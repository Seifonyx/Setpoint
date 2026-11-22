import SwiftUI

/// Build-server drag test only (-movelog): the last move List reported, shown as the Diary's subtitle.
@MainActor @Observable
final class MoveLog {
    static let shared = MoveLog()
    var text = "mv none"
}

/// What the Diary's food menus have open: one place for all meals, so each dialog is shown once (not once per row).
@MainActor @Observable
final class MealActions {
    var more: FoodItem?
    var repeating: FoodItem?
    var moving: FoodItem?
    var naming: MealCategory?
    var mealName = ""
    /// A meal's options (swiped right on its name).
    var mealMore: MealCategory?
    /// Editors opened from a food's ⋯: your food, a saved meal or a recipe (the original, or a copy of it).
    var editFood: Editing?
    var editMeal: Editing?
    var editRecipe: Editing?
    struct Editing: Identifiable { let id = UUID(); let value: [String: JSONValue] }
    /// What a food's and a meal's options are (set up by MealDialogs, shown in a small menu under the row).
    @ObservationIgnored var foodOptions: (FoodItem) -> [OptionRow] = { _ in [] }
    @ObservationIgnored var mealOptions: (MealCategory) -> [OptionRow] = { _ in [] }
    /// The row whose action tray is open ("food-<id>" or "meal-<key>"): the tray opens inside the list, right under it.
    var tray: String?
    func toggle(_ row: String) { withAnimation(.snappy(duration: 0.28)) { tray = tray == row ? nil : row } }
    func close() { if tray != nil { withAnimation(.snappy(duration: 0.25)) { tray = nil } } }
}

/// The Diary's meals as one run of rows: each meal's name, then its foods. Each meal still looks like its own card
/// (rounded ends and a gap, drawn by MealCard), but being one run of rows lets you press, hold and drag a food
/// anywhere: up or down inside its meal, or into another meal, with the list making room as you go (List's own reorder).
struct MealRows: View {
    @Environment(Store.self) private var store
    let day: String
    @Binding var copying: [FoodItem]?
    var kinds: [String: String] = [:]
    /// The food being edited: the Diary shows its editor (a sheet up there doesn't get dropped when this list redraws).
    @Binding var open: FoodItem?
    let actions: MealActions
    let addFood: (String) -> Void
    @AppStorage("closedMeals") private var closedMeals = ""

    enum Row: Identifiable {
        case header(MealCategory)
        case food(FoodItem, MealCategory)
        /// The bottom of a meal's card: a thin row that stays put, so a food can be dropped into an empty or folded meal.
        case end(MealCategory)
        /// A food's or a meal's actions, opened (swipe right › ⋯) right under it, inside the list.
        case tray(String)
        var id: String {
            switch self { case .header(let m): "meal-" + m.key; case .food(let f, _): "food-" + f.id; case .end(let m): "end-" + m.key; case .tray(let r): "tray-" + r }
        }
    }

    private func isOpen(_ key: String) -> Bool { !closedMeals.split(separator: ",").contains(Substring(key)) }
    private func setOpen(_ key: String, _ open: Bool) {
        var set = Set(closedMeals.split(separator: ",").map(String.init))
        if open { set.remove(key) } else { set.insert(key) }
        withAnimation(.snappy) { closedMeals = set.sorted().joined(separator: ",") }
    }
    private func foods(_ key: String) -> [FoodItem] { store.items(day).filter { store.mealKey(of: $0) == key && !$0.isDailyTotal } }

    private var rows: [Row] {
        store.meals.flatMap { m -> [Row] in
            let t = actions.tray
            let head: [Row] = [.header(m)] + (t == "meal-" + m.key ? [.tray(t!)] : [])
            let body: [Row] = isOpen(m.key) ? foods(m.key).flatMap { f -> [Row] in [.food(f, m)] + (t == "food-" + f.id ? [.tray(t!)] : []) } : []
            return head + body + [.end(m)]
        }
    }

