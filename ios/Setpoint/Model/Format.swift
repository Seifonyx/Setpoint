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
    /// Days since 1 January 1970 for a "2026-11-08" day, as the web app counts them.
    static func number(_ day: String) -> Int {
        let p = day.split(separator: "-").compactMap { Int($0) }
        guard p.count == 3 else { return 0 }
        var c = DateComponents(); c.year = p[0]; c.month = p[1]; c.day = p[2]
        var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(identifier: "UTC")!
        return Int(((cal.date(from: c) ?? Date()).timeIntervalSince1970 / 86400).rounded())
    }
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
        v >= 1000 ? (v / 1000).formatted(.number.precision(.fractionLength(0...2))) + " " + String(localized: "L")
            : Int(v).formatted(.number) + " " + String(localized: "ml")
    }
    static func amount(_ qty: Double, _ unit: String) -> String {
        (unit == "g" || unit == "ml" ? qty.formatted(.number.precision(.fractionLength(0...1))) : fraction(qty)) + " " + unit
    }
    /// ½, 1½, ¼, ¾, ⅓, ⅔: how people say amounts.
    static func fraction(_ q: Double) -> String {
        let w = (q + 1e-9).rounded(.down), f = q - w
        for (v, s) in [(0.25, "¼"), (1.0 / 3, "⅓"), (0.5, "½"), (2.0 / 3, "⅔"), (0.75, "¾")] where abs(f - v) < 0.02 {
            return (w > 0 ? Int(w).formatted() : "") + s
        }
        return q.formatted(.number.precision(.fractionLength(0...2)))
    }
}
