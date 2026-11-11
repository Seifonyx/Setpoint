import SwiftUI

/// Foods: your own foods, recipes, saved meals and favorites. Same data as the web app's My foods page.
struct FoodsView: View {
    @Environment(Store.self) private var store
    @State private var editing: EditFood?
    @State private var recipeEdit: EditFood?
    @State private var favorites: [FoodHit] = []

    struct EditFood: Identifiable { let id: String; let food: [String: JSONValue]? }

    private func list(_ key: String) -> [[String: JSONValue]] { (store.root[key]?.array ?? []).compactMap { $0.object } }
    private func remove(_ key: String, id: String) {
        store.setRoot(key, .array(list(key).filter { $0["id"]?.string != id }.map { .object($0) }))
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    let mine = list("myFoods")
                    if mine.isEmpty { Text("Foods you make show up here, like a protein shake or your mum's lasagna.").foregroundStyle(.secondary) }
                    ForEach(mine.indices, id: \.self) { i in
                        let f = mine[i]
                        Button { editing = EditFood(id: f["id"]?.string ?? "", food: f) } label: {
                            LabeledContent {
                                Text("\(Fmt.kcal(f["kcal"]?.number ?? 0)) kcal").monospacedDigit()
                            } label: {
                                Text(f["name"]?.string ?? "")
                                Text("1 \(f["unit"]?.string ?? "serving")" + (f["g"]?.number.map { " · \(Fmt.grams($0)) g" } ?? "")
                                     + " · P \(Fmt.grams(f["p"]?.number ?? 0)) · C \(Fmt.grams(f["c"]?.number ?? 0)) · F \(Fmt.grams(f["f"]?.number ?? 0))")
                            }
                        }
                        .tint(.primary)
                        .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { remove("myFoods", id: f["id"]?.string ?? "") } }
                    }
                    Button("New food", systemImage: "plus") { editing = EditFood(id: "new", food: nil) }
                } header: { Text("My foods") }

                let recipes = list("recipes")
                Section {
                    ForEach(recipes.indices, id: \.self) { i in
                        let r = recipes[i]
                        Button { recipeEdit = EditFood(id: r["id"]?.string ?? "", food: r) } label: {
                            LabeledContent {
                                Text("\((r["items"]?.array ?? []).count)").foregroundStyle(.secondary)
                            } label: {
                                Text(r["name"]?.string ?? "")
                                Text("\(Int(r["servings"]?.number ?? 1)) servings")
                            }
                        }
                        .tint(.primary)
                        .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { remove("recipes", id: r["id"]?.string ?? "") } }
                    }
                    Button("New recipe", systemImage: "plus") { recipeEdit = EditFood(id: "new", food: nil) }
                } header: { Text("Recipes") }

                let meals = list("meals")
                if !meals.isEmpty {
                    Section("Saved meals") {
                        ForEach(meals.indices, id: \.self) { i in
                            let m = meals[i], items = (m["items"]?.array ?? []).compactMap { $0.object }
                            LabeledContent {
                                Text("\(Fmt.kcal(items.reduce(0) { $0 + ($1["kcal"]?.number ?? 0) })) kcal").monospacedDigit()
                            } label: {
                                Text(m["name"]?.string ?? "")
                                Text(items.compactMap { $0["name"]?.string }.joined(separator: ", ")).lineLimit(1)
                            }
                            .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { remove("meals", id: m["id"]?.string ?? "") } }
                        }
                    }
                }

                if !favorites.isEmpty {
                    Section("Favorites") {
                        ForEach(favorites) { f in
                            LabeledContent { Text(f.sub ?? "").font(.brand(.subheadline)).foregroundStyle(.secondary) } label: { Text(f.name) }
                                .swipeActions {
                                    Button("Remove", systemImage: "star.slash", role: .destructive) {
                                        store.setRoot("favs", .array((store.root["favs"]?.array ?? []).filter { $0.string != f.id }))
                                    }
                                }
                        }
                    }
                }
            }
            .brandList()
            .navigationTitle("Foods")
            .task(id: "\(store.version)|\(store.foodsReady)") { favorites = await store.engineRef.list("favorites", meal: "snacks") }
            .sheet(item: $editing) { e in CustomFoodSheet(food: e.food) }
            .sheet(item: $recipeEdit) { e in RecipeEditor(recipe: e.food) }
        }
    }
}