    var body: some View {
        let rows = rows
        ForEach(Array(rows.enumerated()), id: \.element.id) { i, row in
            let last = i == rows.count - 1 || { if case .end = rows[i + 1] { return true }; return false }()
            switch row {
            case .header(let m):
                MealHeader(meal: m, day: day, foods: foods(m.key), expanded: isOpen(m.key), copying: $copying, actions: actions,
                           toggle: { setOpen(m.key, !isOpen(m.key)) }, addFood: { addFood(m.key) })
                    .padding(.top, MealCard.gap)
                    .listRowBackground(MealCard(top: true, bottom: false))
                    .listRowSeparator(.hidden, edges: .top)
                    .listRowSeparator(last ? .hidden : .visible, edges: .bottom)
                    // not .moveDisabled: List won't drop a food where a fixed row sits, so a meal's name has to take drops
                    // (just above it ends the meal before, just below starts this one). Picking a name up moves nothing.
            case .food(let food, let m):
                MealFoodRow(food: food, meal: m, day: day, kind: kinds[food.id], copying: $copying, open: $open, actions: actions)
                    .listRowBackground(MealCard(top: false, bottom: false, tint: store.justAdded.contains(food.id) ? Brand.greenSoft : Brand.card))
                    .listRowSeparator(last ? .hidden : .visible, edges: .bottom)
            case .tray(let r):
                ActionTray(options: r.hasPrefix("meal-")
                           ? store.meals.first { "meal-" + $0.key == r }.map(actions.mealOptions) ?? []
                           : store.items(day).first { "food-" + $0.id == r }.map(actions.foodOptions) ?? []) { actions.close() }
                    .listRowInsets(EdgeInsets(top: 4, leading: 14, bottom: 10, trailing: 14))
                    .listRowBackground(MealCard(top: false, bottom: false))
                    .listRowSeparator(.hidden)
                    .moveDisabled(true)
                    .transition(.opacity.combined(with: .scale(scale: 0.96, anchor: .top)))
            case .end:
                Color.clear.frame(height: 6)
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(MealCard(top: false, bottom: true))
                    .listRowSeparator(.hidden)
                    // takes drops too (last in its meal, or into an empty one); too thin to pick up, and if it is, nothing moves
                    .accessibilityHidden(true)
            }
        }
        // press, hold and drag a food: it lands in the meal whose name is above where you let go, before the food below
        .onMove { from, to in
            actions.close()
            MoveLog.shared.text = "mv \(from.first ?? -1)>\(to) of \(rows.count)"
            guard let i = from.first, rows.indices.contains(i), case .food(let food, _) = rows[i] else { return }
            var moved = rows
            moved.move(fromOffsets: from, toOffset: to)
            guard let at = moved.firstIndex(where: { $0.id == rows[i].id }) else { return }
            var meal = store.meals.first?.key ?? food.meal, aboveAll = true
            for j in stride(from: at - 1, through: 0, by: -1) { if case .header(let m) = moved[j] { meal = m.key; aboveAll = false; break } }
            var before: String?
            if at + 1 < moved.count, case .food(let next, _) = moved[at + 1] { before = next.id }
            // dropped above the first meal's name: the top of that meal, not the bottom
            if aboveAll { before = foods(meal).first(where: { $0.id != food.id })?.id }
            // The list has already moved the row to where you let go. If the diary ends up in exactly that order
            // (between foods of an open meal, or last in it), it's saved at once. Otherwise (into a folded meal, below
            // a meal's card, above everything) rows would appear or vanish during the drop itself, which crashes the
            // list: so the list settles first, and the food moves where it belongs a moment later.
            let exact = !aboveAll && isOpen(meal) && at + 1 < moved.count && {
                switch moved[at + 1] { case .food(_, let m), .end(let m): return m.key == meal; default: return false }
            }()
            let apply: () -> Void = {
                // a folded meal stays folded: the food slides into it and its count goes up (opening it would make the
                // whole list jump just as you let go)
                // exact: the list already shows it there, so nothing more to animate (a second animation is what jolts)
                if exact { store.place(food.id, meal: meal, before: before, on: day) }
                else { withAnimation(.snappy) { store.place(food.id, meal: meal, before: before, on: day) } }
            }
            if exact { apply() } else { Task { @MainActor in try? await Task.sleep(for: .milliseconds(300)); apply() } }
        }
        .task {
            if UserDefaults.standard.string(forKey: "sheet") == "food", let m = store.meals.first { open = foods(m.key).first }
        } // build-server screenshots
    }
}

