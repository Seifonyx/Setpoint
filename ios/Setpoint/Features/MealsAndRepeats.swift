import SwiftUI

/// Your meals: rename, reorder, add (e.g. Pre-workout) and remove. Saved as settings.meals ([{k, n}]), like the web app.
struct MealsEditor: View {
    @Environment(Store.self) private var store
    @State private var meals: [Row] = []
    @State private var adding = false
    @State private var newName = ""

    struct Row: Identifiable, Equatable { let id: String; var name: String }

    var body: some View {
        List {
            Section {
                ForEach($meals) { $m in
                    TextField("Name", text: $m.name).onSubmit(save)
                }
                .onMove { meals.move(fromOffsets: $0, toOffset: $1); save() }
                .onDelete { idx in
                    guard meals.count - idx.count >= 1 else { return }
                    meals.remove(atOffsets: idx); save()
                }
                Button("Add a meal", systemImage: "plus") { newName = ""; adding = true }
            } footer: { Text("Food logged in a meal you remove shows in the last meal. These sync with the web app.") }
            Section {
                Button("Use the standard four") { store.setSetting("meals", nil); load() }
            }
        }
        .environment(\.editMode, .constant(.active))
        .brandList()
        .navigationTitle("Meals")
        .onAppear(perform: load)
        .onDisappear(perform: save)
        .alert("New meal", isPresented: $adding) {
            TextField("Name (e.g. Pre-workout)", text: $newName)
            Button("Cancel", role: .cancel) {}
            Button("Add") {
                let n = newName.trimmingCharacters(in: .whitespaces)
                guard !n.isEmpty else { return }
                meals.append(Row(id: "m" + Ids.new(), name: String(n.prefix(30)))); save()
            }
        }
    }
    private func load() { meals = store.meals.map { Row(id: $0.key, name: $0.name) } }
    private func save() {
        let clean = meals.map { Row(id: $0.id, name: $0.name.trimmingCharacters(in: .whitespaces).isEmpty ? "Meal" : $0.name) }
        // Unchanged standard meals stay as "no custom meals", so they follow the app's language.
        if clean.map(\.id) == ["breakfast", "lunch", "dinner", "snacks"], zip(clean, store.meals).allSatisfy({ $0.name == $1.name }) { return }
        store.setSetting("meals", .array(clean.map { .object(["k": .string($0.id), "n": .string(String($0.name.prefix(30)))]) }))
    }
}

/// Repeating foods: the things you have most days (your morning coffee, the same lunch), added for you.
/// The week up top shows what each day gets on its own; below, each meal's repeats with the days they run.
struct RepeatingView: View {
    @Environment(Store.self) private var store
    @State private var editing: Edit?
    @State private var picking = false
    @State private var pending: [String: JSONValue]?
    @State private var newItem: Edit?
    @State private var kinds: [String: String] = [:]
    @State private var day = Calendar.current.component(.weekday, from: Date()) - 1
    struct Edit: Identifiable { let id: String; let rec: [String: JSONValue]?; let item: [String: JSONValue] }

