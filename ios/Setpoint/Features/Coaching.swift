import SwiftUI
import Charts

/// Measured expenditure week by week, with the target you had then. Shows your metabolism being learned.
struct ExpenditureChart: View {
    @Environment(Store.self) private var store
    @State private var points: [ExpPoint] = []

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Expenditure over time").font(Brand.display(19, .bold))
            if points.filter({ $0.tdee != nil }).count >= 2 {
                Chart {
                    ForEach(points) { p in
                        if let t = p.target {
                            LineMark(x: .value("Week", Day.date(p.date)), y: .value("kcal", t), series: .value("Line", "Target"))
                                .interpolationMethod(.stepEnd).foregroundStyle(Brand.amber).lineStyle(StrokeStyle(lineWidth: 2, dash: [4, 4]))
                        }
                    }
                    ForEach(points) { p in
                        if let t = p.tdee {
                            LineMark(x: .value("Week", Day.date(p.date)), y: .value("kcal", t), series: .value("Line", "Expenditure"))
                                .interpolationMethod(.monotone).foregroundStyle(Brand.green).lineStyle(StrokeStyle(lineWidth: 3, lineCap: .round))
                            PointMark(x: .value("Week", Day.date(p.date)), y: .value("kcal", t)).foregroundStyle(Brand.green).symbolSize(30)
                        }
                    }
                }
                .chartXAxis { AxisMarks(values: .automatic(desiredCount: 4)) { AxisGridLine(); AxisValueLabel(format: .dateTime.month(.abbreviated).day()) } }
                .chartYAxis { AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) }
                .chartYScale(domain: .automatic(includesZero: false))
                .frame(height: 180)
                HStack(spacing: 14) {
                    legend(Brand.green, "Measured expenditure"); legend(Brand.amber, "Your target")
                }
            } else {
                Text("Log food and weigh in for a few weeks to see your expenditure take shape.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            }
        }
        .padding(.vertical, 6)
        .task(id: store.version) { points = await store.engineRef.expenditureHistory(weeks: 12) }
    }
    private func legend(_ c: Color, _ t: LocalizedStringKey) -> some View {
        HStack(spacing: 5) { Capsule().fill(c).frame(width: 14, height: 4); Text(t).font(.brand(.caption)).foregroundStyle(Brand.ink2) }
    }
}

/// Which of your foods gave you the most of a nutrient (this day, or the last 7 days).
struct NutrientSourcesView: View {
    @Environment(Store.self) private var store
    let key: String
    let day: String
    @State private var days = 1
    @State private var data: NutrientSources?
    @State private var showHigh = UserDefaults.standard.string(forKey: "open") == "highin" // build-server screenshots

    var body: some View {
        List {
            Section {
                Picker("Range", selection: $days) { Text("This day").tag(1); Text("7 days").tag(7) }.pickerStyle(.segmented)
            }
            .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            if let d = data {
                Section {
                    if d.list.isEmpty { Text(days == 1 ? "Nothing you logged today has any of this yet." : "Nothing you logged this week has any of this.").foregroundStyle(.secondary) }
                    let top = d.list.first?.v ?? 1
                    ForEach(d.list.indices, id: \.self) { i in
                        let x = d.list[i]
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(x.name).lineLimit(1)
                                Spacer()
                                Text(amount(x.v, d.unit)).font(.brand(.body, .semibold)).monospacedDigit()
                            }
                            GeometryReader { g in
                                Capsule().fill(Brand.green.opacity(0.75)).frame(width: max(4, g.size.width * x.v / max(top, 0.0001)))
                            }
                            .frame(height: 5)
                            if days > 1 && x.times > 1 { Text("\(x.times) times").font(.brand(.caption)).foregroundStyle(Brand.ink2) }
                        }
                        .padding(.vertical, 2)
                    }
                } header: { Text(days == 1 ? "Where it came from today" : "Where it came from this week") }
            }
            // what to eat for more of it
            Section {
                NavigationLink { FoodsHighInView(key: key, label: data?.label ?? "", unit: data?.unit ?? "", day: day) } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "arrow.up.forward.circle.fill").font(.title2).foregroundStyle(Brand.green)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Foods high in \(data?.label ?? "")").font(.brand(.body, .semibold)).foregroundStyle(Brand.ink)
                            Text("The richest everyday foods, per serving or per 100 kcal").font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .brandList()
        .navigationTitle(data?.label ?? "")
        .task(id: "\(days)|\(store.version)") { data = await store.engineRef.nutrientSources(key, day: day, days: days) }
        .navigationDestination(isPresented: $showHigh) { FoodsHighInView(key: key, label: data?.label ?? "", unit: data?.unit ?? "", day: day) }
    }
    private func amount(_ v: Double, _ unit: String) -> String {
        (v >= 100 ? Int(v.rounded()).formatted() : v.formatted(.number.precision(.fractionLength(0...1)))) + " " + unit
    }
}

