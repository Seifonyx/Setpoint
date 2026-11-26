import SwiftUI
import AuthenticationServices

/// The front door: Setpoint needs an account, so your log is saved and follows you to a new phone.
/// One centred card (the dial, the title, email and password, the main button, Google), with the switch between
/// signing in and creating an account under it and the terms in gray at the very bottom.
/// Shown over the app whenever nobody is signed in.
struct AuthFlow: View {
    enum Mode: String { case signUp = "signup", signIn = "signin" }

    @Environment(Account.self) private var account
    @Environment(\.webAuthenticationSession) private var webAuth
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // build-server screenshots: -auth signin / signup (the old "welcome" is the sign-in card now)
    @State private var mode = Mode(rawValue: UserDefaults.standard.string(forKey: "auth") ?? "") ?? .signIn
    @State private var email = ""
    @State private var password = ""
    @State private var reveal = false
    @State private var working = false
    @State private var google = false
    @State private var error: String?
    @State private var note: String?
    @State private var legal: String?   // a legal page open over the sign-in (the app's own copy)
    @State private var shown = 0.0
    // "google" | "email"; `-lastUsed google` shows the bubble in a build-server screenshot
    @State private var lastUsed = UserDefaults.standard.string(forKey: "lastUsed") ?? UserDefaults.standard.string(forKey: "lastSignInMethod")
    @State private var handoff = DialHandoff.shared
    @FocusState private var field: Field?
    enum Field { case email, password }

    private var creating: Bool { mode == .signUp }

    var body: some View {
        ZStack {
            PaperBackground().ignoresSafeArea()
            GeometryReader { g in
                ScrollView {
                    VStack(spacing: 18) { card; switchLink }
                        .frame(maxWidth: 420)
                        .padding(.horizontal, 20).padding(.vertical, 24)
                        .frame(maxWidth: .infinity, minHeight: g.size.height)
                }
                .scrollDismissesKeyboard(.interactively)
                .scrollBounceBehavior(.basedOnSize)
            }
        }
        .safeAreaInset(edge: .bottom) { if field == nil { terms } }
        .tint(Brand.ink)
        .font(.brand(.body))
        .foregroundStyle(Brand.ink)
        .sensoryFeedback(.selection, trigger: mode)
        .sensoryFeedback(.error, trigger: error) { _, new in new != nil }
        .onChange(of: email) { if error != nil { withAnimation(.snappy) { error = nil } } } // fixing it clears the complaint
        .onChange(of: password) { if error != nil { withAnimation(.snappy) { error = nil } } }
        .environment(\.openURL, OpenURLAction { url in
            if let id = LegalLink.page(url) { legal = id; return .handled }
            return .systemAction
        })
        .sheet(item: Binding(get: { legal.map(LegalJob.init) }, set: { legal = $0?.id })) { LegalSheet(page: $0.id) }
        .alert(note ?? "", isPresented: Binding(get: { note != nil }, set: { if !$0 { note = nil } })) { Button("OK", role: .cancel) {} }
    }

    // MARK: The card

    private var card: some View {
        VStack(spacing: 16) {
            dial
            Text(creating ? LocalizedStringKey("Create your account") : LocalizedStringKey("Sign in to Setpoint"))
                .font(Brand.display(26, .heavy)).multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
                .id(mode).transition(.opacity)
            VStack(spacing: 12) {
                emailBox
                passwordBox
                belowPassword
                if let error { errorLine(error) }
            }
            mainButton
            divider
            googleButton
        }
        .modifier(BrandCardStyle(padding: 24))
    }

    /// The artwork: the dial filling. It's also the one that flies into the Diary's dial after signing in.
    private var dial: some View {
        CalorieDial(eaten: shown, target: 100, protein: (shown * 0.8, 100), carbs: (shown * 0.95, 100), fat: (shown * 0.6, 100),
                    lineWidth: 9, ringWidth: 3, ringGap: 4)
            .frame(width: 84, height: 84)
            .environment(\.layoutDirection, .leftToRight)
            .accessibilityHidden(true)
            .opacity(handoff.flying ? 0 : 1)
            .onGeometryChange(for: CGRect.self) { $0.frame(in: .global) } action: { handoff.source = $0 }
            .onAppear {
                if reduceMotion { shown = 78; return }
                withAnimation(.spring(response: 1.4, dampingFraction: 0.75).delay(0.2)) { shown = 78 }
            }
    }

