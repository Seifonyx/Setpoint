import SwiftUI

/// Add food: search everything (the same results as the web app), or pick from your recent foods, favorites, own foods,
/// saved meals and recipes. Quick add and barcode scanning sit in the bar.
struct AddFoodSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State var meal: String
    let day: String
    @State private var query = ""
    @State private var scope = Scope.recent
    @State private var hits: [FoodHit] = []
    @State private var list: [FoodHit] = []
    @State private var meals: [SavedMeal] = []
    @State private var path = NavigationPath()
    @State private var quickAdd = false
    @State private var scanning = false
    @State private var scanMessage: String?

    enum Scope: String, CaseIterable, Identifiable {
        case recent, favorites, mine, meals, recipes
        var id: String { rawValue }
        var title: LocalizedStringKey {
            switch self { case .recent: "Recent"; case .favorites: "Favorites"; case .mine: "My foods"; case .meals: "Meals"; case .recipes: "Recipes" }
        }
    }

    var body: some View {
        NavigationStack(path: $path) {
            List {
                if query.isEmpty {
                    Section {
                        Picker("Show", selection: $scope) { ForEach(Scope.allCases) { Text($0.title).tag($0) } }
                            .pickerStyle(.segmented)
                            .listRowBackground(Color.clear)
                            .listRowInsets(EdgeInsets())
                    }
                    if scope == .meals {
                        ForEach(meals) { m in
                            Button { logSavedMeal(m) } label: {
                                LabeledContent { Text("\(Fmt.kcal(m.kcal)) kcal").monospacedDigit() } label: {
                                    Text(m.name)
                                    Text("\(m.n) foods")
                                }
                            }
                            .tint(.primary)
                        }
                        if meals.isEmpty { empty("No saved meals yet", "Save a meal from its ⋯ menu in the web app.") }
                    } else {
                        ForEach(list) { row($0) }
                        if list.isEmpty { empty(scope == .recent ? "Nothing logged yet" : "Nothing here yet", scope == .recent ? "Search for a food to start." : "") }
                    }
                } else {
                    if !store.foodsReady { HStack { ProgressView(); Text("Loading the food list…").foregroundStyle(.secondary) } }
                    ForEach(hits) { row($0) }
                    if store.foodsReady && hits.isEmpty { empty("No matches", "Try other words, or use Quick add.") }
                }
            }
            .brandList()
            .navigationTitle("Add food")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Search foods")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .principal) {
                    Menu {
                        Picker("Meal", selection: $meal) { ForEach(store.meals) { Text($0.name).tag($0.key) } }
                    } label: {
                        HStack(spacing: 4) { Text(store.meals.first { $0.key == meal }?.name ?? "").font(.brand(.headline)); Image(systemName: "chevron.down").font(.brand(.caption, .bold)) }
                    }
                    .tint(.primary)
                }
                ToolbarItemGroup(placement: .primaryAction) {
                    Button("Scan barcode", systemImage: "barcode.viewfinder") { scanning = true }
                    Button("Quick add", systemImage: "bolt") { quickAdd = true }
                }
            }
            .navigationDestination(for: String.self) { id in FoodAmountView(foodID: id, meal: meal, day: day) { dismiss() } }
            .sheet(isPresented: $quickAdd) { QuickAddView(meal: meal, day: day) { dismiss() } }
            .fullScreenCover(isPresented: $scanning) { BarcodeScreen { code in scanning = false; Task { await lookUp(code) } } }
            .alert(scanMessage ?? "", isPresented: Binding(get: { scanMessage != nil }, set: { if !$0 { scanMessage = nil } })) { Button("OK", role: .cancel) {} }
            .task(id: "\(scope.rawValue)|\(meal)|\(store.version)|\(store.foodsReady)") { await loadList() }
            .task(id: "\(query)|\(meal)|\(store.foodsReady)") {
                guard !query.isEmpty else { hits = []; return }
                try? await Task.sleep(for: .milliseconds(150)) // wait for typing to pause
                hits = await store.engineRef.search(query, meal: meal)
            }
        }
    }

    @ViewBuilder private func row(_ h: FoodHit) -> some View {
        if h.quick == true {
            Button { relogQuick(h) } label: { FoodHitRow(hit: h) }.tint(.primary)
        } else {
            NavigationLink(value: h.id) { FoodHitRow(hit: h) }
        }
    }
    private func empty(_ t: LocalizedStringKey, _ s: LocalizedStringKey) -> some View {
        VStack(alignment: .leading, spacing: 4) { Text(t).font(.brand(.headline)); Text(s).foregroundStyle(.secondary) }.padding(.vertical, 6)
    }

    private func loadList() async {
        let e = store.engineRef
        switch scope {
        case .recent: list = await e.list("recents", meal: meal)
        case .favorites: list = await e.list("favorites", meal: meal)
        case .mine: list = await e.list("myFoods", meal: meal)
        case .recipes: list = await e.list("recipes", meal: meal)
        case .meals: meals = await e.savedMeals()
        }
    }
    private func logSavedMeal(_ m: SavedMeal) {
        Task {
            let items = await store.engineRef.logMeal(m.id, meal: meal)
            store.add(items, to: day, label: String(localized: "Added \(m.name)"))
            dismiss()
        }
    }
    private func relogQuick(_ h: FoodHit) {
        let raw: [String: JSONValue] = ["name": .string(h.name), "kcal": .number(h.kcal ?? 0), "protein": .number(h.protein ?? 0), "carbs": .number(h.carbs ?? 0), "fat": .number(h.fat ?? 0), "meal": .string(meal)]
        store.add([raw], to: day, label: String(localized: "Added \(h.name)"))
        dismiss()
    }
    /// A scanned barcode: your foods and the built-in packaged list first (works offline), then Open Food Facts.
    private func lookUp(_ code: String) async {
        let e = store.engineRef
        if let id = await e.barcodeLocal(code) { path.append(id); return }
        guard let url = URL(string: "https://world.openfoodfacts.org/api/v2/product/\(code).json?fields=code,product_name,product_name_en,product_name_ar,brands,serving_quantity,nutriments") else { return }
        var req = URLRequest(url: url); req.timeoutInterval = 12
        req.setValue("Setpoint iOS", forHTTPHeaderField: "User-Agent")
        guard let (data, _) = try? await URLSession.shared.data(for: req) else { scanMessage = String(localized: "Couldn't reach Open Food Facts. Check your connection."); return }
        if let id = await e.offProduct(String(decoding: data, as: UTF8.self), code: code) {
            if let off = await e.part("offFoods") { store.setRoot("offFoods", off) }
            path.append(id)
        } else {
            scanMessage = String(localized: "This product isn't in Open Food Facts yet. Use Quick add with the numbers from the label.")
        }
    }
}

struct FoodHitRow: View {
    let hit: FoodHit
    var body: some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 5) {
                    Text(hit.name).lineLimit(2)
                    if hit.fav == true { Image(systemName: "star.fill").font(.brand(.caption2)).foregroundStyle(Brand.amber) }
                }
                if let s = hit.via ?? hit.sub { Text(s).font(.brand(.subheadline)).foregroundStyle(.secondary).lineLimit(1) }
                else if hit.quick == true, let k = hit.kcal { Text("Quick add · \(Fmt.kcal(k)) kcal").font(.brand(.subheadline)).foregroundStyle(.secondary) }
            }
            Spacer(minLength: 0)
        }
        .contentShape(.rect)
    }
}