    private var repeats: [[String: JSONValue]] { (store.root["repeats"]?.array ?? []).compactMap { $0.object } }
    private var order: [Int] { let ws = Int(store.root["settings"]?["weekStart"]?.number ?? 5); return (0..<7).map { (ws + $0) % 7 } }
    private func days(_ r: [String: JSONValue]) -> [Int] { (r["days"]?.array ?? []).compactMap { $0.number.map(Int.init) } }
    private func runs(_ r: [String: JSONValue], on d: Int) -> Bool { r["paused"]?.bool != true && (days(r).isEmpty || days(r).contains(d)) }
    private func kcal(_ r: [String: JSONValue]) -> Double { r["item"]?["kcal"]?.number ?? 0 }
    private func kcalOn(_ d: Int) -> Double { repeats.filter { runs($0, on: d) }.reduce(0) { $0 + kcal($1) } }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                week
                if repeats.isEmpty {
                    EmptyState(art: .repeating, title: "Nothing repeats yet",
                               message: "Add the foods you have most days, like your morning coffee or the same lunch. They go into your diary by themselves on the days you choose.",
                               action: (title: "Add a repeating food", run: { picking = true }))
                        .brandCard()
                }
                ForEach(store.meals) { m in
                    let list = repeats.filter { ($0["meal"]?.string ?? "") == m.key }
                    if !list.isEmpty { mealCard(m.name, list) }
                }
            }
            .padding(.horizontal, 16).padding(.top, 4).padding(.bottom, 24)
        }
        .paperPage()
        .navigationTitle("Repeating")
        .toolbar(.hidden, for: .tabBar)
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Add a repeating food", systemImage: "plus") { picking = true } } }
        .sheet(isPresented: $picking, onDismiss: { if let p = pending { newItem = Edit(id: "new", rec: nil, item: p); pending = nil } }) {
            RepeatPicker { raw in pending = raw; picking = false }
        }
        .sheet(item: $editing) { e in RepeatSheet(item: e.item, existing: e.rec) }
        .sheet(item: $newItem) { e in RepeatSheet(item: e.item) }
        .task(id: store.version) { kinds = await store.engineRef.repeatKinds() }
        .sensoryFeedback(.selection, trigger: day)
    }

    /// The week: how much each day gets added by itself. Tap a day to see what.
    private var week: some View {
        let maxK = max(order.map(kcalOn).max() ?? 0, 1)
        let today = Calendar.current.component(.weekday, from: Date()) - 1
        let onDay = repeats.filter { runs($0, on: day) }
        let avg = (0..<7).map(kcalOn).reduce(0, +) / 7
        return VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Your week").font(Brand.display(20, .bold))
                Text(avg > 0 ? LocalizedStringKey("About \(Fmt.kcal(avg)) kcal a day goes in by itself") : LocalizedStringKey("Repeating foods go in by themselves each day"))
                    .font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            }
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(order, id: \.self) { d in
                    let k = kcalOn(d), sel = d == day
                    Button { withAnimation(.snappy) { day = d } } label: {
                        VStack(spacing: 6) {
                            Text(k > 0 ? Fmt.kcal(k) : "–").font(.brand(.caption2, .medium)).monospacedDigit()
                                .foregroundStyle(sel ? Brand.ink : Brand.ink2).lineLimit(1).minimumScaleFactor(0.7)
                            ZStack(alignment: .bottom) {
                                Capsule().fill(Brand.card2).frame(height: 64)
                                Capsule().fill(sel ? Brand.water : Brand.water.opacity(0.45)).frame(height: max(k > 0 ? 8 : 0, 64 * k / maxK))
                            }
                            .frame(width: 22)
                            Text(Calendar.current.veryShortWeekdaySymbols[d]).font(.brand(.footnote, .bold))
                                .foregroundStyle(sel ? Color(uiColor: .systemBackground) : d == today ? Brand.water : Brand.ink)
                                .frame(width: 28, height: 28)
                                .background(Circle().fill(sel ? Brand.ink : Color.clear))
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Text(Calendar.current.weekdaySymbols[d]))
                    .accessibilityValue(Text("\(Fmt.kcal(k)) kcal"))
                    .accessibilityAddTraits(sel ? .isSelected : [])
                }
            }
            if !repeats.isEmpty {
                Divider().overlay(Brand.line)
                VStack(alignment: .leading, spacing: 8) {
                    Text("\(Calendar.current.weekdaySymbols[day]) · \(onDay.count) foods · \(Fmt.kcal(kcalOn(day))) kcal")
                        .font(.brand(.subheadline, .semibold))
                    if onDay.isEmpty {
                        Text("Nothing repeats on this day.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                    } else {
                        FlowChips(names: onDay.map { $0["item"]?["name"]?.string ?? "" })
                    }
                }
            }
        }
        .brandCard()
    }

    private func mealCard(_ name: String, _ list: [[String: JSONValue]]) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(name).font(Brand.display(19, .bold))
                Spacer()
                Text("\(Fmt.kcal(list.filter { $0["paused"]?.bool != true }.reduce(0) { $0 + kcal($1) })) kcal").font(.brand(.subheadline)).foregroundStyle(Brand.ink2).monospacedDigit()
            }
            .padding(.bottom, 4)
            ForEach(list.indices, id: \.self) { i in
                let r = list[i]
                if i > 0 { Divider().overlay(Brand.line) }
                row(r)
            }
        }
        .brandCard()
    }

    private func row(_ r: [String: JSONValue]) -> some View {
        let item = r["item"]?.object ?? [:], paused = r["paused"]?.bool == true, ds = days(r)
        let amount = Fmt.amount(item["qty"]?.number ?? 1, item["unit"]?.string ?? "")
        return Button { editing = Edit(id: r["id"]?.string ?? "", rec: r, item: item) } label: {
            HStack(spacing: 12) {
                FoodIcon(kind: kinds[r["id"]?.string ?? ""] ?? "food", size: 32, name: item["name"]?.string)
                VStack(alignment: .leading, spacing: 4) {
                    Text(item["name"]?.string ?? "").font(.brand(.body)).lineLimit(1)
                    HStack(spacing: 6) {
                        Text(amount + (r["time"]?.string.map { " · " + $0 } ?? "")).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                        if paused {
                            Text("Paused").font(.brand(.caption2, .semibold)).foregroundStyle(Brand.amber)
                                .padding(.horizontal, 6).padding(.vertical, 1).background(Brand.amber.opacity(0.15), in: Capsule())
                        }
                    }
                    // the days it runs, as a row of dots in your week's order
                    HStack(spacing: 4) {
                        ForEach(order, id: \.self) { d in
                            Circle().fill(!paused && (ds.isEmpty || ds.contains(d)) ? Brand.water : Brand.card2).frame(width: 6, height: 6)
                        }
                    }
                }
                Spacer()
                Text(Fmt.kcal(kcal(r))).font(.brand(.body, .semibold)).monospacedDigit()
            }
            .padding(.vertical, 6)
            .opacity(paused ? 0.6 : 1)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .contextMenu {
            Button(paused ? LocalizedStringKey("Resume") : LocalizedStringKey("Pause"), systemImage: paused ? "play.fill" : "pause.fill") { setPaused(r, !paused) }
            Button("Stop repeating", systemImage: "stop.fill", role: .destructive) { if let id = r["id"]?.string { store.stopRepeat(id) } }
        }
    }

    private func setPaused(_ r: [String: JSONValue], _ p: Bool) {
        var rec = r
        rec["paused"] = .bool(p); rec["until"] = .null; rec["u"] = .number(Store.nowMs)
        store.saveRepeat(rec, startsToday: !p)
    }
}

