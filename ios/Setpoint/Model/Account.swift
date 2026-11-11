import Foundation
import Observation
import CryptoKit
import Security

/// Your Setpoint account: the same Firebase account and cloud save as the web app, so both stay in step.
/// Sign-in uses Firebase's REST API; the save lives at users/{uid}/setpoint/state with the food log in monthly
/// pieces under it (…/state/food/YYYY-MM), exactly as the web app writes it. Merging uses the web app's own code.
@MainActor
@Observable
final class Account {
    struct Session: Codable, Sendable {
        var uid: String
        var email: String
        var idToken: String
        var refreshToken: String
        var expires: Date
        var verified: Bool
        var password: Bool
    }

    private(set) var session: Session?
    private(set) var busy = false
    private(set) var failed = false
    var signedIn: Bool { session != nil }

    @ObservationIgnored private weak var store: Store?
    @ObservationIgnored private var pushTask: Task<Void, Never>?
    @ObservationIgnored private var running = false
    @ObservationIgnored private var again = false

    static let shared = Account(store: Store.shared)

    init(store: Store) {
        self.store = store
        session = ProcessInfo.processInfo.arguments.contains("-demo") ? nil : Keychain.load() // screenshots never sync
        store.signedIn = session != nil
        store.onDirty = { [weak self] in self?.schedulePush() }
    }

    // MARK: Signing in

    func signIn(email: String, password: String) async throws {
        let r = try await Auth.post("accounts:signInWithPassword", ["email": email, "password": password, "returnSecureToken": true])
        try await adopt(r)
    }
    func signUp(email: String, password: String) async throws {
        let r = try await Auth.post("accounts:signUp", ["email": email, "password": password, "returnSecureToken": true])
        try await adopt(r)
        if let t = session?.idToken { _ = try? await Auth.post("accounts:sendOobCode", ["requestType": "VERIFY_EMAIL", "idToken": t]) }
    }
    func resetPassword(email: String) async throws {
        _ = try await Auth.post("accounts:sendOobCode", ["requestType": "PASSWORD_RESET", "email": email])
    }
    func sendVerification() async throws {
        guard let s = try await validSession() else { return }
        _ = try await Auth.post("accounts:sendOobCode", ["requestType": "VERIFY_EMAIL", "idToken": s.idToken])
    }
    /// Google: a small page on the Setpoint site signs in with Google and hands back a token (ios-signin.html).
    /// The screen opens it with SwiftUI's web sign-in session and passes back where it ended up.
    static let googleURL = URL(string: "https://setpoint-tracker.web.app/ios-signin.html")!
    func finishGoogle(_ back: URL) async throws {
        let q = Dictionary(uniqueKeysWithValues: (back.fragment ?? "").split(separator: "&").compactMap { part -> (String, String)? in
            let kv = part.split(separator: "=", maxSplits: 1).map(String.init)
            return kv.count == 2 ? (kv[0], kv[1].removingPercentEncoding ?? kv[1]) : nil
        })
        guard let token = q["token"] else {
            if q["error"] == "cancelled" { throw AuthError.message(String(localized: "Sign-in was cancelled.")) }
            throw AuthError.message(String(localized: "Couldn't sign in with Google. Try again."))
        }
        let t = try await Auth.refresh(token)
        let info = try await Auth.lookup(t.idToken)
        try await begin(Session(uid: t.uid, email: info.email, idToken: t.idToken, refreshToken: t.refreshToken, expires: t.expires, verified: info.verified, password: info.password))
    }

    func signOut() {
        pushTask?.cancel()
        Keychain.save(nil)
        session = nil
        store?.signedIn = false
        store?.setSync { $0 = [:] }
    }

    private func adopt(_ r: [String: Any]) async throws {
        guard let id = r["idToken"] as? String, let rt = r["refreshToken"] as? String, let uid = r["localId"] as? String else { throw AuthError.message(String(localized: "Couldn't sign in. Try again.")) }
        let exp = Date().addingTimeInterval(Double(r["expiresIn"] as? String ?? "3600") ?? 3600)
        let info = (try? await Auth.lookup(id)) ?? (email: r["email"] as? String ?? "", verified: false, password: true)
        try await begin(Session(uid: uid, email: info.email, idToken: id, refreshToken: rt, expires: exp, verified: info.verified, password: info.password))
    }
    private func begin(_ s: Session) async throws {
        guard let store else { return }
        let fresh = store.syncValue("uid")?.string != s.uid // first time this account syncs on this iPhone
        session = s
        Keychain.save(s)
        store.signedIn = true
        store.setSync { $0["uid"] = .string(s.uid); $0["email"] = .string(s.email) }
        await pull(fresh: fresh)
    }

