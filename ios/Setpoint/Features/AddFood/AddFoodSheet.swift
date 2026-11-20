import SwiftUI

/// Add food. Three tabs: All (recent, or search everything), Favorites, and My foods (your own foods, recipes and
/// saved meals, each collapsible). Rows add your usual amount in one tap (⊕) or open the food to pick an amount.
/// The sheet stays open while you add, with a tray at the bottom showing what you've added.
struct AddFoodSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State var meal: String
    let day: String
    /// Opened from the scan control or widget: start with the barcode scanner.
    var startScan = false
    @State private var startedScan = false
    @State private var query = UserDefaults.standard.string(forKey: "search") ?? "" // build-server screenshots can open with a search
    @State private var tab = Tab(rawValue: UserDefaults.standard.string(forKey: "addtab") ?? "") ?? .all // -addtab: build-server screenshots
    @State private var hits: [FoodHit] = []
    @State private var recents: [FoodHit] = []
    @State private var frequent: [FoodHit] = []
    @State private var mealRecents: [FoodHit] = []   // the same, at this meal only (the All tab's "This meal")
    @State private var mealFrequent: [FoodHit] = []
    @AppStorage("recentScope") private var scope = "meal"
    @State private var speaking = false
    @State private var favorites: [FoodHit] = []
    @State private var allMine: [FoodHit] = []   // My foods: your foods, recipes and meals in one list
    @State private var meals: [SavedMeal] = []
    @State private var path = NavigationPath()
    @State private var quickAdd = false
    @State private var scanning = false
    @State private var describing = false
    @State private var creating: String?
    @State private var labelCam = false
    @State private var labelValues: LabelValuesBox?
    @State private var scanMessage: String?
    @State private var notFound = false
    @State private var lookingUp = false   // a scanned barcode is being looked up
    @State private var selecting = false
    @FocusState private var searchFocused: Bool
    @State private var selected: [String: FoodHit] = [:]
    @State private var startIDs: Set<String> = []
    @AppStorage("searchSort") private var sort = "best"
    @AppStorage("verifiedOnly") private var verifiedOnly = false
    @State private var plateCam = false
    @State private var logging: SavedMeal?
    @State private var plate: PlateBox?
    @AppStorage("favSort") private var favSort = "recent"
    @AppStorage("favVerified") private var favVerified = false
    @AppStorage("mineSort") private var mineSort = "recent"

    enum Tab: String, CaseIterable, Identifiable {
        case all, favorites, mine
        var id: String { rawValue }
        var title: LocalizedStringKey { switch self { case .all: "All"; case .favorites: "Favorites"; case .mine: "My foods" } }
    }

    /// Foods added since this sheet opened (for the tray).
    private var added: [FoodItem] { store.items(day).filter { !startIDs.contains($0.id) } }

    var body: some View {
        NavigationStack(path: $path) {
            List {
                SwiftUI.Section {
                    PillTabs(selection: $tab, options: Tab.allCases.map { ($0, $0.title) })
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 4, trailing: 0))
                .listSectionSpacing(6)

                SwiftUI.Section { listBar }
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets(top: 0, leading: 4, bottom: 0, trailing: 0))
                    .listSectionSpacing(4)

                if !query.isEmpty {
                    searchResults
                } else {
                    switch tab {
                    case .all: allTab
                    case .favorites: favoritesTab
                    case .mine: mineTab
                    }
                }
            }
            .listSectionSpacing(14)
            .contentMargins(.top, 2, for: .scrollContent) // tabs sit right under the search bar
            .brandList()
            .navigationBarTitleDisplayMode(.inline)
            .safeAreaInset(edge: .top, spacing: 0) { searchBar }
            .toolbar { toolbar }
            .safeAreaInset(edge: .bottom) { tray }
            .navigationDestination(for: String.self) { id in
                FoodAmountView(foodID: id, meal: meal, day: day) { path = NavigationPath() }
            }
            .sheet(isPresented: $quickAdd) { QuickAddView(meal: meal, day: day) {} }
            .sheet(isPresented: $describing) { DescribeMealSheet(meal: meal, day: day) }
            .sheet(isPresented: $speaking) { DescribeMealSheet(meal: meal, day: day, listen: true) }
            .sheet(item: Binding(get: { creating.map(Prefill.init) }, set: { creating = $0?.name })) { p in CustomFoodSheet(food: nil, prefill: p.name) }
            .fullScreenCover(isPresented: $labelCam) {
                LabelCamera { img in
                    labelCam = false
                    guard let img else { return }
                    Task { labelValues = LabelValuesBox(values: await LabelReader.read(img)) }
                }
                .ignoresSafeArea()
            }
            .fullScreenCover(isPresented: $plateCam) {
                LabelCamera { img in plateCam = false; if let img { plate = PlateBox(image: img) } }
                    .ignoresSafeArea()
            }
            .sheet(item: $logging) { m in MealLogSheet(mealID: m.id, mealKey: meal, day: day) }
            .sheet(item: $plate) { p in PlateSheet(image: p.image, meal: meal, day: day, describe: { describing = true }) }
            .sheet(item: $labelValues) { b in CustomFoodSheet(food: nil, prefill: query, values: b.values) }
            .fullScreenCover(isPresented: $scanning) { BarcodeScreen { code in scanning = false; Task { await lookUp(code) } } }
            .overlay {
                if lookingUp {
                    VStack(spacing: 12) {
                        ProgressView().controlSize(.large)
                        Text("Looking up this product…").font(.brand(.subheadline, .semibold))
                    }
                    .padding(24)
                    .glassEffect(.regular, in: .rect(cornerRadius: Radius.card))
                    .transition(.opacity.combined(with: .scale(scale: 0.95)))
                    .accessibilityElement(children: .combine)
                }
            }
            .animation(.snappy, value: lookingUp)
            .task { if startScan && !startedScan { startedScan = true; scanning = true } }
            .alert("Product not found", isPresented: $notFound) {
                Button("Scan the label") { labelCam = true }
                Button("Quick add") { quickAdd = true }
                Button("Cancel", role: .cancel) {}
            } message: { Text("This product isn't in Open Food Facts yet. Photograph its nutrition label and Setpoint fills in the numbers.") }
            .alert(scanMessage ?? "", isPresented: Binding(get: { scanMessage != nil }, set: { if !$0 { scanMessage = nil } })) { Button("OK", role: .cancel) {} }
            .task(id: "\(meal)|\(store.version)|\(store.foodsReady)|\(favSort)|\(favVerified)|\(mineSort)") { await loadLists() }
            .task(id: "\(query)|\(meal)|\(store.foodsReady)|\(sort)|\(verifiedOnly)|\(tab)|\(favSort)|\(favVerified)|\(mineSort)|\(store.version)") {
                guard !query.isEmpty else { hits = []; return }
                try? await Task.sleep(for: .milliseconds(150)) // wait for typing to pause
                // search stays inside the tab you're on: All searches everything, Favorites and My foods only themselves
                switch tab {
                case .all: hits = await store.engineRef.search(query, meal: meal, sort: sort, verifiedOnly: verifiedOnly)
                case .favorites: hits = await store.engineRef.searchIn(query, meal: meal, kind: "favorites", sort: favSort, verifiedOnly: favVerified)
                case .mine: hits = await store.engineRef.searchIn(query, meal: meal, kind: "mine", sort: mineSort, verifiedOnly: false)
                }
            }
            .onAppear { if startIDs.isEmpty { startIDs = Set(store.items(day).map(\.id)) } }
        }
    }

    struct Prefill: Identifiable { let name: String; var id: String { name } }
    struct LabelValuesBox: Identifiable { let id = UUID(); let values: LabelReader.Values }

    // MARK: Tabs

    /// The All tab's list: recent or most frequent, at this meal (falling back to every meal while this one has
    /// nothing yet) or at every meal.
    private var allList: [FoodHit] {
        let mealOnly = sort == "frequent" ? mealFrequent : mealRecents, every = sort == "frequent" ? frequent : recents
        return (scope == "meal" && !mealOnly.isEmpty ? mealOnly : every).filter { !verifiedOnly || $0.verified == true }
    }
    /// "Lunch only": the All tab's choice to see what you have at this meal.
    private var mealTitle: LocalizedStringKey { "\(store.meals.first { $0.key == meal }?.name ?? String(localized: "This meal")) only" }
    @ViewBuilder private var allTab: some View {
        let list = allList
        if list.isEmpty {
            emptyCard(verifiedOnly ? "No verified foods here" : "Nothing logged yet",
                      verifiedOnly ? "Turn off Verified only to see all your foods." : "Search for a food to start.")
        } else {
            Section { ForEach(list) { row($0) } }
        }
    }

    @ViewBuilder private var favoritesTab: some View {
        if favorites.isEmpty {
            emptyCard(favVerified ? "No verified favorites" : "No favorites yet",
                      favVerified ? "Turn off Verified only to see all your favorites." : "Tap the star on a food to keep it here.")
        } else {
            Section { ForEach(favorites) { row($0) } }
        }
    }

    private func emptyCard(_ title: LocalizedStringKey, _ note: LocalizedStringKey) -> some View {
        Section { EmptyState(art: .cup, title: title, message: note) }
    }

    /// My foods: everything you made, in one list (no groups), like Cronometer's Custom tab. Your foods, recipes and
    /// saved meals each keep their own icon; the filter sorts them all together.
    @ViewBuilder private var mineTab: some View {
        if allMine.isEmpty {
            Section {
                EmptyState(art: .cup, title: "Nothing here yet", message: "Foods, recipes and meals you make show up here.")
                Button { creating = "" } label: { Label("New food", systemImage: "plus") }
            }
        } else {
            Section {
                ForEach(allMine) { h in
                    if h.type == "meal", let m = meals.first(where: { $0.id == h.mealId }) { mealRow(m) } else { row(h) }
                }
                Button { creating = "" } label: { Label("New food", systemImage: "plus") }
            }
        }
    }
    /// A saved meal: tap to see what's in it and choose servings; + adds it as it is.
    private func mealRow(_ m: SavedMeal) -> some View {
        HStack(spacing: 12) {
            Button { logging = m } label: {
                HStack(spacing: 12) {
                    FoodIcon(kind: "meal")
                    VStack(alignment: .leading, spacing: 2) {
                        Text(m.name).lineLimit(1)
                        HStack(spacing: 5) { // like the other rows: what it is, then its size
                            Text("Meal").font(.brand(.subheadline, .semibold))
                            Text("·")
                            Text("\(m.n) foods").font(.brand(.subheadline))
                        }
                        .foregroundStyle(Brand.ink2)
                    }
                    Spacer()
                }
                .contentShape(.rect)
            }
            .buttonStyle(.plain)
            Text(Fmt.kcal(m.kcal)).font(Brand.num(18, .semibold)).monospacedDigit()
            addButton { logSavedMeal(m) }
        }
    }

    // MARK: The list bar: a title, and the one filter pill (the same on every tab)

    private static var recent: FilterPill.Option { ("recent", "Most recent", "clock") }
    private static var frequentOpt: FilterPill.Option { ("frequent", "Most frequent", "chart.bar.fill") }
    private static var az: FilterPill.Option { ("az", "A to Z", "textformat") }

    @ViewBuilder private var listBar: some View {
        HStack(alignment: .center) {
            Text(barTitle).font(.brand(.subheadline, .medium)).opacity(barCount == 0 ? 0 : 1).foregroundStyle(Brand.ink2).monospacedDigit().contentTransition(.numericText())
            Spacer()
            if !query.isEmpty && tab == .all {
                FilterPill(sort: $sort, verified: $verifiedOnly, options: [("best", "Best match", "text.magnifyingglass"), Self.recent, Self.frequentOpt])
            } else {
                switch tab {
                case .all:
                    FilterPill(sort: Binding(get: { sort == "frequent" ? "frequent" : "recent" }, set: { sort = $0 == "frequent" ? "frequent" : (sort == "recent" ? "recent" : "best") }),
                               verified: $verifiedOnly, options: [Self.recent, Self.frequentOpt],
                               scope: $scope, scopes: [("meal", mealTitle, "fork.knife"), ("all", "All meals", "square.stack")])
                case .favorites:
                    FilterPill(sort: $favSort, verified: $favVerified, options: [Self.recent, Self.frequentOpt, Self.az])
                case .mine:
                    FilterPill(sort: $mineSort, verified: nil, options: [Self.recent, Self.frequentOpt, Self.az, ("kcal", "Fewest calories", "flame")])
                }
            }
        }
    }
    /// How many there are (the pill beside it says how they're sorted, so nothing is said twice).
    private var barCount: Int {
        if !query.isEmpty { return hits.count }
        switch tab {
        case .all: return allList.count
        case .favorites: return favorites.count
        case .mine: return allMine.count
        }
    }
    private var barTitle: LocalizedStringKey {
        if !query.isEmpty { return hits.count == 1 ? "1 result" : "\(hits.count) results" }
        let n: Int
        switch tab {
        case .all: n = allList.count
        case .favorites: n = favorites.count
        case .mine: n = allMine.count
        }
        return n == 1 ? "1 food" : "\(n) foods"
    }

    /// Setpoint's own search bar, so the microphone and "select several" can sit in it.
    private var searchBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").font(.system(size: 15, weight: .semibold)).foregroundStyle(Brand.ink2)
            TextField(searchPrompt, text: $query)
                .font(.brand(.body)).submitLabel(.search).autocorrectionDisabled().textInputAutocapitalization(.never)
                .focused($searchFocused)
                .accessibilityIdentifier("add-search")
            if !query.isEmpty {
                Button { query = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Brand.ink2) }
                    .accessibilityLabel(Text("Clear"))
            }
            Button { searchFocused = false; speaking = true } label: {
                Image(systemName: "mic.fill").font(.system(size: 15, weight: .semibold)).foregroundStyle(Brand.green).frame(width: 32, height: 36)
            }
            .accessibilityLabel(Text("Say what you ate"))
            .accessibilityIdentifier("add-voice")
            Button { withAnimation(.snappy) { selecting.toggle(); if !selecting { selected = [:] } } } label: {
                Image(systemName: selecting ? "checkmark.circle.fill" : "checkmark.circle")
                    .font(.system(size: 16, weight: .semibold)).foregroundStyle(selecting ? Brand.green : Brand.ink2).frame(width: 32, height: 36)
            }
            .accessibilityLabel(Text(selecting ? LocalizedStringKey("Stop selecting") : LocalizedStringKey("Select several")))
        }
        .buttonStyle(.plain)
        .padding(.leading, 14).padding(.trailing, 6)
        .frame(height: 44)
        .glassEffect(.regular.interactive(), in: .capsule)
        .padding(.horizontal, 16).padding(.top, 4).padding(.bottom, 6)
    }

    /// The search box says where it looks.
    private var searchPrompt: LocalizedStringKey {
        switch tab { case .all: "Search foods"; case .favorites: "Search favorites"; case .mine: "Search my foods" }
    }

    @ViewBuilder private var searchResults: some View {
        if tab != .all { scopedResults } else { allResults }
    }
    /// Searching inside Favorites or My foods: only what's in that tab, and a way out to the whole food list.
    @ViewBuilder private var scopedResults: some View {
        if !hits.isEmpty {
            Section {
                ForEach(hits) { h in
                    if h.type == "meal", let m = meals.first(where: { $0.id == h.mealId }) { mealRow(m) } else { row(h) }
                }
            }
        } else {
            Section {
                VStack(alignment: .leading, spacing: 4) {
                    Text("No matches for “\(query)”").font(.brand(.headline))
                    Text(tab == .mine ? LocalizedStringKey("None of your foods, recipes or meals match.") : LocalizedStringKey("None of your favorites match."))
                        .font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                }
                .padding(.vertical, 4)
                Button { withAnimation(.snappy) { tab = .all } } label: { Label("Search all foods", systemImage: "magnifyingglass") }
                    .accessibilityIdentifier("search-all")
            }
        }
    }
    @ViewBuilder private var allResults: some View {
        if !store.foodsReady {
            Section { SkeletonRows(count: 5).padding(.vertical, 6) }
        }
        if !hits.isEmpty { Section { ForEach(hits) { row($0) } } }
        if store.foodsReady && hits.isEmpty {
            Section {
                VStack(alignment: .leading, spacing: 4) {
                    Text("No matches for “\(query)”").font(.brand(.headline))
                    Text("Make it one of your foods, or scan its barcode.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                }
                .padding(.vertical, 4)
                Button { creating = query } label: { Label("Create “\(query)”", systemImage: "plus.circle.fill") }
                Button { scanning = true } label: { Label("Scan barcode", systemImage: "barcode.viewfinder") }
                Button { labelCam = true } label: { Label("Scan the nutrition label", systemImage: "text.viewfinder") }
                Button { quickAdd = true } label: { Label("Quick add calories", systemImage: "bolt.fill") }
            }
        }
    }

    // MARK: Rows

    @ViewBuilder private func rows(_ list: [FoodHit], header: LocalizedStringKey? = nil, empty: (LocalizedStringKey, LocalizedStringKey)?) -> some View {
        if list.isEmpty {
            if let empty {
                SwiftUI.Section {
                    VStack(alignment: .leading, spacing: 4) { Text(empty.0).font(.brand(.headline)); Text(empty.1).font(.brand(.subheadline)).foregroundStyle(Brand.ink2) }
                        .padding(.vertical, 6)
                }
                .listRowBackground(Brand.card)
            }
        } else if let header {
            Section { ForEach(list) { row($0) } } header: { Text(header) }
        } else {
            Section { ForEach(list) { row($0) } }
        }
    }

    @ViewBuilder private func row(_ h: FoodHit) -> some View {
        let picked = selected[h.id] != nil
        HStack(spacing: 12) {
            if selecting {
                Image(systemName: picked ? "checkmark.circle.fill" : "circle").font(.title3)
                    .foregroundStyle(picked ? Brand.green : Brand.ink2)
            }
            Button {
                if selecting { toggle(h) } else if h.quick == true { relogQuick(h) } else { path.append(h.id) }
            } label: { FoodHitRow(hit: h) }
            .buttonStyle(.plain)
            if !selecting { addButton { oneTap(h) } }
        }
        .swipeActions(edge: .leading) {
            if h.quick != true {
                Button(h.fav == true ? "Remove from favorites" : "Add to favorites", systemImage: h.fav == true ? "star.slash" : "star") { toggleFav(h) }.tint(Brand.amber)
            }
        }
    }

    private func addButton(_ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: "plus").font(.body.weight(.bold)).foregroundStyle(Brand.ink)
                .frame(width: 34, height: 34).background(Brand.card2, in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text("Add"))
    }


    // MARK: Toolbar and tray

    @ToolbarContentBuilder private var toolbar: some ToolbarContent {
        ToolbarItem(placement: .cancellationAction) {
            Button { dismiss() } label: { BarIcon("chevron.backward") }.buttonStyle(.plain)
                .accessibilityLabel(Text(added.isEmpty ? "Cancel" : "Done"))
        }
        .sharedBackgroundVisibility(.hidden)
        ToolbarItem(placement: .principal) {
            Menu {
                Picker("Meal", selection: $meal) { ForEach(store.meals) { Text($0.name).tag($0.key) } }
            } label: {
                VStack(spacing: 0) {
                    // the name is centred exactly; the arrow hangs beside it without pushing it over
                    Text(store.meals.first { $0.key == meal }?.name ?? "").font(Brand.display(17, .bold))
                        .overlay(alignment: .trailing) { Image(systemName: "chevron.down").font(.brand(.caption, .bold)).fixedSize().alignmentGuide(.trailing) { $0[.leading] - 5 } }
                    if let left = kcalLeft {
                        Text(left >= 0 ? "\(Fmt.kcal(left)) kcal left" : "\(Fmt.kcal(-left)) kcal over").font(.brand(.caption)).foregroundStyle(left >= 0 ? Brand.ink2 : Brand.over)
                            .contentTransition(.numericText()).monospacedDigit()
                    }
                }
            }
            .tint(.primary)
        }
        ToolbarItem(placement: .primaryAction) {
            if selecting {
                Button("Done") { withAnimation(.snappy) { selecting = false; selected = [:] } }.fontWeight(.semibold)
            } else {
                HStack(spacing: 4) {
                    // the camera: every way in that uses it (your plate, a barcode, a nutrition label)
                    Menu {
                        Button("Snap your plate", systemImage: "fork.knife") { plateCam = true }
                        Button("Scan barcode", systemImage: "barcode.viewfinder") { scanning = true }
                        Button("Scan a nutrition label", systemImage: "text.viewfinder") { labelCam = true }
                    } label: { BarIcon("camera") }
                    .accessibilityLabel(Text("Camera"))
                    .accessibilityIdentifier("add-camera")
                    Menu {
                        Button("Describe what you ate", systemImage: "text.bubble") { describing = true }
                        Button("Quick add calories", systemImage: "bolt") { quickAdd = true }
                        Button("New food", systemImage: "carrot") { creating = "" }
                    } label: { BarIcon("ellipsis") }
                    .accessibilityLabel(Text("More ways to add"))
                }
                .buttonStyle(.plain)
            }
        }
        .sharedBackgroundVisibility(selecting ? .automatic : .hidden)
    }

    private var kcalLeft: Double? {
        guard let p = store.plans[day] ?? store.plan(day) else { return nil }
        return p.kcal - store.totals(day).kcal
    }

    @ViewBuilder private var tray: some View {
        if selecting && !selected.isEmpty {
            let k = selected.values.reduce(0) { $0 + ($1.kcal ?? 0) }
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("\(selected.count) selected").font(.brand(.subheadline, .semibold))
                    Text("\(Fmt.kcal(k)) kcal").font(.brand(.caption)).foregroundStyle(Brand.ink2).monospacedDigit()
                }
                Spacer()
                // Plan: not eaten yet, ticked off in the Diary when it is
                Button(String(localized: "Plan (verb)", defaultValue: "Plan")) { addSelected(planned: true) }.buttonStyle(.glass).fontWeight(.semibold)
                Button("Add \(selected.count)") { addSelected() }.buttonStyle(.glassProminent).tint(Brand.green).fontWeight(.semibold)
            }
            .padding(.horizontal, 18).padding(.vertical, 10)
            .glassEffect(.regular, in: .capsule)
            .padding(.horizontal, 16).padding(.bottom, 6)
        } else if !added.isEmpty {
            let k = added.reduce(0) { $0 + $1.kcal }
            HStack(spacing: 12) {
                Image(systemName: "checkmark.circle.fill").foregroundStyle(Brand.green).font(.title3)
                VStack(alignment: .leading, spacing: 1) {
                    Text(added.count == 1 ? String(localized: "1 food added") : String(localized: "\(added.count) foods added")).font(.brand(.subheadline, .semibold))
                    Text(added.suffix(3).map(\.displayName).joined(separator: ", ")).font(.brand(.caption)).foregroundStyle(Brand.ink2).lineLimit(1)
                }
                Spacer()
                Text("\(Fmt.kcal(k)) kcal").font(.brand(.subheadline, .semibold)).monospacedDigit().contentTransition(.numericText())
                Button("Undo") { withAnimation { store.undo() } }.font(.brand(.subheadline, .semibold)).disabled(store.undoLabel == nil)
            }
            .padding(.horizontal, 18).padding(.vertical, 10)
            .glassEffect(.regular, in: .capsule)
            .padding(.horizontal, 16).padding(.bottom, 6)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }

    // MARK: Actions

    private func loadLists() async {
        let e = store.engineRef
        recents = await e.list("recents", meal: meal)
        frequent = await e.list("frequent", meal: meal)
        mealRecents = await e.mealList(meal, sort: "recent")
        mealFrequent = await e.mealList(meal, sort: "frequent")
        favorites = await e.list("favorites", meal: meal, sort: favSort, verifiedOnly: favVerified)
        meals = await e.savedMeals()
        allMine = await e.mineAll(meal: meal, sort: mineSort)
    }
    private func toggle(_ h: FoodHit) {
        if selected[h.id] != nil { selected[h.id] = nil } else { selected[h.id] = h }
    }
    /// Your usual amount, added without opening the food.
    private func oneTap(_ h: FoodHit) {
        if h.quick == true { relogQuick(h); return }
        Task {
            guard let item = await store.engineRef.item(h.id, qty: h.q ?? 1, unit: h.u ?? "g", meal: meal) else { path.append(h.id); return }
            withAnimation { store.add([item], to: day, label: String(localized: "Added \(h.name)")) }
        }
    }
    private func addSelected(planned: Bool = false) {
        let list = Array(selected.values)
        Task {
            var items: [[String: JSONValue]] = []
            for h in list {
                if h.quick == true { items.append(quickRaw(h)) }
                else if let it = await store.engineRef.item(h.id, qty: h.q ?? 1, unit: h.u ?? "g", meal: meal) { items.append(it) }
            }
            withAnimation { store.add(items, to: day, planned: planned) }
            selected = [:]; selecting = false
        }
    }
    private func toggleFav(_ h: FoodHit) {
        Task { if let favs = await store.engineRef.toggleFavorite(h.id) { store.setRoot("favs", favs) } }
    }
    private func logSavedMeal(_ m: SavedMeal) {
        Task {
            let items = await store.engineRef.logMeal(m.id, meal: meal)
            withAnimation { store.add(items, to: day, label: String(localized: "Added \(m.name)")) }
        }
    }
    private func quickRaw(_ h: FoodHit) -> [String: JSONValue] {
        ["name": .string(h.name), "kcal": .number(h.kcal ?? 0), "protein": .number(h.protein ?? 0), "carbs": .number(h.carbs ?? 0), "fat": .number(h.fat ?? 0), "meal": .string(meal)]
    }
    private func relogQuick(_ h: FoodHit) {
        withAnimation { store.add([quickRaw(h)], to: day, label: String(localized: "Added \(h.name)")) }
    }
    /// A scanned barcode: your foods and the built-in packaged list first (works offline), then Open Food Facts.
    private func lookUp(_ code: String) async {
        let e = store.engineRef
        if let id = await e.barcodeLocal(code) { path.append(id); return }
        lookingUp = true
        defer { lookingUp = false }
        guard let url = URL(string: "https://world.openfoodfacts.org/api/v2/product/\(code).json?fields=code,product_name,product_name_en,product_name_ar,brands,serving_quantity,nutriments") else { return }
        var req = URLRequest(url: url); req.timeoutInterval = 12
        req.setValue("Setpoint iOS", forHTTPHeaderField: "User-Agent")
        guard let (data, _) = try? await URLSession.shared.data(for: req) else { scanMessage = String(localized: "Couldn't reach Open Food Facts. Check your connection."); return }
        if let id = await e.offProduct(String(decoding: data, as: UTF8.self), code: code) {
            if let off = await e.part("offFoods") { store.setRoot("offFoods", off) }
            path.append(id)
        } else {
            notFound = true
        }
    }
}

