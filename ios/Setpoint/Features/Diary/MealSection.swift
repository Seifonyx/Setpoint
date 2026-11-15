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
        var id: String {
            switch self { case .header(let m): "meal-" + m.key; case .food(let f, _): "food-" + f.id; case .end(let m): "end-" + m.key }
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
            [.header(m)] + (isOpen(m.key) ? foods(m.key).map { .food($0, m) } : []) + [.end(m)]
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
                    .moveDisabled(true)
            case .food(let food, let m):
                MealFoodRow(food: food, meal: m, day: day, kind: kinds[food.id], copying: $copying, open: $open, actions: actions)
                    .listRowBackground(MealCard(top: false, bottom: false, tint: store.justAdded.contains(food.id) ? Brand.greenSoft : Brand.card))
                    .listRowSeparator(last ? .hidden : .visible, edges: .bottom)
            case .end:
                Color.clear.frame(height: 6)
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(MealCard(top: false, bottom: true))
                    .listRowSeparator(.hidden)
                    // not .moveDisabled: List won't drop a food where a fixed row sits, and this is the spot that
                    // puts a food last in its meal (or into an empty one). It's too thin to pick up; if it ever is, nothing moves.
                    .accessibilityHidden(true)
            }
        }
        // press, hold and drag a food: it lands in the meal whose name is above where you let go, before the food below
        .onMove { from, to in
            MoveLog.shared.text = "mv \(from.first ?? -1)>\(to) of \(rows.count)"
            guard let i = from.first, case .food(let food, _) = rows[i] else { return }
            var moved = rows
            moved.move(fromOffsets: from, toOffset: to)
            guard let at = moved.firstIndex(where: { $0.id == rows[i].id }) else { return }
            var meal = store.meals.first?.key ?? food.meal
            for j in stride(from: at - 1, through: 0, by: -1) { if case .header(let m) = moved[j] { meal = m.key; break } }
            var before: String?
            if at + 1 < moved.count, case .food(let next, _) = moved[at + 1] { before = next.id }
            withAnimation(.snappy) { store.place(food.id, meal: meal, before: before, on: day) }
            if !isOpen(meal) { setOpen(meal, true) } // dropped into a folded meal: open it so you see where it went
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
            Text(meal.name).font(Brand.display(17, .bold)).foregroundStyle(Brand.ink)
            Image(systemName: "chevron.down").font(.brand(.caption2, .bold)).foregroundStyle(Brand.ink2)
                .rotationEffect(.degrees(expanded ? 0 : -90))
            if !expanded && !foods.isEmpty {
                Text("\(foods.count)").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            }
            Spacer()
            if !counted.isEmpty {
                Text("\(Fmt.kcal(counted.reduce(0) { $0 + $1.kcal }))").font(Brand.num(18, .semibold)).monospacedDigit().foregroundStyle(Brand.ink2)
            }
            Menu {
                Button("Copy from yesterday", systemImage: "arrow.uturn.backward") {
                    withAnimation { _ = store.copyFromYesterday(meal: meal.key, to: day) }
                }
                if !foods.isEmpty {
                    Button("Copy to another day", systemImage: "doc.on.doc") { copying = foods }
                    Button("Save as meal", systemImage: "square.and.arrow.down.on.square") { actions.mealName = meal.name; actions.naming = meal }
                    Button("Remove all", systemImage: "trash", role: .destructive) { withAnimation { store.removeMeal(meal.key, on: day) } }
                }
            } label: {
                Image(systemName: "ellipsis").font(.brand(.subheadline, .semibold)).frame(width: 28, height: 24).contentShape(.rect)
            }
            .accessibilityLabel(Text("\(meal.name) options"))
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

    var body: some View {
        Button { open = food } label: { FoodRow(food: food, day: day, kind: kind) }
            .buttonStyle(.plain)
            .accessibilityIdentifier("food-\(food.id)")
            .swipeActions(edge: .trailing) {
                Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(food, on: day) } }
            }
            .swipeActions(edge: .leading) {
                // swipe right: ⋯ with everything you can do to it
                Button("More", systemImage: "ellipsis") { actions.more = food }.tint(Brand.ink2)
            }
    }
}

/// The dialogs the meal rows open (⋯, Move, Repeat, Save as meal), shown once from the Diary.
struct MealDialogs: ViewModifier {
    @Environment(Store.self) private var store
    let day: String
    @Binding var copying: [FoodItem]?
    @Binding var open: FoodItem?
    @Bindable var actions: MealActions

    func body(content: Content) -> some View {
        content
            .sheet(item: $actions.repeating) { f in RepeatSheet(item: f.raw) }
            .confirmationDialog(actions.more?.displayName ?? "", isPresented: Binding(get: { actions.more != nil }, set: { if !$0 { actions.more = nil } }), titleVisibility: .visible, presenting: actions.more) { f in
                Button("Adjust") { open = f }
                if f.isPlanned && day <= Day.today { Button("Mark as eaten") { store.markEaten(f, on: day) } }
                Button("Add another") { withAnimation { store.addAnother(f, on: day) } }
                Button("Move") {
                    // one Move: the ⋯ closes first, then the choice of meal opens
                    Task { try? await Task.sleep(for: .milliseconds(350)); actions.moving = f }
                }
                Button("Copy to another day") { copying = [f] }
                Button("Repeat this food") { actions.repeating = f }
                Button("Delete", role: .destructive) { withAnimation { store.delete(f, on: day) } }
            }
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
                if !detail.isEmpty {
                    Text(detail).font(.brand(.subheadline)).foregroundStyle(.secondary).lineLimit(1)
                }
                if let note = food.note { Text(note).font(.brand(.footnote)).italic().foregroundStyle(.secondary).lineLimit(1) }
            }
            Spacer()
            Text(Fmt.kcal(food.kcal)).font(Brand.num(18, .semibold)).monospacedDigit().foregroundStyle(Brand.ink)
        }
        .contentShape(.rect)
        .opacity(food.isPlanned && day <= Day.today ? 0.55 : 1)
    }

    private var detail: String {
        var parts: [String] = []
        if food.isPlanned && day <= Day.today { parts.append(String(localized: "Planned")) }
        if let t = food.time { parts.append(t) }
        if let q = food.qty, let u = food.unit, food.ref != nil { parts.append(Fmt.amount(q, u)) }
        else {
            let m = [("P", food.protein), ("C", food.carbs), ("F", food.fat)].filter { $0.1 > 0 }.map { "\($0.0) \(Fmt.grams($0.1))" }
            if !m.isEmpty { parts.append(m.joined(separator: " · ")) }
        }
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
                            .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(f, on: day) } } }
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