    /// Refreshes the sign-in when it's about to run out (it lasts an hour).
    private func validSession() async throws -> Session? {
        guard var s = session else { return nil }
        if s.expires > Date().addingTimeInterval(60) { return s }
        do {
            let t = try await Auth.refresh(s.refreshToken)
            s.idToken = t.idToken; s.refreshToken = t.refreshToken; s.expires = t.expires
            if let info = try? await Auth.lookup(t.idToken) { s.verified = info.verified; s.email = info.email }
            session = s; Keychain.save(s)
            return s
        } catch AuthError.signedOut {
            signOut(); return nil
        }
    }
    /// Checks again whether your email has been verified.
    func refreshAccount() async {
        guard var s = session, let fresh = try? await validSession(), let info = try? await Auth.lookup(fresh.idToken) else { return }
        s = fresh; s.verified = info.verified; session = s; Keychain.save(s)
    }

    // MARK: Sync (the web app's pull and push, step for step)

    var lastSync: Date? { store?.syncValue("lastSync")?.number.map { Date(timeIntervalSince1970: $0 / 1000) } }

    private var sentKey: String { "setpoint-months-\(session?.uid ?? "")" }
    /// What each food month looked like when this iPhone last uploaded it. nil = this iPhone hasn't synced months yet.
    private var sentMonths: [String: String]? {
        get { UserDefaults.standard.dictionary(forKey: sentKey) as? [String: String] }
        set { UserDefaults.standard.set(newValue, forKey: sentKey) }
    }

    func schedulePush() {
        guard session != nil else { return }
        pushTask?.cancel()
        pushTask = Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(1200))
            guard !Task.isCancelled else { return }
            await self?.run { try await $0.push() }
        }
    }
    /// Pull on open and when you come back to the app; push whatever changed here.
    func syncNow() async {
        guard let store else { return }
        if store.syncValue("dirty")?.bool == true { await run { try await $0.push() } } else { await pull(fresh: false) }
    }
    func pull(fresh: Bool) async { await run { try await $0.pullNow(fresh: fresh) } }

    /// One sync at a time; a request that comes in meanwhile runs once more afterwards.
    private func run(_ work: @escaping (Account) async throws -> Void) async {
        if running { again = true; return }
        running = true; busy = true; failed = false
        do { try await work(self) } catch { failed = true; print("Sync:", error) }
        running = false; busy = false
        if again { again = false; schedulePush() }
    }

    private func pullNow(fresh: Bool) async throws {
        guard let store, let s = try await validSession() else { return }
        var fresh = fresh
        if sentMonths == nil { fresh = true } // first sync of monthly food on this iPhone: merge everything once
        let fs = Firestore(token: s.idToken), base = "users/\(s.uid)/setpoint/state"
        guard let main = try await fs.get(base) else {
            if sentMonths == nil { sentMonths = [:] }
            return try await push()
        }
        let cAt = main.number("updatedAt") ?? 0
        let localAt = store.syncValue("updatedAt")?.number ?? 0, dirty = store.syncValue("dirty")?.bool == true
        if !fresh && !dirty && cAt <= localAt { done(); return }
        let months = try await fs.list("\(base)/food").map { $0.string("data") ?? "{}" }
        let engine = Engine.shared
        let cloud = await engine.syncJoin(main.string("data") ?? "{}", months: months)
        let split = (main.number("split") ?? 0) > 0
        let took: () async throws -> Void = {
            self.sentMonths = split ? store.monthSigs() : [:]
            if !split { try await self.push() } else { self.done() }
        }
        if fresh || dirty {
            let local = store.cloudDataText()
            if !(await engine.syncHasData(local)) { store.applyCloud(cloud, updatedAt: cAt); return try await took() }
            if !(await engine.syncHasData(cloud)) { if sentMonths == nil { sentMonths = [:] }; return try await push() }
            let merged = await engine.syncMerge(local: local, cloud: cloud, cloudNewer: cAt > localAt)
            store.applyCloud(merged, updatedAt: (Date().timeIntervalSince1970 * 1000).rounded())
            if sentMonths == nil { sentMonths = [:] }
            return try await push()
        }
        store.applyCloud(cloud, updatedAt: cAt)
        try await took()
    }

    private func push() async throws {
        guard let store, let s = try await validSession() else { return }
        guard let sent = sentMonths else { return try await pullNow(fresh: true) } // never upload months before merging once
        let at = store.syncValue("updatedAt")?.number ?? (Date().timeIntervalSince1970 * 1000).rounded()
        let parts = store.cloudParts()
        let sigs = parts.months.mapValues(Account.sig)
        let fs = Firestore(token: s.idToken), base = "users/\(s.uid)/setpoint/state"
        var writes: [(String, [String: Firestore.Value])] = [
            (base, ["app": .string("Setpoint"), "v": .int(Int64(store.schema)), "split": .int(2), "updatedAt": .int(Int64(at)), "data": .string(parts.main)])
        ]
        for (ym, text) in parts.months where sent[ym] != sigs[ym] { writes.append(("\(base)/food/\(ym)", ["updatedAt": .int(Int64(at)), "data": .string(text)])) }
        for ym in sent.keys where sigs[ym] == nil { writes.append(("\(base)/food/\(ym)", ["updatedAt": .int(Int64(at)), "data": .string("{}")])) } // emptied months
        for chunk in stride(from: 0, to: writes.count, by: 400).map({ Array(writes[$0..<min($0 + 400, writes.count)]) }) {
            try await fs.commit(chunk)
        }
        sentMonths = sigs
        let stillSame = store.syncValue("updatedAt")?.number == at
        store.setSync { s in
            s["lastSync"] = .number((Date().timeIntervalSince1970 * 1000).rounded())
            if stillSame { s["dirty"] = .bool(false) }
        }
        if !stillSame { schedulePush() } // something changed while uploading
    }

    private func done() {
        store?.setSync { $0["lastSync"] = .number((Date().timeIntervalSince1970 * 1000).rounded()); $0["dirty"] = .bool(false) }
    }

    static func sig(_ text: String) -> String {
        SHA256.hash(data: Data(text.utf8)).prefix(12).map { String(format: "%02x", $0) }.joined()
    }
}