/// A food in a list: its icon, name, your usual amount, calories and how they split into protein, carbs and fat.
struct FoodHitRow: View {
    let hit: FoodHit
    var body: some View {
        HStack(spacing: 12) {
            FoodIcon(kind: hit.quick == true ? "quick" : hit.kind ?? "food", name: hit.name)
            VStack(alignment: .leading, spacing: 3) {
                // "Chicken breast" in bold, "baked, no skin…" under it: quick to scan, nothing hidden
                HStack(spacing: 5) {
                    Text(head).lineLimit(1).font(.brand(.body, .semibold))
                    if hit.verified == true { Image(systemName: "checkmark.seal.fill").font(.caption2).foregroundStyle(Brand.ink2.opacity(0.7)).accessibilityLabel(Text("Verified")) }
                    if hit.fav == true { Image(systemName: "star.fill").font(.caption2).foregroundStyle(Brand.amber) }
                }
                if let rest { Text(rest).font(.brand(.footnote)).foregroundStyle(Brand.ink2).lineLimit(1) }
                HStack(spacing: 6) {
                    if let badge { Text(badge).font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.ink2); Text("·").foregroundStyle(Brand.ink2) }
                    Text(detail).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).lineLimit(1)
                }
            }
            Spacer(minLength: 6)
            if let k = hit.kcal {
                VStack(alignment: .trailing, spacing: 5) {
                    Text(Fmt.kcal(k)).font(Brand.num(18, .semibold)).monospacedDigit()
                    MacroSplit(p: hit.protein ?? 0, c: hit.carbs ?? 0, f: hit.fat ?? 0).frame(width: 40, height: 4)
                }
            }
        }
        .contentShape(.rect)
    }
    /// The food's name up to the first comma (or " · " before a brand), and the rest.
    private var parts: (String, String?) {
        let n = hit.name
        for sep in [", ", " · ", " - "] {
            if let r = n.range(of: sep), r.lowerBound > n.startIndex {
                let rest = n[r.upperBound...].trimmingCharacters(in: .whitespaces)
                return (String(n[..<r.lowerBound]), rest.isEmpty ? nil : rest)
            }
        }
        return (n, nil)
    }
    private var head: String { parts.0 }
    private var rest: String? { parts.1 }
    private var badge: LocalizedStringKey? {
        if hit.quick == true { return "Quick add" }
        if hit.recipe == true { return "Recipe" }
        if hit.custom == true { return "Mine" }
        if hit.off == true { return "Barcode" }
        if hit.est == true { return "Estimate" }
        return nil
    }
    private var detail: String {
        if hit.quick == true { return String(localized: "kcal and macros") }
        var s = hit.amt ?? hit.sub ?? ""
        if hit.usual == true { s += " · " + String(localized: "your usual") }
        return s
    }
}

