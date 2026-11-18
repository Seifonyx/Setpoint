import SwiftUI
import AuthenticationServices

/// The front door: Setpoint needs an account, so your log is saved and follows you to a new phone.
/// A welcome page (the dial filling, what the app is, the two ways in), then one short form to create an account
/// or sign in. Shown over the app whenever nobody is signed in.
struct AuthFlow: View {
    enum Mode: String { case welcome, signUp = "signup", signIn = "signin" }

    @Environment(Account.self) private var account
    @Environment(\.webAuthenticationSession) private var webAuth
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // build-server screenshots: -auth welcome / signup / signin
    @State private var mode = Mode(rawValue: UserDefaults.standard.string(forKey: "auth") ?? "") ?? .welcome
    @State private var email = ""
    @State private var password = ""
    @State private var reveal = false
    @State private var working = false
    @State private var google = false
    @State private var error: String?
    @State private var note: String?
    @State private var legal: String?   // a legal page open over the sign-in (the app's own copy)
    @State private var shown = 0.0
    @State private var arrived = false
    @FocusState private var field: Field?
    enum Field { case email, password }

    var body: some View {
        ZStack {
            PaperBackground().ignoresSafeArea()
            if mode == .welcome {
                welcome.transition(.asymmetric(insertion: .move(edge: .leading).combined(with: .opacity), removal: .move(edge: .leading).combined(with: .opacity)))
            } else {
                form.transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity), removal: .move(edge: .trailing).combined(with: .opacity)))
            }
        }
        .tint(Brand.ink)
        .font(.brand(.body))
        .foregroundStyle(Brand.ink)
        .sensoryFeedback(.selection, trigger: mode)
        .sensoryFeedback(.error, trigger: error) { _, new in new != nil }
        .environment(\.openURL, OpenURLAction { url in
            if let id = LegalLink.page(url) { legal = id; return .handled }
            return .systemAction
        })
        .sheet(item: Binding(get: { legal.map(LegalJob.init) }, set: { legal = $0?.id })) { LegalSheet(page: $0.id) }
        .alert(note ?? "", isPresented: Binding(get: { note != nil }, set: { if !$0 { note = nil } })) { Button("OK", role: .cancel) {} }
    }

    // MARK: Welcome

    private var welcome: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 12)
            CalorieDial(eaten: shown, target: 100, protein: (shown * 0.8, 100), carbs: (shown * 0.95, 100), fat: (shown * 0.6, 100))
                .frame(width: 200, height: 200)
                .environment(\.layoutDirection, .leftToRight)
                .accessibilityHidden(true)
                .onAppear {
                    if reduceMotion { shown = 78; arrived = true; return }
                    withAnimation(.spring(response: 1.4, dampingFraction: 0.75).delay(0.2)) { shown = 78 }
                    withAnimation(.spring(response: 0.8, dampingFraction: 0.85).delay(0.55)) { arrived = true }
                }
            VStack(spacing: 10) {
                Text("Setpoint").font(Brand.display(46, .heavy))
                Text("Eat to your target. Watch your weight trend settle where you want it.")
                    .font(.brand(.title3)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true).padding(.horizontal, 30)
            }
            .padding(.top, 28)
            .opacity(arrived ? 1 : 0).offset(y: arrived ? 0 : 18)
            Spacer(minLength: 12)
            VStack(spacing: 12) {
                primary("Create account") { go(.signUp) }
                googleButton
                Button { go(.signIn) } label: {
                    HStack(spacing: 6) {
                        Text("Already have an account?").foregroundStyle(Brand.ink2)
                        Text("Sign in").foregroundStyle(Brand.green).bold()
                    }
                    .font(.brand(.body)).frame(maxWidth: .infinity, minHeight: 44).contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("auth-signin")
                if let error { errorLine(error) }
                terms
            }
            .padding(.horizontal, 24).padding(.bottom, 16)
            .opacity(arrived ? 1 : 0).offset(y: arrived ? 0 : 24)
        }
    }

    // MARK: Create account / Sign in

    private var form: some View {
        let creating = mode == .signUp
        return ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Button { go(.welcome) } label: { Image(systemName: "chevron.backward").font(.body.weight(.semibold)).frame(width: 22, height: 22) }
                    .buttonStyle(.glass).buttonBorderShape(.circle)
                    .accessibilityLabel(Text("Back"))
                    .padding(.top, 8)
                VStack(alignment: .leading, spacing: 8) {
                    Text(creating ? LocalizedStringKey("Create your account") : LocalizedStringKey("Welcome back"))
                        .font(Brand.display(34, .heavy))
                    Text(creating ? LocalizedStringKey("Your log is saved to your account, so it's safe if you change phones.")
                                  : LocalizedStringKey("Sign in to pick up where you left off."))
                        .font(.brand(.body)).foregroundStyle(Brand.ink2).fixedSize(horizontal: false, vertical: true)
                }
                .padding(.top, 28)

                VStack(spacing: 12) {
                    box("envelope", focused: field == .email) {
                        TextField("Email", text: $email)
                            .textContentType(creating ? .emailAddress : .username).keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never).autocorrectionDisabled()
                            .focused($field, equals: .email).submitLabel(.next).onSubmit { field = .password }
                            .accessibilityIdentifier("auth-email")
                    }
                    box("lock", focused: field == .password) {
                        Group {
                            if reveal { TextField("Password", text: $password).textInputAutocapitalization(.never).autocorrectionDisabled() }
                            else { SecureField("Password", text: $password) } // (iOS leaves hidden text out of screenshots: it looks empty there)
                        }
                        .textContentType(creating ? .newPassword : .password)
                        .focused($field, equals: .password).submitLabel(.go).onSubmit(submit)
                        .accessibilityIdentifier("auth-password")
                        Button { reveal.toggle() } label: {
                            Image(systemName: reveal ? "eye.slash" : "eye").foregroundStyle(Brand.ink2).frame(width: 32, height: 32).contentShape(.rect)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(Text(reveal ? LocalizedStringKey("Hide password") : LocalizedStringKey("Show password")))
                    }
                    if creating {
                        // the one rule, shown before you type and ticked off once you meet it (no second password box)
                        HStack(spacing: 6) {
                            Image(systemName: password.count >= 6 ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(password.count >= 6 ? Brand.green : Brand.ink2)
                            Text("At least 6 characters").foregroundStyle(Brand.ink2)
                        }
                        .font(.brand(.footnote)).frame(maxWidth: .infinity, alignment: .leading).padding(.leading, 4)
                        .animation(.snappy, value: password.count >= 6)
                    } else {
                        Button("Forgot password?", action: forgot)
                            .font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.ink2).buttonStyle(.plain)
                            .frame(maxWidth: .infinity, alignment: .trailing).frame(minHeight: 30)
                            .disabled(working)
                    }
                    if let error { errorLine(error) }
                }
                .padding(.top, 26)

                VStack(spacing: 12) {
                    primary(creating ? "Create account" : "Sign in", busy: working && !google, action: submit)
                        .accessibilityIdentifier("auth-submit")
                    HStack(spacing: 12) {
                        Rectangle().fill(Brand.line).frame(height: 1)
                        Text("or").font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                        Rectangle().fill(Brand.line).frame(height: 1)
                    }
                    .padding(.vertical, 2)
                    googleButton
                    Button { go(creating ? .signIn : .signUp) } label: {
                        HStack(spacing: 6) {
                            Text(creating ? LocalizedStringKey("Already have an account?") : LocalizedStringKey("New to Setpoint?")).foregroundStyle(Brand.ink2)
                            Text(creating ? LocalizedStringKey("Sign in") : LocalizedStringKey("Create account")).foregroundStyle(Brand.green).bold()
                        }
                        .font(.brand(.body)).frame(maxWidth: .infinity, minHeight: 44).contentShape(.rect)
                    }
                    .buttonStyle(.plain)
                    if creating { terms }
                }
                .padding(.top, 22)
            }
            .padding(.horizontal, 24).padding(.bottom, 24)
        }
        .onChange(of: email) { if error != nil { withAnimation(.snappy) { error = nil } } } // fixing it clears the complaint
        .onChange(of: password) { if error != nil { withAnimation(.snappy) { error = nil } } }
        .scrollDismissesKeyboard(.interactively)
        .scrollBounceBehavior(.basedOnSize)
    }

    // MARK: Pieces

    /// A text box: the app's card, an icon, and a green edge while you're typing in it.
    private func box<C: View>(_ icon: String, focused: Bool, @ViewBuilder _ content: () -> C) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 16, weight: .semibold)).foregroundStyle(focused ? Brand.green : Brand.ink2).frame(width: 22)
            content()
        }
        .font(.brand(.body))
        .padding(.horizontal, 16).frame(minHeight: 56)
        .background(Brand.card, in: .rect(cornerRadius: 18, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).strokeBorder(focused ? Brand.green : Brand.line, lineWidth: focused ? 1.5 : 1))
        .animation(.snappy(duration: 0.2), value: focused)
    }

    private func primary(_ title: LocalizedStringKey, busy: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            ZStack {
                Text(title).font(.brand(.headline)).opacity(busy ? 0 : 1)
                if busy { ProgressView().tint(Brand.onGreen) }
            }
            .foregroundStyle(Brand.onGreen).frame(maxWidth: .infinity, minHeight: 54)
            .background(Brand.green, in: Capsule())
        }
        .buttonStyle(.plain)
        .disabled(working)
    }

    private var googleButton: some View {
        Button(action: withGoogle) {
            ZStack {
                HStack(spacing: 10) {
                    Text(verbatim: "G").font(.system(size: 19, weight: .bold, design: .rounded))
                    Text("Continue with Google").font(.brand(.headline))
                }
                .opacity(working && google ? 0 : 1)
                if working && google { ProgressView() }
            }
            .foregroundStyle(Brand.ink).frame(maxWidth: .infinity, minHeight: 54)
            .background(Brand.card, in: Capsule())
            .overlay(Capsule().strokeBorder(Brand.line, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .disabled(working)
    }

    private var terms: some View {
        Text("By continuing you agree to the [Terms](setpoint-legal://terms) and [Privacy Policy](setpoint-legal://privacy).")
            .font(.brand(.caption)).foregroundStyle(Brand.ink2).tint(Brand.ink).multilineTextAlignment(.center)
            .frame(maxWidth: .infinity).padding(.top, 2)
    }

    private func errorLine(_ text: String) -> some View {
        Label(text, systemImage: "exclamationmark.circle.fill")
            .font(.brand(.subheadline, .medium)).foregroundStyle(Brand.danger)
            .frame(maxWidth: .infinity, alignment: .leading).fixedSize(horizontal: false, vertical: true)
            .transition(.opacity)
            .accessibilityIdentifier("auth-error")
    }

    // MARK: Actions

    private func go(_ m: Mode) {
        error = nil; field = nil
        withAnimation(reduceMotion ? nil : .snappy(duration: 0.32)) { mode = m }
    }

    /// Checked here first, so the common slips get a plain answer without a trip to the server.
    private func submit() {
        let e = email.trimmingCharacters(in: .whitespaces)
        if e.isEmpty { fail(String(localized: "Enter your email"), .email); return }
        if !e.contains("@") || !e.contains(".") { fail(String(localized: "That email doesn't look right."), .email); return }
        if password.isEmpty { fail(String(localized: "Enter your password"), .password); return }
        if mode == .signUp && password.count < 6 { fail(String(localized: "Use at least 6 characters for the password."), .password); return }
        let creating = mode == .signUp, pw = password
        act { if creating { try await account.signUp(email: e, password: pw) } else { try await account.signIn(email: e, password: pw) } }
    }
    private func forgot() {
        let e = email.trimmingCharacters(in: .whitespaces)
        guard !e.isEmpty else { fail(String(localized: "Enter your email"), .email); return }
        act { try await account.resetPassword(email: e); note = String(localized: "Reset link sent to \(e)") }
    }
    private func withGoogle() {
        google = true
        act {
            let req = Google.request()
            let back = try await webAuth.authenticate(using: req.url, callback: .customScheme(Google.scheme), preferredBrowserSession: .shared, additionalHeaderFields: [:])
            try await account.finishGoogle(back, req)
        }
    }
    private func fail(_ text: String, _ f: Field) {
        withAnimation(.snappy) { error = text }
        field = f
    }
    private func act(_ work: @escaping () async throws -> Void) {
        working = true
        withAnimation(.snappy) { error = nil }
        Task {
            do { try await work(); password = "" }
            catch let e as ASWebAuthenticationSessionError where e.code == .canceledLogin {}
            catch { withAnimation(.snappy) { self.error = error.localizedDescription } }
            working = false; google = false
        }
    }
}

private struct LegalJob: Identifiable { let id: String }
