import SwiftUI

/// The evening wrap-up: after 8 pm, once you've logged a couple of meals, today folds into one line at the top of
/// the Diary ("A good day: 2,040 of 2,060 kcal · protein hit · 8 vitamins covered"). Tomorrow starts fresh.
struct WrapUpCard: View {
    @Environment(Store.self) private var store
    @State private var score: DayScore?
    @State private var covered = 0
    @State private var showScore = false

    /// Shown in the evening of today, when there's a day to sum up (or on the build server with -wrapup YES).
    @MainActor static func shows(_ store: Store) -> Bool {
        if UserDefaults.standard.bool(forKey: "wrapup") { return true }
        let h = Calendar.current.component(.hour, from: Date())
        return h >= 20 && Set(store.eaten(Day.today).map(\.meal)).count >= 2
    }

    var body: some View {
        let t = store.totals(Day.today), plan = store.plans[Day.today] ?? store.plan(Day.today)
        Button { showScore = true } label: {
            HStack(spacing: Space.m) {
                Image(systemName: "moon.stars.fill").font(.title3).foregroundStyle(Brand.amber)
                    .frame(width: 40, height: 40).background(Brand.amber.opacity(0.14), in: Circle())
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).font(.brand(.headline))
                    Text(line(t, plan)).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                if let s = score {
                    Text(s.grade).font(Brand.num(30, .bold)).foregroundStyle(Brand.green)
                }
            }
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showScore) { if let s = score { DayScoreSheet(score: s) } }
        .task(id: store.version) {
            score = await store.engineRef.dayScore(Day.today)
            if let n = await store.engineRef.nutrients(Day.today) {
                covered = n.rows.filter { ($0.group == "vit" || $0.group == "min") && ($0.goal ?? 0) > 0 && $0.v >= ($0.goal ?? 0) }.count
            }
        }
    }

    private var title: LocalizedStringKey {
        switch score?.grade ?? "" {
        case "A": "A great day"
        case "B": "A good day"
        case "C": "A decent day"
        case "": "Your day"
        default: "Tomorrow's a fresh start"
        }
    }
    private func line(_ t: Totals, _ p: DayPlan?) -> String {
        var parts: [String] = []
        if let p { parts.append(String(localized: "\(Fmt.kcal(t.kcal)) of \(Fmt.kcal(p.kcal)) kcal")) } else { parts.append("\(Fmt.kcal(t.kcal)) " + String(localized: "kcal")) }
        if let p, p.protein > 0, t.protein >= p.protein * 0.95 { parts.append(String(localized: "protein hit")) }
        if covered > 0 { parts.append(String(localized: "\(covered) vitamins and minerals covered")) }
        return parts.joined(separator: " · ")
    }
}