/// A food's kind as a small drawn icon on a tinted tile (Setpoint's own set, matching the web app's).
/// A food inside a recipe or meal: icon, its whole name (up to two lines), the amount under it in grey, and the
/// calories lined up on the right, the same as a row in the Diary.
struct IngredientRow: View {
    @Environment(Store.self) private var store
    let name: String
    let amount: String?
    let kcal: Double
    var kind = "food"
    var ref: String? = nil          // the food's id: its icon is looked up from the food list
    @State private var found: String?

    var body: some View {
        HStack(spacing: 12) {
            FoodIcon(kind: found ?? kind, size: 32, name: name)
            VStack(alignment: .leading, spacing: 2) {
                // the whole name, up to two lines; only the amount is grey
                Text(Self.clean(name)).font(.brand(.body)).foregroundStyle(Brand.ink).lineLimit(2).fixedSize(horizontal: false, vertical: true)
                if let amount { Text(amount).font(.brand(.footnote)).foregroundStyle(Brand.ink2).monospacedDigit().lineLimit(1) }
            }
            Spacer(minLength: 8)
            Text(Fmt.kcal(kcal)).font(Brand.num(18, .semibold)).monospacedDigit().foregroundStyle(Brand.ink2)
        }
        .padding(.vertical, 2)
        .contentShape(.rect)
        .accessibilityElement(children: .combine)
        .task(id: "\(ref ?? "")|\(store.foodsReady)") {
            guard let ref, store.foodsReady else { return }
            found = await store.engineRef.kinds(of: [ref])[ref]
        }
    }

