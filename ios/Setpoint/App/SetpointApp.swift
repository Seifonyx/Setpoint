import SwiftUI

@main
struct SetpointApp: App {
    init() { Brand.applyAppearance() }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