/// The weekly check-in: last week in one screen, what changed in your plan and why, and one message.
struct CheckInView: View {
    @Environment(Store.self) private var store
    @State private var story = false
    @State private var explain = false
    @State private var review: WeekReview?
    @State private var history: [ExpPoint] = []

    var body: some View {
        List {
            if let r = review {
                Section {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(r.label).font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.ink2)
                        Text(message(r)).font(Brand.display(24, .bold)).fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(.vertical, 6)
                }
                Section {
                    HStack(spacing: 10) {
                        tile(trendText, "Trend change", Brand.green)
                        tile("\(r.onTarget)/\(r.n)", "Days on target", Brand.amber)
                        tile("\(r.n)/7", "Days logged", Brand.water)
                    }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                }
                Section {
                    LabeledContent("Average calories") { Text(Fmt.kcal(r.kcal) + (r.tg.map { " / " + Fmt.kcal($0) } ?? "")).monospacedDigit() }
                    LabeledContent("Average protein") { Text("\(Fmt.grams(r.protein)) g" + (r.pg.map { " / \(Fmt.grams($0)) g" } ?? "")).monospacedDigit() }
                    if let e = store.overview?.energy { LabeledContent("Expenditure now") { Text("\(Fmt.kcal((e.tdee / 10).rounded() * 10)) kcal").monospacedDigit() } }
                } header: { Text("Last week") }
                Section {
                    if let why = store.overview?.tuneWhy {
                        Text(LocalizedStringKey(why)).font(.brand(.body))
                    } else {
                        Text("No change this week: your target still fits how your weight is moving.").font(.brand(.body)).foregroundStyle(Brand.ink2)
                    }
                    if let t = store.overview?.plan?.target { LabeledContent("Your target") { Text("\(Fmt.kcal((t / 10).rounded() * 10)) kcal").bold().monospacedDigit() } }
                    Button { explain = true } label: { Label("How your target works", systemImage: "info.circle") }
                } header: { Text("Your plan") }
                Section { ExpenditureChart() }
            } else {
                Section { Text("Log a few days this week to get your first check-in.").foregroundStyle(.secondary) }
            }
        }
        .brandList()
        .navigationTitle("Weekly check-in")
        .toolbar(.hidden, for: .tabBar)
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Play your week", systemImage: "play.circle.fill") { story = true } } }
        .fullScreenCover(isPresented: $story) { WeekStory().environment(store) }
        .sheet(isPresented: $explain) { TargetExplainer() }
        .task {
            // the first time this week's check-in opens, the story plays first
            if UserDefaults.standard.string(forKey: "storySeen") != Self.weekKey {
                UserDefaults.standard.set(Self.weekKey, forKey: "storySeen")
                story = true
            }
        }
        .task(id: store.version) {
            review = await store.engineRef.weekReview()
            history = await store.engineRef.expenditureHistory(weeks: 3)
        }
        .onAppear { UserDefaults.standard.set(Self.weekKey, forKey: "checkInSeen") }
    }

    /// This week's key (the week start), so the Diary offers the check-in once a week.
    @MainActor static var weekKey: String {
        let ws = Int(Store.shared.root["settings"]?["weekStart"]?.number ?? 5)
        let wd = Calendar.current.component(.weekday, from: Date()) - 1
        return Day.add(Day.today, -((wd - ws + 7) % 7))
    }

    private var trendChange: Double? {
        let t = history.compactMap(\.trend)
        guard t.count >= 2 else { return nil }
        return t[t.count - 1] - t[t.count - 2]
    }
    private var trendText: String {
        guard let d = trendChange else { return "—" }
        return (d > 0 ? "+" : d < 0 ? "−" : "") + Fmt.weight(abs(d), unit: store.unit)
    }
    private func message(_ r: WeekReview) -> String {
        let dir = store.overview?.plan?.pace.dir ?? "maintain"
        let d = trendChange ?? 0
        if r.n <= 3 { return String(localized: "A light week of logging. More days logged makes your plan sharper.") }
        if dir == "lose" { return d < -0.05 ? String(localized: "Your trend went down. You're on your way.") : String(localized: "Your trend held steady. Keep logging; one week is a short window.") }
        if dir == "gain" { return d > 0.05 ? String(localized: "Your trend went up, as planned.") : String(localized: "Your trend held steady. Eating a bit more will move it.") }
        return abs(d) < 0.3 ? String(localized: "Steady as planned. Nicely maintained.") : String(localized: "Your trend moved a little. Your target adjusts for you.")
    }
    private func tile(_ v: String, _ l: LocalizedStringKey, _ c: Color) -> some View {
        VStack(spacing: 4) {
            Text(v).font(Brand.num(26, .semibold)).monospacedDigit().foregroundStyle(c).lineLimit(1).minimumScaleFactor(0.6)
            Text(l).font(.brand(.caption)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 74).brandCard(padding: 10)
    }
}

