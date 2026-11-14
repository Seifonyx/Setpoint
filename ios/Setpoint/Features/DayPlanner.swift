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
                        
                        .brandCard(padding: 14)
                    }
                    VStack(spacing: 14) { ForEach(p.meals) { m in timelineRow(m) } } // the day, as a timeline
                    Text("A starting point from your targets. Everything goes in as planned, so you can swap foods and tick them off as you eat.")
                        .font(.brand(.footnote)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center).padding(.horizontal, 12)
                } else if target == nil {
                    EmptyState(art: .target, title: "Set your targets first",
                               message: "Setpoint plans a day around your calories, protein, carbs and fat. Set them in You › Plan.").brandCard()
                } else if loading || !store.foodsReady {
                    SkeletonRows(count: 6).brandCard()
                }
            }
            .padding(.horizontal, 16).padding(.top, 4).padding(.bottom, 110)
            .animation(.snappy, value: shown)
        }
        .paperPage()
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
        .toolbar(.hidden, for: .tabBar)
        .sheet(isPresented: $adding) { if let p = shown { AddPlanSheet(plan: p) } }
        .alert("Save this day", isPresented: $naming) {
            TextField("Name", text: $name)
            Button("Save") { save() }
            Button("Cancel", role: .cancel) {}
        } message: { Text("Saved days sync with your account, ready to add to any day.") }
        .task(id: taskKey) { await replan() }
        .sensoryFeedback(.selection, trigger: seeds)
    }

    // MARK: Pieces

    private func summary(_ p: DayPlanResult) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 16) {
                ZStack {
                    CalorieDial(eaten: p.total.kcal, target: p.target.kcal, protein: nil, carbs: nil, fat: nil, lineWidth: 12)
                    VStack(spacing: 0) {
                        Text(Fmt.kcal(p.total.kcal)).font(Brand.num(28, .semibold)).monospacedDigit()
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
                Label { Text("Nutrients").lineLimit(1) } icon: { Image(systemName: "leaf.fill").foregroundStyle(Brand.green) }
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

    /// Short names so the rings' labels fit ("Vit A", not "Vitami…").
    static let short = ["fib": "Fiber", "vA": "Vit A", "vC": "Vit C", "vD": "Vit D", "vE": "Vit E", "vK": "Vit K", "fol": "Folate",
                        "b12": "B12", "b6": "B6", "ca": "Calcium", "fe": "Iron", "mg": "Magnesium", "k": "Potassium", "zn": "Zinc"]
    private func microRing(_ m: DayPlanResult.Micro) -> some View {
        let c = m.pct >= 100 ? Brand.green : m.pct >= 60 ? Brand.amber : Brand.over
        return VStack(spacing: 5) {
            ZStack {
                Circle().stroke(Brand.card2, lineWidth: 4)
                Circle().trim(from: 0, to: min(1, m.pct / 100)).stroke(c, style: StrokeStyle(lineWidth: 4, lineCap: .round)).rotationEffect(.degrees(-90))
                Text(m.pct >= 100 ? "✓" : "\(Int(m.pct))").font(.brand(.caption2, .bold)).monospacedDigit().foregroundStyle(m.pct >= 100 ? Brand.green : Brand.ink)
            }
            .frame(width: 38, height: 38)
            Text(Self.short[m.key].map { Brand.arabic ? m.label : $0 } ?? m.label).font(.brand(.caption2)).foregroundStyle(Brand.ink2)
                .lineLimit(1).minimumScaleFactor(0.8).frame(width: 64)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(m.label))
        .accessibilityValue(Text("\(Int(m.pct)) percent"))
    }

    /// A meal on the day's timeline: its time on the left, a dot in its colour, and a line on to the next meal.
    private func timelineRow(_ m: DayPlanResult.Meal) -> some View {
        let isOn = m.on && !off.contains(m.meal), last = m.id == shown?.meals.last?.id
        return mealCard(m)
            .padding(.leading, 54)
            .overlay(alignment: .topLeading) {
                VStack(spacing: 6) {
                    Text(Self.time(m.meal)).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
                        .lineLimit(2).multilineTextAlignment(.center).minimumScaleFactor(0.8).frame(width: 48)
                    Circle().fill(isOn ? Brand.meal(m.meal) : Brand.card2).frame(width: 12, height: 12)
                        .overlay(Circle().stroke(Brand.bg, lineWidth: 3))
                    Rectangle().fill(Brand.line).frame(width: 2).frame(maxHeight: .infinity)
                        .padding(.bottom, last ? 0 : -20)
                        .opacity(last ? 0 : 1)
                }
                .padding(.top, 18)
            }
    }
    /// The usual time for a meal, in the iPhone's own clock style.
    static func time(_ key: String) -> String {
        let hm: (Int, Int)? = ["breakfast": (8, 0), "lunch": (13, 0), "dinner": (19, 30)][key]
        guard let (h, mi) = hm, let d = Calendar.current.date(bySettingHour: h, minute: mi, second: 0, of: Date()) else {
            return key == "snacks" ? String(localized: "Any time") : ""
        }
        return d.formatted(date: .omitted, time: .shortened)
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
                        .labelsHidden().scaleEffect(0.85)
                }
            }
            .padding(.bottom, isOn ? 10 : 0)
            if isOn {
                ForEach(m.items) { it in
                    HStack(spacing: 12) {
                        FoodIcon(kind: it.kind, size: 32, name: it.name)
                        VStack(alignment: .leading, spacing: 1) {
                            HStack(spacing: 5) {
                                Text(it.name).font(.brand(.body)).lineLimit(1)
                                if it.usual { Text("Usual").font(.brand(.caption)).foregroundStyle(Brand.ink2) }
                            }
                            Text(it.amt).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                        }
                        Spacer()
                        Text(Fmt.kcal(it.kcal)).font(Brand.num(18, .semibold)).monospacedDigit().foregroundStyle(Brand.ink2)
                    }
                    .padding(.vertical, 6)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }
                if savedDay == nil {
                    Button { withAnimation(.snappy) { seeds[m.meal, default: 0] += 1 } } label: {
                        Label("Another idea", systemImage: "arrow.triangle.2.circlepath").font(.brand(.subheadline, .semibold))
                    }
                    
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
            .buttonStyle(.glassProminent).tint(Brand.green)
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
        SavedDays.add(SavedDay(id: Ids.new(), name: n.isEmpty ? String(localized: "My day") : n, created: Date(), plan: p), store)
    }
}

/// Days you saved from the planner. They sync with your account (root.ios.savedDays).
struct SavedDay: Codable, Identifiable, Hashable, Sendable {
    let id: String
    var name: String
    let created: Date
    let plan: DayPlanResult
    var u: Double?
    static func == (a: SavedDay, b: SavedDay) -> Bool { a.id == b.id && a.name == b.name }
    func hash(into h: inout Hasher) { h.combine(id) }
}
@MainActor
enum SavedDays {
    private static let oldKey = "savedDays" // kept on the phone before they synced
    /// Days saved on the phone by the first version move into your synced data (once).
    static func moveOld(_ store: Store) {
        guard let d = UserDefaults.standard.data(forKey: oldKey) else { return }
        UserDefaults.standard.removeObject(forKey: oldKey)
        for day in (try? JSONDecoder().decode([SavedDay].self, from: d)) ?? [] { add(day, store) }
    }
    static func load(_ store: Store) -> [SavedDay] {
        guard let v = store.ios("savedDays"), let d = try? JSONEncoder().encode(v) else { return [] }
        return (try? JSONDecoder().decode([SavedDay].self, from: d)) ?? []
    }
    static func add(_ day: SavedDay, _ store: Store) {
        var day = day; day.u = Store.nowMs
        guard let d = try? JSONEncoder().encode(day), let v = try? JSONDecoder().decode(JSONValue.self, from: d) else { return }
        store.setIos { o in
            var list = o["savedDays"]?.array ?? []
            list.removeAll { $0["id"]?.string == day.id }
            list.insert(v, at: 0)
            o["savedDays"] = .array(list)
        }
    }
    static func delete(_ id: String, _ store: Store) {
        store.setIos { o in
            o["savedDays"] = .array((o["savedDays"]?.array ?? []).filter { $0["id"]?.string != id })
            var del = o["del"]?.object ?? [:]; del[id] = .number(Store.nowMs); o["del"] = .object(del)
        }
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
                        Toggle("Skip meals that already have food", isOn: $skipFull)
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
    @Environment(Store.self) private var store
    private var days: [SavedDay] { SavedDays.load(store) }
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
            .onDelete { idx in let list = days; for i in idx { SavedDays.delete(list[i].id, store) } }
        }
        .brandList()
        .navigationTitle("Saved days")
        .toolbar(.hidden, for: .tabBar)
    }
}