/// A meal's card, drawn behind its rows: rounded at the top behind its name, at the bottom behind its last row,
/// with a clear gap above, so each meal reads as its own card.
struct MealCard: View {
    static let gap: CGFloat = 10
    let top: Bool
    let bottom: Bool
    var tint: Color = Brand.card
    var body: some View {
        VStack(spacing: 0) {
            if top { Color.clear.frame(height: Self.gap) }
            UnevenRoundedRectangle(topLeadingRadius: top ? Radius.card : 0, bottomLeadingRadius: bottom ? Radius.card : 0,
                                   bottomTrailingRadius: bottom ? Radius.card : 0, topTrailingRadius: top ? Radius.card : 0, style: .continuous)
                .fill(tint)
                .overlay { if top { TopSheen().padding(.horizontal, Radius.card) } }
        }
        .animation(.easeOut(duration: 0.9), value: tint)
    }
}

/// A meal's name row: tap anywhere on it to fold or unfold the meal (+ and ⋯ are their own buttons).
struct MealHeader: View {
    @Environment(Store.self) private var store
    let meal: MealCategory
    let day: String
    let foods: [FoodItem]
    let expanded: Bool
    @Binding var copying: [FoodItem]?
    let actions: MealActions
    let toggle: () -> Void
    let addFood: () -> Void

    private var counted: [FoodItem] { foods.filter { !$0.isPlanned || day > Day.today } }

    var body: some View {
        HStack(alignment: .center, spacing: 8) {
            Button(action: addFood) {
                Image(systemName: "plus").font(.subheadline.weight(.bold)).foregroundStyle(Brand.ink)
                    .frame(width: 26, height: 26).background(Brand.card2, in: Circle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Text("Add food to \(meal.name)"))
            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 6) {
                    Text(meal.name).font(Brand.display(17, .bold)).foregroundStyle(Brand.ink)
                    if !expanded && !foods.isEmpty {
                        Text("\(foods.count)").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                    }
                }
                // what's in it so far, small, under the name
                if !counted.isEmpty {
                    let t = counted.reduce(into: (k: 0.0, p: 0.0, c: 0.0, f: 0.0)) { $0.k += $1.kcal; $0.p += $1.protein; $0.c += $1.carbs; $0.f += $1.fat }
                    Text(verbatim: "\(Fmt.kcal(t.k)) kcal • \(Fmt.grams(t.p)) g P • \(Fmt.grams(t.c)) g C • \(Fmt.grams(t.f)) g F")
                        .font(.brand(.caption)).foregroundStyle(Brand.ink2).monospacedDigit().lineLimit(1).minimumScaleFactor(0.8)
                }
            }
            Spacer(minLength: 4)
            Image(systemName: "chevron.down").font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.ink2)
                .rotationEffect(.degrees(expanded ? 0 : -90))
                .frame(width: 28, height: 28)
        }
        .padding(.vertical, 2)
        // swipe right for its options, left to clear it (like the foods in it)
        .swipeActions(edge: .leading) {
            Button { actions.toggle("meal-" + meal.key) } label: { Label("\(meal.name) options", systemImage: "ellipsis") }
                .labelStyle(.iconOnly).tint(Brand.blue)
        }
        .swipeActions(edge: .trailing) {
            if !foods.isEmpty {
                Button(role: .destructive) { store.removeMeal(meal.key, on: day) } label: { Label("Remove all", systemImage: "trash") }
                    .labelStyle(.iconOnly).tint(Brand.danger)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture(perform: toggle)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("meal-\(meal.key)")
        .accessibilityAddTraits(.isButton)
        .accessibilityHint(Text(expanded ? "Collapse \(meal.name)" : "Expand \(meal.name)"))
    }
}

