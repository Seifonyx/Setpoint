import SwiftUI
import UniformTypeIdentifiers

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

    init() {
        _store = State(initialValue: Store.shared)
        _account = State(initialValue: Account.shared)
    }

    var body: some View {
        TabView(selection: $tab) {
            Tab("Diary", systemImage: "book.pages", value: AppTab.diary) {
                DiaryView(importing: $importing)
            }
            // bars read the same in Arabic (the trend arrow flipped and looked like going down)
            Tab("Progress", systemImage: "chart.bar.xaxis", value: AppTab.progress) {
                ProgressScreen()
            }
            Tab("Foods", systemImage: "fork.knife", value: AppTab.foods) {
                FoodsView()
            }
            Tab("You", systemImage: "person.crop.circle", value: AppTab.you) {
                YouView(importing: $importing)
            }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
        .sensoryFeedback(trigger: store.changeCount) { _, _ in haptics ? .success : nil }
        .onChange(of: store.request) { _, r in if r != nil { tab = .diary } }
        .modifier(LockCover())
        .environment(store)
        .environment(account)
        .task { await store.start(); await account.pull(fresh: false) }
        .onChange(of: phase) { _, p in if p == .active { Task { await store.tick(); await account.syncNow() } } }
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
