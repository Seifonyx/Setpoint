import SwiftUI

/// Vitamins and minerals for a day against your targets (recommended for your age and sex), like the web app.
struct NutrientsView: View {
    @Environment(Store.self) private var store
    let day: String
    @State private var data: NutrientData?

    var body: some View {
        List {
            if let d = data {
                if d.items == 0 {
                    Section { Text("Log some food to see your vitamins and minerals.").foregroundStyle(.secondary) }
                }
                if !d.low.isEmpty {
                    Section {
                        ForEach(d.low, id: \.key) { l in
                            NavigationLink { NutrientSourcesView(key: l.key, day: day) } label: { LabeledContent(l.label) { Text("\(Int(l.pct.rounded()))%").monospacedDigit().foregroundStyle(Brand.amber) } }
                        }
                    } header: { Text("Often low") } footer: { Text("Your average over the last 2 weeks, as a share of your target.") }
                }
                ForEach(d.groups, id: \.key) { g in
                    let rows = d.rows.filter { $0.group == g.key && ($0.goal != nil || $0.hi != nil || $0.v > 0) }
                    if !rows.isEmpty {
                        Section(g.label) { ForEach(rows, id: \.key) { r in NavigationLink { NutrientSourcesView(key: r.key, day: day) } label: { row(r) } } }
                    }
                }
                Section { Text("Foods you log by name only (quick adds) don't count here. Faded rows have little data for the day.").font(.brand(.footnote)).foregroundStyle(.secondary) }
            } else {
                ProgressView()
            }
        }
        .brandList()
        .navigationTitle("Vitamins & minerals")
        .navigationSubtitle(Day.date(day).formatted(.dateTime.weekday(.wide).month(.wide).day()))
        .task(id: "\(day)|\(store.version)|\(store.foodsReady)") { data = await store.engineRef.nutrients(day) }
    }

    private func amount(_ v: Double, _ unit: String) -> String {
        let s = v >= 100 ? Int(v.rounded()).formatted() : v.formatted(.number.precision(.fractionLength(0...1)))
        return "\(s) \(unit)"
    }
    @ViewBuilder private func row(_ r: NutrientData.Row) -> some View {
        let target = r.goal ?? r.hi
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(r.label)
                Spacer()
                Text(amount(r.v, r.unit) + (target.map { " / " + amount($0, r.unit) } ?? "")).font(.brand(.subheadline)).monospacedDigit().foregroundStyle(.secondary)
            }
            if target != nil {
                ProgressView(value: TargetColor.fill(r.v, goal: r.goal, hi: r.hi))
                    .tint(TargetColor.of(r.v, goal: r.goal, hi: r.hi))
            }
        }
        .opacity(r.cov < 0.5 && r.v > 0 ? 0.5 : 1)
    }
}