/// One food in a meal: tap to edit, swipe left to delete, swipe right for ⋯ (everything you can do to it),
/// press and hold to drag it. (No long-press menu: it would take the press that starts a drag, and ⋯ has it all.)
struct MealFoodRow: View {
    @Environment(Store.self) private var store
    let food: FoodItem
    let meal: MealCategory
    let day: String
    let kind: String?
    @Binding var copying: [FoodItem]?
    @Binding var open: FoodItem?
    let actions: MealActions

    @State private var ticked = false
    private var tickable: Bool { food.isPlanned && day <= Day.today }

    var body: some View {
        HStack(spacing: 10) {
            // planned: a circle to tick when you eat it (then it counts, at the time you ticked it)
            if tickable {
                Button {
                    withAnimation(.snappy) { ticked = true }
                    Task { try? await Task.sleep(for: .milliseconds(250)); withAnimation(.snappy) { store.markEaten(food, on: day) } }
                } label: {
                    Image(systemName: ticked ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 24, weight: .regular)).foregroundStyle(ticked ? Brand.green : Brand.ink2)
                        .contentTransition(.symbolEffect(.replace)).frame(width: 30, height: 44).contentShape(.rect)
                }
                .buttonStyle(.plain)
                .sensoryFeedback(.success, trigger: ticked) { _, now in now }
                .accessibilityLabel(Text("Mark \(food.displayName) as eaten"))
                .accessibilityIdentifier("tick-\(food.id)")
            }
            Button { open = food } label: { FoodRow(food: food, day: day, kind: kind) }
                .buttonStyle(.plain)
        }
            .accessibilityIdentifier("food-\(food.id)")
                .swipeActions(edge: .trailing) {
                Button(role: .destructive) { store.delete(food, on: day) } label: { Label("Delete", systemImage: "trash") }
                    .labelStyle(.iconOnly).tint(Brand.danger)
            }
            .swipeActions(edge: .leading) {
                // swipe right: ⋯ with everything you can do to it
                Button { actions.toggle("food-" + food.id) } label: { Label("More", systemImage: "ellipsis") }
                    .labelStyle(.iconOnly).tint(Brand.blue)
            }
    }
}

