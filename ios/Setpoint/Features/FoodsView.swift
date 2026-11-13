import SwiftUI

/// One food category: your own foods, recipes, saved meals or favorites (same data as the web app's My foods page).
struct FoodLists: View {
    enum Kind: Hashable { case mine, recipes, meals, favorites }
    let kind: Kind
    @Environment(Store.self) private var store
    @State private var editing: EditFood?
    @State private var recipeEdit: EditFood?
    @State private var favorites: [FoodHit] = []

    private var title: LocalizedStringKey {
        switch kind { case .mine: "My foods"; case .recipes: "Recipes"; case .meals: "Saved meals"; case .favorites: "Favorites" }
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
                    Button("New food", systemImage: "plus") { editing = EditFood(id: "new", food: nil) }
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
                    Button("New recipe", systemImage: "plus") { recipeEdit = EditFood(id: "new", food: nil) }
                } header: { Text("Recipes") }

                case .meals:
                let meals = list("meals")
                if meals.isEmpty { Text("Save a meal from the Diary (a meal's ⋯ menu › Save as meal) to log it again in one tap.").foregroundStyle(.secondary) }
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
            .toolbar(.hidden, for: .tabBar)
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

/// Foods: categories, each on its own page.
struct FoodsView: View {
    @Environment(Store.self) private var store
    @State private var openPlanner = false
    @State private var openRepeating = false
    private func count(_ k: String) -> Int { store.root[k]?.array?.count ?? 0 }
    private let cols = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    LazyVGrid(columns: cols, spacing: 12) {
                        tile("My foods", "carrot.fill", Brand.green, count("myFoods")) { FoodLists(kind: .mine) }
                        tile("Recipes", "frying.pan.fill", Brand.green, count("recipes")) { FoodLists(kind: .recipes) }
                        tile("Saved meals", "takeoutbag.and.cup.and.straw.fill", Brand.green, count("meals")) { FoodLists(kind: .meals) }
                        tile("Favorites", "star.fill", Brand.green, count("favs")) { FoodLists(kind: .favorites) }
                        tile("Repeating", "repeat", Brand.green, count("repeats")) { RepeatingView() }
                        tile("Saved days", "calendar.badge.checkmark", Brand.green, store.ios("savedDays")?.array?.count ?? 0) { SavedDaysView() }
                    }
                    planCard
                }
                .padding(.horizontal, 16).padding(.top, 4).padding(.bottom, 24)
            }
            .paperPage()
            .navigationTitle("Foods")
            .navigationDestination(isPresented: $openPlanner) { DayPlannerView() }
            .navigationDestination(isPresented: $openRepeating) { RepeatingView() }
            .task { // build-server screenshots: -open planner / -open repeating
                SavedDays.moveOld(store)
                let o = UserDefaults.standard.string(forKey: "open")
                openPlanner = o == "planner"; openRepeating = o == "repeating"
            }
        }
    }

    /// The day planner, up top: it's the one thing here that does the work for you.
    private var planCard: some View {
        NavigationLink { DayPlannerView() } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle().fill(Brand.greenSoft)
                    Image(systemName: "wand.and.sparkles").font(.title2.weight(.semibold)).foregroundStyle(Brand.green)
                }
                .frame(width: 56, height: 56)
                VStack(alignment: .leading, spacing: 3) {
                    Text("Plan my day").font(Brand.display(20, .bold))
                    Text("A balanced day for your targets, rich in vitamins, built from what you eat").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.forward").font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ink2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .brandCard()
        }
        .buttonStyle(.plain)
    }

    private func tile<D: View>(_ title: LocalizedStringKey, _ icon: String, _ color: Color, _ n: Int, @ViewBuilder dest: @escaping () -> D) -> some View {
        NavigationLink { dest() } label: {
            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: icon).font(.title3).foregroundStyle(color)
                    .frame(width: 44, height: 44).background(color.opacity(0.14), in: .rect(cornerRadius: 13))
                Spacer(minLength: 6)
                Text(title).font(Brand.display(18, .bold)).lineLimit(1).minimumScaleFactor(0.8)
                Text(n == 1 ? String(localized: "1 item") : String(localized: "\(n) items")).font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            }
            .frame(maxWidth: .infinity, minHeight: 132, alignment: .topLeading)
            .brandCard()
        }
        .buttonStyle(.plain)
    }
}
