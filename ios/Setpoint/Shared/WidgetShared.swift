import Foundation
import AppIntents
import WidgetKit
import ActivityKit

/// Shared by the app and its widgets (this folder is built into both).
/// The app writes a small summary of today into a shared space (an App Group); the widgets only read it.

enum SharedBox {
    static let group = "group.app.setpoint.ios"
    /// SideStore renames App Groups for your Apple ID and lists the real names in Info.plist (ALTAppGroups).
    static var groupID: String {
        if let g = (Bundle.main.object(forInfoDictionaryKey: "ALTAppGroups") as? [String])?.first { return g }
        if Bundle.main.bundleURL.pathExtension == "appex" {
            let app = Bundle.main.bundleURL.deletingLastPathComponent().deletingLastPathComponent()
            if let b = Bundle(url: app), let g = (b.object(forInfoDictionaryKey: "ALTAppGroups") as? [String])?.first { return g }
        }
        return group
    }
    static var defaults: UserDefaults? { UserDefaults(suiteName: groupID) }
    static let dayKey = "widgetDay"
    static let pendingWaterKey = "pendingWater"
}

/// Today, as the widgets and the Live Activity show it. Weights are in kg.
struct WidgetDay: Codable, Equatable, Sendable {
    var day: String
    var eaten: Double
    var target: Double          // 0: no target
    var protein: Double, carbs: Double, fat: Double
    var proteinTarget: Double, carbsTarget: Double, fatTarget: Double
    var water: Double, waterGoal: Double, waterStep: Double
    var weightKg: Double?
    var weightDay: String?
    var recent: [Double]        // the last weigh-ins, oldest first
    var unit: String
    var trackCalories: Bool

    static func load() -> WidgetDay? {
        guard let data = SharedBox.defaults?.data(forKey: SharedBox.dayKey) else { return nil }
        return try? JSONDecoder().decode(WidgetDay.self, from: data)
    }
    func save() {
        if let data = try? JSONEncoder().encode(self) { SharedBox.defaults?.set(data, forKey: SharedBox.dayKey) }
    }
    /// The same targets on a day that has started since the app last wrote: nothing eaten yet.
    func on(_ today: String) -> WidgetDay {
        guard today != day else { return self }
        var d = self
        d.day = today; d.eaten = 0; d.protein = 0; d.carbs = 0; d.fat = 0; d.water = 0
        return d
    }
    var left: Double { target - eaten }
    var progress: Double { target > 0 ? min(eaten / target, 1) : 0 }
    var over: Bool { target > 0 && eaten > target * 1.05 }

    static let sample = WidgetDay(day: Day.today, eaten: 1240, target: 2050, protein: 92, carbs: 128, fat: 41,
                                  proteinTarget: 150, carbsTarget: 220, fatTarget: 65, water: 1250, waterGoal: 2200, waterStep: 250,
                                  weightKg: 78.4, weightDay: Day.today, recent: [79.6, 79.4, 79.5, 79.1, 78.9, 79.0, 78.7, 78.6, 78.4],
                                  unit: "kg", trackCalories: true)
}

/// The water button on the widgets. It runs in the widget, so it adds the water to the widget straight away and
/// leaves a note that the app picks up the next time it opens (it can't reach the app's diary from there).
struct WidgetWaterIntent: AppIntent {
    static let title: LocalizedStringResource = "Log water"
    static let isDiscoverable = false

    func perform() async throws -> some IntentResult {
        guard var day = WidgetDay.load()?.on(Day.today) else { return .result() }
        day.water += day.waterStep
        day.save()
        let d = SharedBox.defaults
        var pending = (d?.dictionary(forKey: SharedBox.pendingWaterKey) as? [String: Double]) ?? [:]
        pending[day.day, default: 0] += day.waterStep
        d?.set(pending, forKey: SharedBox.pendingWaterKey)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

/// The Live Activity: calories left on the Lock Screen and in the Dynamic Island.
struct DayActivity: ActivityAttributes {
    struct ContentState: Codable, Hashable, Sendable {
        var eaten: Double, target: Double
        var protein: Double, carbs: Double, fat: Double
        var proteinTarget: Double, carbsTarget: Double, fatTarget: Double
        var water: Double, waterGoal: Double
    }
}

extension WidgetDay {
    var activityState: DayActivity.ContentState {
        .init(eaten: eaten, target: target, protein: protein, carbs: carbs, fat: fat,
              proteinTarget: proteinTarget, carbsTarget: carbsTarget, fatTarget: fatTarget, water: water, waterGoal: waterGoal)
    }
}