/// The dialogs the meal rows open (⋯, Move, Repeat, Save as meal), shown once from the Diary.
struct MealDialogs: ViewModifier {
    enum Kind { case food, custom([String: JSONValue]), meal([String: JSONValue]?), recipe([String: JSONValue]) }
    /// What a logged entry is: a saved meal (logged as one), one of your recipes, one of your own foods, or any food.
    static func kind(of f: FoodItem, _ store: Store) -> Kind {
        let list = { (k: String) in (store.root[k]?.array ?? []).compactMap(\.object) }
        if f.raw["mi"] != nil { return .meal(list("meals").first { $0["id"]?.string == f.raw["mid"]?.string }) }
        if let r = f.ref, let rec = list("recipes").first(where: { $0["id"]?.string == r }) { return .recipe(rec) }
        if let r = f.ref, let rec = list("myFoods").first(where: { $0["id"]?.string == r }) { return .custom(rec) }
        return .food
    }
    /// A saved meal, recipe or food of yours, as a new one to edit (the original stays as it is).
    static func copy(_ v: [String: JSONValue], prefix: String, named: String?) -> [String: JSONValue] {
        var c = v; c["id"] = .string(prefix + Ids.new())
        c["name"] = .string(String(localized: "\(named ?? "") copy"))
        return c
    }
    /// Any food as your own copy: this amount becomes one serving, with its numbers.
    static func customCopy(of f: FoodItem) -> [String: JSONValue] {
        var v: [String: JSONValue] = ["id": .string("c" + Ids.new()), "name": .string(String(localized: "\(f.displayName) copy")),
                                      "unit": .string("serving"), "kcal": .number(f.kcal.rounded()),
                                      "p": .number(f.protein), "c": .number(f.carbs), "f": .number(f.fat)]
        if let g = f.raw["g"]?.number { v["g"] = .number((g * 10).rounded() / 10) }
        return v
    }
    /// Everything you can do to a logged food (swipe right on it), in the order you'd want it.
    private func foodOptions(_ f: FoodItem) -> [OptionRow] {
        var o: [OptionRow] = []
        if f.isPlanned && day <= Day.today { o.append(.init("Eaten", "checkmark.circle", tint: Brand.green) { store.markEaten(f, on: day) }) }
        else if day <= Day.today { o.append(.init(text: String(localized: "Plan (verb)", defaultValue: "Plan"), "calendar.badge.clock", tint: Brand.blue) { withAnimation(.snappy) { store.markPlanned(f, on: day) } }) }
        o.append(.init("Repeat", "repeat", tint: Brand.amber) { actions.repeating = f })
        switch Self.kind(of: f, store) {
        case .meal(let rec):
            o.append(.init("Explode", "square.split.2x2", tint: Brand.fat) { withAnimation { store.explode(f, into: f.raw["mi"]?.array?.compactMap(\.object) ?? [], on: day) } })
            if let rec {
                o.append(.init("Edit meal", "pencil", tint: Brand.ink) { actions.editMeal = .init(value: rec) })
                o.append(.init("Edit a copy", "plus.square.on.square", tint: Brand.ink) { actions.editMeal = .init(value: Self.copy(rec, prefix: "m", named: rec["name"]?.string)) })
            }
        case .recipe(let rec):
            o.append(.init("Explode", "square.split.2x2", tint: Brand.fat) { Task { await explodeRecipe(f, rec) } })
            o.append(.init("Edit recipe", "pencil", tint: Brand.ink) { actions.editRecipe = .init(value: rec) })
            o.append(.init("Edit a copy", "plus.square.on.square", tint: Brand.ink) { actions.editRecipe = .init(value: Self.copy(rec, prefix: "r", named: rec["name"]?.string)) })
        case .custom(let rec):
            o.append(.init("Edit food", "pencil", tint: Brand.ink) { actions.editFood = .init(value: rec) })
            o.append(.init("Edit a copy", "plus.square.on.square", tint: Brand.ink) { actions.editFood = .init(value: Self.copy(rec, prefix: "c", named: rec["name"]?.string)) })
        case .food:
            o.append(.init("Edit a copy", "plus.square.on.square", tint: Brand.ink) { actions.editFood = .init(value: Self.customCopy(of: f)) })
        }
        o.append(.init("Copy", "calendar.badge.plus", tint: Brand.water) { copying = [f] })
        o.append(.init("Delete", "trash", destructive: true) { withAnimation { store.delete(f, on: day) } })
        return o
    }
    /// A meal's options (swipe right on its name).
    private func mealOptions(_ m: MealCategory) -> [OptionRow] {
        let foods = store.items(day).filter { store.mealKey(of: $0) == m.key && !$0.isDailyTotal }
        var o: [OptionRow] = []
        if day <= Day.today && foods.contains(where: \.isPlanned) {
            o.append(.init("All eaten", "checkmark.circle", tint: Brand.green) { withAnimation(.snappy) { store.markAllEaten(meal: m.key, on: day) } })
        }
        o.append(.init("From yesterday", "arrow.uturn.backward", tint: Brand.amber) { withAnimation { _ = store.copyFromYesterday(meal: m.key, to: day) } })
        if !foods.isEmpty {
            o.append(.init("Copy", "calendar.badge.plus", tint: Brand.water) { copying = foods })
            o.append(.init("Save as meal", "square.and.arrow.down.on.square", tint: Brand.blue) { actions.mealName = m.name; actions.naming = m })
            o.append(.init("Clear", "trash", destructive: true) { withAnimation { store.removeMeal(m.key, on: day) } })
        }
        return o
    }
    /// A recipe you ate, as its ingredients: each one at the share of the recipe you had.
    private func explodeRecipe(_ f: FoodItem, _ rec: [String: JSONValue]) async {
        let ings = (rec["items"]?.array ?? []).compactMap(\.object)
        let serves = max(rec["servings"]?.number ?? 1, 1)
        let totalG = rec["cookedG"]?.number ?? ings.reduce(0) { $0 + ($1["g"]?.number ?? 0) }
        let share: Double = f.unit == "serving" ? (f.qty ?? 1) / serves
            : (f.raw["g"]?.number).map { totalG > 0 ? $0 / totalG : 1 / serves } ?? 1 / serves
        var out: [[String: JSONValue]] = []
        for it in ings {
            guard let ref = it["ref"]?.string, let q = it["qty"]?.number, let u = it["unit"]?.string,
                  let made = await store.engineRef.item(ref, qty: q * share, unit: u, meal: f.meal) else { continue }
            out.append(made)
        }
        withAnimation { store.explode(f, into: out, on: day) }
    }
    @Environment(Store.self) private var store
    let day: String
    @Binding var copying: [FoodItem]?
    @Binding var open: FoodItem?
    @Bindable var actions: MealActions

