import SwiftUI

/// A meal you build yourself, like Cronometer's: a name and the foods in it, each at its amount. Logging it adds
/// each food to your diary on its own. Make one here, or from the Diary (a meal's ⋯ › Save as meal).
struct MealEditor: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    /// nil: a new meal
    let meal: [String: JSONValue]?
    @State private var name = ""
    @State private var items: [[String: JSONValue]] = []
    @State private var picking = false
    @State private var editing: Part?
    @State private var confirmDelete = false
    struct Part: Identifiable { let id = UUID(); let index: Int; let item: [String: JSONValue] }

    private var total: Totals {
        items.reduce(into: Totals()) { t, x in t.kcal += x["kcal"]?.number ?? 0; t.protein += x["protein"]?.number ?? 0; t.carbs += x["carbs"]?.number ?? 0; t.fat += x["fat"]?.number ?? 0 }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    WordsField(label: "Name", text: $name, placeholder: "e.g. My usual breakfast")
                } header: { Text("Meal") }
                Section {
                    HStack(spacing: 14) {
                        stat("Calories", Fmt.kcal(total.kcal))
                        stat("Protein", "\(Fmt.grams(total.protein)) g")
                        stat("Carbs", "\(Fmt.grams(total.carbs)) g")
                        stat("Fat", "\(Fmt.grams(total.fat)) g")
                    }
                    .padding(.vertical, 2)
                } header: { Text("Totals") }
                Section {
                    ForEach(items.indices, id: \.self) { i in
                        let it = items[i]
                        Button { editing = Part(index: i, item: it) } label: {
                            IngredientRow(name: it["name"]?.string ?? "", amount: it["qty"]?.number.flatMap { q in it["unit"]?.string.map { Fmt.amount(q, $0) } }, kcal: it["kcal"]?.number ?? 0, ref: it["ref"]?.string)
                        }
                        .buttonStyle(.plain)
                        .swipeActions { Button("Remove", systemImage: "minus.circle", role: .destructive) { withAnimation { _ = items.remove(at: i) } }.tint(Brand.danger) }
                    }
                    .onMove { items.move(fromOffsets: $0, toOffset: $1) } // press, hold and drag to reorder
                    Button { picking = true } label: { Label("Add a food", systemImage: "plus.circle.fill").foregroundStyle(Brand.green).fontWeight(.semibold) }
                } header: { Text("Foods") } footer: {
                    Text("Tap a food to change its amount, swipe to remove it, or hold and drag to reorder.")
                }
                if meal != nil {
                    Section { Button("Delete meal", role: .destructive) { confirmDelete = true }.foregroundStyle(Brand.danger) }
                }
            }
            .brandList()
            .navigationTitle(meal == nil ? "New meal" : "Edit meal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save).disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || items.isEmpty).buttonStyle(.glassProminent).tint(Brand.green)
                }
            }
            .sheet(isPresented: $picking) {
                RepeatPicker(title: "Add to meal") { raw in
                    var x = raw; for k in ["id", "meal", "t", "plan", "u"] { x.removeValue(forKey: k) }
                    withAnimation { items.append(x) }
                    picking = false
                }
            }
            .sheet(item: $editing) { p in
                PartAmountSheet(part: p.item) { updated in if p.index < items.count { items[p.index] = updated } }
            }
            .confirmationDialog("Delete this meal?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete", role: .destructive) { remove(); dismiss() }
            }
            .onAppear {
                guard let m = meal, items.isEmpty else { return }
                name = m["name"]?.string ?? ""
                items = (m["items"]?.array ?? []).compactMap { $0.object }
            }
        }
    }

    private func stat(_ l: LocalizedStringKey, _ v: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(l).font(.brand(.caption2, .semibold)).foregroundStyle(Brand.ink2)
            Text(v).font(Brand.num(18, .semibold)).monospacedDigit().lineLimit(1).minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    private func save() {
        var all = (store.root["meals"]?.array ?? []).compactMap { $0.object }
        let id = meal?["id"]?.string ?? ("m" + Ids.new())
        let rec: [String: JSONValue] = ["id": .string(id), "name": .string(String(name.trimmingCharacters(in: .whitespaces).prefix(40))), "items": .array(items.prefix(40).map { .object($0) })]
        if let i = all.firstIndex(where: { $0["id"]?.string == id }) { all[i] = rec } else { all.append(rec) }
        store.setRoot("meals", .array(all.map { .object($0) }))
        dismiss()
    }
    private func remove() {
        guard let id = meal?["id"]?.string else { return }
        store.setRoot("meals", .array((store.root["meals"]?.array ?? []).filter { $0["id"]?.string != id }))
    }
}

/// Logging a meal from Add food: what's in it, how many servings, then each food goes in on its own.
struct MealLogSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let mealID: String
    let mealKey: String
    let day: String
    @State private var servings = 1.0

    private var rec: [String: JSONValue]? { (store.root["meals"]?.array ?? []).compactMap { $0.object }.first { $0["id"]?.string == mealID } }
    private var items: [[String: JSONValue]] { (rec?["items"]?.array ?? []).compactMap { $0.object } }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Text("Servings").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                        Spacer()
                        Stepper(value: $servings, in: 0.5...10, step: 0.5) {
                            Text(Fmt.fraction(servings) + "×").font(Brand.num(22, .semibold)).monospacedDigit().frame(maxWidth: .infinity, alignment: .trailing)
                        }
                        .fixedSize()
                    }
                }
                Section {
                    ForEach(items.indices, id: \.self) { i in
                        let it = items[i]
                        IngredientRow(name: it["name"]?.string ?? "", amount: it["qty"]?.number.flatMap { q in it["unit"]?.string.map { Fmt.amount(q * servings, $0) } }, kcal: (it["kcal"]?.number ?? 0) * servings, ref: it["ref"]?.string)
                    }
                } header: { Text("Foods") }
            }
            .brandList()
            .navigationTitle(rec?["name"]?.string ?? "")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } } }
            .safeAreaInset(edge: .bottom) {
                HStack(spacing: 10) {
                    // Plan: in the diary unticked, ticked off when you eat it (a day still to come is always planned)
                    if day <= Day.today {
                        Button { Task { await add(planned: true) } } label: {
                            Text(String(localized: "Plan (verb)", defaultValue: "Plan")).font(.brand(.headline)).frame(minWidth: 70, minHeight: 50)
                        }
                        .buttonStyle(.glass)
                    }
                    Button { Task { await add() } } label: {
                        Text("Add \(items.count) foods · \(addKcal) kcal")
                            .font(.brand(.headline)).frame(maxWidth: .infinity, minHeight: 50)
                    }
                    .buttonStyle(.glassProminent).tint(Brand.green)
                }
                .padding(.horizontal, 16).padding(.bottom, 8)
            }
        }
        .presentationDetents([.medium, .large])
    }
    private var addKcal: String { Fmt.kcal(items.reduce(0.0) { $0 + ($1["kcal"]?.number ?? 0) } * servings) }
    private func add(planned: Bool = false) async {
        let list = await store.engineRef.logMeal(mealID, meal: mealKey, factor: servings)
        let name = rec?["name"]?.string ?? ""
        store.add(list, to: day, label: planned ? String(localized: "Planned \(name)") : String(localized: "Added \(name)"), planned: planned)
        dismiss()
    }
}