    private var emailBox: some View {
        box("envelope.fill", label: "Email", focused: field == .email) {
            TextField("", text: $email)
                .textContentType(creating ? .emailAddress : .username).keyboardType(.emailAddress)
                .textInputAutocapitalization(.never).autocorrectionDisabled()
                .focused($field, equals: .email).submitLabel(.next).onSubmit { field = .password }
                .accessibilityIdentifier("auth-email")
                .accessibilityLabel(Text("Email"))
        }
    }

    private var passwordBox: some View {
        box("lock.fill", label: "Password", focused: field == .password) {
            Group {
                if reveal { TextField("", text: $password).textInputAutocapitalization(.never).autocorrectionDisabled() }
                else { SecureField("", text: $password) } // (iOS leaves hidden text out of screenshots: it looks empty there)
            }
            .textContentType(creating ? .newPassword : .password)
            .focused($field, equals: .password).submitLabel(.go).onSubmit(submit)
            .accessibilityIdentifier("auth-password")
            .accessibilityLabel(Text("Password"))
        } trailing: {
            Button { reveal.toggle() } label: {
                Image(systemName: reveal ? "eye.slash" : "eye").foregroundStyle(Brand.ink2).frame(width: 32, height: 32).contentShape(.rect)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Text(reveal ? LocalizedStringKey("Hide password") : LocalizedStringKey("Show password")))
        }
    }

