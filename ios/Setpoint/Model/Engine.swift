import Foundation
import JavaScriptCore

/// The web app's own food search and maths, run in JavaScriptCore (built by tools/ios-engine.js). The screens are
/// native SwiftUI; this keeps search results, amounts, targets and expenditure identical to the web app.
/// An actor, so it works off the main thread and one thing at a time.
actor Engine {
    static let shared = Engine()
    private let ctx: JSContext
    private let sp: JSValue
    private var stateVersion = -1
    private(set) var foodsReady = false

    init() {
        let c = JSContext()!
        c.exceptionHandler = { _, e in print("Engine error:", e?.toString() ?? "?") }
        if let u = Bundle.main.url(forResource: "engine", withExtension: "js"), let s = try? String(contentsOf: u, encoding: .utf8) {
            c.evaluateScript(s)
        }
        ctx = c
        sp = c.objectForKeyedSubscript("SP")
        // Food names, units and plan messages come out in Arabic when the app runs in Arabic (the web app's ar.js).
        sp.invokeMethod("setLang", withArguments: [Bundle.main.preferredLocalizations.first?.hasPrefix("ar") == true ? "ar" : "en"])
    }

    private func call(_ fn: String, _ args: [Any] = []) -> String? {
        guard let r = sp.invokeMethod(fn, withArguments: args), !r.isUndefined, !r.isNull else { return nil }
        let s = r.toString() ?? ""
        return s == "null" ? nil : s
    }
    private func decode<T: Decodable>(_ type: T.Type, _ fn: String, _ args: [Any] = []) -> T? {
        guard let s = call(fn, args), let d = s.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(T.self, from: d)
    }

    // MARK: Data

    /// Hands the engine your data. Older versions arriving late are ignored.
    func setState(_ json: String, version: Int) {
        guard version > stateVersion else { return }
        stateVersion = version
        _ = call("setState", [json])
    }
    func state() -> String? { call("getState") }
    func part(_ key: String) -> JSONValue? { decode(JSONValue.self, "part", [key]) }

    func loadFoods() {
        guard !foodsReady, let u = Bundle.main.url(forResource: "foods", withExtension: "json"), let s = try? String(contentsOf: u, encoding: .utf8) else { return }
        _ = call("loadFoods", [s])
        foodsReady = sp.forProperty("ready").toBool()
    }

    // MARK: Adding food

    func search(_ q: String, meal: String) -> [FoodHit] { decode([FoodHit].self, "search", [q, meal]) ?? [] }
    func search(_ q: String, meal: String, sort: String, verifiedOnly: Bool) -> [FoodHit] { decode([FoodHit].self, "searchSorted", [q, meal, sort, verifiedOnly]) ?? [] }
    func list(_ kind: String, meal: String) -> [FoodHit] { decode([FoodHit].self, kind, [meal]) ?? [] }
    func savedMeals() -> [SavedMeal] { decode([SavedMeal].self, "savedMeals") ?? [] }
    func food(_ id: String, meal: String) -> FoodInfo? { decode(FoodInfo.self, "food", [id, meal]) }
    func macros(_ id: String, qty: Double, unit: String) -> Macros? { decode(Macros.self, "macros", [id, qty, unit]) }
    func item(_ id: String, qty: Double, unit: String, meal: String) -> [String: JSONValue]? { decode(JSONValue.self, "item", [id, qty, unit, meal])?.object }
    func reamount(_ item: [String: JSONValue], qty: Double, unit: String) -> [String: JSONValue]? {
        guard let d = try? JSONEncoder().encode(JSONValue.object(item)), let s = String(data: d, encoding: .utf8) else { return nil }
        return decode(JSONValue.self, "reamount", [s, qty, unit])?.object
    }
    func amountText(_ qty: Double, _ unit: String) -> String { call("fmtAmt", [qty, unit]) ?? "" }
    func logMeal(_ id: String, meal: String) -> [[String: JSONValue]] { (decode(JSONValue.self, "logMeal", [id, meal])?.array ?? []).compactMap { $0.object } }
    func toggleFavorite(_ id: String) -> JSONValue? { decode(JSONValue.self, "toggleFav", [id]) }
    func barcodeLocal(_ code: String) -> String? { decode(String.self, "barcodeLocal", [code]) }
    func validBarcode(_ code: String) -> Bool { sp.invokeMethod("validBarcode", withArguments: [code])?.toBool() ?? false }
    /// An Open Food Facts answer, read the way the web app reads it. Returns the food's id, or nil if it isn't usable.
    func offProduct(_ json: String, code: String) -> String? {
        guard let r = decode(JSONValue.self, "offProduct", [json, code]) else { return nil }
        return r["id"]?.string
    }

    // MARK: Plan and maths

    func dayPlan(_ day: String) -> DayPlan? { decode(DayPlan.self, "dayPlan", [day]) }
    func trend(_ day: String) -> Double? { decode(Double.self, "trend", [day]) }
    func overview() -> Overview? { decode(Overview.self, "overview") }
    // Account sync: the web app's merge.
    func syncJoin(_ main: String, months: [String]) -> String {
        let m = (try? JSONSerialization.data(withJSONObject: months)).map { String(decoding: $0, as: UTF8.self) } ?? "[]"
        return call("syncJoin", [main, m]) ?? "{}"
    }
    func syncHasData(_ text: String) -> Bool { sp.invokeMethod("syncHasData", withArguments: [text])?.toBool() ?? false }
    func syncMerge(local: String, cloud: String, cloudNewer: Bool) -> String { call("syncMerge", [local, cloud, cloudNewer]) ?? local }
    func nutrients(_ day: String) -> NutrientData? { decode(NutrientData.self, "nutrients", [day]) }
    func weekReview(_ start: String = "") -> WeekReview? { decode(WeekReview.self, "weekReview", [start]) }
    func achievements() -> Achievements? { decode(Achievements.self, "achievements", [false]) }
    func prayer(lat: Double, lon: Double, fa: Double) -> PrayerTimes? { decode(PrayerTimes.self, "prayer", [lat, lon, fa]) }
    func cities() -> [City] { decode([City].self, "cities") ?? [] }
    func insights() -> Insights? { decode(Insights.self, "insights") }
    func applyRepeats() -> Int { Int(sp.invokeMethod("applyRepeats", withArguments: [])?.toInt32() ?? 0) }
    func dayScore(_ day: String) -> DayScore? { decode(DayScore.self, "dayScore", [day]) }
    func itemKinds(_ day: String) -> [String: String] { decode([String: String].self, "itemKinds", [day]) ?? [:] }
    func expenditureHistory(weeks: Int) -> [ExpPoint] { decode([ExpPoint].self, "expenditureHistory", [weeks]) ?? [] }
    func nutrientSources(_ key: String, day: String, days: Int) -> NutrientSources? { decode(NutrientSources.self, "nutrientSources", [key, day, days]) }
    func progress() -> ProgressData? { decode(ProgressData.self, "progress") }
    func nutrition(days: Int) -> [NutritionDay] { decode([NutritionDay].self, "nutrition", [days]) ?? [] }
    func paceValue(_ dir: String, _ i: Int) -> Double { sp.invokeMethod("paceValue", withArguments: [dir, i])?.toDouble() ?? 0 }
    /// What the web app does on every open: a due weekly adjustment, reaching your goal, today's targets remembered.
    func tick() -> JSONValue? { decode(JSONValue.self, "tick") }
    func undoTune() { _ = call("undoTune") }
}

