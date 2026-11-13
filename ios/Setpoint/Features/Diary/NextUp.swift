import SwiftUI

/// Next up, at the top of Today: the food you planned for this meal (tick it all off in one tap), or, when nothing's
/// planned, a meal that fits what's left of your day. It's built by the day planner from your remaining calories and
/// macros, skips what you've already had today and fills the vitamins you're still short on.
struct NextUpCard: View {
    @Environment(Store.self) private var store
    @State private var idea: DayPlanResult.Meal?
    @State private var seed = 0
    @State private var logged = false

    private var today: String { Day.today }
    private var plan: DayPlan? { store.plans[today] ?? store.plan(today) }
    private var eatenMeals: Set<String> { Set(store.eaten(today).map(\.meal)) }
    /// The meal for now, or the next one after it that's still empty.
    private var next: MealCategory? { nextFor(store) }
    @MainActor func nextFor(_ store: Store) -> MealCategory? {
        let eatenMeals = Set(store.eaten(Day.today).map(\.meal))
        let h = Calendar.current.component(.hour, from: Date()), meals = store.meals
        let guess = h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 21 ? "dinner" : "snacks"
        let start = meals.firstIndex { $0.key == guess } ?? 0
        return meals[start...].first { !eatenMeals.contains($0.key) } ?? (h >= 21 ? meals.last : nil)
    }
    private var planned: [FoodItem] { store.items(today).filter { $0.isPlanned && $0.meal == next?.key } }
    private var left: DayPlan? {
        guard let p = plan else { return nil }
        let t = store.totals(today)
        return DayPlan(kcal: max(0, p.kcal - t.kcal), protein: max(0, p.protein - t.protein), carbs: max(0, p.carbs - t.carbs), fat: max(0, p.fat - t.fat))
    }

    /// Whether there's anything to show (the Diary leaves the card out otherwise).
    @MainActor static func shows(_ store: Store) -> Bool {
        let c = NextUpCard(), today = Day.today
        guard store.foodsReady, let m = c.nextFor(store) else { return false }
        if store.items(today).contains(where: { $0.isPlanned && $0.meal == m.key }) { return true }
        guard let p = store.plans[today] ?? store.plan(today) else { return false }
        return p.kcal - store.totals(today).kcal >= 150
    }

    var body: some View {
        Group {
            if let m = next, !planned.isEmpty {
                plannedCard(m)
            } else if let m = next, let l = left, let idea {
                ideaCard(m, l, idea)
            } else {
                HStack { ProgressView(); Text("Finding a meal that fits…").font(.brand(.subheadline)).foregroundStyle(Brand.ink2) }
                    .frame(maxWidth: .infinity, minHeight: 80)
            }
        }
        .task(id: "\(store.version)|\(seed)|\(next?.key ?? "")|\(store.foodsReady)") { await suggest() }
    }

    private func header(_ title: LocalizedStringKey, _ meal: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon).font(.subheadline.weight(.bold)).foregroundStyle(Brand.amber)
            Text(title).font(.brand(.caption, .bold)).foregroundStyle(Brand.amber).textCase(.uppercase).tracking(1.2)
            Text("·").foregroundStyle(Brand.ink2)
            Text(meal).font(.brand(.caption, .bold)).foregroundStyle(Brand.ink2).textCase(.uppercase).tracking(1.2)
        }
    }

    private func plannedCard(_ m: MealCategory) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            header("Planned", m.name, icon: "checklist")
            ForEach(planned) { f in
                HStack(spacing: 10) {
                    Circle().strokeBorder(Brand.ink2.opacity(0.5), lineWidth: 1.5).frame(width: 18, height: 18)
                    Text(f.displayName).font(.brand(.body)).lineLimit(1)
                    Spacer()
                    Text(Fmt.kcal(f.kcal)).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).monospacedDigit()
                }
            }
            Button {
                withAnimation(.snappy) { for f in planned { store.markEaten(f, on: today) } }
            } label: {
                Label("I ate it all", systemImage: "checkmark").font(.brand(.headline)).frame(maxWidth: .infinity, minHeight: 44)
            }
            .buttonStyle(.glassProminent)
        }
        .padding(16)
    }

    private func ideaCard(_ m: MealCategory, _ l: DayPlan, _ idea: DayPlanResult.Meal) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            header("Next up", m.name, icon: "sparkles")
            Text("\(Fmt.kcal(l.kcal)) kcal and \(Fmt.grams(l.protein)) g protein left today. This fits:")
                .font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(idea.items) { it in
                        VStack(alignment: .leading, spacing: 6) {
                            FoodIcon(kind: it.kind, size: 36, name: it.name)
                            Text(it.name).font(.brand(.subheadline, .semibold)).lineLimit(2).fixedSize(horizontal: false, vertical: true)
                            Text(it.amt).font(.brand(.caption)).foregroundStyle(Brand.ink2)
                        }
                        .frame(width: 108, alignment: .leading)
                        .padding(10)
                        .background(Brand.card2.opacity(0.6), in: .rect(cornerRadius: 16))
                    }
                }
            }
            .scrollClipDisabled()
            HStack(spacing: 10) {
                Button { withAnimation(.snappy) { seed += 1 } } label: {
                    Label("Another idea", systemImage: "arrow.triangle.2.circlepath").font(.brand(.subheadline, .semibold)).frame(minHeight: 44)
                }
                .buttonStyle(.glass)
                Button { Task { await log(m, idea) } } label: {
                    Text("Log it · \(Fmt.kcal(idea.kcal)) kcal").font(.brand(.headline)).frame(maxWidth: .infinity, minHeight: 44)
                }
                .buttonStyle(.glassProminent)
            }
        }
        .padding(16)
        .sensoryFeedback(.success, trigger: logged)
    }

    private func suggest() async {
        guard let l = left, l.kcal >= 150, let m = next, store.foodsReady else { idea = nil; return }
        let order = store.meals.map(\.key), i = order.firstIndex(of: m.key) ?? 0
        let rest = order[i...].filter { !eatenMeals.contains($0) }
        let r = await store.engineRef.planDay(target: l, meals: Array(rest), seeds: [m.key: seed], seed: 0, mine: true, today: true)
        withAnimation(.snappy) { idea = r?.meals.first { $0.meal == m.key && !$0.items.isEmpty } }
    }
    private func log(_ m: MealCategory, _ idea: DayPlanResult.Meal) async {
        var items: [[String: JSONValue]] = []
        for it in idea.items { if let raw = await store.engineRef.item(it.ref, qty: it.qty, unit: it.unit, meal: m.key) { items.append(raw) } }
        store.add(items, to: today, label: String(localized: "Logged \(m.name)"))
        logged.toggle()
    }
}