    @ViewBuilder private var belowPassword: some View {
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
                .font(.brand(.footnote, .semibold)).foregroundStyle(Brand.ink).buttonStyle(.plain)
                .frame(maxWidth: .infinity, alignment: .trailing).frame(minHeight: 30)
                .disabled(working)
        }
    }

    private var mainButton: some View {
        Button(action: submit) {
            ZStack {
                Text(creating ? LocalizedStringKey("Create account") : LocalizedStringKey("Sign in"))
                    .font(.brand(.headline)).opacity(working && !google ? 0 : 1)
                if working && !google { ProgressView().tint(Brand.onGreen) }
            }
            .foregroundStyle(Brand.onGreen).frame(maxWidth: .infinity, minHeight: 54)
            .background(Brand.green, in: .rect(cornerRadius: Radius.chip, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(working)
        .overlay(alignment: .topTrailing) { if lastUsed == "email" && !creating { LastUsedBubble() } }
        .accessibilityValue(Text(lastUsed == "email" && !creating ? LocalizedStringKey("Last used") : ""))
        .accessibilityIdentifier("auth-submit")
    }

    private var divider: some View {
        HStack(spacing: 12) {
            Rectangle().fill(Brand.line).frame(height: 1)
            Text(creating ? LocalizedStringKey("Or continue with") : LocalizedStringKey("Or sign in with"))
                .font(.brand(.caption)).foregroundStyle(Brand.ink2).fixedSize()
            Rectangle().fill(Brand.line).frame(height: 1)
        }
    }

    private var googleButton: some View {
        Button(action: withGoogle) {
            ZStack {
                HStack(spacing: 10) {
                    Image("GoogleG").resizable().scaledToFit().frame(width: 20, height: 20).accessibilityHidden(true)
                    Text(verbatim: "Google").font(.brand(.headline))
                }
                .opacity(working && google ? 0 : 1)
                if working && google { ProgressView() }
            }
            .foregroundStyle(Brand.ink).frame(maxWidth: .infinity, minHeight: 50)
            .background(Brand.card2, in: .rect(cornerRadius: Radius.chip, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(working)
        .overlay(alignment: .topTrailing) { if lastUsed == "google" { LastUsedBubble() } }
        .accessibilityValue(Text(lastUsed == "google" ? LocalizedStringKey("Last used") : ""))
        .accessibilityIdentifier("auth-google")
    }

    // MARK: Under the card

    private var switchLink: some View {
        Button { go(creating ? .signIn : .signUp) } label: {
            HStack(spacing: 6) {
                Text(creating ? LocalizedStringKey("Already have an account?") : LocalizedStringKey("New to Setpoint?")).foregroundStyle(Brand.ink2)
                Text(creating ? LocalizedStringKey("Sign in") : LocalizedStringKey("Create account")).foregroundStyle(Brand.green).bold()
            }
            .font(.brand(.body)).frame(maxWidth: .infinity, minHeight: 44).contentShape(.rect)
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("auth-switch")
    }

    /// Small and gray, pinned at the very bottom; hidden while you type so it doesn't ride up on the keyboard.
    private var terms: some View {
        Text("By continuing you agree to the [Terms](setpoint-legal://terms) and [Privacy Policy](setpoint-legal://privacy).")
            .font(.brand(.caption2)).foregroundStyle(Brand.ink2).tint(Brand.ink2).multilineTextAlignment(.center)
            .frame(maxWidth: .infinity).padding(.horizontal, 24).padding(.bottom, 8)
    }

    // MARK: Pieces

    /// A text well: an icon, a small label above the value, and a green edge while you're typing in it.
    private func box<C: View, T: View>(_ icon: String, label: LocalizedStringKey, focused: Bool,
                                        @ViewBuilder _ content: () -> C, @ViewBuilder trailing: () -> T = { EmptyView() }) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 16, weight: .semibold)).foregroundStyle(focused ? Brand.green : Brand.ink2).frame(width: 22)
            VStack(alignment: .leading, spacing: 2) {
                Text(label).font(.brand(.caption)).foregroundStyle(Brand.ink2)
                content()
            }
            trailing()
        }
        .font(.brand(.body))
        .padding(.horizontal, 16).frame(minHeight: 60)
        .background(Brand.card2, in: .rect(cornerRadius: Radius.chip, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Radius.chip, style: .continuous).strokeBorder(Brand.green, lineWidth: focused ? 1.5 : 0))
        .animation(.snappy(duration: 0.2), value: focused)
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
        withAnimation(reduceMotion ? nil : Motion.snappy) { mode = m }
    }

    /// Checked here first, so the common slips get a plain answer without a trip to the server.
    private func submit() {
        let e = email.trimmingCharacters(in: .whitespaces)
        if e.isEmpty { fail(String(localized: "Enter your email"), .email); return }
        if !e.contains("@") || !e.contains(".") { fail(String(localized: "That email doesn't look right."), .email); return }
        if password.isEmpty { fail(String(localized: "Enter your password"), .password); return }
        if mode == .signUp && password.count < 6 { fail(String(localized: "Use at least 6 characters for the password."), .password); return }
        let creating = self.creating, pw = password
        handoff.skipNext = creating // a new account gets the plain fade, not the dial flight
        act { [self] in
            if creating { try await account.signUp(email: e, password: pw) } else { try await account.signIn(email: e, password: pw) }
            remember("email")
        }
    }
    private func forgot() {
        let e = email.trimmingCharacters(in: .whitespaces)
        guard !e.isEmpty else { fail(String(localized: "Enter your email"), .email); return }
        act { try await account.resetPassword(email: e); note = String(localized: "Reset link sent to \(e)") }
    }
    private func withGoogle() {
        google = true
        act { [self] in
            let req = Google.request()
            let back = try await webAuth.authenticate(using: req.url, callback: .customScheme(Google.scheme), preferredBrowserSession: .shared, additionalHeaderFields: [:])
            try await account.finishGoogle(back, req)
            remember("google")
        }
    }
    private func remember(_ method: String) {
        UserDefaults.standard.set(method, forKey: "lastSignInMethod"); lastUsed = method
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

/// "Last used": a small bubble on the corner of the button you used last time. It takes no room in the row.
private struct LastUsedBubble: View {
    var body: some View {
        Text("Last used").font(.brand(.caption2, .semibold)).foregroundStyle(Brand.onGreen)
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(Brand.green, in: Capsule())
            .shadow(color: .black.opacity(0.12), radius: 4, y: 2)
            .fixedSize().allowsHitTesting(false).accessibilityHidden(true)
            .padding(.trailing, 12).offset(y: -9)
    }
}