// MARK: Firebase REST

enum AuthError: LocalizedError {
    case message(String)
    case signedOut
    var errorDescription: String? {
        switch self { case .message(let m): m; case .signedOut: String(localized: "You were signed out. Sign in again.") }
    }
}

private enum Auth {
    static let key = "AIzaSyAYXoxTt8Bhb2A-oCrQzpKO71GL1D892_o"

    static func request(_ url: URL, body: Data, type: String) -> URLRequest {
        var r = URLRequest(url: url)
        r.httpMethod = "POST"; r.httpBody = body
        r.setValue(type, forHTTPHeaderField: "Content-Type")
        r.setValue("https://setpoint-tracker.web.app/", forHTTPHeaderField: "Referer")
        r.timeoutInterval = 20
        return r
    }
    static func post(_ method: String, _ body: [String: Any]) async throws -> [String: Any] {
        let url = URL(string: "https://identitytoolkit.googleapis.com/v1/\(method)?key=\(key)")!
        let (data, resp) = try await send(request(url, body: try JSONSerialization.data(withJSONObject: body), type: "application/json"))
        let obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        if (resp as? HTTPURLResponse)?.statusCode ?? 0 >= 400 {
            throw AuthError.message(message(((obj["error"] as? [String: Any])?["message"] as? String) ?? ""))
        }
        return obj
    }
    static func refresh(_ token: String) async throws -> (uid: String, idToken: String, refreshToken: String, expires: Date) {
        let url = URL(string: "https://securetoken.googleapis.com/v1/token?key=\(key)")!
        let body = "grant_type=refresh_token&refresh_token=\(token.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? token)"
        let (data, resp) = try await send(request(url, body: Data(body.utf8), type: "application/x-www-form-urlencoded"))
        let o = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
        if code == 400 || code == 401 || code == 403 { throw AuthError.signedOut }
        guard code < 400, let id = o["id_token"] as? String, let rt = o["refresh_token"] as? String, let uid = o["user_id"] as? String else {
            throw AuthError.message(String(localized: "Couldn't reach the server. Are you offline?"))
        }
        return (uid, id, rt, Date().addingTimeInterval(Double(o["expires_in"] as? String ?? "3600") ?? 3600))
    }
    static func lookup(_ idToken: String) async throws -> (email: String, verified: Bool, password: Bool) {
        let r = try await post("accounts:lookup", ["idToken": idToken])
        let u = (r["users"] as? [[String: Any]])?.first ?? [:]
        let providers = (u["providerUserInfo"] as? [[String: Any]] ?? []).compactMap { $0["providerId"] as? String }
        return (u["email"] as? String ?? "", u["emailVerified"] as? Bool ?? false, providers.contains("password"))
    }
    static func send(_ r: URLRequest) async throws -> (Data, URLResponse) {
        do { return try await URLSession.shared.data(for: r) } catch { throw AuthError.message(String(localized: "Couldn't reach the server. Are you offline?")) }
    }
    static func message(_ code: String) -> String {
        let c = code.split(separator: " ").first.map(String.init) ?? code
        switch c {
        case "EMAIL_NOT_FOUND", "INVALID_PASSWORD", "INVALID_LOGIN_CREDENTIALS": return String(localized: "Wrong email or password.")
        case "EMAIL_EXISTS": return String(localized: "There's already an account with this email. Sign in instead.")
        case "WEAK_PASSWORD": return String(localized: "Use at least 6 characters for the password.")
        case "INVALID_EMAIL", "MISSING_EMAIL": return String(localized: "That email doesn't look right.")
        case "MISSING_PASSWORD": return String(localized: "Enter your password.")
        case "TOO_MANY_ATTEMPTS_TRY_LATER": return String(localized: "Too many tries. Wait a bit.")
        case "USER_DISABLED": return String(localized: "This account has been turned off.")
        default: return String(localized: "Couldn't sign in. Try again.")
        }
    }
}