/// Names as wrapping chips.
struct FlowChips: View {
    let names: [String]
    var body: some View {
        ChipLayout(spacing: 6) {
            ForEach(names.indices, id: \.self) { i in
                Text(names[i]).font(.brand(.caption, .medium)).lineLimit(1)
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background(Brand.water.opacity(0.12), in: Capsule())
            }
        }
    }
}
struct ChipLayout: Layout {
    var spacing: CGFloat = 6
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let w = proposal.width ?? 320
        var x: CGFloat = 0, y: CGFloat = 0, row: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > w, x > 0 { x = 0; y += row + spacing; row = 0 }
            x += s.width + spacing; row = max(row, s.height)
        }
        return CGSize(width: w, height: y + row)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, row: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > bounds.maxX, x > bounds.minX { x = bounds.minX; y += row + spacing; row = 0 }
            v.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(s))
            x += s.width + spacing; row = max(row, s.height)
        }
    }
}

/// Pick a food to repeat: what you've eaten lately, or search.
struct RepeatPicker: View {
    let picked: ([String: JSONValue]) -> Void
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""
    @State private var recents: [FoodHit] = []
    @State private var hits: [FoodHit] = []

    var body: some View {
        NavigationStack {
            List {
                let list = query.isEmpty ? recents.filter { $0.quick != true } : hits
                Section {
                    ForEach(list) { h in
                        Button { Task { await choose(h) } } label: { FoodHitRow(hit: h) }.buttonStyle(.plain)
                    }
                } header: { Text(query.isEmpty ? LocalizedStringKey("Recent") : LocalizedStringKey("Results")) }
            }
            .brandList()
            .navigationTitle("Repeat a food")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Search foods")
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } }
            .task(id: store.foodsReady) { recents = await store.engineRef.list("recents", meal: store.meals.first?.key ?? "breakfast") }
            .task(id: query) {
                guard !query.isEmpty else { hits = []; return }
                try? await Task.sleep(for: .milliseconds(150))
                hits = await store.engineRef.search(query, meal: store.meals.first?.key ?? "breakfast")
            }
        }
    }
    private func choose(_ h: FoodHit) async {
        guard let raw = await store.engineRef.item(h.id, qty: h.q ?? 1, unit: h.u ?? "g", meal: store.meals.first?.key ?? "breakfast") else { return }
        picked(raw)
    }
}

