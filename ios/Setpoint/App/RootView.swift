import SwiftUI

/// The four main sections in the iOS 26 tab bar (real Liquid Glass, drawn by the system).
enum AppTab: String, Hashable, CaseIterable {
    case diary, progress, foods, you
}

struct RootView: View {
    // Screenshots on the build server open a given tab with the launch argument `-tab progress`.
    @State private var tab: AppTab = AppTab(rawValue: UserDefaults.standard.string(forKey: "tab") ?? "") ?? .diary

    var body: some View {
        TabView(selection: $tab) {
            Tab("Diary", systemImage: "book.pages", value: AppTab.diary) {
                DiaryView()
            }
            Tab("Progress", systemImage: "chart.bar.xaxis", value: AppTab.progress) // bars read the same in Arabic (the trend arrow flipped and looked like going down) {
                ProgressScreen()
            }
            Tab("Foods", systemImage: "fork.knife", value: AppTab.foods) {
                FoodsView()
            }
            Tab("You", systemImage: "person.crop.circle", value: AppTab.you) {
                YouView()
            }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
    }
}

#Preview {
    RootView()
}
