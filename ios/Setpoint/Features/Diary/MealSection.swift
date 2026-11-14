import SwiftUI

/// One meal in the Diary: its foods, with iOS swipe actions and a long-press menu on each, and a ⋯ menu for the meal.
struct MealSection: View {
    @Environment(Store.self) private var store
    let meal: MealCategory
    let day: String
    @Binding var copying: [FoodItem]?
    var kinds: [String: String] = [:]
    /// The food being edited: the Diary shows its editor (a sheet up there doesn't get dropped when this list redraws).
    @Binding var open: FoodItem?
    let addFood: () -> Void
    @State private var more: FoodItem?
    @State private var repeating: FoodItem?
    @State private var moving: FoodItem?
    @AppStorage("closedMeals") private var closedMeals = ""
    private var expanded: Bool { !closedMeals.split(separator: ",").contains(Substring(meal.key)) }
    private func toggleOpen() {
        var set = Set(closedMeals.split(separator: ",").map(String.init))
        if expanded { set.insert(meal.key) } else { set.remove(meal.key) }
        withAnimation(.snappy) { closedMeals = set.sorted().joined(separator: ",") }
    }
    @State private var naming = false
    @State private var mealName = ""

    /// Each meal has its own colour, as a thin edge down the side of its card: easy to tell apart at a glance.
    private var accent: Color { Brand.meal(meal.key) }
    private var foods: [FoodItem] { store.items(day).filter { store.mealKey(of: $0) == meal.key && !$0.isDailyTotal } }
    private var counted: [FoodItem] { foods.filter { !$0.isPlanned || day > Day.today } }

    var body: some View {
        Section {
            // the meal's heading: tap anywhere on it to fold or unfold the card (+ and ⋯ are their own buttons)
            HStack(alignment: .center, spacing: 8) {
                Button(action: addFood) {
                    Image(systemName: "plus").font(.subheadline.weight(.bold)).foregroundStyle(Brand.ink)
                        .frame(width: 26, height: 26).background(Brand.card2, in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text("Add food to \(meal.name)"))
                HStack(spacing: 7) {
                    Circle().fill(accent).frame(width: 7, height: 7).accessibilityHidden(true) // each meal's own colour
                    Text(meal.name).font(Brand.display(17, .bold)).foregroundStyle(Brand.ink)
                }
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
                        Button("Save as meal", systemImage: "square.and.arrow.down.on.square") { mealName = meal.name; naming = true }
                        Button("Remove all", systemImage: "trash", role: .destructive) { withAnimation { store.removeMeal(meal.key, on: day) } }
                    }
                } label: {
                    Image(systemName: "ellipsis").font(.brand(.subheadline, .semibold)).frame(width: 28, height: 24).contentShape(.rect)
                }
                .accessibilityLabel(Text("\(meal.name) options"))
            }
            .contentShape(Rectangle())
            .onTapGesture(perform: toggleOpen)
            .accessibilityAddTraits(.isButton)
            .accessibilityHint(Text(expanded ? "Collapse \(meal.name)" : "Expand \(meal.name)"))
            .padding(.vertical, 0)
            .listRowSeparator(expanded && !foods.isEmpty ? .visible : .hidden, edges: .bottom)
            .listRowBackground(Brand.card.overlay(TopSheen()))
            if expanded {
            ForEach(foods) { food in
                Button { open = food } label: { FoodRow(food: food, day: day, kind: kinds[food.id]) }
                    .buttonStyle(.plain)
                .listRowBackground(store.justAdded.contains(food.id) ? Brand.greenSoft : Brand.card)
                .animation(.easeOut(duration: 0.9), value: store.justAdded.contains(food.id))
                    .swipeActions(edge: .trailing) {
                        Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(food, on: day) } }
                    }
                    .swipeActions(edge: .leading) {
                        // swipe right: ⋯ with everything you can do to it
                        Button("More", systemImage: "ellipsis") { more = food }.tint(Brand.ink2)
                    }
                    .contextMenu {
                        if food.isPlanned && day <= Day.today {
                            Button("Mark as eaten", systemImage: "checkmark.circle") { store.markEaten(food, on: day) }
                        }
                        Button("Add another", systemImage: "plus") { store.addAnother(food, on: day) }
                        Menu("Move to", systemImage: "arrow.right") {
                            ForEach(store.meals.filter { $0.key != meal.key }) { m in
                                Button(m.name) { withAnimation { store.move(food, to: m.key, on: day) } }
                            }
                        }
                        Menu("Copy to", systemImage: "plus.square.on.square") {
                            ForEach(store.meals.filter { $0.key != meal.key }) { m in
                                Button(m.name) { withAnimation { store.copyToMeal(food, meal: m.key, on: day) } }
                            }
                        }
                        Button("Copy to another day", systemImage: "doc.on.doc") { copying = [food] }
                        Divider()
                        Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(food, on: day) } }
                    }
            }
            }
        }
        .sheet(item: $repeating) { f in RepeatSheet(item: f.raw) }
        .confirmationDialog(more?.displayName ?? "", isPresented: Binding(get: { more != nil }, set: { if !$0 { more = nil } }), titleVisibility: .visible, presenting: more) { f in
            Button("Adjust") { open = f }
            if f.isPlanned && day <= Day.today { Button("Mark as eaten") { store.markEaten(f, on: day) } }
            Button("Add another") { withAnimation { store.addAnother(f, on: day) } }
            Button("Move") {
                // one Move: the ⋯ closes first, then the choice of meal opens
                Task { try? await Task.sleep(for: .milliseconds(350)); moving = f }
            }
            Button("Copy to another day") { copying = [f] }
            Button("Repeat this food") { repeating = f }
            Button("Delete", role: .destructive) { withAnimation { store.delete(f, on: day) } }
        }
        .confirmationDialog("Move to", isPresented: Binding(get: { moving != nil }, set: { if !$0 { moving = nil } }), titleVisibility: .visible, presenting: moving) { f in
            ForEach(store.meals.filter { $0.key != meal.key }) { m in
                Button(m.name) { withAnimation { store.move(f, to: m.key, on: day) } }
            }
        }
        .alert("Save as meal", isPresented: $naming) {
            TextField("Name", text: $mealName)
            Button("Cancel", role: .cancel) {}
            Button("Save") {
                let n = mealName.trimmingCharacters(in: .whitespaces)
                if !n.isEmpty { store.saveMeal(n, items: foods) }
            }
        } message: { Text("Log these foods again in one tap from Add food › Meals.") }
        .task {
            let f = UserDefaults.standard.string(forKey: "sheet")
            guard meal.key == store.meals.first?.key else { return }
            if f == "food" { open = foods.first }
        } // build-server screenshots
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