/// Just enough of Firestore's REST API: read a document, list a collection, write several documents at once.
private struct Firestore {
    let token: String
    static let root = "projects/setpoint-tracker/databases/(default)/documents"

    enum Value {
        case string(String), int(Int64)
        var json: [String: Any] {
            switch self { case .string(let s): ["stringValue": s]; case .int(let i): ["integerValue": String(i)] }
        }
    }
    struct Doc {
        let fields: [String: Any]
        func string(_ k: String) -> String? { (fields[k] as? [String: Any])?["stringValue"] as? String }
        func number(_ k: String) -> Double? {
            guard let f = fields[k] as? [String: Any] else { return nil }
            if let s = f["integerValue"] as? String { return Double(s) }
            if let d = f["doubleValue"] as? Double { return d }
            return f["integerValue"] as? Double
        }
    }

    private func url(_ path: String, _ query: String = "") -> URL {
        URL(string: "https://firestore.googleapis.com/v1/\(Self.root)/\(path)\(query)")!
    }
    private func send(_ r: URLRequest) async throws -> (Data, Int) {
        var r = r
        r.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        r.timeoutInterval = 30
        let (d, resp) = try await URLSession.shared.data(for: r)
        return (d, (resp as? HTTPURLResponse)?.statusCode ?? 0)
    }
    func get(_ path: String) async throws -> Doc? {
        let (d, code) = try await send(URLRequest(url: url(path)))
        if code == 404 { return nil }
        guard code < 400, let o = try JSONSerialization.jsonObject(with: d) as? [String: Any] else { throw AuthError.message("Firestore \(code)") }
        return Doc(fields: o["fields"] as? [String: Any] ?? [:])
    }
    func list(_ path: String) async throws -> [Doc] {
        var out: [Doc] = [], page: String? = nil
        repeat {
            let q = "?pageSize=300" + (page.map { "&pageToken=\($0.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? $0)" } ?? "")
            let (d, code) = try await send(URLRequest(url: url(path, q)))
            guard code < 400, let o = try JSONSerialization.jsonObject(with: d) as? [String: Any] else { throw AuthError.message("Firestore \(code)") }
            out += (o["documents"] as? [[String: Any]] ?? []).map { Doc(fields: $0["fields"] as? [String: Any] ?? [:]) }
            page = o["nextPageToken"] as? String
        } while page != nil
        return out
    }
    func commit(_ writes: [(String, [String: Value])]) async throws {
        var r = URLRequest(url: URL(string: "https://firestore.googleapis.com/v1/\(Self.root.replacingOccurrences(of: "/documents", with: ""))/documents:commit")!)
        r.httpMethod = "POST"
        r.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["writes": writes.map { path, fields in
            ["update": ["name": "\(Self.root)/\(path)", "fields": fields.mapValues { $0.json }]]
        }]
        r.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (d, code) = try await send(r)
        guard code < 400 else { throw AuthError.message("Firestore \(code): \(String(decoding: d.prefix(300), as: UTF8.self))") }
    }
}

// MARK: Keychain (the sign-in stays on this iPhone only)

private enum Keychain {
    static var query: [String: Any] { [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: "app.setpoint.account", kSecAttrAccount as String: "session"] }
    static func load() -> Account.Session? {
        var q = query; q[kSecReturnData as String] = true; q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let d = out as? Data else { return nil }
        return try? JSONDecoder().decode(Account.Session.self, from: d)
    }
    static func save(_ s: Account.Session?) {
        SecItemDelete(query as CFDictionary)
        guard let s, let d = try? JSONEncoder().encode(s) else { return }
        var q = query; q[kSecValueData as String] = d; q[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(q as CFDictionary, nil)
    }
}