    /// Words that only file a food under a heading ("Beverages, water, tap"): skipped so the food itself leads.
    private static let filing: Set<String> = ["Beverages", "Spices", "Snacks", "Fast foods", "Restaurant", "Babyfood", "Soup", "Sauce"]
    /// "Beverages, water, tap, drinking" → "Water, tap, drinking": the food first, its filing word dropped.
    static func clean(_ n: String) -> String {
        guard let r = n.range(of: ", "), filing.contains(String(n[..<r.lowerBound])) else { return n }
        let t = String(n[r.upperBound...]); return t.prefix(1).uppercased() + t.dropFirst()
    }
}

struct FoodIcon: View {
    let kind: String
    var size: CGFloat = 32
    var name: String? = nil

    var body: some View {
        // one fixed icon per type (foods, meals, recipes, your own foods), each in its own colour, no tile behind it
        let style = FoodType(kind: kind)
        Image(systemName: style.icon)
            .font(.system(size: size * 0.6, weight: .semibold))
            .foregroundStyle(style.color)
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

/// The four kinds of thing you log, each with one icon and colour used everywhere (Diary, Add food, the Foods tab).
struct FoodType {
    let icon: String
    let color: Color
    init(kind: String) {
        switch kind {
        case "meal": icon = "takeoutbag.and.cup.and.straw.fill"; color = Brand.water
        case "recipe": icon = "frying.pan.fill"; color = Brand.protein
        case "mine": icon = "pencil"; color = Brand.fat          // your own foods: you wrote them
        default: icon = "carrot.fill"; color = Brand.amber         // every food from the database (and quick adds)
        }
    }
    static let food = FoodType(kind: "food"), meal = FoodType(kind: "meal"), recipe = FoodType(kind: "recipe"), mine = FoodType(kind: "mine")
}

/// The filter pill used on every tab of Add food: how the list is sorted, and (where it applies) Verified only.
struct FilterPill: View {
    typealias Option = (String, LocalizedStringKey, String)
    @Binding var sort: String
    var verified: Binding<Bool>?
    let options: [Option]
    /// Optional second choice under the sort (the All tab: this meal or all meals).
    var scope: Binding<String>? = nil
    var scopes: [Option] = []

    var body: some View {
        Menu {
            Picker("Sort", selection: $sort) {
                ForEach(options, id: \.0) { o in Label(o.1, systemImage: o.2).tag(o.0) }
            }
            .pickerStyle(.inline)
            if let scope, !scopes.isEmpty {
                SwiftUI.Section {
                    Picker("Show", selection: scope) { ForEach(scopes, id: \.0) { o in Label(o.1, systemImage: o.2).tag(o.0) } }
                        .pickerStyle(.inline)
                }
            }
            if let verified {
                SwiftUI.Section { Toggle(isOn: verified) { Label("Verified only", systemImage: "checkmark.seal.fill") } }
            }
        } label: {
            HStack(spacing: 5) {
                Image(systemName: "arrow.up.arrow.down").font(.caption.weight(.semibold))
                Text(options.first { $0.0 == sort }?.1 ?? options[0].1).font(.brand(.subheadline, .semibold)).lineLimit(1)
                if verified?.wrappedValue == true {
                    Image(systemName: "checkmark.seal.fill").font(.caption).foregroundStyle(Brand.ink2).accessibilityLabel(Text("Verified only"))
                }
                Image(systemName: "chevron.down").font(.caption2.weight(.bold)).foregroundStyle(Brand.ink2)
            }
            .padding(.horizontal, 12).padding(.vertical, 6)
            .background(Brand.card, in: Capsule())
            .overlay(Capsule().strokeBorder(Brand.line, lineWidth: 1))
            .foregroundStyle(Brand.ink)
        }
        .menuActionDismissBehavior(.disabled) // pick a sort and Verified only without reopening
        .sensoryFeedback(.selection, trigger: "\(sort)\(verified?.wrappedValue ?? false)\(scope?.wrappedValue ?? "")")
        .accessibilityLabel(Text("Sort"))
        .accessibilityValue(Text(options.first { $0.0 == sort }?.1 ?? options[0].1))
    }
}

/// Setpoint's tab switch: a green pill that slides to the tab you pick.
struct PillTabs<T: Hashable>: View {
    @Binding var selection: T
    let options: [(T, LocalizedStringKey)]
    @Namespace private var ns

    var body: some View {
        HStack(spacing: 4) {
            ForEach(options.indices, id: \.self) { i in
                let value = options[i].0, title = options[i].1
                let on = value == selection
                Button { withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) { selection = value } } label: {
                    Text(title).font(.brand(.subheadline, .semibold)).lineLimit(1).minimumScaleFactor(0.8)
                        .foregroundStyle(on ? Brand.bg : Brand.ink2)
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background { if on { Capsule().fill(Brand.ink).matchedGeometryEffect(id: "pill", in: ns) } }
                        .contentShape(Capsule())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(4)
        .background(Brand.card, in: Capsule())
        .overlay(Capsule().strokeBorder(Brand.line.opacity(0.7), lineWidth: 0.5))
        .sensoryFeedback(.selection, trigger: selection)
    }
}
