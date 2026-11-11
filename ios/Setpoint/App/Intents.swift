import AppIntents
import Foundation

/// Siri and Shortcuts: "Log water in Setpoint", "Log my weight in Setpoint", "Add food in Setpoint".
/// They run inside the app (no extension), so they work with a free Apple ID.

struct LogWaterIntent: AppIntent {
    static let title: LocalizedStringResource = "Log water"
    static let description = IntentDescription("Adds water to today in Setpoint.")

    @Parameter(title: "Amount (ml)", default: 250, inclusiveRange: (50, 2000))
    var ml: Int

    static var parameterSummary: some ParameterSummary { Summary("Log \(\.$ml) ml of water") }

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let store = Store.shared
        store.addWater(Double(ml), on: Day.today)
        let total = Fmt.ml(store.waterOn(Day.today))
        return .result(dialog: "Added. \(total) today.")
    }
}

struct LogWeightIntent: AppIntent {
    static let title: LocalizedStringResource = "Log weight"
    static let description = IntentDescription("Saves today's weigh-in in Setpoint, in your app's unit (kg or lb).")

    @Parameter(title: "Weight")
    var weight: Double?

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let store = Store.shared
        let w: Double
        if let weight { w = weight } else { w = try await $weight.requestValue(IntentDialog("What's your weight in \(store.unit)?")) }
        let kg = store.unit == "lb" ? w / 2.20462 : w
        guard (20...400).contains(kg) else { return .result(dialog: "That weight doesn't look right.") }
        let old = store.entry(Day.today)
        store.logWeight(kg, on: Day.today, note: old?.note ?? "", excluded: old?.excluded ?? false)
        return .result(dialog: "Saved \(Fmt.weight(kg, unit: store.unit)) \(store.unit) for today.")
    }
}

struct AddFoodIntent: AppIntent {
    static let title: LocalizedStringResource = "Add food"
    static let description = IntentDescription("Opens Setpoint ready to search for a food.")
    static let openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        Store.shared.request = .addFood
        return .result()
    }
}

struct SetpointShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: LogWaterIntent(), phrases: ["Log water in \(.applicationName)", "Add water in \(.applicationName)"],
                    shortTitle: "Log water", systemImageName: "drop.fill")
        AppShortcut(intent: LogWeightIntent(), phrases: ["Log my weight in \(.applicationName)", "Log weight in \(.applicationName)"],
                    shortTitle: "Log weight", systemImageName: "scalemass.fill")
        AppShortcut(intent: AddFoodIntent(), phrases: ["Add food in \(.applicationName)", "Log food in \(.applicationName)"],
                    shortTitle: "Add food", systemImageName: "fork.knife")
    }
}
