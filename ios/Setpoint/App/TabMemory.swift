import SwiftUI
import UIKit

/// When the tabs keep your place and when they start fresh, the way the iPhone's own apps and the top trackers do it:
/// - Switching tabs keeps each tab where you left it (Apple's tab bar guidance).
/// - Tapping the tab you're already on: from a screen further in, back to that tab's main screen; on the main screen,
///   the system scrolls it to the top, and the Diary also goes back to today.
/// - Back after an hour or more, or on a new day: every tab starts on its main screen, the Diary on today, and the app
///   opens on the Diary. Not when something is still open on top (a sheet you were filling in): an unfinished task wins.
@MainActor @Observable
final class TabMemory {
    static let shared = TabMemory()
    /// How long away before the app starts fresh.
    static let away: TimeInterval = 60 * 60

    /// Goes up to rebuild a tab from its main screen (used as the tab's identity).
    private(set) var generation: [AppTab: Int] = [:]
    /// Goes up when the Diary's tab is tapped while it's already on its main screen: back to today.
    private(set) var diaryToday = 0
    /// Whether each tab is showing its main screen (not a screen pushed from it).
    @ObservationIgnored private var atRoot: [AppTab: Bool] = [:]
    @ObservationIgnored private var leftAt: Date?
    @ObservationIgnored private var leftDay: String?

    func id(_ tab: AppTab) -> Int { generation[tab, default: 0] }
    /// A tab's main screen appeared or went. A rebuilt tab's old main screen can report going after the new one
    /// appeared, so reports from an older build of the tab are ignored.
    func shown(_ tab: AppTab, generation g: Int, root: Bool) {
        guard g == id(tab) else { return }
        atRoot[tab] = root
    }

    /// The open tab was tapped again.
    func reselected(_ tab: AppTab) {
        if atRoot[tab] == false { generation[tab, default: 0] += 1; atRoot[tab] = true }
        else if tab == .diary { diaryToday += 1 }
    }

    /// The app went to the background.
    func left() { leftAt = Date(); leftDay = Day.today }

    /// Back in the app: true when everything should start fresh (checked once per return).
    func returnIsStale() -> Bool {
        guard let at = leftAt else { return false }
        leftAt = nil
        guard Date().timeIntervalSince(at) >= Self.away || leftDay != Day.today else { return false }
        return !Self.somethingOpen
    }

    func resetAll() {
        for t in AppTab.allCases { generation[t, default: 0] += 1; atRoot[t] = true }
    }

    /// A sheet, cover, alert or menu is showing over the tabs.
    private static var somethingOpen: Bool {
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
        return scene?.keyWindow?.rootViewController?.presentedViewController != nil
    }
}

extension View {
    /// Marks a tab's main screen, so tapping its tab again knows whether there's a screen to go back from.
    func tabRoot(_ tab: AppTab) -> some View {
        let g = TabMemory.shared.id(tab)
        return onAppear { TabMemory.shared.shown(tab, generation: g, root: true) }
            .onDisappear { TabMemory.shared.shown(tab, generation: g, root: false) }
    }
}