    func body(content: Content) -> some View {
        content
            .sheet(item: $actions.repeating) { f in RepeatSheet(item: f.raw) }
            .sheet(item: $actions.editFood) { e in CustomFoodSheet(food: e.value) }
            .sheet(item: $actions.editMeal) { e in MealEditor(meal: e.value) }
            .sheet(item: $actions.editRecipe) { e in RecipeEditor(recipe: e.value) }
            .task(id: day) { actions.foodOptions = foodOptions; actions.mealOptions = mealOptions } // per day shown
            .confirmationDialog("Move to", isPresented: Binding(get: { actions.moving != nil }, set: { if !$0 { actions.moving = nil } }), titleVisibility: .visible, presenting: actions.moving) { f in
                ForEach(store.meals.filter { $0.key != store.mealKey(of: f) }) { m in
                    Button(m.name) { withAnimation { store.move(f, to: m.key, on: day) } }
                }
            }
            .alert("Save as meal", isPresented: Binding(get: { actions.naming != nil }, set: { if !$0 { actions.naming = nil } })) {
                TextField("Name", text: $actions.mealName)
                Button("Cancel", role: .cancel) {}
                Button("Save") {
                    let n = actions.mealName.trimmingCharacters(in: .whitespaces)
                    if !n.isEmpty, let m = actions.naming {
                        store.saveMeal(n, items: store.items(day).filter { store.mealKey(of: $0) == m.key && !$0.isDailyTotal })
                    }
                }
            } message: { Text("Log these foods again in one tap from Add food › Meals.") }
    }
}

struct FoodRow: View {
    let food: FoodItem
    let day: String
    var kind: String? = nil

