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
    @State private var openID: String?
    @AppStorage("closedMeals") private var closedMeals = ""
    private var expanded: Bool { !closedMeals.split(separator: ",").contains(Substring(meal.key)) }
    private func toggleOpen() {
        var set = Set(closedMeals.split(separator: ",").map(String.init))
        if expanded { set.insert(meal.key) } else { set.remove(meal.key) }
        withAnimation(.snappy) { closedMeals = set.sorted().joined(separator: ",") }
    }
    @State private var naming = false
    @State private var summary = false
    @State private var mealName = ""

    private var foods: [FoodItem] { store.items(day).filter { store.mealKey(of: $0) == meal.key && !$0.isDailyTotal } }
    private var counted: [FoodItem] { foods.filter { !$0.isPlanned || day > Day.today } }

    var body: some View {
        Section {
            // the meal's heading, inside its card (like Cronometer): + adds, the name opens the meal, the chevron folds it
            Group {
            HStack(alignment: .center, spacing: 8) {
                // + adds to this meal; the name opens the meal; the chevron folds it
                Button(action: addFood) {
                    Image(systemName: "plus").font(.body.weight(.bold)).foregroundStyle(Brand.green)
                        .frame(width: 30, height: 30).background(Brand.greenSoft, in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text("Add food to \(meal.name)"))
                Button { summary = true } label: {
                    Text(meal.name).font(Brand.display(20, .bold)).foregroundStyle(Brand.ink).contentShape(.rect)
                }
                .buttonStyle(.plain)
                Button(action: toggleOpen) {
                    HStack(spacing: 6) {
                        Image(systemName: "chevron.down").font(.brand(.caption, .bold)).foregroundStyle(Brand.ink2)
                            .rotationEffect(.degrees(expanded ? 0 : -90))
                        if !expanded && !foods.isEmpty {
                            Text("\(foods.count)").font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
                                .padding(.horizontal, 6).padding(.vertical, 1).background(Brand.card2, in: Capsule())
                        }
                    }
                    .frame(minWidth: 28, minHeight: 28).contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(expanded ? "Collapse \(meal.name)" : "Expand \(meal.name)"))
                Spacer()
                if !counted.isEmpty {
                    Text("\(Fmt.kcal(counted.reduce(0) { $0 + $1.kcal })) kcal").font(.brand(.subheadline, .semibold)).monospacedDigit().foregroundStyle(Brand.ink2)
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
                    Image(systemName: "ellipsis").font(.brand(.body, .semibold)).frame(width: 30, height: 24).contentShape(.rect)
                }
                .accessibilityLabel(Text("\(meal.name) options"))
            }
            }
            .padding(.vertical, 2)
            .listRowSeparator(expanded && !foods.isEmpty ? .visible : .hidden, edges: .bottom)
            if expanded {
            ForEach(foods) { food in
                // tap a food: it opens in place (amount, macros, actions); tap again to fold it
                VStack(spacing: 0) {
                    Button { withAnimation(Motion.gentle) { openID = openID == food.id ? nil : food.id } } label: {
                        FoodRow(food: food, day: day, kind: kinds[food.id])
                    }
                    .buttonStyle(.plain)
                    if openID == food.id {
                        FoodQuickEdit(food: food, day: day) { open = food }
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
                .listRowBackground(store.justAdded.contains(food.id) ? Brand.greenSoft : Brand.card)
                .animation(.easeOut(duration: 0.9), value: store.justAdded.contains(food.id))
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
            }
        }
        .sheet(item: $open) { f in FoodDetailSheet(food: f, day: day, kind: kinds[f.id]) }
        .sheet(isPresented: $summary) {
            MealSummarySheet(meal: meal, day: day, kinds: kinds, addFood: { summary = false; addFood() },
                             saveAs: { summary = false; mealName = meal.name; naming = true }, copy: { summary = false; copying = foods })
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
            if f == "food" { open = foods.first } else if f == "meal" { summary = true }
            if UserDefaults.standard.bool(forKey: "expand") { openID = foods.first?.id }
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
            Text(Fmt.kcal(food.kcal)).font(Brand.num(20, .semibold)).monospacedDigit().foregroundStyle(Brand.ink)
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
            Text("\(Fmt.grams(g)) g").font(Brand.num(23, .semibold)).monospacedDigit()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// A food opened in place in the Diary: its macros, quick amounts (½×, 1×, 1½×, 2×), and the full editor or delete.
struct FoodQuickEdit: View {
    let food: FoodItem
    let day: String
    let more: () -> Void
    @Environment(Store.self) private var store
    @State private var base: (qty: Double, unit: String)?

    var body: some View {
        VStack(alignment: .leading, spacing: Space.m) {
            HStack(spacing: Space.l) {
                macro("Protein", food.protein, Brand.protein)
                macro("Carbs", food.carbs, Brand.carbs)
                macro("Fat", food.fat, Brand.fat)
                Spacer()
            }
            if let b = base, food.ref != nil, (food.raw["mi"]?.array ?? []).isEmpty {
                HStack(spacing: Space.s) {
                    ForEach([0.5, 1, 1.5, 2], id: \.self) { f in
                        let q = b.qty * f
                        let on = abs((food.qty ?? 0) - q) < 0.001
                        Button { Task { await set(q, b.unit) } } label: {
                            Text(Fmt.amount(q, b.unit)).font(.brand(.caption, .semibold)).lineLimit(1).minimumScaleFactor(0.7)
                                .padding(.horizontal, 10).frame(maxWidth: .infinity, minHeight: 32)
                                .background(on ? Brand.green : Brand.card2, in: Capsule())
                                .foregroundStyle(on ? Brand.onGreen : Brand.ink)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            HStack {
                Button(action: more) { Label("More", systemImage: "slider.horizontal.3").font(.brand(.subheadline, .semibold)) }
                    .buttonStyle(.plain).foregroundStyle(Brand.green)
                Spacer()
                Button(role: .destructive) { withAnimation { store.delete(food, on: day) } } label: {
                    Label("Delete", systemImage: "trash").font(.brand(.subheadline, .semibold))
                }
                .buttonStyle(.plain).foregroundStyle(Brand.over)
            }
        }
        .padding(.top, Space.m).padding(.bottom, Space.xs)
        .onAppear { if base == nil, let q = food.qty, let u = food.unit { base = (q, u) } } // the chips scale the amount you opened it at
    }

    private func macro(_ name: LocalizedStringKey, _ g: Double, _ c: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(name).font(.brand(.caption2, .semibold)).foregroundStyle(Brand.ink2)
            HStack(spacing: 4) {
                Circle().fill(c).frame(width: 6, height: 6)
                Text("\(Fmt.grams(g)) g").font(Brand.num(18, .semibold)).monospacedDigit()
            }
        }
    }
    private func set(_ qty: Double, _ unit: String) async {
        guard let raw = await store.engineRef.reamount(food.raw, qty: qty, unit: unit) else { return }
        withAnimation(Motion.snappy) { store.replace(food, with: raw, on: day) }
    }
}
