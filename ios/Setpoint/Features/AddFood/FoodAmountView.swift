import SwiftUI

/// One food: pick the amount and unit (your usual is filled in), see what it adds, and add it to the meal.
struct FoodAmountView: View {
    @Environment(Store.self) private var store
    let foodID: String
    @State var meal: String
    let day: String
    let done: () -> Void
    /// Set when picking an ingredient for a recipe: hands the item back instead of logging it.
    var pick: (([String: JSONValue]) -> Void)? = nil
    @State private var info: FoodInfo?
    @State private var qtyText = "1"
    @State private var unit = ""
    @State private var macros: Macros?
    @State private var fav = false
    @FocusState private var focused: Bool

    @State private var base: Double = 1
    private var dayLeft: Double? {
        guard let p = store.plans[day] ?? store.plan(day) else { return nil }
        return p.kcal - store.totals(day).kcal
    }
    private var qty: Double? { Double(qtyText.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")).flatMap { $0 > 0 ? $0 : nil } }

    var body: some View {
        Form {
            if let info {
                Section {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(info.name).font(.brand(.title3, .semibold))
                        if let c = info.cat { Text(LocalizedStringKey(c)).font(.brand(.subheadline)).foregroundStyle(.secondary) }
                        if info.est { Text("Estimate").font(.brand(.caption)).foregroundStyle(Brand.amber) }
                    }
                    .padding(.vertical, 2)
                }
                Section("Amount") {
                    // quick servings: half, one, one and a half, two of your usual amount
                    HStack(spacing: 8) {
                        ForEach([0.5, 1, 1.5, 2], id: \.self) { m in
                            let v = base * m
                            Button { qtyText = v.formatted(.number.grouping(.never).precision(.fractionLength(0...2)).locale(Locale(identifier: "en_US_POSIX"))) } label: {
                                Text(m == 0.5 ? "½" : m == 1.5 ? "1½" : "\(Int(m))×")
                                    .font(.brand(.subheadline, .semibold)).frame(maxWidth: .infinity, minHeight: 34)
                                    .background(qty == v ? Brand.green : Brand.card2, in: Capsule())
                                    .foregroundStyle(qty == v ? Color(uiColor: .systemBackground) : Brand.ink)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    HStack {
                        TextField("Amount", text: $qtyText).keyboardType(.decimalPad).focused($focused)
                            .font(.brand(.title2, .semibold)).frame(maxWidth: 110)
                        Picker("Unit", selection: $unit) { ForEach(info.units, id: \.label) { Text($0.display).tag($0.label) } }
                            .labelsHidden()
                    }
                    Picker("Meal", selection: $meal) { ForEach(store.meals) { Text($0.name).tag($0.key) } }
                }
                if let m = macros, let left = dayLeft {
                    Section {
                        let after = left - m.kcal
                        HStack {
                            Text(after >= 0 ? "Leaves \(Fmt.kcal(after)) kcal for today" : "\(Fmt.kcal(-after)) kcal over today's target")
                                .font(.brand(.subheadline, .semibold)).foregroundStyle(after >= 0 ? Brand.green : Brand.over)
                            Spacer()
                        }
                        .contentTransition(.numericText())
                    }
                }
                Section {
                    LabeledContent("Calories") { Text("\(Fmt.kcal(macros?.kcal ?? 0)) kcal").monospacedDigit().contentTransition(.numericText()) }
                    LabeledContent("Protein") { Text("\(Fmt.grams(macros?.protein ?? 0)) g").monospacedDigit() }
                    LabeledContent("Carbs") { Text("\(Fmt.grams(macros?.carbs ?? 0)) g").monospacedDigit() }
                    LabeledContent("Fat") { Text("\(Fmt.grams(macros?.fat ?? 0)) g").monospacedDigit() }
                    if let g = macros?.g, unit != "g" { LabeledContent("Weight") { Text("\(Fmt.grams(g)) g").foregroundStyle(.secondary) } }
                }
                Section("Per 100 g") {
                    let p = info.per100
                    if let v = p.fib { LabeledContent("Fiber") { Text("\(v.formatted(.number.precision(.fractionLength(0...1)))) g") } }
                    if let v = p.sug { LabeledContent("Sugars") { Text("\(v.formatted(.number.precision(.fractionLength(0...1)))) g") } }
                    if let v = p.sat { LabeledContent("Saturated fat") { Text("\(v.formatted(.number.precision(.fractionLength(0...1)))) g") } }
                    if let v = p.na { LabeledContent("Sodium") { Text("\(Int(v.rounded())) mg") } }
                }
            } else {
                ProgressView()
            }
        }
        .brandList()
        .navigationTitle("Food")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(fav ? "Remove from favorites" : "Add to favorites", systemImage: fav ? "star.fill" : "star") { toggleFav() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Add", action: add).disabled(qty == nil || info == nil).buttonStyle(.glassProminent)
            }
        }
        .task {
            info = await store.engineRef.food(foodID, meal: meal)
            if let d = info?.def { base = d.qty; qtyText = d.qty.formatted(.number.precision(.fractionLength(0...2)).grouping(.never).locale(Locale(identifier: "en_US_POSIX"))); unit = d.unit }
            fav = info?.fav ?? false
        }
        .task(id: "\(qtyText)|\(unit)") {
            guard let q = qty, !unit.isEmpty else { return }
            let m = await store.engineRef.macros(foodID, qty: q, unit: unit)
            withAnimation(.snappy) { macros = m }
        }
        .sensoryFeedback(.selection, trigger: unit)
    }

    private func add() {
        guard let q = qty else { return }
        Task {
            guard let item = await store.engineRef.item(foodID, qty: q, unit: unit, meal: meal) else { return }
            if let pick { pick(item); done(); return }
            store.add([item], to: day, label: String(localized: "Added \(info?.name ?? "")"))
            done()
        }
    }
    private func toggleFav() {
        Task {
            if let favs = await store.engineRef.toggleFavorite(foodID) { store.setRoot("favs", favs) }
            fav.toggle()
        }
    }
}

/// Calories and macros without a food from the list.
struct QuickAddView: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let meal: String
    let day: String
    let done: () -> Void
    @State private var name = ""
    @State private var kcal = ""
    @State private var protein = ""
    @State private var carbs = ""
    @State private var fat = ""

    private func num(_ s: String) -> Double? { Double(s.replacingOccurrences(of: ",", with: ".")) }

    var body: some View {
        NavigationStack {
            Form {
                Section { TextField("Name (optional)", text: $name) }
                Section {
                    field("Calories", $kcal, "kcal")
                    field("Protein", $protein, "g")
                    field("Carbs", $carbs, "g")
                    field("Fat", $fat, "g")
                } footer: {
                    if num(kcal) == nil, let t = total {
                        Text("About \(Fmt.kcal(t)) kcal from the macros")
                    }
                }
            }
            .brandList()
            .navigationTitle("Quick add")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Add", action: add).disabled(total == nil) }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var total: Double? {
        if let k = num(kcal), k > 0 { return k }
        let m = (num(protein) ?? 0) * 4 + (num(carbs) ?? 0) * 4 + (num(fat) ?? 0) * 9
        return m > 0 ? m : nil
    }
    private func field(_ label: LocalizedStringKey, _ text: Binding<String>, _ unit: LocalizedStringKey) -> some View {
        HStack {
            Text(label)
            Spacer()
            TextField("0", text: text).keyboardType(.decimalPad).multilineTextAlignment(.trailing).frame(maxWidth: 90)
            Text(unit).foregroundStyle(.secondary)
        }
    }
    private func add() {
        guard let k = total else { return }
        let raw: [String: JSONValue] = ["name": .string(name.trimmingCharacters(in: .whitespaces)), "kcal": .number(min(10000, k.rounded())),
            "protein": .number((num(protein) ?? 0).rounded()), "carbs": .number((num(carbs) ?? 0).rounded()), "fat": .number((num(fat) ?? 0).rounded()), "meal": .string(meal)]
        store.add([raw], to: day, label: String(localized: "Quick add saved"))
        dismiss(); done()
    }
}
