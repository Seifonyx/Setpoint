import SwiftUI
import AuthenticationServices

/// Sign in to the same account as the web app; your data syncs between them.
struct AccountView: View {
    @Environment(Account.self) private var account
    @Environment(\.webAuthenticationSession) private var webAuth
    @Environment(\.openURL) private var openURL
    @State private var email = ""
    @State private var password = ""
    @State private var agreed = false
    @State private var working = false
    @State private var error: String?
    @State private var note: String?
    @State private var confirmOut = false
    @FocusState private var field: Int?

    var body: some View {
        List {
            if let s = account.session { signedIn(s) } else { signedOut }
        }
        .brandList()
        .navigationTitle("Account")
        .alert(note ?? "", isPresented: Binding(get: { note != nil }, set: { if !$0 { note = nil } })) { Button("OK", role: .cancel) {} }
        .task { if account.signedIn { await account.refreshAccount() } }
    }

    // MARK: Signed in

    @ViewBuilder private func signedIn(_ s: Account.Session) -> some View {
        Section {
            LabeledContent("Signed in as") { Text(s.email).lineLimit(1).truncationMode(.middle) }
            if s.password && !s.verified {
                Button("Send verification email") { act { try await account.sendVerification(); note = String(localized: "Sent. Check your inbox.") } }
            }
        } footer: {
            if s.password && !s.verified { Text("Verify your email so you can always get back into your account.") }
        }
        Section {
            HStack {
                Label {
                    if account.busy { Text("Syncing…") }
                    else if account.failed { Text("Couldn't sync. Are you offline?") }
                    else if let d = account.lastSync { Text("Synced \(d, format: .relative(presentation: .named))") }
                    else { Text("Not synced yet") }
                } icon: {
                    Image(systemName: account.failed ? "exclamationmark.icloud" : "checkmark.icloud").foregroundStyle(account.failed ? Brand.amber : Brand.green)
                }
                Spacer()
                if account.busy { ProgressView() }
            }
            Button("Sync now", systemImage: "arrow.triangle.2.circlepath") { Task { await account.syncNow() } }
                .disabled(account.busy)
        } footer: {
            Text("Your weigh-ins, food log, foods, recipes, plan and settings sync with the web app. Photos stay on this iPhone for now.")
        }
        Section {
            Button("Sign out", role: .destructive) { confirmOut = true }
                .confirmationDialog("Sign out?", isPresented: $confirmOut, titleVisibility: .visible) {
                    Button("Sign out", role: .destructive) { account.signOut() }
                } message: { Text("Your data stays on this iPhone. Sign in again to sync.") }
        } footer: {
            Text("To delete your account, sign in on the web app and use Settings › Account.")
        }
    }

    // MARK: Signed out

    @ViewBuilder private var signedOut: some View {
        Section {
            TextField("Email", text: $email)
                .textContentType(.username).keyboardType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled()
                .focused($field, equals: 0).submitLabel(.next).onSubmit { field = 1 }
            SecureField("Password", text: $password)
                .textContentType(.password).focused($field, equals: 1).submitLabel(.go).onSubmit(signIn)
        } header: {
            Text("Use the same account as the web app")
        } footer: {
            if let error { Text(error).foregroundStyle(Brand.over) }
        }
        Section {
            Toggle(isOn: $agreed) {
                Text("I agree to the [Terms](https://setpoint-tracker.web.app/terms.html) and [Privacy Policy](https://setpoint-tracker.web.app/privacy.html)")
                    .font(.brand(.subheadline))
            }
        }
        Section {
            Button(action: signIn) {
                HStack { Spacer(); if working { ProgressView() } else { Text("Sign in").bold() }; Spacer() }
            }
            .disabled(working)
            Button("Create account") {
                guard check(needPassword: true) else { return }
                act { try await account.signUp(email: email.trimmingCharacters(in: .whitespaces), password: password) }
            }
            .disabled(working)
            Button("Forgot password?") {
                let e = email.trimmingCharacters(in: .whitespaces)
                guard !e.isEmpty else { error = String(localized: "Enter your email"); return }
                act { try await account.resetPassword(email: e); note = String(localized: "Reset link sent to \(e)") }
            }
            .disabled(working)
        }
        Section {
            Button {
                guard agreed else { error = String(localized: "Tick the box above to continue"); return }
                act {
                    let back = try await webAuth.authenticate(using: Account.googleURL, callback: .customScheme("setpoint"), preferredBrowserSession: .shared, additionalHeaderFields: [:])
                    try await account.finishGoogle(back)
                }
            } label: {
                HStack { Spacer(); Label("Continue with Google", systemImage: "g.circle.fill"); Spacer() }
            }
            .disabled(working)
        } footer: {
            Text("Signing in merges what's on this iPhone with your account.")
        }
    }

    private func check(needPassword: Bool) -> Bool {
        error = nil
        if email.trimmingCharacters(in: .whitespaces).isEmpty { error = String(localized: "Enter your email"); return false }
        if needPassword && password.isEmpty { error = String(localized: "Enter your password"); return false }
        if !agreed { error = String(localized: "Tick the box above to continue"); return false }
        return true
    }
    private func signIn() {
        guard check(needPassword: true) else { return }
        act { try await account.signIn(email: email.trimmingCharacters(in: .whitespaces), password: password) }
    }
    private func act(_ work: @escaping () async throws -> Void) {
        working = true; error = nil
        Task {
            do { try await work(); password = "" }
            catch let e as ASWebAuthenticationSessionError where e.code == .canceledLogin {}
            catch { self.error = error.localizedDescription }
            working = false
        }
    }
}