// MARK: - What the engine sends back

struct FoodHit: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let name: String
    let sub: String?
    let via: String?
    let fav: Bool?
    let est: Bool?
    let recipe: Bool?
    let custom: Bool?
    let kind: String?
    // quick adds from your recent foods
    let quick: Bool?
    let kcal: Double?
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    // your usual (or a sensible) serving, for one-tap add
    let off: Bool?
    let q: Double?
    let u: String?
    let amt: String?
    let usual: Bool?
    let verified: Bool?

    enum CodingKeys: String, CodingKey { case id, name, sub, via, fav, est, recipe, custom, kind, quick, kcal, protein, carbs, fat, off, q, u, amt, usual, verified }
    init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        name = try c.decodeIfPresent(String.self, forKey: .name) ?? ""
        quick = try c.decodeIfPresent(Bool.self, forKey: .quick)
        kcal = try c.decodeIfPresent(Double.self, forKey: .kcal)
        protein = try c.decodeIfPresent(Double.self, forKey: .protein)
        carbs = try c.decodeIfPresent(Double.self, forKey: .carbs)
        fat = try c.decodeIfPresent(Double.self, forKey: .fat)
        id = try c.decodeIfPresent(String.self, forKey: .id) ?? "q|\(name)|\(Int(kcal ?? 0))"
        sub = try c.decodeIfPresent(String.self, forKey: .sub)
        via = try c.decodeIfPresent(String.self, forKey: .via)
        fav = try c.decodeIfPresent(Bool.self, forKey: .fav)
        est = try c.decodeIfPresent(Bool.self, forKey: .est)
        recipe = try c.decodeIfPresent(Bool.self, forKey: .recipe)
        custom = try c.decodeIfPresent(Bool.self, forKey: .custom)
        kind = try c.decodeIfPresent(String.self, forKey: .kind)
        off = try c.decodeIfPresent(Bool.self, forKey: .off)
        q = try c.decodeIfPresent(Double.self, forKey: .q)
        u = try c.decodeIfPresent(String.self, forKey: .u)
        amt = try c.decodeIfPresent(String.self, forKey: .amt)
        usual = try c.decodeIfPresent(Bool.self, forKey: .usual)
        verified = try c.decodeIfPresent(Bool.self, forKey: .verified)
    }
}

struct SavedMeal: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let name: String
    let kcal: Double
    let n: Int
}

struct FoodUnit: Decodable, Hashable, Sendable {
    let label: String; let g: Double; let text: String?
    var display: String { text ?? label }
}