    var body: some View {
        HStack(spacing: 12) {
            FoodIcon(kind: kind ?? (food.ref == nil ? "quick" : "food"), size: 32, name: food.displayName)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 5) {
                    Text(food.displayName).lineLimit(1)
                    if food.isAdjusted { Image(systemName: "slider.horizontal.3").font(.brand(.caption)).foregroundStyle(.secondary).accessibilityLabel(Text("Adjusted for this day")) }
                    if food.isRepeat { Image(systemName: "repeat").font(.brand(.caption)).foregroundStyle(.secondary).accessibilityLabel(Text("Repeat item")) }
                }
                if planned || !detail.isEmpty {
                    // planned: said in the plan colour (not faded: it's waiting to be ticked, not switched off)
                    (planned ? Text("Planned").foregroundStyle(Brand.blue).fontWeight(.semibold) + Text(detail.isEmpty ? "" : " · ") : Text(""))
                        .font(.brand(.subheadline)) + Text(detail).font(.brand(.subheadline)).foregroundStyle(.secondary)
                }
                if let note = food.note { Text(note).font(.brand(.footnote)).italic().foregroundStyle(.secondary).lineLimit(1) }
            }
            Spacer()
            // not counted until it's ticked: only the calories are quieter
            Text(Fmt.kcal(food.kcal)).font(Brand.num(18, .semibold)).monospacedDigit().foregroundStyle(planned ? Brand.ink2 : Brand.ink)
        }
        .contentShape(.rect)
    }
    private var planned: Bool { food.isPlanned && day <= Day.today }

    private var detail: String {
        var parts: [String] = []
        if let t = food.time { parts.append(t) }
        if let q = food.qty, let u = food.unit, food.ref != nil { parts.append(Fmt.amount(q, u)) }
        return parts.joined(separator: " · ")
    }
}

/// A food's calories split into protein, carbs and fat, as one thin bar.
struct MacroSplit: View {
    let p: Double, c: Double, f: Double
    var body: some View {
        let kp = p * 4, kc = c * 4, kf = f * 9, t = kp + kc + kf
        GeometryReader { g in
            if t > 0 {
                HStack(spacing: 1.5) {
                    Capsule().fill(Brand.protein).frame(width: max(0, g.size.width * kp / t - 1))
                    Capsule().fill(Brand.carbs).frame(width: max(0, g.size.width * kc / t - 1))
                    Capsule().fill(Brand.fat).frame(width: max(0, g.size.width * kf / t - 1))
                }
            }
        }
    }
}

/// A meal at a glance: its totals and macro split, its share of your day, and every food with its portion.
struct MealSummarySheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let meal: MealCategory
    let day: String
    let kinds: [String: String]
    let addFood: () -> Void
    let saveAs: () -> Void
    let copy: () -> Void
    @State private var open: FoodItem?
    @State private var confirmClear = false

    private var foods: [FoodItem] { store.items(day).filter { store.mealKey(of: $0) == meal.key && !$0.isDailyTotal } }

    var body: some View {
        let t = foods.filter { !$0.isPlanned || day > Day.today }.reduce(into: Totals()) { t, f in t.kcal += f.kcal; t.protein += f.protein; t.carbs += f.carbs; t.fat += f.fat }
        NavigationStack {
            List {
                Section {
                    HStack(alignment: .center) {
                        VStack(alignment: .leading, spacing: 0) {
                            Text(Fmt.kcal(t.kcal)).font(Brand.num(55, .bold)).monospacedDigit().contentTransition(.numericText())
                            Text("kcal").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                        }
                        Spacer()
                        MacroDonut(p: t.protein, c: t.carbs, f: t.fat).frame(width: 74, height: 74)
                    }
                    HStack(spacing: 10) {
                        cell("Protein", t.protein, Brand.protein); cell("Carbs", t.carbs, Brand.carbs); cell("Fat", t.fat, Brand.fat)
                    }
                }
                Section {
                    ForEach(foods) { f in
                        Button { open = f } label: { FoodRow(food: f, day: day, kind: kinds[f.id]) }.buttonStyle(.plain)
                            .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(f, on: day) } }.tint(Brand.danger) }
                    }
                    Button(action: addFood) { Label("Add food", systemImage: "plus.circle.fill").font(.brand(.body, .semibold)).foregroundStyle(Brand.green) }
                } header: { Text("\(foods.count) foods") }
                if !foods.isEmpty {
                    Section {
                        Button("Save as meal", systemImage: "square.and.arrow.down.on.square", action: saveAs)
                        Button("Copy to another day", systemImage: "doc.on.doc", action: copy)
                        Button("Clear this meal", systemImage: "trash", role: .destructive) { confirmClear = true }
                    }
                    .tint(Brand.ink)
                }
            }
            .listSectionSpacing(14)
            .brandList()
            .navigationTitle(meal.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
            .sheet(item: $open) { f in FoodDetailSheet(food: f, day: day, kind: kinds[f.id]) }
            .confirmationDialog("Clear \(meal.name)?", isPresented: $confirmClear, titleVisibility: .visible) {
                Button("Clear", role: .destructive) { store.removeMeal(meal.key, on: day); dismiss() }
            }
        }
        .presentationDetents([.large])
    }
    private func cell(_ l: LocalizedStringKey, _ g: Double, _ c: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) { Circle().fill(c).frame(width: 7, height: 7); Text(l).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2) }
            Text("\(Fmt.grams(g)) g").font(Brand.num(22, .semibold)).monospacedDigit()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// One choice in an options sheet.
