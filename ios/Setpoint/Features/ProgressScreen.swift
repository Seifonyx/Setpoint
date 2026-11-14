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
    @State private var picked: Date?   // touch and hold the chart to read a day
    @State private var reveal: CGFloat = 1 // the trend line draws itself in when you open Progress
    @State private var drawn = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    struct EditDay: Identifiable { let id: String }

    var body: some View {
        NavigationStack {
            List {
                SwiftUI.Section {
                    PillTabs(selection: $page, options: [("weight", "Weight"), ("nutrition", "Nutrition"), ("body", "Body")])
                    if page != "body" { Picker("Range", selection: $range) {
                        Text("1M").tag(30); Text("3M").tag(90); Text("6M").tag(180); Text("1Y").tag(365); Text("All").tag(0)
                    }
                    .pickerStyle(.segmented) }
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(top: 4, leading: 0, bottom: 4, trailing: 0))
                switch page {
                case "weight": weightPage
                case "nutrition": nutritionPage
                default:
                    BodySection()
                    PhotosSection()
                }
            }
            .brandList()
            .navigationTitle("Progress")
            .task(id: "\(store.version)|\(range)|\(store.foodsReady)") { await load() }
            .sheet(item: $editing) { WeightSheet(day: $0.id) }
            .onDisappear { drawn = false }
            .onChange(of: page) { drawn = false }
        }
    }

    /// Draw the line from left to right and count the numbers up, once each time you come to the page.
    private func drawIn() {
        guard !drawn else { return }
        drawn = true
        guard !reduceMotion else { reveal = 1; return }
        reveal = 0
        withAnimation(.easeInOut(duration: 1.2).delay(0.1)) { reveal = 1 }
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
                Text("Trend weight").font(.brand(.subheadline)).foregroundStyle(.secondary)
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Group {
                        if let now = data?.now { CountUp(value: now, progress: reveal) { Fmt.weight($0, unit: unit) } } else { Text("—") }
                    }
                    .font(Brand.num(53, .bold)).monospacedDigit()
                    Text(LocalizedStringKey(unit)).foregroundStyle(.secondary)
                    Spacer()
                    if let c = change(pts) { deltaChip(c) }
                }
                if pts.count >= 2 { chart(pts).onAppear(perform: drawIn) } else {
                    Text("Log your weight a few times to see your trend.").font(.brand(.subheadline)).foregroundStyle(.secondary).padding(.vertical, 30)
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
        if (data?.points.count ?? 0) >= 5 {
            Section { NavigationLink { InsightsView() } label: { Label("Weight factors", systemImage: "chart.dots.scatter") } }
        }
        if (data?.points.count ?? 0) >= 2 || !(store.root["phases"]?.array ?? []).isEmpty { PhasesSection() }
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
        let first = pts.first?.date ?? "", last = pts.last?.date ?? ""
        let windows = (data?.cycle ?? []).filter { $0.to >= first && $0.from <= Day.add(last, 3) }
        return Chart {
            ForEach(windows, id: \.from) { w in
                RectangleMark(xStart: .value("From", Day.date(max(w.from, first))), xEnd: .value("To", Day.date(w.to)))
                    .foregroundStyle(Brand.protein.opacity(w.guess ? 0.06 : 0.1))
            }
            ForEach(pts) { p in
                PointMark(x: .value("Day", Day.date(p.date), unit: .day), y: .value("Weight", disp(p.kg)))
                    .symbolSize(pts.count > 60 ? 12 : 26)
                    .foregroundStyle(p.x ? Brand.ink2.opacity(0.3) : Brand.ink2.opacity(0.55))
            }
            ForEach(pts) { p in
                AreaMark(x: .value("Day", Day.date(p.date), unit: .day), yStart: .value("Base", yLo), yEnd: .value("Trend", disp(p.trend)))
                    .interpolationMethod(.monotone)
                    .foregroundStyle(LinearGradient(colors: [Brand.green.opacity(0.28), Brand.green.opacity(0)], startPoint: .top, endPoint: .bottom))
            }
            ForEach(pts) { p in
                LineMark(x: .value("Day", Day.date(p.date), unit: .day), y: .value("Trend", disp(p.trend)))
                    .interpolationMethod(.monotone)
                    .lineStyle(StrokeStyle(lineWidth: 3.5, lineCap: .round))
                    .foregroundStyle(Brand.green)
            }
            if let last = pts.last {
                PointMark(x: .value("Day", Day.date(last.date), unit: .day), y: .value("Trend", disp(last.trend)))
                    .symbolSize(110).foregroundStyle(Brand.amber)
            }
            if let sel = nearest(pts) {
                RuleMark(x: .value("Day", Day.date(sel.date), unit: .day))
                    .foregroundStyle(Brand.ink2.opacity(0.5))
                    .lineStyle(StrokeStyle(lineWidth: 1))
                    .annotation(position: .top, spacing: 4, overflowResolution: .init(x: .fit(to: .chart), y: .disabled)) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(Day.date(sel.date).formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())).font(.brand(.caption2, .semibold)).foregroundStyle(Brand.ink2)
                            Text("\(Fmt.weight(sel.kg, unit: unit)) \(unit)").font(Brand.num(22, .semibold)).monospacedDigit()
                            Text("Trend \(Fmt.weight(sel.trend, unit: unit))").font(.brand(.caption2)).foregroundStyle(Brand.green).monospacedDigit()
                        }
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        .background(Brand.card2, in: .rect(cornerRadius: Radius.chip))
                    }
                PointMark(x: .value("Day", Day.date(sel.date), unit: .day), y: .value("Weight", disp(sel.kg)))
                    .symbolSize(90).foregroundStyle(Brand.ink)
            }
            if let g = goal {
                RuleMark(y: .value("Goal", disp(g)))
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 4]))
                    .foregroundStyle(Brand.amber)
                    .annotation(position: .top, alignment: .leading) { Text("Goal").font(.brand(.caption2, .semibold)).foregroundStyle(Brand.amber) }
            }
        }
        .chartYScale(domain: yLo...yHi)
        .chartXSelection(value: $picked)
        .sensoryFeedback(.selection, trigger: nearest(pts)?.date)
        .chartXAxis { AxisMarks(values: .automatic(desiredCount: 4)) { AxisGridLine(); AxisValueLabel(format: .dateTime.month(.abbreviated).day()) } }
        .chartYAxis { AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) }
        .frame(height: 220)
        .mask {
            GeometryReader { g in
                Rectangle().frame(width: g.size.width * reveal + (reveal >= 1 ? 80 : 0), height: g.size.height + 160).offset(y: -80)
            }
        }
        .padding(.top, 8)
    }

    /// The weigh-in closest to where your finger is on the chart.
    private func nearest(_ pts: [ProgressData.Point]) -> ProgressData.Point? {
        guard let d = picked else { return nil }
        let n = Day.number(Day.iso(d))
        return pts.min { abs(Day.number($0.date) - n) < abs(Day.number($1.date) - n) }
    }

    private func stats(_ pts: [ProgressData.Point]) -> some View {
        let counted = pts.filter { !$0.x }
        let first = counted.first ?? pts[0], last = counted.last ?? pts[pts.count - 1]
        let days = Double(max(1, Day.number(last.date) - Day.number(first.date)))
        let perWeek = (last.trend - first.trend) / days * 7
        return HStack {
            stat(Double(pts.count), "Weigh-ins") { "\(Int($0.rounded()))" }
            stat(perWeek, "Per week") { ($0 >= 0 ? "+" : "−") + Fmt.weight(abs($0), unit: unit) }
            stat(pts.map(\.kg).min() ?? 0, "Lowest") { Fmt.weight($0, unit: unit) }
            stat(pts.map(\.kg).max() ?? 0, "Highest") { Fmt.weight($0, unit: unit) }
        }
    }
    private func stat(_ v: String, _ l: LocalizedStringKey) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.brand(.headline)).monospacedDigit()
            Text(l).font(.brand(.caption)).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
    private func stat(_ v: Double, _ l: LocalizedStringKey, _ f: @escaping (Double) -> String) -> some View {
        VStack(spacing: 2) {
            CountUp(value: v, progress: reveal, format: f).font(.brand(.headline)).monospacedDigit()
            Text(l).font(.brand(.caption)).foregroundStyle(.secondary)
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
            .font(.brand(.subheadline, .semibold)).monospacedDigit()
            .foregroundStyle(good(d) ? Brand.green : Brand.ink2)
    }

    private func weekRow(_ w: ProgressData.Week) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(w.label)
                Group {
                    if let k = w.kcal { Text("\(w.n) days weighed · \(Fmt.kcal(k)) kcal") } else { Text("\(w.n) days weighed") }
                }
                .font(.brand(.subheadline)).foregroundStyle(.secondary)
            }
            Spacer()
            Text(Fmt.weight(w.avg, unit: unit)).monospacedDigit().fontWeight(.semibold)
            if let d = w.delta { Text(deltaText(d)).font(.brand(.subheadline)).monospacedDigit().foregroundStyle(good(d) ? Brand.green : Brand.ink2).frame(minWidth: 44, alignment: .trailing) }
        }
    }

    private func dayRow(_ e: ProgressData.Point, prev: ProgressData.Point?) -> some View {
        Button { editing = EditDay(id: e.date) } label: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(Day.date(e.date), format: .dateTime.weekday(.abbreviated).month(.abbreviated).day())
                    let sub = [e.kcal.map { "\(Fmt.kcal($0)) " + String(localized: "kcal") }, e.x ? String(localized: "Excluded") : nil, e.note.isEmpty ? nil : e.note].compactMap { $0 }
                    if !sub.isEmpty { Text(sub.joined(separator: " · ")).font(.brand(.subheadline)).foregroundStyle(.secondary).lineLimit(1) }
                }
                Spacer()
                Text(Fmt.weight(e.kg, unit: unit)).monospacedDigit().fontWeight(.semibold)
                if let p = prev {
                    let d = e.kg - p.kg
                    Text(deltaText(d)).font(.brand(.subheadline)).monospacedDigit().foregroundStyle(towardGoal(e, p) ? Brand.green : Brand.ink2).frame(minWidth: 44, alignment: .trailing)
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
                    Text("Average a day").font(.brand(.subheadline)).foregroundStyle(.secondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(Fmt.kcal(avg.kcal)).font(Brand.num(41, .semibold))
                        Text("kcal").foregroundStyle(.secondary)
                    }
                    if let t = avgTarget {
                        let d = avg.kcal - t
                        if abs(d) < 25 { Text("On target").font(.brand(.subheadline)).foregroundStyle(Brand.green) }
                        else if d < 0 { Text("\(Fmt.kcal(-d)) kcal under target").font(.brand(.subheadline)).foregroundStyle(.secondary) }
                        else { Text("\(Fmt.kcal(d)) kcal over target").font(.brand(.subheadline)).foregroundStyle(Brand.amber) }
                    }
                    Chart {
                        ForEach(nutrition) { d in
                            BarMark(x: .value("Day", Day.date(d.date), unit: .day), y: .value("kcal", d.kcal))
                                .foregroundStyle(d.target.map { d.kcal > $0 * 1.05 } == true ? Brand.amber.gradient : Brand.green.gradient)
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

/// A number that counts up to its value as `progress` goes from 0 to 1 (weights count up from a little below,
/// so it reads as settling in rather than racing from zero).
struct CountUp: View, Animatable {
    var value: Double
    var progress: CGFloat
    var format: (Double) -> String
    nonisolated var animatableData: CGFloat { get { progress } set { progress = newValue } }
    var body: some View {
        let start = abs(value) > 20 ? value * 0.94 : 0
        Text(format(progress >= 1 ? value : start + (value - start) * Double(progress)))
    }
}
