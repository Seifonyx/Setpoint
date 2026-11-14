import SwiftUI

/// One food category: your own foods, recipes, meals or favorites (same data as the web app's My foods page).
struct FoodLists: View {
    enum Kind: Hashable { case mine, recipes, meals, favorites }
    let kind: Kind
    @Environment(Store.self) private var store
    @State private var editing: EditFood?
    @State private var recipeEdit: EditFood?
    @State private var mealEdit: MealJob?
    struct MealJob: Identifiable { let id = UUID(); let meal: [String: JSONValue]? }
    @State private var favorites: [FoodHit] = []

    private var title: LocalizedStringKey {
        switch kind { case .mine: "My foods"; case .recipes: "Recipes"; case .meals: "Meals"; case .favorites: "Favorites" }
    }

    struct EditFood: Identifiable { let id: String; let food: [String: JSONValue]? }

    private func list(_ key: String) -> [[String: JSONValue]] { (store.root[key]?.array ?? []).compactMap { $0.object } }
    private func remove(_ key: String, id: String) {
        store.setRoot(key, .array(list(key).filter { $0["id"]?.string != id }.map { .object($0) }))
    }

    var body: some View {
        Group {
            List {
                switch kind {
                case .mine:
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
                } header: { Text("My foods") }

                case .recipes:
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
                } header: { Text("Recipes") }

                case .meals:
                let meals = list("meals")
                if meals.isEmpty {
                    Section {
                        EmptyState(art: .plate, title: "No meals yet",
                                   message: "Build a meal from the foods you usually have together, then log it in one tap. Tap + to make one, or save one from the Diary (a meal's ⋯ › Save as meal).")
                    }
                }
                if !meals.isEmpty {
                    Section {
                        ForEach(meals.indices, id: \.self) { i in
                            let m = meals[i], items = (m["items"]?.array ?? []).compactMap { $0.object }
                            Button { mealEdit = MealJob(meal: m) } label: {
                                HStack(spacing: 12) {
                                    FoodIcon(kind: "meal")
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(m["name"]?.string ?? "").lineLimit(1)
                                        Text(items.compactMap { $0["name"]?.string }.joined(separator: ", ")).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).lineLimit(1)
                                    }
                                    Spacer()
                                    Text(Fmt.kcal(items.reduce(0) { $0 + ($1["kcal"]?.number ?? 0) })).font(Brand.num(18, .semibold)).monospacedDigit().foregroundStyle(Brand.ink2)
                                }
                                .contentShape(.rect)
                            }
                            .buttonStyle(.plain)
                            .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { remove("meals", id: m["id"]?.string ?? "") } }
                        }
                    }
                }

                case .favorites:
                if favorites.isEmpty { Text("Tap the star on any food to keep it here.").foregroundStyle(.secondary) }
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
            }
            .brandList()
            .navigationTitle(title)
            .toolbar {
                // a + up top for making a new one
                if kind != .favorites {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button(kind == .mine ? "New food" : kind == .recipes ? "New recipe" : "New meal", systemImage: "plus") {
                            switch kind {
                            case .mine: editing = EditFood(id: "new", food: nil)
                            case .recipes: recipeEdit = EditFood(id: "new", food: nil)
                            default: mealEdit = MealJob(meal: nil)
                            }
                        }
                    }
                }
            }
            .toolbar(.hidden, for: .tabBar)
            .task(id: "\(store.version)|\(store.foodsReady)") { favorites = await store.engineRef.list("favorites", meal: "snacks") }
            .sheet(item: $editing) { e in CustomFoodSheet(food: e.food) }
            .sheet(item: $recipeEdit) { e in RecipeEditor(recipe: e.food) }
            .sheet(item: $mealEdit) { j in MealEditor(meal: j.meal) }
        }
    }
}

