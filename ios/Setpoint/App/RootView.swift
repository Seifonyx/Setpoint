import SwiftUI
import UniformTypeIdentifiers
import UIKit

/// The four main sections in the iOS 26 tab bar (real Liquid Glass, drawn by the system).
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

    var body: some View {
        TabView(selection: $tab) {
            Tab(value: AppTab.diary) {
                DiaryView(importing: $importing)
            } label: { TabIcon(title: "Diary", icon: tab == .diary ? "book.pages.fill" : "book.pages") }
            // bars read the same in Arabic (the trend arrow flipped and looked like going down)
            Tab(value: AppTab.progress) {
                ProgressScreen()
            } label: { TabIcon(title: "Progress", icon: tab == .progress ? "chart.bar.fill" : "chart.bar") }
            Tab(value: AppTab.foods) {
                FoodsView()
            } label: { TabIcon(title: "Foods", icon: tab == .foods ? "fork.knife.circle.fill" : "fork.knife.circle") }
            Tab(value: AppTab.you) {
                YouView(importing: $importing)
            } label: { TabIcon(title: "You", icon: tab == .you ? "person.crop.circle.fill" : "person.crop.circle") }
            .badge(weekReady ? 1 : 0) // your weekly check-in is waiting
        }
        .tabBarMinimizeBehavior(.onScrollDown)
        // one rule for haptics: logging something is a success, removing is a firm tap, changing is a light one
        .sensoryFeedback(trigger: store.changeCount) { _, _ in
            guard haptics else { return nil }
            switch store.changeKind { case .add: return .success; case .remove: return .impact(weight: .medium); case .edit: return .selection }
        }
        .onChange(of: store.changeCount) { if store.changeKind == .add { Sounds.play(.tick) } }
        .onChange(of: store.request) { _, r in if r != nil { tab = .diary } }
        .modifier(LockCover())
        .overlay { if launching { LaunchDial { launching = false } } }
        .fullScreenCover(isPresented: $shotStory) { WeekStory().environment(store) } // build-server screenshots
        .sheet(isPresented: $shotTarget) { TargetExplainer().environment(store) }
        .fullScreenCover(isPresented: $onboarding) { OnboardingView { onboarding = false }.environment(store).environment(account) }
        .onAppear {
            // First launch on a fresh install (or the build server's -onboarding screenshot).
            let args = ProcessInfo.processInfo.arguments
            if args.contains("-onboarding") || (!args.contains("-demo") && store.isEmpty && !account.signedIn && !UserDefaults.standard.bool(forKey: "onboarded")) { onboarding = true }
        }
        .tint(Brand.ink) // one quiet colour for controls; green is kept for the ring and the main actions
        .toggleStyle(SwitchToggleStyle(tint: Brand.green)) // switches stay green, as on the iPhone itself
        .font(.brand(.body))
        .foregroundStyle(Brand.ink)
        .environment(store)
        .environment(account)
        .task { await store.start(); WidgetBridge.publish(store); await account.pull(fresh: false) }
        .onChange(of: store.version) { WidgetBridge.publish(store) } // widgets and the Live Activity
        .onOpenURL { url in
            // From a widget: setpoint://add, ://scan or ://weight opens that; anything else just opens the diary.
            open(QuickAction(rawValue: url.host ?? ""))
        }
        // From a Control Centre control (its intent runs in the app and leaves the action in the inbox)
        .onReceive(NotificationCenter.default.publisher(for: QuickActionInbox.posted)) { _ in if let a = QuickActionInbox.take() { open(a) } }
        .task { if let a = QuickActionInbox.take() { open(a) } }
        .onChange(of: phase) { _, p in
            if p == .active { WidgetBridge.publish(store); Task { await store.tick(); await account.syncNow() } }
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

/// A tab's icon exactly as named: filled on the tab you're on, outlined on the others (the tab bar would fill them all).
struct TabIcon: View {
    let title: LocalizedStringKey
    let icon: String
    var body: some View {
        Label { Text(title) } icon: { Image(systemName: icon).environment(\.symbolVariants, .none) }
    }
}
