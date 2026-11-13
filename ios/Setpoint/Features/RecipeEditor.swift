import SwiftUI

/// Make or change a recipe: ingredients from the food list (or your foods), how many servings it makes,
/// and optionally its cooked weight. Saved in the web app's format (state.recipes).
struct RecipeEditor: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let recipe: [String: JSONValue]?
    @State private var name = ""
    @State private var servings = 4
    @State private var cooked = ""
    @State private var items: [[String: JSONValue]] = []
    @State private var picking = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    WordsField(label: "Name", text: $name, placeholder: "e.g. Chicken pasta bake")
                } header: { Text("Recipe") }
                Section {
                    Stepper(value: $servings, in: 1...100) {
                        HStack { Text("Servings"); Spacer(); Text("\(servings)").font(Brand.num(22, .semibold)).monospacedDigit() }
                    }
                    NumberField(label: "Cooked weight", text: $cooked, unit: "g", placeholder: "–")
                } header: { Text("Makes") } footer: { Text("Cooked weight is optional: weigh the whole pot after cooking to log it by weight later.") }
                Section {
                    ForEach(items.indices, id: \.self) { i in
                        let it = items[i]
                        LabeledContent {
                            Text("\(Fmt.kcal(it["kcal"]?.number ?? 0)) kcal").monospacedDigit()
                        } label: {
                            Text(it["name"]?.string ?? "")
                            Text(Fmt.amount(it["qty"]?.number ?? 1, it["unit"]?.string ?? "g"))
                        }
                    }
                    .onDelete { items.remove(atOffsets: $0) }
                    Button("Add ingredient", systemImage: "plus") { picking = true }
                } header: { Text("Ingredients") } footer: {
                    if let error { Text(error).foregroundStyle(Brand.danger) }
                    else if !items.isEmpty {
                        let k = items.reduce(0) { $0 + ($1["kcal"]?.number ?? 0) }
                        Text("\(Fmt.kcal(k / Double(servings))) kcal a serving")
                    }
                }
            }
            .brandList()
            .navigationTitle(recipe == nil ? "New recipe" : "Edit recipe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .sheet(isPresented: $picking) { IngredientPicker { items.append($0) } }
            .task {
                guard let r = recipe else { return }
                name = r["name"]?.string ?? ""; servings = Int(r["servings"]?.number ?? 1)
                cooked = r["cookedG"]?.number.map { String(Int($0)) } ?? ""
                // Work out each ingredient's calories for the list (recipes only store the amounts).
                var out: [[String: JSONValue]] = []
                for it in (r["items"]?.array ?? []).compactMap({ $0.object }) {
                    var x = it
                    if let ref = it["ref"]?.string, let q = it["qty"]?.number, let u = it["unit"]?.string,
                       let m = await store.engineRef.macros(ref, qty: q, unit: u) { x["kcal"] = .number(m.kcal) }
                    out.append(x)
                }
                items = out
            }
        }
    }

    private func save() {
        let nm = name.trimmingCharacters(in: .whitespaces)
        guard !nm.isEmpty else { error = String(localized: "Give it a name"); return }
        guard !items.isEmpty else { error = String(localized: "Add at least one ingredient"); return }
        let g = Double(cooked.replacingOccurrences(of: ",", with: "."))
        if !cooked.isEmpty, (g ?? 0) <= 0 { error = String(localized: "Check the cooked weight"); return }
        var v: [String: JSONValue] = recipe ?? ["id": .string("r" + Ids.new())]
        v["name"] = .string(String(nm.prefix(60)))
        v["servings"] = .number(Double(servings))
        v["cookedG"] = g.map { .number($0.rounded()) } ?? .null
        v["items"] = .array(items.prefix(60).map { it in
            .object(["ref": it["ref"] ?? .null, "name": it["name"] ?? .null, "g": it["g"] ?? .null, "qty": it["qty"] ?? .null, "unit": it["unit"] ?? .null])
        })
        var all = (store.root["recipes"]?.array ?? []).compactMap { $0.object }
        if let i = all.firstIndex(where: { $0["id"]?.string == v["id"]?.string }) { all[i] = v } else { all.append(v) }
        store.setRoot("recipes", .array(all.map { .object($0) }))
        dismiss()
    }
}

/// Search the food list for an ingredient, then pick how much (the same screen as adding food).
struct IngredientPicker: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let picked: ([String: JSONValue]) -> Void
    @State private var query = ""
    @State private var hits: [FoodHit] = []

    var body: some View {
        NavigationStack {
            List(hits) { h in
                NavigationLink(value: h.id) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(h.name)
                        if let s = h.sub { Text(s).font(.brand(.subheadline)).foregroundStyle(.secondary) }
                    }
                }
            }
            .overlay { if hits.isEmpty && !query.isEmpty { ContentUnavailableView.search(text: query) } }
            .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Search foods")
            .task(id: query) {
                try? await Task.sleep(for: .milliseconds(150))
                hits = query.trimmingCharacters(in: .whitespaces).isEmpty ? await store.engineRef.list("myFoods", meal: "lunch") : await store.engineRef.search(query, meal: "lunch")
            }
            .brandList()
            .navigationTitle("Add ingredient")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } } }
            .navigationDestination(for: String.self) { id in
                FoodAmountView(foodID: id, meal: "lunch", day: Day.today, done: { dismiss() }, pick: picked)
            }
        }
    }
}
