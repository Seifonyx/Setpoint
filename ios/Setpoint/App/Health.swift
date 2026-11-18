import Foundation
import HealthKit

/// Apple Health: weigh-ins from your smart scale, your average steps for your activity, and (if you turn it on)
/// your weigh-ins saved to Health.
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
            return .unavailable(String(localized: "This install of Setpoint can't use Apple Health. It needs the Health test build (and an Apple ID that allows it).") + "\n\n" + diagnosis(error))
        }
        // Weigh-ins from the last 60 days: the first of each day, added where you haven't logged one.
        let start = Calendar.current.date(byAdding: .day, value: -60, to: Date())!
        let samples: [HKQuantitySample] = (try? await HKSampleQueryDescriptor(
            predicates: [.quantitySample(type: mass, predicate: HKQuery.predicateForSamples(withStart: start, end: Date()))],
            sortDescriptors: [SortDescriptor(\.startDate)]).result(for: store)) ?? []
        var byDay: [String: Double] = [:]
        for s in samples where !mine(s) { // not the weigh-ins Setpoint saved there itself
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

    // MARK: Saving weigh-ins to Health

    /// Settings › Apple Health › Save weigh-ins to Apple Health.
    static let writeKey = "healthWrite"
    static var writing: Bool { UserDefaults.standard.bool(forKey: writeKey) }
    private static let tag = "setpoint-weight-"
    /// A weigh-in Setpoint saved (tagged with its day), so importing never brings it back as a new one.
    private static func mine(_ s: HKSample) -> Bool { (s.metadata?[HKMetadataKeyExternalUUID] as? String)?.hasPrefix(tag) == true }

    /// Asks for permission to save weigh-ins. Returns why it can't, or nil when it can.
    static func enableWriting() async -> String? {
        guard HKHealthStore.isHealthDataAvailable() else { return String(localized: "Apple Health isn't available on this device.") }
        let mass = HKQuantityType(.bodyMass)
        do { try await store.requestAuthorization(toShare: [mass], read: [mass, HKQuantityType(.stepCount)]) }
        catch { return String(localized: "This install of Setpoint can't use Apple Health. It needs the Health test build (and an Apple ID that allows it).") }
        guard store.authorizationStatus(for: mass) == .sharingAuthorized else {
            return String(localized: "Allow Setpoint to write Weight in the Health app (Profile › Apps › Setpoint), then try again.")
        }
        return nil
    }

    /// Brings Health in line with your weigh-ins for the days that changed (day → kg, or nil when deleted):
    /// Setpoint's own entry for that day is replaced or removed. A day that already has the same weight in Health
    /// from somewhere else (your smart scale, say) gets nothing, so nothing is doubled.
    static func mirror(_ changes: [String: Double?]) async {
        guard writing, HKHealthStore.isHealthDataAvailable() else { return }
        let mass = HKQuantityType(.bodyMass), kgUnit = HKUnit.gramUnit(with: .kilo)
        guard store.authorizationStatus(for: mass) == .sharingAuthorized else { return }
        for (day, kg) in changes {
            let id = tag + day
            let ours = HKQuery.predicateForObjects(withMetadataKey: HKMetadataKeyExternalUUID, allowedValues: [id])
            _ = try? await store.deleteObjects(of: mass, predicate: ours)
            guard let kg, (20...400).contains(kg) else { continue }
            let start = Day.date(day), end = Calendar.current.date(byAdding: .day, value: 1, to: start)!
            let that = (try? await HKSampleQueryDescriptor(
                predicates: [.quantitySample(type: mass, predicate: HKQuery.predicateForSamples(withStart: start, end: end))],
                sortDescriptors: []).result(for: store)) ?? []
            if that.contains(where: { abs($0.quantity.doubleValue(for: kgUnit) - kg) < 0.05 }) { continue }
            let when = day == Day.today ? Date() : Calendar.current.date(byAdding: .hour, value: 8, to: start)!
            let sample = HKQuantitySample(type: mass, quantity: HKQuantity(unit: kgUnit, doubleValue: kg), start: when, end: when,
                                          metadata: [HKMetadataKeyExternalUUID: id, HKMetadataKeyWasUserEntered: true])
            try? await store.save(sample)
        }
    }

    /// What went wrong, for working out whether SideStore kept the Health permission: the app version, whether the
    /// signing profile SideStore made includes HealthKit, and the error iOS gave.
    /// Whether this install can use Apple Health at all: SideStore removes the HealthKit permission when it signs
    /// with a free Apple ID, and then Settings hides the button. It comes back on its own if the permission is there.
    static var allowed: Bool {
        guard HKHealthStore.isHealthDataAvailable(),
              let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
              let data = try? Data(contentsOf: url), let text = String(data: data, encoding: .isoLatin1) else { return false }
        return text.contains("com.apple.developer.healthkit")
    }
    static func diagnosis(_ error: Error) -> String {
        let info = Bundle.main.infoDictionary
        let version = "\(info?["CFBundleShortVersionString"] as? String ?? "?") (\(info?["CFBundleVersion"] as? String ?? "?"))"
        var profile = "no profile"
        if let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
           let data = try? Data(contentsOf: url), let text = String(data: data, encoding: .isoLatin1) {
            profile = text.contains("com.apple.developer.healthkit") ? "HealthKit in profile" : "no HealthKit in profile"
        }
        let e = error as NSError
        return "Setpoint \(version) · \(profile) · \(e.domain) \(e.code): \(e.localizedDescription)"
    }
}