/// Start (or change) repeating a food: which meal, which days, and optionally a time.
struct RepeatSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let item: [String: JSONValue]
    var existing: [String: JSONValue]? = nil
    @State private var meal = "breakfast"
    @State private var days: Set<Int> = []
    @State private var timed = false
    @State private var time = Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: Date()) ?? Date()
    @State private var paused = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    LabeledContent(item["name"]?.string ?? "") { Text("\(Fmt.kcal(item["kcal"]?.number ?? 0)) kcal").monospacedDigit() }
                    Picker("Meal", selection: $meal) { ForEach(store.meals) { Text($0.name).tag($0.key) } }
                }
                Section {
                    HStack(spacing: 6) {
                        ForEach(order, id: \.self) { d in
                            let on = days.isEmpty || days.contains(d)
                            Button {
                                var s = days.isEmpty ? Set(0..<7) : days
                                if s.contains(d) { s.remove(d) } else { s.insert(d) }
                                days = s.count == 7 ? [] : s
                            } label: {
                                Text(Calendar.current.veryShortWeekdaySymbols[d]).font(.brand(.subheadline, .semibold))
                                    .frame(maxWidth: .infinity, minHeight: 38)
                                    .background(Circle().fill(on ? AnyShapeStyle(Brand.green) : AnyShapeStyle(Brand.card2)))
                                    .foregroundStyle(on ? Color(uiColor: .systemBackground) : Brand.ink)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                } header: { Text("Days") } footer: { Text(days.isEmpty ? "Every day" : "\(days.count) days a week") }
                Section {
                    Toggle("Add at a set time", isOn: $timed)
                    if timed { DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute) }
                    if existing != nil { Toggle("Pause", isOn: $paused) }
                }
                if existing != nil {
                    Section { Button("Stop repeating", role: .destructive, action: stop) }
                }
            }
            .brandList()
            .navigationTitle(existing == nil ? "Repeat" : "Repeating food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button(existing == nil ? "Start" : "Save", action: save) }
            }
            .onAppear {
                meal = existing?["meal"]?.string ?? item["meal"]?.string ?? store.meals.first?.key ?? "breakfast"
                days = Set((existing?["days"]?.array ?? []).compactMap { $0.number.map(Int.init) })
                if let t = existing?["time"]?.string, let h = Int(t.prefix(2)), let m = Int(t.suffix(2)) {
                    timed = true; time = Calendar.current.date(bySettingHour: h, minute: m, second: 0, of: Date()) ?? time
                }
                paused = existing?["paused"]?.bool == true
            }
        }
    }
    private var order: [Int] { let ws = Int(store.root["settings"]?["weekStart"]?.number ?? 5); return (0..<7).map { (ws + $0) % 7 } }
    private var hm: String { let c = Calendar.current.dateComponents([.hour, .minute], from: time); return String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0) }

    private func save() {
        var clean = item
        for k in ["id", "meal", "t", "u", "plan", "rep"] { clean.removeValue(forKey: k) }
        let id = existing?["id"]?.string ?? "p" + String(UUID().uuidString.lowercased().filter(\.isLetter).prefix(8))
        var rec: [String: JSONValue] = ["id": .string(id), "item": .object(clean), "meal": .string(meal),
            "days": .array(days.sorted().map { .number(Double($0)) }), "u": .number(Store.nowMs), "paused": .bool(paused), "time": timed ? .string(hm) : .null]
        if !paused { rec.removeValue(forKey: "until") }
        store.saveRepeat(rec, startsToday: timed && hm > nowHM)
        dismiss()
    }
    private var nowHM: String { let c = Calendar.current.dateComponents([.hour, .minute], from: Date()); return String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0) }
    private func stop() {
        if let id = existing?["id"]?.string { store.stopRepeat(id) }
        dismiss()
    }
}
