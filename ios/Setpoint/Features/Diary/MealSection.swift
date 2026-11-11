import SwiftUI

/// One meal in the Diary: its foods, with iOS swipe actions and a long-press menu on each, and a ⋯ menu for the meal.
struct MealSection: View {
    @Environment(Store.self) private var store
    let meal: MealCategory
    let day: String
    @Binding var copying: [FoodItem]?
    var kinds: [String: String] = [:]
    let addFood: () -> Void
    @State private var open: FoodItem?
    @AppStorage("closedMeals") private var closedMeals = ""
    private var expanded: Bool { !closedMeals.split(separator: ",").contains(Substring(meal.key)) }
    private func toggleOpen() {
        var set = Set(closedMeals.split(separator: ",").map(String.init))
        if expanded { set.insert(meal.key) } else { set.remove(meal.key) }
        withAnimation(.snappy) { closedMeals = set.sorted().joined(separator: ",") }
    }
    @State private var naming = false
    @State private var mealName = ""

    private var foods: [FoodItem] { store.items(day).filter { store.mealKey(of: $0) == meal.key && !$0.isDailyTotal } }
    private var counted: [FoodItem] { foods.filter { !$0.isPlanned || day > Day.today } }

    var body: some View {
        Section {
            if expanded {
            ForEach(foods) { food in
                Button { open = food } label: { FoodRow(food: food, day: day, kind: kinds[food.id]) }
                    .buttonStyle(.plain)
                    .swipeActions(edge: .trailing) {
                        Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(food, on: day) } }
                    }
                    .swipeActions(edge: .leading) {
                        Button("Add another", systemImage: "plus") { withAnimation { store.addAnother(food, on: day) } }.tint(Brand.green)
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
            Button(action: addFood) {
                Label("Add food", systemImage: "plus.circle.fill").font(.brand(.body, .semibold)).foregroundStyle(Brand.green)
            }
            }
        } header: {
            HStack(alignment: .firstTextBaseline) {
                Button(action: toggleOpen) {
                    HStack(spacing: 6) {
                        Text(meal.name).font(Brand.display(20, .bold)).foregroundStyle(Brand.ink).textCase(nil)
                        Image(systemName: "chevron.down").font(.brand(.caption, .bold)).foregroundStyle(Brand.ink2)
                            .rotationEffect(.degrees(expanded ? 0 : -90))
                        if !expanded && !foods.isEmpty {
                            Text("\(foods.count)").font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
                                .padding(.horizontal, 6).padding(.vertical, 1).background(Brand.card2, in: Capsule())
                        }
                    }
                    .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(expanded ? "Collapse \(meal.name)" : "Expand \(meal.name)"))
                Spacer()
                if !counted.isEmpty {
                    Text("\(Fmt.kcal(counted.reduce(0) { $0 + $1.kcal })) kcal").font(.brand(.subheadline, .semibold)).monospacedDigit().foregroundStyle(Brand.ink2).textCase(nil)
                }
                Menu {
                    Button("Add food", systemImage: "plus", action: addFood)
                    Button("Copy from yesterday", systemImage: "arrow.uturn.backward") {
                        withAnimation { _ = store.copyFromYesterday(meal: meal.key, to: day) }
                    }
                    if !foods.isEmpty {
                        Button("Copy to another day", systemImage: "doc.on.doc") { copying = foods }
                        Button("Save as meal", systemImage: "square.and.arrow.down.on.square") { mealName = meal.name; naming = true }
                        Button("Remove all", systemImage: "trash", role: .destructive) { withAnimation { store.removeMeal(meal.key, on: day) } }
                    }
                } label: {
                    Image(systemName: "ellipsis").font(.brand(.body, .semibold)).frame(width: 30, height: 24).contentShape(.rect)
                }
                .accessibilityLabel(Text("\(meal.name) options"))
            }
        }
        .sheet(item: $open) { f in FoodDetailSheet(food: f, day: day) }
        .alert("Save as meal", isPresented: $naming) {
            TextField("Name", text: $mealName)
            Button("Cancel", role: .cancel) {}
            Button("Save") {
                let n = mealName.trimmingCharacters(in: .whitespaces)
                if !n.isEmpty { store.saveMeal(n, items: foods) }
            }
        } message: { Text("Log these foods again in one tap from Add food › Meals.") }
        .task { if UserDefaults.standard.string(forKey: "sheet") == "food", meal.key == store.meals.first?.key { open = foods.first } } // build-server screenshots
    }
}

struct FoodRow: View {
    let food: FoodItem
    let day: String
    var kind: String? = nil

    var body: some View {
        HStack(spacing: 12) {
            FoodIcon(kind: kind ?? (food.ref == nil ? "quick" : "food"), size: 36)
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
            VStack(alignment: .trailing, spacing: 4) {
                Text(Fmt.kcal(food.kcal)).font(.brand(.body, .semibold)).monospacedDigit()
                MacroSplit(p: food.protein, c: food.carbs, f: food.fat).frame(width: 46, height: 4)
            }
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
