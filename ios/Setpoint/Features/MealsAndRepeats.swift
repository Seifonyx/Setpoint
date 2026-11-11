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

/// Foods that add themselves to your diary (state.repeats), as in the web app.
struct RepeatsView: View {
    @Environment(Store.self) private var store
    @State private var editing: Edit?
    struct Edit: Identifiable { let id: String; let rec: [String: JSONValue] }

    private var repeats: [[String: JSONValue]] { (store.root["repeats"]?.array ?? []).compactMap { $0.object } }

    var body: some View {
        List {
            Section {
                if repeats.isEmpty { Text("Tap a food in your Diary and choose Repeat to have it added for you, like your morning coffee.").foregroundStyle(.secondary) }
                ForEach(repeats.indices, id: \.self) { i in
                    let r = repeats[i], item = r["item"]?.object ?? [:]
                    Button { editing = Edit(id: r["id"]?.string ?? "", rec: r) } label: {
                        LabeledContent {
                            Text("\(Fmt.kcal(item["kcal"]?.number ?? 0)) kcal").monospacedDigit()
                        } label: {
                            Text(item["name"]?.string ?? "")
                            Text(summary(r))
                        }
                    }
                    .tint(.primary)
                }
            }
        }
        .brandList()
        .navigationTitle("Repeating foods")
        .sheet(item: $editing) { e in RepeatSheet(item: e.rec["item"]?.object ?? [:], existing: e.rec) }
    }
    private func summary(_ r: [String: JSONValue]) -> String {
        let days = (r["days"]?.array ?? []).compactMap { $0.number.map(Int.init) }
        var s = days.isEmpty || days.count == 7 ? String(localized: "Every day") : days.map { Calendar.current.shortWeekdaySymbols[$0] }.joined(separator: ", ")
        if let t = r["time"]?.string { s += " · " + t }
        if r["paused"]?.bool == true { s += " · " + String(localized: "Paused") }
        return s
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
