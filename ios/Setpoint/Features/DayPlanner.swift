import SwiftUI

/// Plan my day: a whole day of food for your targets, from tools/ios-planner.js. It fills your vitamins and minerals
/// first, learns from what you log, and keeps it sensible (one protein per meal, meat or fish at most twice a day).
/// Add it to a day as planned food, or save it to use again.
struct DayPlannerView: View {
    @Environment(Store.self) private var store
    @AppStorage("plannerMine") private var mine = true
    @AppStorage("plannerOff") private var offText = ""      // meals you switched off, comma separated
    @AppStorage("plannerSeed") private var seed = 0
    @State private var seeds: [String: Int] = [:]
    @State private var plan: DayPlanResult?
    @State private var loading = true
    @State private var adding = false
    @State private var naming = false
    @State private var name = ""
    @State private var saved = SavedDays.load()
    /// A saved day you opened (shown as it was saved, not re-planned).
    var savedDay: SavedDay? = nil

    private var off: Set<String> { Set(offText.split(separator: ",").map(String.init)) }
    private var target: DayPlan? { store.plans[Day.today] ?? store.plan(Day.today) }
    private var shown: DayPlanResult? { savedDay?.plan ?? plan }
    private var taskKey: String {
        let sd = seeds.keys.sorted().map { k in k + String(seeds[k] ?? 0) }.joined(separator: ",")
        return [String(mine), offText, String(seed), sd, String(store.foodsReady), String(target?.kcal ?? 0)].joined(separator: "|")
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                if let p = shown {
                    summary(p)
                    if savedDay == nil {
                        Toggle(isOn: $mine) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Learn from my logs").font(.brand(.body, .semibold))
                                Text("Leans towards the foods you eat, at your usual amounts").font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                            }
                        }
                        .tint(Brand.green)
                        .brandCard(padding: 14)
                    }
                    ForEach(p.meals) { m in mealCard(m) }
                    Text("A starting point from your targets. Everything goes in as planned, so you can swap foods and tick them off as you eat.")
                        .font(.brand(.footnote)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center).padding(.horizontal, 12)
                } else if target == nil {
                    ContentUnavailableView("Set your targets first", systemImage: "target",
                                           description: Text("Setpoint plans a day around your calories, protein, carbs and fat. Set them in You › Plan."))
                } else if loading || !store.foodsReady {
                    ProgressView().padding(.top, 80)
                }
            }
            .padding(.horizontal, 16).padding(.top, 4).padding(.bottom, 110)
            .animation(.snappy, value: shown)
        }
        .background(Brand.bg.ignoresSafeArea())
        .navigationTitle(savedDay?.name ?? String(localized: "Plan my day"))
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            if savedDay == nil {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save this day", systemImage: "bookmark") { name = ""; naming = true }.disabled(plan == nil)
                }
            }
        }
        .safeAreaInset(edge: .bottom) { bottomBar }
        .sheet(isPresented: $adding) { if let p = shown { AddPlanSheet(plan: p) } }
        .alert("Save this day", isPresented: $naming) {
            TextField("Name", text: $name)
            Button("Save") { save() }
            Button("Cancel", role: .cancel) {}
        } message: { Text("Saved days are kept on this iPhone, ready to add to any day.") }
        .task(id: taskKey) { await replan() }
        .sensoryFeedback(.selection, trigger: seeds)
    }

    // MARK: Pieces

    private func summary(_ p: DayPlanResult) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 16) {
                ZStack {
                    CalorieDial(eaten: p.total.kcal, target: p.target.kcal, protein: nil, carbs: nil, fat: nil)
                    VStack(spacing: 0) {
                        Text(Fmt.kcal(p.total.kcal)).font(Brand.display(24)).monospacedDigit()
                        Text("of \(Fmt.kcal(p.target.kcal))").font(.brand(.caption)).foregroundStyle(Brand.ink2)
                    }
                }
                .frame(width: 112, height: 112)
                VStack(spacing: 9) {
                    macro("Protein", p.total.protein, p.target.protein, Brand.protein)
                    macro("Carbs", p.total.carbs, p.target.carbs, Brand.carbs)
                    macro("Fat", p.total.fat, p.target.fat, Brand.fat)
                }
            }
            Divider().overlay(Brand.line)
            HStack {
                Label { Text("Vitamins and minerals") } icon: { Image(systemName: "leaf.fill").foregroundStyle(Brand.green) }
                    .font(.brand(.subheadline, .semibold))
                Spacer()
                Text("\(p.met) of \(p.micros.count) covered").font(.brand(.subheadline)).foregroundStyle(Brand.ink2).monospacedDigit()
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) { ForEach(p.micros) { microRing($0) } }
            }
            .scrollClipDisabled()
        }
        .brandCard()
    }

    private func macro(_ name: LocalizedStringKey, _ v: Double, _ t: Double, _ c: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(name).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
                Spacer()
                Text("\(Fmt.grams(v)) / \(Fmt.grams(t)) g").font(.brand(.caption)).monospacedDigit()
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.card2)
                    Capsule().fill(c).frame(width: g.size.width * min(1, t > 0 ? v / t : 0))
                }
            }
            .frame(height: 6)
        }
    }

    private func microRing(_ m: DayPlanResult.Micro) -> some View {
        let c = m.pct >= 100 ? Brand.green : m.pct >= 60 ? Brand.amber : Brand.over
        return VStack(spacing: 5) {
            ZStack {
                Circle().stroke(Brand.card2, lineWidth: 4)
                Circle().trim(from: 0, to: min(1, m.pct / 100)).stroke(c, style: StrokeStyle(lineWidth: 4, lineCap: .round)).rotationEffect(.degrees(-90))
                Text(m.pct >= 100 ? "✓" : "\(Int(m.pct))").font(.brand(.caption2, .bold)).monospacedDigit().foregroundStyle(m.pct >= 100 ? Brand.green : Brand.ink)
            }
            .frame(width: 38, height: 38)
            Text(m.label).font(.brand(.caption2)).foregroundStyle(Brand.ink2).lineLimit(1).frame(width: 64)
        }
    }

    @ViewBuilder private func mealCard(_ m: DayPlanResult.Meal) -> some View {
        let isOn = m.on && !off.contains(m.meal)
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(m.name).font(Brand.display(19, .bold))
                    if isOn {
                        Text("P \(Fmt.grams(m.protein)) · C \(Fmt.grams(m.carbs)) · F \(Fmt.grams(m.fat))").font(.brand(.caption)).foregroundStyle(Brand.ink2).monospacedDigit()
                    } else {
                        Text("Not planned").font(.brand(.caption)).foregroundStyle(Brand.ink2)
                    }
                }
                Spacer()
                if isOn { Text("\(Fmt.kcal(m.kcal)) kcal").font(.brand(.subheadline, .semibold)).monospacedDigit() }
                if savedDay == nil {
                    Toggle("Plan \(m.name)", isOn: Binding(get: { isOn }, set: { setMeal(m.meal, $0) }))
                        .labelsHidden().tint(Brand.green).scaleEffect(0.85)
                }
            }
            .padding(.bottom, isOn ? 10 : 0)
            if isOn {
                ForEach(m.items) { it in
                    HStack(spacing: 12) {
                        FoodIcon(kind: it.kind, size: 34, name: it.name)
                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 5) {
                                Text(it.name).font(.brand(.body)).lineLimit(1)
                                if it.usual { Text("Usual").font(.brand(.caption2, .semibold)).foregroundStyle(Brand.green)
                                    .padding(.horizontal, 6).padding(.vertical, 1).background(Brand.greenSoft, in: Capsule()) }
                            }
                            Text(it.amt).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                        }
                        Spacer()
                        Text(Fmt.kcal(it.kcal)).font(.brand(.subheadline)).monospacedDigit().foregroundStyle(Brand.ink2)
                    }
                    .padding(.vertical, 6)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }
                if savedDay == nil {
                    Button { withAnimation(.snappy) { seeds[m.meal, default: 0] += 1 } } label: {
                        Label("Another idea", systemImage: "arrow.triangle.2.circlepath").font(.brand(.subheadline, .semibold))
                    }
                    .tint(Brand.green)
                    .padding(.top, 8)
                }
            }
        }
        .brandCard()
        .opacity(isOn ? 1 : 0.75)
    }

    private var bottomBar: some View {
        HStack(spacing: 12) {
            if savedDay == nil {
                Button { withAnimation(.snappy) { seed += 1; seeds = [:] } } label: {
                    Image(systemName: "shuffle").font(.body.weight(.semibold)).frame(width: 50, height: 50)
                }
                .buttonStyle(.glass)
                .accessibilityLabel(Text("A new day"))
            }
            Button { adding = true } label: {
                Text("Add to diary").font(.brand(.headline)).frame(maxWidth: .infinity, minHeight: 50)
            }
            .buttonStyle(.glassProminent)
            .disabled(shown?.meals.contains { $0.on && !$0.items.isEmpty } != true)
        }
        .padding(.horizontal, 16).padding(.bottom, 8)
    }

    // MARK: Actions

    private func replan() async {
        guard savedDay == nil, let t = target, store.foodsReady else { loading = false; return }
        let meals = store.meals.map(\.key).filter { !off.contains($0) }
        plan = await store.engineRef.planDay(target: t, meals: meals.isEmpty ? store.meals.map(\.key) : meals, seeds: seeds, seed: seed, mine: mine)
        loading = false
    }
    private func setMeal(_ key: String, _ on: Bool) {
        var s = off
        if on { s.remove(key) } else {
            guard store.meals.count - s.count > 1 else { return } // keep at least one meal
            s.insert(key)
        }
        withAnimation(.snappy) { offText = s.sorted().joined(separator: ",") }
    }
    private func save() {
        guard let p = plan else { return }
        let n = name.trimmingCharacters(in: .whitespaces)
        let day = SavedDay(id: Ids.new(), name: n.isEmpty ? String(localized: "My day") : n, created: Date(), plan: p)
        saved.insert(day, at: 0)
        SavedDays.save(saved)
    }
}