struct OptionRow: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    var destructive = false
    var tint: Color = Brand.ink2
    let run: @MainActor () -> Void
    init(text title: String, _ icon: String, tint: Color = Brand.ink2, destructive: Bool = false, run: @escaping @MainActor () -> Void) {
        self.title = title; self.icon = icon; self.tint = destructive ? Brand.danger : tint; self.destructive = destructive; self.run = run
    }
    init(_ title: LocalizedStringResource, _ icon: String, tint: Color = Brand.ink2, destructive: Bool = false, run: @escaping @MainActor () -> Void) {
        self.init(text: String(localized: title), icon, tint: tint, destructive: destructive, run: run)
    }
}


/// A food's or a meal's actions: a tray of small tiles that opens inside the list, right under its row (swipe right ›
/// ⋯). Part of the list, so it's always in the same place, scrolls with it and can never be cut off. Each tile has its
/// own colour; Delete is red.
struct ActionTray: View {
    let options: [OptionRow]
    let close: () -> Void
    /// Up to five on one line; more split evenly over two (never one tile left alone on a line)
    private var columns: [GridItem] {
        let n = options.count <= 5 ? max(options.count, 1) : (options.count + 1) / 2
        return Array(repeating: GridItem(.flexible(), spacing: 8), count: n)
    }

    var body: some View {
        LazyVGrid(columns: columns, spacing: 8) {
            ForEach(options) { o in
                Button {
                    close()
                    // the tray folds away first, then the choice runs (some open a sheet)
                    Task { try? await Task.sleep(for: .milliseconds(250)); o.run() }
                } label: {
                    VStack(spacing: 6) {
                        Image(systemName: o.icon).font(.system(size: 18, weight: .semibold)).foregroundStyle(o.tint)
                            .frame(height: 22)
                        Text(o.title).font(.brand(.caption, .medium)).foregroundStyle(o.destructive ? Brand.danger : Brand.ink)
                            .lineLimit(1).minimumScaleFactor(0.75)
                    }
                    .frame(maxWidth: .infinity, minHeight: 64)
                    .background(o.tint.opacity(o.destructive ? 0.12 : 0.1), in: .rect(cornerRadius: 16, style: .continuous))
                    .contentShape(.rect)
                }
                .buttonStyle(TileStyle())
                .accessibilityLabel(Text(o.title))
            }
        }
        .sensoryFeedback(.impact(weight: .light), trigger: options.count)
    }
}

/// A tile sinks a little while your finger is on it.
private struct TileStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.scaleEffect(configuration.isPressed ? 0.94 : 1).animation(.snappy(duration: 0.15), value: configuration.isPressed)
    }
}
