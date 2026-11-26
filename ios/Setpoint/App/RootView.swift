import SwiftUI
import UniformTypeIdentifiers
import UIKit

/// The four main sections, in Setpoint's own Liquid Glass tab bar (App/BrandTabBar.swift).
enum AppTab: String, Hashable, CaseIterable {
    case diary, progress, foods, you
}

struct RootView: View {
    @State private var store: Store
    @State private var account: Account
    // Screenshots on the build server open a given tab with the launch argument `-tab progress`.
    @State private var tab: AppTab = AppTab(rawValue: UserDefaults.standard.string(forKey: "tab") ?? "") ?? .diary
    @State private var importing = false
    @State private var pending: Data?
    @State private var message: String?
    @Environment(\.scenePhase) private var phase
    @AppStorage(DeviceSettings.haptics) private var haptics = true
    @State private var onboarding = false
    @AppStorage("checkInSeen") private var checkInSeen = ""
    private var weekReady: Bool { checkInSeen != CheckInView.weekKey && store.entries.count >= 3 && CheckInView.due }
    @State private var launching = !UIAccessibility.isReduceMotionEnabled // the dial draws itself on launch
    @State private var shotStory = UserDefaults.standard.string(forKey: "open") == "story"
    @State private var shotTarget = UserDefaults.standard.string(forKey: "open") == "target"
    @State private var tabBar = TabBarState.shared
    @State private var handoff = DialHandoff.shared
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    // build-server screenshot: `-open handoff` shows the welcome, then acts as if you signed in (the dial flight)
    @State private var demoAuth = UserDefaults.standard.string(forKey: "open") == "handoff"

    /// Nobody is signed in (screenshots use demo data without an account; -auth shows the sign-in screens anyway).
    private var needsAccount: Bool {
        let args = ProcessInfo.processInfo.arguments
        return demoAuth || args.contains("-auth") || (!args.contains("-demo") && !account.signedIn)
    }
    /// A signed-in account with nothing logged and no plan yet: it's new, so it sets up its plan first.
    private var needsPlan: Bool {
        !ProcessInfo.processInfo.arguments.contains("-demo") && account.signedIn && store.food.isEmpty
            && store.root["profile"]?.object?["heightCm"] == nil
            && store.syncValue("lastSync") != nil // checked with the account (offline, an empty phone proves nothing)
    }

    init() {
        _store = State(initialValue: Store.shared)
        _account = State(initialValue: Account.shared)
    }

    /// Go to the diary and start an action from outside the app (a widget, a control).
    private func open(_ a: QuickAction?) {
        tab = .diary
        switch a {
        case .addFood: store.request = .addFood
        case .scan: store.request = .scan
        case .weight: store.request = .logWeight
        case nil: break
        }
    }

    /// A tab's icon (filled on the open tab) and name; the name fades out while the bar is compact (TabBarShrinker).
    private func tabLabel(_ title: LocalizedStringKey, _ icon: String, _ t: AppTab) -> some View {
        Label { Text(title) } icon: {
            Image(systemName: tab == t ? icon + ".fill" : icon).environment(\.symbolVariants, .none)
        }
        .accessibilityLabel(Text(title))
    }

