import AppIntents
import Foundation

/// The three things worth one tap from outside the app: add a food, scan a barcode, log your weight.
/// Used by the Control Centre controls and the Lock Screen widgets (both in the widget extension).
enum QuickAction: String, AppEnum, CaseIterable {
    case addFood = "add", scan, weight

    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Action"
    static let caseDisplayRepresentations: [QuickAction: DisplayRepresentation] = [
        .addFood: "Add food", .scan: "Scan a barcode", .weight: "Log weight",
    ]
    var title: LocalizedStringResource {
        switch self { case .addFood: "Add food"; case .scan: "Scan a barcode"; case .weight: "Log weight" }
    }
    var icon: String {
        switch self { case .addFood: "fork.knife"; case .scan: "barcode.viewfinder"; case .weight: "scalemass.fill" }
    }
    /// setpoint://add, setpoint://scan, setpoint://weight (the app's own link scheme)
    var url: URL { URL(string: "setpoint://\(rawValue)")! }
}

/// Opens Setpoint straight to an action. It runs in the app (openAppWhenRun), which picks the action up from the inbox.
struct OpenQuickActionIntent: AppIntent {
    static let title: LocalizedStringResource = "Open in Setpoint"
    static let openAppWhenRun = true
    static let isDiscoverable = false

    @Parameter(title: "Action") var action: QuickAction

    init() {}
    init(_ action: QuickAction) { self.action = action }

    @MainActor
    func perform() async throws -> some IntentResult {
        QuickActionInbox.post(action)
        return .result()
    }
}

/// Hands an action from the intent to the app's screens: kept until taken, so it also works while the app is launching.
enum QuickActionInbox {
    static let key = "quickAction"
    static let posted = Notification.Name("SetpointQuickAction")

    @MainActor static func post(_ a: QuickAction) {
        UserDefaults.standard.set(a.rawValue, forKey: key)
        NotificationCenter.default.post(name: posted, object: nil)
    }
    @MainActor static func take() -> QuickAction? {
        guard let raw = UserDefaults.standard.string(forKey: key) else { return nil }
        UserDefaults.standard.removeObject(forKey: key)
        return QuickAction(rawValue: raw)
    }
}
