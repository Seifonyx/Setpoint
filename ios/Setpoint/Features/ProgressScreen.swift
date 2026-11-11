import SwiftUI
import Charts

/// Progress: your weight and its trend, weekly averages, history, and what you ate over time.
/// The trend and weeks come from the web app's own maths (via the engine).
struct ProgressScreen: View {
    @Environment(Store.self) private var store
    @State private var page = "weight"
    @AppStorage("progressRange") private var range = 90
    @State private var data: ProgressData?
    @State private var nutrition: [NutritionDay] = []
    @State private var editing: EditDay?
    @State private var showWeeks = false
    @State private var showAll = false

    struct EditDay: Identifiable { let id: String }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("Show", selection: $page) { Text("Weight").tag("weight"); Text("Nutrition").tag("nutrition") }
                        .pickerStyle(.segmented)
                    Picker("Range", selection: $range) {
                        Text("1M").tag(30); Text("3M").tag(90); Text("6M").tag(180); Text("1Y").tag(365); Text("All").tag(0)
                    }
                    .pickerStyle(.segmented)
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(top: 4, leading: 0, bottom: 4, trailing: 0))
                if page == "weight" { weightPage } else { nutritionPage }
            }
            .navigationTitle("Progress")
            .task(id: "\(store.version)|\(range)|\(store.foodsReady)") { await load() }
            .sheet(item: $editing) { WeightSheet(day: $0.id) }
        }
    }

    private func load() async {
        data = await store.engineRef.progress()
        let days = range == 0 ? max(30, (data?.points.first.map { Day.number(Day.today) - Day.number($0.date) + 1 }) ?? 30) : range
        nutrition = await store.engineRef.nutrition(days: days)
    }

    // MARK: Weight

    private var unit: String { data?.unit ?? store.unit }
    private func disp(_ kg: Double) -> Double { unit == "lb" ? kg * 2.20462 : kg }
    private var points: [ProgressData.Point] {
        guard let d = data else { return [] }
        guard range > 0 else { return d.points }
        let from = Day.number(Day.today) - range
        return d.points.filter { Day.number($0.date) > from }
    }

    @ViewBuilder private var weightPage: some View {
        let pts = points
        Section {
            VStack(alignment: .leading, spacing: 6) {
                Text("Trend weight").font(.subheadline).foregroundStyle(.secondary)
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(data?.now.map { Fmt.weight($0, unit: unit) } ?? "—").font(.system(size: 34, weight: .bold, design: .rounded))
                    Text(LocalizedStringKey(unit)).foregroundStyle(.secondary)
                    Spacer()
                    if let c = change(pts) { deltaChip(c) }
                }
                if pts.count >= 2 { chart(pts) } else {
                    Text("Log your weight a few times to see your trend.").font(.subheadline).foregroundStyle(.secondary).padding(.vertical, 30)
                }
            }
            .padding(.vertical, 4)
            if pts.count >= 2 { stats(pts) }
        }
        if let w = data?.weeks.first {
            Section("This week") {
                weekRow(w)
            }
        }
        if let d = data, !d.points.isEmpty {
            Section {
                Picker("History", selection: $showWeeks) { Text("Days").tag(false); Text("Weeks").tag(true) }.pickerStyle(.segmented)
                if showWeeks {
                    ForEach(showAll ? d.weeks : Array(d.weeks.prefix(8))) { weekRow($0) }
                    if !showAll && d.weeks.count > 8 { Button("Show all \(d.weeks.count) weeks") { showAll = true } }
                } else {
                    let rev = Array(d.points.reversed())
                    ForEach(Array((showAll ? rev : Array(rev.prefix(10))).enumerated()), id: \.element.id) { i, e in
                        dayRow(e, prev: i + 1 < rev.count ? rev[i + 1] : nil)
                    }
                    if !showAll && rev.count > 10 { Button("Show all \(rev.count)") { showAll = true } }
                }
            } header: { Text("History") }
        }
    }

    private func change(_ pts: [ProgressData.Point]) -> Double? {
        guard let a = pts.first, let b = pts.last, pts.count >= 2 else { return nil }
        return b.trend - a.trend
    }

    private func chart(_ pts: [ProgressData.Point]) -> some View {
        let lo = pts.map { min($0.kg, $0.trend) }.min() ?? 0, hi = pts.map { max($0.kg, $0.trend) }.max() ?? 1
        let goal = data?.goalKg.flatMap { g in (g >= lo - 3 && g <= hi + 3) ? g : nil }
        let yLo = disp(min(lo, goal ?? lo)) - 0.5, yHi = disp(max(hi, goal ?? hi)) + 0.5
        return Chart {
            ForEach(pts) { p in
                PointMark(x: .value("Day", Day.date(p.date), unit: .day), y: .value("Weight", disp(p.kg)))
                    .symbolSize(pts.count > 60 ? 12 : 26)
                    .foregroundStyle(p.x ? Color.secondary.opacity(0.4) : Color.accentColor.opacity(0.45))
            }
            ForEach(pts) { p in
                LineMark(x: .value("Day", Day.date(p.date), unit: .day), y: .value("Trend", disp(p.trend)))
                    .interpolationMethod(.monotone)
                    .lineStyle(StrokeStyle(lineWidth: 3, lineCap: .round))
                    .foregroundStyle(Color.accentColor)
            }
            if let g = goal {
                RuleMark(y: .value("Goal", disp(g)))
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 4]))
                    .foregroundStyle(.green)
                    .annotation(position: .top, alignment: .leading) { Text("Goal").font(.caption2).foregroundStyle(.green) }
            }
        }
        .chartYScale(domain: yLo...yHi)
        .chartXAxis { AxisMarks(values: .automatic(desiredCount: 4)) { AxisGridLine(); AxisValueLabel(format: .dateTime.month(.abbreviated).day()) } }
        .chartYAxis { AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) }
        .frame(height: 220)
        .padding(.top, 8)
    }

    private func stats(_ pts: [ProgressData.Point]) -> some View {
        let counted = pts.filter { !$0.x }
        let first = counted.first ?? pts[0], last = counted.last ?? pts[pts.count - 1]
        let days = Double(max(1, Day.number(last.date) - Day.number(first.date)))
        let perWeek = (last.trend - first.trend) / days * 7
        return HStack {
            stat("\(pts.count)", "Weigh-ins")
            stat((perWeek >= 0 ? "+" : "−") + Fmt.weight(abs(perWeek), unit: unit), "Per week")
            stat(Fmt.weight(pts.map(\.kg).min() ?? 0, unit: unit), "Lowest")
            stat(Fmt.weight(pts.map(\.kg).max() ?? 0, unit: unit), "Highest")
        }
    }
    private func stat(_ v: String, _ l: LocalizedStringKey) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.headline).fontDesign(.rounded).monospacedDigit()
            Text(l).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private func good(_ d: Double) -> Bool {
        guard let down = data?.down, abs(disp(d)) >= 0.05 else { return false }
        return (d < 0) == down
    }
    private func deltaText(_ d: Double) -> String {
        abs(disp(d)) < 0.05 ? "0" : (d < 0 ? "−" : "+") + Fmt.weight(abs(d), unit: unit)
    }
    private func deltaChip(_ d: Double) -> some View {
        Text(abs(disp(d)) < 0.05 ? String(localized: "Steady") : "\(deltaText(d)) \(NSLocalizedString(unit, comment: ""))")
            .font(.subheadline.weight(.semibold)).monospacedDigit()
            .padding(.horizontal, 10).padding(.vertical, 4)
            .background(Capsule().fill((good(d) ? Color.green : Color.secondary).opacity(0.15)))
            .foregroundStyle(good(d) ? Color.green : Color.secondary)
    }

    private func weekRow(_ w: ProgressData.Week) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(w.label)
                Group {
                    if let k = w.kcal { Text("\(w.n) days weighed · \(Fmt.kcal(k)) kcal") } else { Text("\(w.n) days weighed") }
                }
                .font(.subheadline).foregroundStyle(.secondary)
            }
            Spacer()
            Text(Fmt.weight(w.avg, unit: unit)).monospacedDigit().fontWeight(.semibold)
            if let d = w.delta { Text(deltaText(d)).font(.subheadline).monospacedDigit().foregroundStyle(good(d) ? Color.green : Color.secondary).frame(minWidth: 44, alignment: .trailing) }
        }
    }

    private func dayRow(_ e: ProgressData.Point, prev: ProgressData.Point?) -> some View {
        Button { editing = EditDay(id: e.date) } label: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(Day.date(e.date), format: .dateTime.weekday(.abbreviated).month(.abbreviated).day())
                    let sub = [e.kcal.map { "\(Fmt.kcal($0)) " + String(localized: "kcal") }, e.x ? String(localized: "Excluded") : nil, e.note.isEmpty ? nil : e.note].compactMap { $0 }
                    if !sub.isEmpty { Text(sub.joined(separator: " · ")).font(.subheadline).foregroundStyle(.secondary).lineLimit(1) }
                }
                Spacer()
                Text(Fmt.weight(e.kg, unit: unit)).monospacedDigit().fontWeight(.semibold)
                if let p = prev {
                    let d = e.kg - p.kg
                    Text(deltaText(d)).font(.subheadline).monospacedDigit().foregroundStyle(towardGoal(e, p) ? Color.green : Color.secondary).frame(minWidth: 44, alignment: .trailing)
                }
            }
        }
        .tint(.primary)
    }
    private func towardGoal(_ e: ProgressData.Point, _ p: ProgressData.Point) -> Bool {
        guard let g = data?.goalKg, abs(disp(e.kg - p.kg)) >= 0.05 else { return false }
        return abs(e.kg - g) < abs(p.kg - g)
    }

    // MARK: Nutrition

    @ViewBuilder private var nutritionPage: some View {
        if nutrition.isEmpty {
            Section { Text("Log some food to see your averages here.").foregroundStyle(.secondary) }
        } else {
            let n = Double(nutrition.count)
            let avg = (kcal: nutrition.map(\.kcal).reduce(0, +) / n, p: nutrition.map(\.protein).reduce(0, +) / n,
                       c: nutrition.map(\.carbs).reduce(0, +) / n, f: nutrition.map(\.fat).reduce(0, +) / n)
            let targets = nutrition.compactMap(\.target)
            let avgTarget = targets.isEmpty ? nil : targets.reduce(0, +) / Double(targets.count)
            Section {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Average a day").font(.subheadline).foregroundStyle(.secondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(Fmt.kcal(avg.kcal)).font(.system(size: 34, weight: .bold, design: .rounded))
                        Text("kcal").foregroundStyle(.secondary)
                    }
                    if let t = avgTarget {
                        let d = avg.kcal - t
                        if abs(d) < 25 { Text("On target").font(.subheadline).foregroundStyle(.green) }
                        else if d < 0 { Text("\(Fmt.kcal(-d)) kcal under target").font(.subheadline).foregroundStyle(.secondary) }
                        else { Text("\(Fmt.kcal(d)) kcal over target").font(.subheadline).foregroundStyle(.orange) }
                    }
                    Chart {
                        ForEach(nutrition) { d in
                            BarMark(x: .value("Day", Day.date(d.date), unit: .day), y: .value("kcal", d.kcal))
                                .foregroundStyle(d.target.map { d.kcal > $0 * 1.05 } == true ? Color.orange.gradient : Color.accentColor.gradient)
                                .cornerRadius(3)
                        }
                        if let t = avgTarget {
                            RuleMark(y: .value("Target", t)).lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 4])).foregroundStyle(.secondary)
                        }
                    }
                    .chartXAxis { AxisMarks(values: .automatic(desiredCount: 4)) { AxisGridLine(); AxisValueLabel(format: .dateTime.month(.abbreviated).day()) } }
                    .chartYAxis { AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) }
                    .frame(height: 200)
                    .padding(.top, 8)
                }
                .padding(.vertical, 4)
                HStack {
                    stat("\(Fmt.grams(avg.p)) g", "Protein")
                    stat("\(Fmt.grams(avg.c)) g", "Carbs")
                    stat("\(Fmt.grams(avg.f)) g", "Fat")
                    stat("\(nutrition.count)", "Days logged")
                }
            }
            let pts = nutrition.compactMap { d in d.proteinTarget.map { (d.protein, $0) } }
            if !pts.isEmpty {
                let hit = pts.filter { $0.0 >= $0.1 * 0.9 }.count
                Section {
                    LabeledContent("Protein target hit") { Text("\(hit)/\(pts.count)").monospacedDigit() }
                } footer: { Text("Days you ate at least 90% of your protein target.") }
            }
        }
    }
}
