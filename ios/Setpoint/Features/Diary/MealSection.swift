import SwiftUI

/// One meal in the Diary: its foods, with iOS swipe actions and a long-press menu on each, and a ⋯ menu for the meal.
struct MealSection: View {
    @Environment(Store.self) private var store
    let meal: MealCategory
    let day: String
    @Binding var copying: [FoodItem]?

    private var foods: [FoodItem] { store.items(day).filter { store.mealKey(of: $0) == meal.key && !$0.isDailyTotal } }
    private var counted: [FoodItem] { foods.filter { !$0.isPlanned || day > Day.today } }

    var body: some View {
        Section {
            ForEach(foods) { food in
                FoodRow(food: food, day: day)
                    .swipeActions(edge: .trailing) {
                        Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(food, on: day) } }
                    }
                    .swipeActions(edge: .leading) {
                        Button("Add another", systemImage: "plus") { withAnimation { store.addAnother(food, on: day) } }.tint(.green)
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
                        Button("Copy to another day", systemImage: "doc.on.doc") { copying = [food] }
                        Divider()
                        Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(food, on: day) } }
                    }
            }
            if foods.isEmpty {
                Text("Nothing logged").foregroundStyle(.tertiary)
            }
        } header: {
            HStack {
                Text(meal.name)
                Spacer()
                if !counted.isEmpty {
                    Text("\(Fmt.kcal(counted.reduce(0) { $0 + $1.kcal })) kcal").monospacedDigit()
                }
                Menu {
                    Button("Copy from yesterday", systemImage: "arrow.uturn.backward") {
                        withAnimation { _ = store.copyFromYesterday(meal: meal.key, to: day) }
                    }
                    if !foods.isEmpty {
                        Button("Copy to another day", systemImage: "doc.on.doc") { copying = foods }
                        Button("Remove all", systemImage: "trash", role: .destructive) { withAnimation { store.removeMeal(meal.key, on: day) } }
                    }
                } label: {
                    Image(systemName: "ellipsis").font(.body.weight(.semibold)).frame(width: 30, height: 24).contentShape(.rect)
                }
                .accessibilityLabel(Text("\(meal.name) options"))
            }
        }
    }
}

struct FoodRow: View {
    let food: FoodItem
    let day: String

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 5) {
                    Text(food.displayName).lineLimit(1)
                    if food.isAdjusted { Image(systemName: "slider.horizontal.3").font(.caption).foregroundStyle(.secondary).accessibilityLabel(Text("Adjusted for this day")) }
                    if food.isRepeat { Image(systemName: "repeat").font(.caption).foregroundStyle(.secondary).accessibilityLabel(Text("Repeat item")) }
                }
                if !detail.isEmpty {
                    Text(detail).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                }
                if let note = food.note { Text(note).font(.footnote).italic().foregroundStyle(.secondary).lineLimit(1) }
            }
            Spacer()
            Text(Fmt.kcal(food.kcal)).monospacedDigit().foregroundStyle(.secondary)
        }
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