/// Make or change one of your own foods (per serving, like a nutrition label).
struct CustomFoodSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let food: [String: JSONValue]?
    var prefill: String = ""
    /// Numbers read from a nutrition label (per serving), for you to check.
    var values: LabelReader.Values? = nil
    @State private var name = ""
    @State private var unit = ""
    @State private var grams = ""
    @State private var kcal = ""
    @State private var p = ""
    @State private var c = ""
    @State private var f = ""
    @State private var nuts: [String: String] = [:]   // every other nutrient, per serving
    @State private var error: String?

    /// All the nutrients you can add, grouped like a full nutrition label.
    static var groups: [(LocalizedStringKey, [(String, LocalizedStringKey, String)])] { [
        ("Fats", [("sat", "Saturated fat", "g"), ("trans", "Trans fat", "g"), ("mono", "Monounsaturated fat", "g"), ("poly", "Polyunsaturated fat", "g"),
                  ("chol", "Cholesterol", "mg"), ("ala", "Omega-3 (ALA)", "g"), ("epa", "Omega-3 (EPA)", "g"), ("dha", "Omega-3 (DHA)", "g"), ("la", "Omega-6", "g")]),
        ("Carbs", [("fib", "Fiber", "g"), ("sug", "Sugars", "g")]),
        ("Minerals", [("na", "Sodium", "mg"), ("k", "Potassium", "mg"), ("ca", "Calcium", "mg"), ("fe", "Iron", "mg"), ("mg", "Magnesium", "mg"),
                      ("zn", "Zinc", "mg"), ("ph", "Phosphorus", "mg"), ("cu", "Copper", "mg"), ("mn", "Manganese", "mg"), ("se", "Selenium", "µg")]),
        ("Vitamins", [("vA", "Vitamin A", "µg"), ("vC", "Vitamin C", "mg"), ("vD", "Vitamin D", "µg"), ("vE", "Vitamin E", "mg"), ("vK", "Vitamin K", "µg"),
                      ("b1", "Thiamin (B1)", "mg"), ("b2", "Riboflavin (B2)", "mg"), ("b3", "Niacin (B3)", "mg"), ("b5", "Pantothenic acid (B5)", "mg"),
                      ("b6", "Vitamin B6", "mg"), ("fol", "Folate", "µg"), ("b12", "Vitamin B12", "µg"), ("chl", "Choline", "mg")]),
        ("Other", [("water", "Water", "g"), ("caff", "Caffeine", "mg"), ("alc", "Alcohol", "g")]),
    ] }

    private func num(_ s: String) -> Double? { s.isEmpty ? nil : Double(s.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")) }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    WordsField(label: "Name", text: $name, placeholder: "e.g. Protein shake")
                } header: { Text("Food") }
                Section {
                    WordsField(label: "Serving name", text: $unit, placeholder: "e.g. scoop, slice, bowl")
                    NumberField(label: "Weight of one serving", text: $grams, unit: "g", placeholder: "–")
                } header: { Text("Serving") } footer: { Text("Add the weight if you'd like to log it in grams too.") }
                Section {
                    NumberField(label: "Calories", text: $kcal, unit: "kcal", big: true)
                    NumberField(label: "Protein", text: $p, unit: "g")
                    NumberField(label: "Carbs", text: $c, unit: "g")
                    NumberField(label: "Fat", text: $f, unit: "g")
                } header: { Text("Nutrition facts") } footer: {
                    if let error { Text(error).foregroundStyle(Brand.danger) }
                    else if let k = estimate { Text("Per serving. About \(Fmt.kcal(k)) kcal from the macros.") }
                    else { Text("Per serving, as on the label.") }
                }
                // everything else on the label: each group folds, so the form stays short until you need it
                ForEach(Self.groups.indices, id: \.self) { gi in
                    let g = Self.groups[gi]
                    Section {
                        DisclosureGroup {
                            ForEach(g.1, id: \.0) { n in
                                NumberField(label: n.1, text: Binding(get: { nuts[n.0] ?? "" }, set: { nuts[n.0] = $0 }), unit: LocalizedStringKey(n.2), placeholder: "–")
                            }
                        } label: {
                            HStack {
                                Text(g.0).font(.brand(.body, .semibold))
                                Spacer()
                                let filled = g.1.filter { !(nuts[$0.0] ?? "").isEmpty }.count
                                if filled > 0 { Text("\(filled)").font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2).monospacedDigit() }
                            }
                        }
                        .tint(Brand.ink2)
                    } header: { if gi == 0 { Text("More nutrition facts") } }
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
                guard let x = food else {
                    if name.isEmpty { name = prefill }
                    if let v = values {
                        func t(_ d: Double?) -> String { d.map { $0.formatted(.number.grouping(.never).locale(Locale(identifier: "en_US_POSIX"))) } ?? "" }
                        kcal = t(v.kcal); p = t(v.protein); c = t(v.carbs); f = t(v.fat); grams = t(v.grams)
                    }
                    return
                }
                name = x["name"]?.string ?? ""; unit = x["unit"]?.string ?? ""
                grams = x["g"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                kcal = x["kcal"]?.number.map { String(Int($0)) } ?? ""
                p = x["p"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                c = x["c"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                f = x["f"]?.number.map { $0.formatted(.number.grouping(.never)) } ?? ""
                for (k, v) in x["n"]?.object ?? [:] { if let d = v.number { nuts[k] = d.formatted(.number.grouping(.never).locale(Locale(identifier: "en_US_POSIX"))) } }
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
        var n: [String: JSONValue] = [:]
        for (k, t) in nuts { if let d = num(t), d >= 0 { n[k] = .number(d) } }
        v["n"] = .object(n)
        var all = (store.root["myFoods"]?.array ?? []).compactMap { $0.object }
        if let i = all.firstIndex(where: { $0["id"]?.string == v["id"]?.string }) { all[i] = v } else { all.append(v) }
        store.setRoot("myFoods", .array(all.map { .object($0) }))
        dismiss()
    }
}

/// Foods: categories, each on its own page.
struct FoodsView: View {
    @Environment(Store.self) private var store
    @State private var openPlanner = false
    @State private var openRepeating = false
    @State private var shotNewFood = false   // build-server screenshots
    @State private var shotNewMeal = false
    private func count(_ k: String) -> Int { store.root[k]?.array?.count ?? 0 }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    row("My foods", "carrot.fill", Brand.green, count("myFoods")) { FoodLists(kind: .mine) }
                    row("Recipes", "frying.pan.fill", Brand.protein, count("recipes")) { FoodLists(kind: .recipes) }
                    row("Meals", "takeoutbag.and.cup.and.straw.fill", Brand.amber, count("meals")) { FoodLists(kind: .meals) }
                    row("Repeating", "repeat", Brand.water, count("repeats")) { RepeatingView() }
                    row("Saved days", "calendar.badge.checkmark", Brand.blue, store.ios("savedDays")?.array?.count ?? 0) { SavedDaysView() }
                }
                Section { planRow }
            }
            .brandList()
            .navigationTitle("Foods")
            .navigationDestination(isPresented: $openPlanner) { DayPlannerView() }
            .navigationDestination(isPresented: $openRepeating) { RepeatingView() }
            .sheet(isPresented: $shotNewFood) { CustomFoodSheet(food: nil) }
            .sheet(isPresented: $shotNewMeal) { MealEditor(meal: nil) }
            .task { // build-server screenshots: -open planner / -open repeating
                SavedDays.moveOld(store)
                let o = UserDefaults.standard.string(forKey: "open")
                openPlanner = o == "planner"; openRepeating = o == "repeating"
                shotNewFood = o == "newfood"; shotNewMeal = o == "newmeal"
            }
        }
    }

    /// The day planner, last: one row with a line saying what it does.
    private var planRow: some View {
        NavigationLink { DayPlannerView() } label: {
            Label {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Plan my day").foregroundStyle(Brand.ink)
                    Text("A balanced day for your targets, built from what you eat").font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                }
            } icon: {
                Image(systemName: "calendar.day.timeline.left").font(.system(size: 14, weight: .semibold)).foregroundStyle(.white)
                    .frame(width: 28, height: 28).background(Brand.green, in: .rect(cornerRadius: Radius.icon))
            }
        }
    }

    private func row<D: View>(_ title: LocalizedStringKey, _ icon: String, _ color: Color, _ n: Int, @ViewBuilder dest: @escaping () -> D) -> some View {
        NavigationLink { dest() } label: {
            LabeledContent { Text("\(n)").monospacedDigit().foregroundStyle(Brand.ink2) } label: { TileLabel(title, icon, color) }
        }
    }
}
