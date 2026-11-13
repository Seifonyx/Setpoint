import SwiftUI

/// Your week, as a story: a few full-screen cards you tap or swipe through. Logging, calories, protein, your weight
/// trend, your best day, the nutrient to watch, and what next week's target is (and why).
struct WeekStory: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var page = 0
    @State private var review: WeekReview?
    @State private var trend: Double?
    @State private var low: NutrientData.Low?
    @State private var best: DayScore?
    @State private var streak = 0
    @State private var loaded = false

    private let count = 7

    var body: some View {
        ZStack(alignment: .top) {
            background.ignoresSafeArea().animation(.easeInOut(duration: 0.5), value: page)
            if let r = review {
                GeometryReader { g in
                    TabView(selection: $page) {
                        ForEach(0..<count, id: \.self) { i in card(i, r).tag(i).padding(.horizontal, 28) }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .contentShape(Rectangle())
                    .onTapGesture { p in // tap the right side for the next card, the left to go back
                        withAnimation(.snappy) { if p.x > g.size.width * 0.35 { if page < count - 1 { page += 1 } else { dismiss() } } else if page > 0 { page -= 1 } }
                    }
                }
            } else if loaded {
                VStack(spacing: 12) {
                    Text("Log a few days this week to get your first story.").font(Brand.display(24, .bold)).multilineTextAlignment(.center)
                    Button("Close") { dismiss() }.buttonStyle(.glass)
                }
                .padding(32).frame(maxHeight: .infinity)
            }
            // story progress, like the ones you know
            if review != nil { HStack(spacing: 4) {
                ForEach(0..<count, id: \.self) { i in
                    Capsule().fill(.white.opacity(i <= page ? 0.95 : 0.3)).frame(height: 3)
                }
            }
            .padding(.horizontal, 16).padding(.top, 8) }
            HStack {
                Spacer()
                Button { dismiss() } label: { Image(systemName: "xmark").font(.headline).foregroundStyle(.white).frame(width: 44, height: 44) }
                    .accessibilityLabel(Text("Close"))
            }
            .padding(.top, 18).padding(.horizontal, 8)
        }
        .foregroundStyle(.white)
        .sensoryFeedback(.selection, trigger: page)
        .task {
            let e = store.engineRef
            review = await e.weekReview()
            if review == nil { review = await e.weekReview(CheckInView.weekKey) } // nothing last week: this week so far
            let t = await e.expenditureHistory(weeks: 3).compactMap(\.trend)
            trend = t.count >= 2 ? t[t.count - 1] - t[t.count - 2] : nil
            low = await e.nutrients(Day.today)?.low.first
            if let b = review?.best { best = await e.dayScore(b) }
            streak = await e.achievements()?.streak ?? 0
            loaded = true
        }
    }

    private var background: LinearGradient {
        let pairs: [(UInt32, UInt32)] = [(0x0F5C45, 0x0A2E24), (0x8A4E12, 0x3B2208), (0x8E3A26, 0x3A160E), (0x2C5F7A, 0x10273A), (0x0F5C45, 0x16302A), (0x3F4E7A, 0x171D33), (0x1E1A14, 0x0F5C45)]
        let p = pairs[min(page, pairs.count - 1)]
        return LinearGradient(colors: [Color(Brand.rgb(p.0)), Color(Brand.rgb(p.1))], startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    @ViewBuilder private func card(_ i: Int, _ r: WeekReview) -> some View {
        VStack(alignment: .leading, spacing: 18) {
            Spacer()
            switch i {
            case 0:
                eyebrow(r.label)
                big(String(localized: "Your week"))
                line(String(localized: "You logged \(r.n) of 7 days."))
                if streak >= 3 { pill("\(streak)-day streak", "flame.fill") }
            case 1:
                eyebrow(String(localized: "Calories"))
                big(Fmt.kcal(r.kcal))
                line(r.tg.map { String(localized: "a day on average, against a target of \(Fmt.kcal($0)).") } ?? String(localized: "a day on average."))
                if r.n > 0 { pill("On target \(r.onTarget) of \(r.n) days", "target") }
            case 2:
                eyebrow(String(localized: "Protein"))
                big("\(Fmt.grams(r.protein)) g")
                if let g = r.pg, g > 0 {
                    line(r.protein >= g * 0.95 ? String(localized: "a day. Right on your goal, which keeps muscle while you change.") : String(localized: "a day, \(String(Int((r.protein / g * 100).rounded())) + "%") of your goal. Plan my day can help close the gap."))
                } else { line(String(localized: "a day on average.")) }
            case 3:
                eyebrow(String(localized: "Weight trend"))
                big(trendText)
                line(trendMessage)
            case 4:
                eyebrow(String(localized: "Best day"))
                big(r.best.map { Day.date($0).formatted(.dateTime.weekday(.wide)) } ?? "—")
                if let b = best { pill("Day score \(b.score) · \(b.grade)", "star.fill") }
                line(String(localized: "Closest to your targets, with the most nutrients covered."))
            case 5:
                eyebrow(String(localized: "One to watch"))
                if let l = low {
                    big(l.label)
                    line(String(localized: "It's been at \(String(Int(l.pct)) + "%") of what you need lately. Plan my day puts foods rich in it first."))
                } else {
                    big(String(localized: "All good"))
                    line(String(localized: "No vitamin or mineral has been running low lately."))
                }
            default:
                eyebrow(String(localized: "Next week"))
                if let t = store.overview?.plan?.target { big("\(Fmt.kcal((t / 10).rounded() * 10)) kcal") }
                line(store.overview?.tuneWhy.map { Bundle.main.localizedString(forKey: $0, value: nil, table: nil) } ?? String(localized: "Your target stays the same: it still fits how your weight is moving."))
                Button { dismiss() } label: {
                    Text("Let's go").font(.brand(.headline)).foregroundStyle(Brand.green).frame(maxWidth: .infinity, minHeight: 50)
                        .background(.white, in: Capsule())
                }
                .padding(.top, 8)
            }
            Spacer(); Spacer()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func eyebrow(_ t: String) -> some View {
        Text(t).font(.brand(.subheadline, .bold)).textCase(.uppercase).tracking(1.6).opacity(0.8)
    }
    private func big(_ t: String) -> some View {
        Text(t).font(Brand.display(56, .heavy)).lineLimit(2).minimumScaleFactor(0.5).fixedSize(horizontal: false, vertical: true)
    }
    private func line(_ t: String) -> some View {
        Text(t).font(.brand(.title3, .medium)).opacity(0.92).fixedSize(horizontal: false, vertical: true)
    }
    private func pill(_ t: LocalizedStringKey, _ icon: String) -> some View {
        Label(t, systemImage: icon).font(.brand(.subheadline, .semibold))
            .padding(.horizontal, 14).padding(.vertical, 8).background(.white.opacity(0.18), in: Capsule())
    }
    private var trendText: String {
        guard let d = trend else { return "—" }
        return (d > 0 ? "+" : d < 0 ? "−" : "") + Fmt.weight(abs(d), unit: store.unit) + " " + store.unit
    }
    private var trendMessage: String {
        let dir = store.overview?.plan?.pace.dir ?? "maintain", d = trend ?? 0
        if trend == nil { return String(localized: "A few more weigh-ins and your trend shows here.") }
        if dir == "lose" { return d < -0.05 ? String(localized: "Your trend went down. That's the direction you want.") : String(localized: "Your trend held. One week is short; stay steady.") }
        if dir == "gain" { return d > 0.05 ? String(localized: "Your trend went up, as planned.") : String(localized: "Your trend held. A little more food will move it.") }
        return abs(d) < 0.3 ? String(localized: "Steady, as planned. Nicely maintained.") : String(localized: "Your trend moved a little. Your target adjusts for you.")
    }
}
