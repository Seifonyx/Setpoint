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
