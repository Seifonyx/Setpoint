import Foundation
import HealthKit

/// Apple Health: weigh-ins from your smart scale, and your average steps for your activity.
/// Needs the HealthKit permission, which only the "health" test build carries (a free Apple ID may not allow it);
/// everywhere else this reports that Health isn't available, and nothing else changes.
@MainActor
enum Health {
    static let store = HKHealthStore()
    enum Result { case imported(weights: Int, steps: Int?), unavailable(String) }

    static func sync(_ app: Store) async -> Result {
        guard HKHealthStore.isHealthDataAvailable() else { return .unavailable(String(localized: "Apple Health isn't available on this device.")) }
        let mass = HKQuantityType(.bodyMass), steps = HKQuantityType(.stepCount)
        do {
            try await store.requestAuthorization(toShare: [], read: [mass, steps])
        } catch {
            return .unavailable(String(localized: "This install of Setpoint can't use Apple Health. It needs the Health test build (and an Apple ID that allows it)."))
        }
        // Weigh-ins from the last 60 days: the first of each day, added where you haven't logged one.
        let start = Calendar.current.date(byAdding: .day, value: -60, to: Date())!
        let samples: [HKQuantitySample] = (try? await HKSampleQueryDescriptor(
            predicates: [.quantitySample(type: mass, predicate: HKQuery.predicateForSamples(withStart: start, end: Date()))],
            sortDescriptors: [SortDescriptor(\.startDate)]).result(for: store)) ?? []
        var byDay: [String: Double] = [:]
        for s in samples {
            let d = Day.iso(s.startDate)
            if byDay[d] == nil { byDay[d] = s.quantity.doubleValue(for: .gramUnit(with: .kilo)) }
        }
        var added = 0
        for (d, kg) in byDay.sorted(by: { $0.key < $1.key }) where app.entry(d) == nil && (20...400).contains(kg) {
            app.logWeight(kg, on: d, note: String(localized: "From Apple Health"), excluded: false); added += 1
        }
        // Average daily steps over the last 14 full days.
        let s14 = Calendar.current.date(byAdding: .day, value: -14, to: Calendar.current.startOfDay(for: Date()))!
        let sum = try? await HKStatisticsQueryDescriptor(
            predicate: .quantitySample(type: steps, predicate: HKQuery.predicateForSamples(withStart: s14, end: Calendar.current.startOfDay(for: Date()))),
            options: .cumulativeSum).result(for: store)
        let total = sum?.sumQuantity()?.doubleValue(for: .count())
        let avg = total.map { Int(($0 / 14 / 100).rounded() * 100) }
        if let a = avg, a > 500 { app.setProfile { $0["steps"] = .number(Double(a)) } }
        return .imported(weights: added, steps: avg)
    }
}
