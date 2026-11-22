import SwiftUI
import UIKit

@main
struct SetpointApp: App {
    init() { Brand.applyAppearance() }

    var body: some Scene {
        WindowGroup {
            RootView()
                .task { FastAnimations.applyIfAsked() }
        }
    }
}

/// The UI tests' quick checks launch with -fastAnimations: animations run 30 times faster, so the tests don't wait for
/// them to settle after every tap. Never in normal use (only that launch argument turns it on).
enum FastAnimations {
    @MainActor static func applyIfAsked() {
        guard ProcessInfo.processInfo.arguments.contains("-fastAnimations") else { return }
        UIView.setAnimationsEnabled(false)
        for scene in UIApplication.shared.connectedScenes {
            for window in (scene as? UIWindowScene)?.windows ?? [] { window.layer.speed = 30 }
        }
    }
}