/// Make or change one of your own foods (per serving, like a nutrition label).
struct CustomFoodSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let food: [String: JSONValue]?
    @State private var name = ""
    @State private var unit = ""
    @State private var grams = ""
    @State private var kcal = ""
    @State private var p = ""
    @State private var c = ""
    @State private var f = ""
    @State private var error: String?

    private func num(_ s: String) -> Double? { s.isEmpty ? nil : Double(s.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")) }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                    TextField("Serving (e.g. scoop, slice)", text: $unit)
                    row("Weight of a serving (optional)", $grams, "g")
                }
                Section {
                    row("Calories", $kcal, "kcal")
                    row("Protein", $p, "g")
                    row("Carbs", $c, "g")
                    row("Fat", $f, "g")
                } header: { Text("Per serving") } footer: {
                    if let error { Text(error).foregroundStyle(Brand.over) }
                    else if let k = estimate { Text("About \(Fmt.kcal(k)) kcal from the macros") }
                }
            }
            .brandList()
            .navigationTitle(food == nil ? "New food" : "Edit food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .onAppear {
                guard let x = food else { return }
                name = x["name"]?.string ?? ""; unit = x["unit"]?.string ?? ""
                grams = x["g"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                kcal = x["kcal"]?.number.map { String(Int($0)) } ?? ""
                p = x["p"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                c = x["c"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                f = x["f"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
            }
        }
    }
    private var estimate: Double? {
        let pp = num(p) ?? 0, cc = num(c) ?? 0, ff = num(f) ?? 0
        return pp + cc + ff > 0 ? 4 * pp + 4 * cc + 9 * ff : nil
    }
    private func row(_ title: LocalizedStringKey, _ text: Binding<String>, _ unit: LocalizedStringKey) -> some View {
        LabeledContent(title) {
            HStack(spacing: 4) {
                TextField("0", text: text).keyboardType(.decimalPad).multilineTextAlignment(.trailing).frame(maxWidth: 90)
                Text(unit).foregroundStyle(.secondary)
            }
        }
    }
    private func save() {
        let nm = name.trimmingCharacters(in: .whitespaces)
        guard !nm.isEmpty else { error = String(localized: "Give it a name"); return }
        guard let k = num(kcal) ?? estimate, (0...10000).contains(k) else { error = String(localized: "Enter the calories per serving"); return }
        if !grams.isEmpty, (num(grams) ?? 0) <= 0 { error = String(localized: "Check the weight"); return }
        var v: [String: JSONValue] = food ?? ["id": .string("c" + Ids.new())]
        v["name"] = .string(String(nm.prefix(60)))
        v["unit"] = .string(String((unit.trimmingCharacters(in: .whitespaces).isEmpty ? "serving" : unit).prefix(30)))
        v["g"] = num(grams).map { .number(($0 * 10).rounded() / 10) } ?? .null
        v["kcal"] = .number(k.rounded())
        v["p"] = .number(num(p) ?? 0); v["c"] = .number(num(c) ?? 0); v["f"] = .number(num(f) ?? 0)
        if v["n"] == nil { v["n"] = .object([:]) }
        var all = (store.root["myFoods"]?.array ?? []).compactMap { $0.object }
        if let i = all.firstIndex(where: { $0["id"]?.string == v["id"]?.string }) { all[i] = v } else { all.append(v) }
        store.setRoot("myFoods", .array(all.map { .object($0) }))
        dismiss()
    }
}
