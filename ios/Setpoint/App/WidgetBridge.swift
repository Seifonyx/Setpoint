import Foundation
import WidgetKit
import ActivityKit

/// Keeps the widgets and the Live Activity up to date with today.
@MainActor
enum WidgetBridge {
    static let liveKey = "liveActivity" // on this iPhone only
    private static var last: WidgetDay?

    /// After every change: take in water added from a widget, write today's summary and refresh the widgets.
    static func publish(_ store: Store) {
        takePending(store)
        let day = summary(store)
        if day != last {
            last = day
            day.save()
            WidgetCenter.shared.reloadAllTimelines()
        }
        let on = UserDefaults.standard.bool(forKey: liveKey) && day.trackCalories && day.target > 0
        Task { await LiveDay.sync(day, on: on) }
    }

    /// Water logged with a widget's button while the app was closed.
    private static func takePending(_ store: Store) {
        guard let d = SharedBox.defaults, let pending = d.dictionary(forKey: SharedBox.pendingWaterKey) as? [String: Double], !pending.isEmpty else { return }
        d.removeObject(forKey: SharedBox.pendingWaterKey)
        for (day, ml) in pending where ml > 0 { store.addWater(ml, on: day) }
    }

    static func summary(_ store: Store) -> WidgetDay {
        let today = Day.today
        let t = store.totals(today)
        let p = store.plans[today] ?? store.plan(today)
        let weighIns = store.entries.filter { !$0.excluded }
        let last = weighIns.last
        return WidgetDay(day: today, eaten: t.kcal, target: p?.kcal ?? 0,
                         protein: t.protein, carbs: t.carbs, fat: t.fat,
                         proteinTarget: p?.protein ?? 0, carbsTarget: p?.carbs ?? 0, fatTarget: p?.fat ?? 0,
                         water: store.waterOn(today), waterGoal: store.waterGoal, waterStep: store.waterSizes.first ?? 250,
                         weightKg: last?.kg, weightDay: last?.date, recent: weighIns.suffix(14).map(\.kg),
                         unit: store.unit, trackCalories: store.root["settings"]?.object?["trackCalories"]?.bool ?? true)
    }
}

/// The Live Activity (calories left on the Lock Screen and in the Dynamic Island), when it's turned on in Settings.
enum LiveDay {
    static func sync(_ day: WidgetDay, on: Bool) async {
        let running = Activity<DayActivity>.activities
        guard on else {
            for a in running { await a.end(nil, dismissalPolicy: .immediate) }
            return
        }
        let tomorrow = Calendar.current.startOfDay(for: Date().addingTimeInterval(86_400))
        let content = ActivityContent(state: day.activityState, staleDate: tomorrow)
        if let a = running.first {
            if a.content.state != content.state { await a.update(content) }
            for extra in running.dropFirst() { await extra.end(nil, dismissalPolicy: .immediate) }
        } else if ActivityAuthorizationInfo().areActivitiesEnabled {
            _ = try? Activity.request(attributes: DayActivity(), content: content)
        }
    }
}