    var body: some View {
        TabView(selection: $tab) {
            // the system's own Liquid Glass tab bar; while you scroll down a page it shrinks in place (TabBarShrinker)
            Tab(value: AppTab.diary) { DiaryView(importing: $importing) } label: { tabLabel("Diary", "book.pages", .diary) }
            Tab(value: AppTab.progress) { ProgressScreen() } label: { tabLabel("Progress", "chart.bar", .progress) }
            Tab(value: AppTab.foods) { FoodsView() } label: { tabLabel("Foods", "fork.knife.circle", .foods) }
            Tab(value: AppTab.you) { YouView(importing: $importing) } label: { tabLabel("You", "person.crop.circle", .you) }
                .badge(weekReady ? 1 : 0) // your weekly check-in is waiting
        }
        .background(TabBarShrinker(compact: tabBar.compact))
        .onChange(of: tab) { tabBar.compact = false }
        // one rule for haptics: logging something is a success, removing is a firm tap, changing is a light one
        .sensoryFeedback(trigger: store.changeCount) { _, _ in
            guard haptics else { return nil }
            switch store.changeKind { case .add: return .success; case .remove: return .impact(weight: .medium); case .edit: return .selection }
        }
        .onChange(of: store.changeCount) { if store.changeKind == .add { Sounds.play(.tick) } }
        .onChange(of: store.request) { _, r in if r != nil { tab = .diary } }
        .modifier(LockCover())
        // Setpoint needs an account: nobody signed in means the welcome and sign-in screens, over everything
        .overlay { if needsAccount { AuthFlow().environment(account).transition(.opacity) } }
        .animation(.easeInOut(duration: 0.35), value: needsAccount)
        .modifier(DialFlight(handoff: handoff, needsAccount: needsAccount, demoAuth: $demoAuth, start: { tab = .diary; startHandoff() }))
        .overlay { if launching { LaunchDial { launching = false } } }
        .fullScreenCover(isPresented: $shotStory) { WeekStory().environment(store) } // build-server screenshots
        .sheet(isPresented: $shotTarget) { TargetExplainer().environment(store) }
        .fullScreenCover(isPresented: $onboarding) { OnboardingView { onboarding = false }.environment(store).environment(account) }
        .onAppear {
            // the build server's -onboarding screenshot, or an account that never finished setting up its plan
            if ProcessInfo.processInfo.arguments.contains("-onboarding") || needsPlan { onboarding = true }
        }
        .modifier(SignInWatch(account: account, signedIn: { tab = .diary; startHandoff() }, arrived: { if needsPlan && !account.failed { onboarding = true } }))
        .tint(Brand.ink) // one quiet colour for controls; green is kept for the ring and the main actions
        .toggleStyle(SwitchToggleStyle(tint: Brand.green)) // switches stay green, as on the iPhone itself
        .font(.brand(.body))
        .foregroundStyle(Brand.ink)
        .environment(store)
        .environment(account)
        .task {
            store.onWeighIns = { changes in Task { await Health.mirror(changes) } } // Settings › Save weigh-ins to Apple Health
            await store.start(); WidgetBridge.publish(store); await account.pull(fresh: false)
        }
        .onChange(of: store.version) { WidgetBridge.publish(store) } // widgets and the Live Activity
        .onOpenURL { url in
            // From a widget: setpoint://add, ://scan or ://weight opens that; anything else just opens the diary.
            open(QuickAction(rawValue: url.host ?? ""))
        }
        // From a Control Centre control (its intent runs in the app and leaves the action in the inbox)
        .onReceive(NotificationCenter.default.publisher(for: QuickActionInbox.posted)) { _ in if let a = QuickActionInbox.take() { open(a) } }
        .task { if let a = QuickActionInbox.take() { open(a) } }
        .task { await UpdateCheck.shared.check() } // a newer build in SideStore
        .onChange(of: phase) { _, p in
            if p == .active { WidgetBridge.publish(store); Task { await store.tick(); await account.syncNow(); await Health.autoImport(store); await UpdateCheck.shared.check() } }
            if p != .active { store.flushSave() } // nothing waiting to be written when the app is left
            if p == .background { Reminders.update(store) } // only remind about what isn't done yet
        }
        .fileImporter(isPresented: $importing, allowedContentTypes: [.json, .data]) { result in
            guard case .success(let url) = result else { return }
            let ok = url.startAccessingSecurityScopedResource()
            defer { if ok { url.stopAccessingSecurityScopedResource() } }
            if let data = try? Data(contentsOf: url) {
                if store.isEmpty { apply(data) } else { pending = data }
            }
        }
        .confirmationDialog("Replace the data on this iPhone?", isPresented: Binding(get: { pending != nil }, set: { if !$0 { pending = nil } }), titleVisibility: .visible) {
            Button("Replace with backup", role: .destructive) { if let d = pending { apply(d) }; pending = nil }
        } message: {
            Text("Everything on this iPhone is replaced with the backup.")
        }
        .alert(message ?? "", isPresented: Binding(get: { message != nil }, set: { if !$0 { message = nil } })) {
            Button("OK", role: .cancel) {}
        }
    }

    /// A returning account's sign-in: the sign-in dial flies into the Diary's. New accounts, Reduce Motion and anything
    /// unmeasured get the plain fade. However it goes, `flying` always ends false, so the Diary dial can't stay hidden.
    private func startHandoff() {
        guard !reduceMotion, !handoff.skipNext, handoff.source != .zero else { handoff.skipNext = false; return }
        handoff.reset(); handoff.flying = true
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(80)) // let the Diary lay out and report its frame
            let to = handoff.target
            // only fly to a dial you can fully see (below the top bar, above the tab bar); otherwise the plain fade
            guard handoff.flying, to != .zero, visibleArea.contains(to) else { handoff.reset(); return }
            handoff.landing = to // frozen: later layout changes (the synced data arriving) don't move the landing
            withAnimation(Motion.gentle) { handoff.arrived = true } // position, size and values morph together
            try? await Task.sleep(for: .milliseconds(480))
            handoff.fading = true // the real dial fades in under the flying one
            try? await Task.sleep(for: .milliseconds(180))
            handoff.reset()
        }
    }

    /// Where a dial can land: the window, minus the top bar and the tab bar.
    private var visibleArea: CGRect {
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        let w = scene?.keyWindow
        let b = w?.bounds ?? .zero, inset = w?.safeAreaInsets ?? .zero
        return CGRect(x: b.minX, y: b.minY + inset.top + 56, width: b.width, height: b.height - inset.top - inset.bottom - 56 - 90)
    }

    private func apply(_ data: Data) {
        do {
            try store.importBackup(data)
            message = String(localized: "Imported \(store.food.keys.count) days and \(store.entries.count) weigh-ins.")
            tab = .diary
        } catch {
            message = error.localizedDescription
        }
    }
}

#Preview {
    RootView()
}

/// The sign-in dial in the air above everything (kept out of RootView.body, which the compiler can't type-check in time).
private struct DialFlight: ViewModifier {
    let handoff: DialHandoff
    let needsAccount: Bool
    @Binding var demoAuth: Bool
    let start: () -> Void
    @Environment(\.scenePhase) private var phase
    func body(content: Content) -> some View {
        content
            .overlay { if handoff.flying { FlyingDial(handoff: handoff) } }
            .onChange(of: needsAccount) { if needsAccount { handoff.reset() } } // signed out: never leave the Diary dial hidden
            .onChange(of: phase) { if phase != .active { handoff.reset() } }
            .task {
                guard demoAuth else { return }
                try? await Task.sleep(for: .seconds(1.5))
                demoAuth = false; start()
            }
    }
}

/// After signing in: go to the Diary; and once the account's data has arrived, only a truly new account goes on to set
/// up its plan (judging at the moment of signing in, before the data arrived, sent existing accounts to the tutorial).
struct SignInWatch: ViewModifier {
    let account: Account
    let signedIn: () -> Void
    let arrived: () -> Void
    func body(content: Content) -> some View {
        content
            .onChange(of: account.signedIn) { _, on in if on { signedIn() } }
            .onChange(of: account.arrived) { arrived() }
    }
}