struct FoodInfo: Decodable, Sendable {
    struct Serving: Decodable, Sendable { let qty: Double; let unit: String }
    struct Per100: Decodable, Sendable { let kcal: Double?; let p: Double?; let c: Double?; let f: Double?; let fib: Double?; let sug: Double?; let sat: Double?; let na: Double? }
    let id: String
    let name: String
    let cat: String?
    let units: [FoodUnit]
    let def: Serving
    let fav: Bool
    let est: Bool
    let recipe: Bool
    let custom: Bool
    let per100: Per100
}

struct Macros: Decodable, Equatable, Sendable { let kcal: Double; let protein: Double; let carbs: Double; let fat: Double; let g: Double }

/// The Plan screens' numbers, straight from the web app's maths.
struct Overview: Decodable, Sendable {
    struct Energy: Decodable, Sendable {
        struct Parts: Decodable, Sendable { let bmr: Double; let life: Double; let steps: Double; let train: Double }
        let tdee: Double; let source: String; let w: Double?; let calc: Double?; let level: String?; let parts: Parts?
    }
    struct Measured: Decodable, Sendable {
        let ready: Bool; let calDays: Int; let days: Int?; let coverage: Double?; let partial: Int?; let span: Int; let needCal: Int; let needSpan: Int
        let intake: Double?; let rateKgWk: Double?; let tdee: Double?
    }
    struct Pace: Decodable, Sendable { let dir: String; let kg: Double; let i: Int }
    struct Plan: Decodable, Sendable {
        let target: Double; let protein: Double; let carbs: Double; let fat: Double; let pace: Pace; let warn: String; let eta: String
        let ref: Double; let refWhy: String; let proteinPerKg: Double; let fatPerKg: Double; let kind: String; let custom: Bool
        struct Ranges: Decodable, Sendable { let protein: [Double]; let fat: [Double] }
        let ranges: Ranges?
    }
    struct Training: Decodable, Sendable { let days: Int; let type: String; let minutes: Int; let intensity: String }
    struct Profile: Decodable, Sendable { let sex: String?; let birthYear: Int?; let heightCm: Double?; let bodyFat: Double?; let steps: Int?; let training: Training? }
    let ready: Bool
    let kg: Double?
    let unit: String
    let adaptive: Bool
    let adjustKcal: Double?
    let tuneWhy: String?
    let profile: Profile
    let age: Int?
    let goalKg: Double?
    let rates: [String: [Double]]
    let energy: Energy?
    let measured: Measured
    let plan: Plan?
}

struct ProgressData: Decodable, Sendable {
    struct Point: Decodable, Sendable, Identifiable { let date: String; let kg: Double; let trend: Double; let x: Bool; let note: String; let kcal: Double?; var id: String { date } }
    struct Week: Decodable, Sendable, Identifiable { let start: String; let label: String; let n: Int; let avg: Double; let lo: Double; let hi: Double; let kcal: Double?; let delta: Double?; var id: String { start } }
    let points: [Point]
    let weeks: [Week]
    struct Window: Decodable, Sendable { let from: String; let to: String; let guess: Bool }
    let cycle: [Window]?
    let down: Bool?
    let goalKg: Double?
    let now: Double?
    let unit: String
}

struct NutritionDay: Decodable, Sendable, Identifiable {
    let date: String; let kcal: Double; let protein: Double; let carbs: Double; let fat: Double; let target: Double?; let proteinTarget: Double?
    var id: String { date }
}

struct NutrientData: Decodable, Sendable {
    struct Group: Decodable, Sendable { let key: String; let label: String }
    struct Row: Decodable, Sendable { let key: String; let label: String; let unit: String; let group: String; let v: Double; let cov: Double; let goal: Double?; let hi: Double? }
    struct Low: Decodable, Sendable { let key: String; let label: String; let pct: Double }
    let items: Int
    let groups: [Group]
    let rows: [Row]
    let low: [Low]
}

struct WeekReview: Decodable, Sendable {
    let start: String; let label: String; let n: Int; let kcal: Double; let protein: Double; let tg: Double?; let pg: Double?
    let best: String?; let onTarget: Int; let train: Int; let trainOn: Bool; let dw: Double?
}

struct Achievements: Decodable, Sendable {
    struct Item: Decodable, Sendable { let t: String; let got: Bool; let p: String }
    let streak: Int
    let list: [Item]
}

struct PrayerTimes: Decodable, Sendable {
    let fajr: Double; let maghrib: Double; let fajrNext: Double
}
struct City: Decodable, Sendable, Hashable { let name: String; let lat: Double; let lon: Double; let fa: Double }

struct Insights: Decodable, Sendable {
    struct Item: Decodable, Sendable { let t: String; let d: Double; let s: String; let note: String }
    let n: Int
    let items: [Item]
}

struct DayScore: Decodable, Sendable {
    struct Part: Decodable, Sendable { let label: String; let pts: Double; let max: Double; let note: String }
    let score: Int; let grade: String; let parts: [Part]
}

struct ExpPoint: Decodable, Sendable, Identifiable {
    let date: String; let tdee: Double?; let intake: Double?; let target: Double?; let trend: Double?
    var id: String { date }
}
struct NutrientSources: Decodable, Sendable {
    struct Item: Decodable, Sendable { let name: String; let v: Double; let times: Int }
    let unit: String; let label: String; let list: [Item]
}
