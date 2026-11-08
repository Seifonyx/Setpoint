import Foundation

/// Days are written like the web app writes them: "2026-11-08", in local time.
enum Day {
    static func iso(_ d: Date) -> String {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: d)
        return String(format: "%04d-%02d-%02d", c.year ?? 2000, c.month ?? 1, c.day ?? 1)
    }
    static func date(_ day: String) -> Date {
        let p = day.split(separator: "-").compactMap { Int($0) }
        guard p.count == 3 else { return Date() }
        return Calendar.current.date(from: DateComponents(year: p[0], month: p[1], day: p[2], hour: 12)) ?? Date()
    }
    static func add(_ day: String, _ days: Int) -> String {
        Day.iso(Calendar.current.date(byAdding: .day, value: days, to: Day.date(day)) ?? Date())
    }
    static var today: String { iso(Date()) }
    /// 0 = Sunday … 6 = Saturday, as the web app counts weekdays.
    static func weekday(_ day: String) -> Int { Calendar.current.component(.weekday, from: Day.date(day)) - 1 }
}

enum Fmt {
    static func kcal(_ v: Double) -> String { Int(v.rounded()).formatted(.number) }
    static func grams(_ v: Double) -> String { Int(v.rounded()).formatted(.number) }
    static func weight(_ kg: Double, unit: String) -> String {
        (unit == "lb" ? kg * 2.20462 : kg).formatted(.number.precision(.fractionLength(1)))
    }
    static func ml(_ v: Double) -> String {
        v >= 1000 ? (v / 1000).formatted(.number.precision(.fractionLength(0...2))) + " L" : Int(v).formatted(.number) + " ml"
    }
    static func amount(_ qty: Double, _ unit: String) -> String {
        qty.formatted(.number.precision(.fractionLength(0...2))) + " " + unit
    }
}
