import SwiftUI

/// Your log as spreadsheet files (CSV) for Numbers, Excel or Google Sheets: weigh-ins, daily totals and every food.
/// Unlike a backup (one file to restore from), these are for reading and charting your data elsewhere.
struct ExportView: View {
    @Environment(Store.self) private var store
    @State private var days = 90          // 0: everything
    @State private var files: [URL] = []
    @State private var error: String?

    var body: some View {
        Form {
            Section {
                Picker("Time period", selection: $days) {
                    Text("Last 30 days").tag(30); Text("Last 90 days").tag(90); Text("Last year").tag(365); Text("Everything").tag(0)
                }
            } footer: {
                Text("Three files: your weigh-ins, your daily totals, and every food you logged. They open in Numbers, Excel or Google Sheets.")
            }
            Section {
                if files.isEmpty {
                    Text("Nothing logged in this range").foregroundStyle(.secondary)
                } else {
                    ShareLink(items: files) {
                        Label("Export \(files.count) files", systemImage: "square.and.arrow.up")
                    }
                }
            } footer: {
                if !files.isEmpty { Text(summary) }
            }
            if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
        }
        .brandList()
        .navigationTitle("Export to a spreadsheet")
        .navigationBarTitleDisplayMode(.inline)
        .task(id: "\(days)|\(store.version)") { make() }
    }

    private var from: String { days == 0 ? "0000-00-00" : Day.add(Day.today, -(days - 1)) }
    private var foodDays: [String] { store.food.keys.filter { $0 >= from && $0 <= Day.today && !store.items($0).isEmpty }.sorted() }
    private var weighIns: [WeighIn] { store.entries.filter { $0.date >= from && $0.date <= Day.today }.sorted { $0.date < $1.date } }
    private var summary: String {
        String(localized: "\(weighIns.count) weigh-ins and \(foodDays.count) days of food.")
    }

    private func make() {
        let w = weighIns, fd = foodDays
        guard !w.isEmpty || !fd.isEmpty else { files = []; return }
        let unit = store.unit, lb = unit == "lb"
        let wt: (Double) -> String = { kg in num(lb ? kg * 2.20462 : kg, 1) }
        var out: [URL] = []
        do {
            let dir = FileManager.default.temporaryDirectory.appendingPathComponent("Setpoint export", isDirectory: true)
            try? FileManager.default.removeItem(at: dir)
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            let stamp = Day.today

            if !w.isEmpty {
                var rows = [["Date", "Weight (\(unit))", "Excluded from trend", "Note"]]
                rows += w.map { [$0.date, wt($0.kg), $0.excluded ? "yes" : "", $0.note] }
                out.append(try write(rows, "Setpoint weigh-ins \(stamp).csv", in: dir))
            }
            // every day with food or a weigh-in, so the totals line up with the weights
            let allDays = Set(fd).union(w.map(\.date)).sorted()
            if !allDays.isEmpty {
                var rows = [["Date", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)", "Calorie target (kcal)", "Water (ml)", "Weight (\(unit))"]]
                for d in allDays {
                    let t = store.totals(d), p = store.plans[d] ?? store.plan(d)
                    rows.append([d, num(t.kcal, 0), num(t.protein, 1), num(t.carbs, 1), num(t.fat, 1),
                                 p.map { num($0.kcal, 0) } ?? "", store.waterOn(d) > 0 ? num(store.waterOn(d), 0) : "", store.entry(d).map { wt($0.kg) } ?? ""])
                }
                out.append(try write(rows, "Setpoint daily totals \(stamp).csv", in: dir))
            }
            if !fd.isEmpty {
                let names = Dictionary(store.meals.map { ($0.key, $0.name) }, uniquingKeysWith: { a, _ in a })
                var rows = [["Date", "Time", "Meal", "Food", "Amount", "Unit", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)", "Planned"]]
                for d in fd {
                    for f in store.items(d) {
                        rows.append([d, f.time ?? "", names[f.meal] ?? f.meal, f.displayName, f.qty.map { num($0, 2) } ?? "", f.unit ?? "",
                                     num(f.kcal, 0), num(f.protein, 1), num(f.carbs, 1), num(f.fat, 1), f.isPlanned ? "yes" : ""])
                    }
                }
                out.append(try write(rows, "Setpoint food log \(stamp).csv", in: dir))
            }
            files = out; error = nil
        } catch {
            files = []; self.error = error.localizedDescription
        }
    }

    /// Plain numbers with a dot, whatever the iPhone's language, so every spreadsheet reads them as numbers.
    private func num(_ v: Double, _ places: Int) -> String {
        let s = String(format: "%.\(places)f", locale: Locale(identifier: "en_US_POSIX"), v)
        guard places > 0, s.contains(".") else { return s }
        var t = s
        while t.hasSuffix("0") { t.removeLast() }
        if t.hasSuffix(".") { t.removeLast() }
        return t
    }
    private func write(_ rows: [[String]], _ name: String, in dir: URL) throws -> URL {
        let text = rows.map { $0.map(Self.cell).joined(separator: ",") }.joined(separator: "\r\n") + "\r\n"
        let url = dir.appendingPathComponent(name)
        // with a byte-order mark so Excel reads Arabic food names correctly
        try (Data([0xEF, 0xBB, 0xBF]) + Data(text.utf8)).write(to: url, options: .atomic)
        return url
    }
    /// A CSV cell: quoted when it holds a comma, quote or line break; a leading = + - @ is defused so a
    /// spreadsheet never runs it as a formula.
    static func cell(_ v: String) -> String {
        var s = v
        if let c = s.first, "=+@".contains(c) || (c == "-" && Double(s) == nil) { s = "'" + s }
        guard s.contains(where: { $0 == "," || $0 == "\"" || $0 == "\n" || $0 == "\r" }) else { return s }
        return "\"" + s.replacingOccurrences(of: "\"", with: "\"\"") + "\""
    }
}
