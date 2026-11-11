import SwiftUI

/// Your streak, last week's review and your achievements, at the top of You.
struct YouHighlights: View {
    @Environment(Store.self) private var store
    @State private var review: WeekReview?
    @State private var ach: Achievements?

    var body: some View {
        Section {
            if let a = ach {
                HStack {
                    stat("\(a.streak)", "Day streak", "flame.fill", .orange)
                    stat("\(store.food.keys.count)", "Days logged", "calendar", .blue)
                    stat("\(a.list.filter(\.got).count)/\(a.list.count)", "Achievements", "trophy.fill", .yellow)
                }
                .padding(.vertical, 4)
            }
            if let r = review {
                NavigationLink { WeekReviewView(review: r) } label: {
                    LabeledContent {
                        Text("\(r.onTarget)/\(r.n) on target").monospacedDigit()
                    } label: {
                        Label { Text("Last week"); Text(r.label) } icon: { Image(systemName: "calendar.badge.checkmark") }
                    }
                }
            }
            if let a = ach {
                NavigationLink { AchievementsView(ach: a) } label: { Label("Achievements", systemImage: "trophy") }
            }
        }
        .task(id: store.version) {
            review = await store.engineRef.weekReview()
            ach = await store.engineRef.achievements()
        }
    }
    private func stat(_ v: String, _ l: LocalizedStringKey, _ icon: String, _ c: Color) -> some View {
        VStack(spacing: 3) {
            HStack(spacing: 4) { Image(systemName: icon).foregroundStyle(c).font(.subheadline); Text(v).font(.title3.weight(.bold)).fontDesign(.rounded).monospacedDigit() }
            Text(l).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct WeekReviewView: View {
    @Environment(Store.self) private var store
    let review: WeekReview

    var body: some View {
        let r = review
        List {
            Section {
                LabeledContent("Days logged") { Text("\(r.n)/7").monospacedDigit() }
                LabeledContent("Average calories") { Text(Fmt.kcal(r.kcal) + (r.tg.map { " / " + Fmt.kcal($0) } ?? "")).monospacedDigit() }
                LabeledContent("Average protein") { Text("\(Fmt.grams(r.protein)) g" + (r.pg.map { " / \(Fmt.grams($0)) g" } ?? "")).monospacedDigit() }
                LabeledContent("Days on target") { Text("\(r.onTarget)").monospacedDigit() }
                if let b = r.best { LabeledContent("Closest to target") { Text(Day.date(b), format: .dateTime.weekday(.wide)) } }
                if r.trainOn { LabeledContent("Training days") { Text("\(r.train)").monospacedDigit() } }
                if let d = r.dw {
                    LabeledContent("Weight (weekly average)") { Text((d > 0 ? "+" : d < 0 ? "−" : "") + Fmt.weight(abs(d), unit: store.unit) + " " + store.unit).monospacedDigit() }
                }
            } footer: { Text("On target means within 10% of that day's calories.") }
        }
        .navigationTitle("Your week")
        .navigationSubtitle(r.label)
    }
}

struct AchievementsView: View {
    let ach: Achievements
    var body: some View {
        List {
            Section {
                ForEach(ach.list.indices, id: \.self) { i in
                    let a = ach.list[i]
                    HStack(spacing: 12) {
                        Image(systemName: a.got ? "checkmark.seal.fill" : "seal").font(.title3).foregroundStyle(a.got ? Color.yellow : Color.secondary)
                        Text(a.t).foregroundStyle(a.got ? Color.primary : Color.secondary)
                        Spacer()
                        if !a.got && !a.p.isEmpty { Text(a.p).font(.subheadline).monospacedDigit().foregroundStyle(.secondary) }
                    }
                }
            } footer: { Text("Your streak allows one missed day a week.") }
        }
        .navigationTitle("Achievements")
    }
}

/// Weight factors: what tends to move your next-morning weight, from your own log (the web app's weightInsights).
struct InsightsView: View {
    @Environment(Store.self) private var store
    @State private var data: Insights?

    var body: some View {
        List {
            if let d = data {
                if d.n < 14 {
                    Section { Text("Needs 14 days with food logged and a weigh-in the next morning.").foregroundStyle(.secondary) }
                } else {
                    Section {
                        ForEach(d.items.indices, id: \.self) { i in
                            let x = d.items[i]
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(x.t).font(.headline)
                                    Spacer()
                                    Text((x.d > 0 ? "+" : x.d < 0 ? "−" : "") + Fmt.weight(abs(x.d), unit: store.unit) + " " + store.unit)
                                        .monospacedDigit().foregroundStyle(abs(x.d) >= 0.15 ? (x.d > 0 ? Color.orange : Color.green) : Color.secondary)
                                }
                                Text(x.s).font(.subheadline).foregroundStyle(.secondary)
                                Text(x.note).font(.subheadline)
                            }
                            .padding(.vertical, 2)
                        }
                    } footer: { Text("Next-morning weight: your highest third of days vs your lowest.") }
                }
            } else { ProgressView() }
        }
        .navigationTitle("Weight factors")
        .task(id: "\(store.version)|\(store.foodsReady)") { data = await store.engineRef.insights() }
    }
}

/// How the day score is made up (calories, protein, fiber, carbs and fat).
struct DayScoreSheet: View {
    @Environment(\.dismiss) private var dismiss
    let score: DayScore
    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(alignment: .firstTextBaseline) {
                        Text(score.grade).font(.system(size: 48, weight: .bold, design: .rounded))
                        Text("\(score.score)/100").font(.title3).foregroundStyle(.secondary).monospacedDigit()
                    }
                }
                Section {
                    ForEach(score.parts.indices, id: \.self) { i in
                        let p = score.parts[i]
                        VStack(alignment: .leading, spacing: 6) {
                            HStack { Text(p.label); Spacer(); Text("\(Int(p.pts.rounded()))/\(Int(p.max))").monospacedDigit().foregroundStyle(.secondary) }
                            ProgressView(value: p.pts, total: p.max)
                            Text(p.note).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                } footer: { Text("Closer to your calories and macros scores higher. It's a guide, not a grade on you.") }
            }
            .navigationTitle("Day score")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
        .presentationDetents([.medium, .large])
    }
}