/// Days you saved from the planner (kept on this iPhone).
struct SavedDay: Codable, Identifiable, Hashable, Sendable {
    let id: String
    var name: String
    let created: Date
    let plan: DayPlanResult
    static func == (a: SavedDay, b: SavedDay) -> Bool { a.id == b.id && a.name == b.name }
    func hash(into h: inout Hasher) { h.combine(id) }
}
enum SavedDays {
    static let key = "savedDays"
    static func load() -> [SavedDay] {
        guard let d = UserDefaults.standard.data(forKey: key) else { return [] }
        return (try? JSONDecoder().decode([SavedDay].self, from: d)) ?? []
    }
    static func save(_ days: [SavedDay]) {
        if let d = try? JSONEncoder().encode(days) { UserDefaults.standard.set(d, forKey: key) }
    }
}

/// Which day the plan goes on. The foods go in as planned, so they count once you tick them off.
struct AddPlanSheet: View {
    let plan: DayPlanResult
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var day = Day.today
    @State private var skipFull = true
    @State private var busy = false

    private var full: Set<String> { Set(store.items(day).map(\.meal)) }
    private var kept: [DayPlanResult.Meal] { plan.meals.filter { $0.on && !$0.items.isEmpty && !(skipFull && full.contains($0.meal)) } }