extension CheckInView {
    /// Due when this week's check-in hasn't been opened yet (for the first 3 days of the week).
    @MainActor static var due: Bool {
        UserDefaults.standard.string(forKey: "checkInSeen") != CheckInView.weekKey && Day.number(Day.today) - Day.number(CheckInView.weekKey) < 3
    }
}

/// The foods richest in a nutrient (everyday ones, plus anything you've logged or saved), per serving or per
/// 100 kcal. Tap one to pick an amount and add it.
struct FoodsHighInView: View {
    @Environment(Store.self) private var store
    let key: String
    let label: String
    let unit: String
    let day: String
    @State private var by = "serving"
    @State private var data: HighIn?
    private var rows: [HighInRow]? { data?.rows }

    var body: some View {
        List {
            Section {
                Picker("Rank by", selection: $by) { Text("Per serving").tag("serving"); Text("Per 100 kcal").tag("kcal") }.pickerStyle(.segmented)
            } footer: {
                Text(by == "kcal" ? "Most of it for the fewest calories." : "Most of it in one usual serving.")
            }
            .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            if let rows {
                Section {
                    if rows.isEmpty { Text("No foods in the list have data for this.").foregroundStyle(.secondary) }
                    ForEach(rows) { r in
                        NavigationLink { AddFromList(foodID: r.hit.id, day: day) } label: { row(r) }
                    }
                } footer: { Text("Everyday foods, plus ones you've logged or saved. Tap one to pick an amount.") }
            } else {
                SkeletonRows(count: 6)
            }
        }
        .brandList()
        .navigationTitle(String(localized: "High in \(data?.label ?? label)"))
        .navigationBarTitleDisplayMode(.inline)
        .task(id: "\(by)|\(store.foodsReady)") { data = await store.engineRef.highIn(key, by: by, meal: Self.mealNow(store)) }
    }

    private func row(_ r: HighInRow) -> some View {
        HStack(spacing: 12) {
            FoodIcon(kind: r.hit.kind ?? "food", size: 32, name: r.hit.name)
            VStack(alignment: .leading, spacing: 2) {
                Text(r.hit.name).font(.brand(.body)).lineLimit(2)
                Text(r.sub).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 1) {
                Text(Self.amount(r.v, data?.unit ?? unit)).font(Brand.num(18, .semibold)).monospacedDigit()
                if let p = r.pct { Text("\(Int(p))%").font(.brand(.caption, .semibold)).foregroundStyle(p >= 100 ? Brand.green : Brand.ink2).monospacedDigit() }
            }
        }
        .accessibilityElement(children: .combine)
    }
    static func amount(_ v: Double, _ unit: String) -> String {
        (v >= 100 ? Int(v.rounded()).formatted() : v.formatted(.number.precision(.fractionLength(0...1)))) + " " + unit
    }
    /// The meal for the time of day (your own sections: the first one).
    @MainActor static func mealNow(_ store: Store) -> String {
        let h = Calendar.current.component(.hour, from: Date()), keys = store.meals.map(\.key)
        let want = h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 21 ? "dinner" : "snacks"
        return keys.contains(want) ? want : keys.first ?? "snacks"
    }
}

/// A food picked from a list outside Add food: choose the amount, add it, and come back.
struct AddFromList: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let foodID: String
    let day: String
    var body: some View {
        FoodAmountView(foodID: foodID, meal: FoodsHighInView.mealNow(store), day: day, done: { dismiss() })
    }
}