    var body: some View {
        NavigationStack {
            Form {
                Section("Which day") {
                    Picker("Day", selection: $day) {
                        Text("Today").tag(Day.today)
                        Text("Tomorrow").tag(Day.add(Day.today, 1))
                        if day != Day.today && day != Day.add(Day.today, 1) { Text(Day.date(day).formatted(.dateTime.weekday(.wide).month().day())).tag(day) }
                    }
                    .pickerStyle(.segmented)
                    DatePicker("Another day", selection: Binding(get: { Day.date(day) }, set: { day = Day.iso($0) }), displayedComponents: .date)
                }
                if !full.isEmpty {
                    Section {
                        Toggle("Skip meals that already have food", isOn: $skipFull).tint(Brand.green)
                    } footer: { Text("This day already has \(Fmt.kcal(store.totals(day).kcal)) kcal logged.") }
                }
                Section {
                    ForEach(plan.meals.filter { $0.on && !$0.items.isEmpty }) { m in
                        let skip = skipFull && full.contains(m.meal)
                        LabeledContent(m.name) { Text(skip ? String(localized: "Skipped") : "\(Fmt.kcal(m.kcal)) kcal").monospacedDigit() }
                            .opacity(skip ? 0.5 : 1)
                    }
                }
            }
            .brandList()
            .navigationTitle("Add to diary")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") { Task { await add() } }.disabled(kept.isEmpty || busy)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func add() async {
        busy = true
        var items: [[String: JSONValue]] = []
        for m in kept {
            for it in m.items {
                if var raw = await store.engineRef.item(it.ref, qty: it.qty, unit: it.unit, meal: m.meal) {
                    raw["plan"] = .bool(true)
                    items.append(raw)
                }
            }
        }
        store.add(items, to: day, label: String(localized: "Planned \(items.count) foods"))
        busy = false
        dismiss()
    }
}

/// Your saved days, from the Foods tab.
struct SavedDaysView: View {
    @State private var days = SavedDays.load()
    var body: some View {
        List {
            if days.isEmpty {
                Text("Plan a day, then tap the bookmark to keep it here.").foregroundStyle(Brand.ink2)
            }
            ForEach(days) { d in
                NavigationLink { DayPlannerView(savedDay: d) } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(d.name).font(.brand(.body, .semibold))
                        Text("\(Fmt.kcal(d.plan.total.kcal)) kcal · P \(Fmt.grams(d.plan.total.protein)) · C \(Fmt.grams(d.plan.total.carbs)) · F \(Fmt.grams(d.plan.total.fat))")
                            .font(.brand(.footnote)).foregroundStyle(Brand.ink2).monospacedDigit()
                    }
                }
            }
            .onDelete { idx in days.remove(atOffsets: idx); SavedDays.save(days) }
        }
        .brandList()
        .navigationTitle("Saved days")
        .onAppear { days = SavedDays.load() }
    }
}
