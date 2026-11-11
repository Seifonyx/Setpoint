import SwiftUI

/// Tap a logged food: change how much you had (with live numbers), see its nutrition and its share of your day,
/// and move it, time it or note it. A saved meal logged as one entry shows its foods, each resizable or removable.
struct FoodDetailSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let food: FoodItem
    let day: String
    var kind: String? = nil

    @State private var info: FoodInfo?
    @State private var qtyText = ""
    @State private var unit = ""
    @State private var factor = 1.0            // for quick adds and meals: how many of the logged amount
    @State private var live: Totals?
    @State private var parts: [[String: JSONValue]] = []   // a meal's foods, as edited
    @State private var meal = ""
    @State private var hasTime = false
    @State private var time = Date()
    @State private var note = ""
    @State private var moreNutrients = false
    @State private var confirmDelete = false
    @State private var repeating = false

    private var repeatRec: [String: JSONValue]? {
        guard let rid = food.raw["rep"]?.string else { return nil }
        return (store.root["repeats"]?.array ?? []).compactMap { $0.object }.first { $0["id"]?.string == rid }
    }
    private var isMeal: Bool { !(food.raw["mi"]?.array ?? []).isEmpty }
    private var byFood: Bool { food.ref != nil && info != nil && !isMeal }
    private var qty: Double? { Double(qtyText.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")).flatMap { $0 > 0 ? $0 : nil } }
    private var base: Double { food.qty ?? info?.def.qty ?? 1 }
    private var shown: Totals { live ?? Totals(kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat) }

    var body: some View {
        NavigationStack {
            List {
                header
                portion
                if isMeal { mealFoods }
                share
                if byFood, info?.per100 != nil { nutrients }
                details
            }
            .listSectionSpacing(14)
            .brandList()
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        if food.isPlanned && day <= Day.today { Button("Mark as eaten", systemImage: "checkmark.circle") { store.markEaten(food, on: day); dismiss() } }
                        Button(repeatRec == nil ? "Repeat this food" : "Repeating", systemImage: "repeat") { repeating = true }
                        if isMeal { Button("Split into separate foods", systemImage: "square.split.2x2") { split() } }
                        Divider()
                        Button("Delete", systemImage: "trash", role: .destructive) { confirmDelete = true }
                    } label: { Image(systemName: "ellipsis") }
                }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save).buttonStyle(.glassProminent) }
            }
            .sheet(isPresented: $repeating) { RepeatSheet(item: repeatRec?["item"]?.object ?? food.raw, existing: repeatRec) }
            .confirmationDialog("Delete \(food.displayName)?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete", role: .destructive) { store.delete(food, on: day); dismiss() }
            }
            .task { await load() }
            .task(id: "\(qtyText)|\(unit)|\(factor)|\(parts.count)") { await recalc() }
        }
        .presentationDetents([.large])
        .sensoryFeedback(.selection, trigger: qtyText)
    }

    // MARK: Sections

    private var header: some View {
        Section {
            HStack(spacing: 14) {
                FoodIcon(kind: kind ?? (isMeal ? "dish" : food.ref == nil ? "quick" : "food"), size: 52, name: food.displayName)
                VStack(alignment: .leading, spacing: 3) {
                    Text(food.displayName).font(Brand.display(22, .bold)).lineLimit(3)
                    Text(subtitle).font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                }
            }
            HStack(alignment: .center, spacing: 18) {
                VStack(alignment: .leading, spacing: 0) {
                    Text(Fmt.kcal(shown.kcal)).font(Brand.display(46, .heavy)).monospacedDigit().contentTransition(.numericText())
                    Text("kcal").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                }
                Spacer()
                MacroDonut(p: shown.protein, c: shown.carbs, f: shown.fat).frame(width: 74, height: 74)
            }
            .padding(.vertical, 4)
            HStack(spacing: 10) {
                macro("Protein", shown.protein, Brand.protein)
                macro("Carbs", shown.carbs, Brand.carbs)
                macro("Fat", shown.fat, Brand.fat)
            }
        }
        .animation(.snappy, value: shown)
    }

    @ViewBuilder private var portion: some View {
        Section {
            HStack(spacing: 12) {
                stepButton("minus") { bump(-1) }
                VStack(spacing: 2) {
                    if byFood {
                        TextField("Amount", text: $qtyText).keyboardType(.decimalPad).multilineTextAlignment(.center)
                            .font(Brand.display(30, .bold)).monospacedDigit()
                        Menu {
                            Picker("Unit", selection: $unit) { ForEach(info?.units ?? [], id: \.label) { Text($0.display).tag($0.label) } }
                        } label: {
                            HStack(spacing: 3) { Text(info?.units.first { $0.label == unit }?.display ?? unit); Image(systemName: "chevron.up.chevron.down").font(.caption2) }
                                .font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.green)
                        }
                    } else {
                        Text(factor.formatted(.number.precision(.fractionLength(0...2))) + "×").font(Brand.display(30, .bold)).monospacedDigit()
                        Text(isMeal ? "of this meal" : "of the logged amount").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                    }
                }
                .frame(maxWidth: .infinity)
                stepButton("plus") { bump(1) }
            }
            HStack(spacing: 8) {
                ForEach([0.5, 1, 1.5, 2], id: \.self) { m in
                    let on = byFood ? (qty.map { abs($0 - base * m) < 0.001 } ?? false) : abs(factor - m) < 0.001
                    Button { setMultiple(m) } label: {
                        Text(m == 0.5 ? "½" : m == 1.5 ? "1½" : "\(Int(m))×").font(.brand(.subheadline, .semibold))
                            .frame(maxWidth: .infinity, minHeight: 34)
                            .background(on ? Brand.green : Brand.card2, in: Capsule())
                            .foregroundStyle(on ? Color(uiColor: .systemBackground) : Brand.ink)
                    }
                    .buttonStyle(.plain)
                }
            }
            if let g = gramsNow, byFood, unit != "g" {
                Text("\(Fmt.grams(g)) g").font(.brand(.footnote)).foregroundStyle(Brand.ink2)
            }
        } header: { Text("Portion") }
    }

    private var mealFoods: some View {
        Section {
            ForEach(parts.indices, id: \.self) { i in
                let it = parts[i]
                HStack(spacing: 10) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(it["name"]?.string ?? String(localized: "Quick add")).lineLimit(1)
                        if let q = it["qty"]?.number, let u = it["unit"]?.string { Text(Fmt.amount(q * factor, u)).font(.brand(.subheadline)).foregroundStyle(Brand.ink2) }
                    }
                    Spacer()
                    Text(Fmt.kcal((it["kcal"]?.number ?? 0) * factor)).font(.brand(.body, .semibold)).monospacedDigit()
                }
                .swipeActions { Button("Remove", systemImage: "minus.circle", role: .destructive) { withAnimation { _ = parts.remove(at: i) } } }
            }
        } header: { Text("In this meal") } footer: { Text("Swipe a food to take it out of this meal. ⋯ › Split turns it into separate foods.") }
    }

    @ViewBuilder private var share: some View {
        if let plan = store.plans[day] ?? store.plan(day) {
            Section {
                bar("Calories", shown.kcal, plan.kcal, Brand.green, "kcal")
                bar("Protein", shown.protein, plan.protein, Brand.protein, "g")
            } header: { Text("Of your day") }
        }
    }

    private var nutrients: some View {
        Section {
            DisclosureGroup("More nutrients", isExpanded: $moreNutrients) {
                if let p = info?.per100, let g = gramsNow {
                    let k = g / 100
                    if let v = p.fib { nutrient("Fiber", v * k, "g") }
                    if let v = p.sug { nutrient("Sugars", v * k, "g") }
                    if let v = p.sat { nutrient("Saturated fat", v * k, "g") }
                    if let v = p.na { nutrient("Sodium", v * k, "mg") }
                }
            }
            .tint(Brand.ink)
        }
    }

    private var details: some View {
        Section {
            Picker("Meal", selection: $meal) { ForEach(store.meals) { Text($0.name).tag($0.key) } }
            Toggle("Time eaten", isOn: $hasTime.animation())
            if hasTime { DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute) }
            TextField("Note", text: $note, axis: .vertical).lineLimit(1...4)
        } header: { Text("Details") }
    }

    // MARK: Bits

    private var subtitle: String {
        var s = [store.meals.first { $0.key == store.mealKey(of: food) }?.name ?? ""]
        if let t = food.time { s.append(t) }
        if food.isPlanned { s.append(String(localized: "Planned")) }
        if repeatRec != nil { s.append(String(localized: "Repeating")) }
        return s.filter { !$0.isEmpty }.joined(separator: " · ")
    }
    private var gramsNow: Double? {
        guard let q = qty, let u = info?.units.first(where: { $0.label == unit }) else { return nil }
        return q * u.g
    }
    private func macro(_ l: LocalizedStringKey, _ g: Double, _ c: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) { Circle().fill(c).frame(width: 7, height: 7); Text(l).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2) }
            Text("\(Fmt.grams(g)) g").font(Brand.display(19, .bold)).monospacedDigit().contentTransition(.numericText())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    private func bar(_ l: LocalizedStringKey, _ v: Double, _ t: Double, _ c: Color, _ u: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(l)
                Spacer()
                Text("\(Int((v / max(t, 1) * 100).rounded()))%").font(.brand(.body, .semibold)).monospacedDigit()
                Text("of \(Fmt.kcal(t)) \(u)").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.card2)
                    Capsule().fill(c).frame(width: g.size.width * min(1, v / max(t, 1)))
                }
            }
            .frame(height: 6)
        }
        .padding(.vertical, 2)
    }
    private func nutrient(_ l: LocalizedStringKey, _ v: Double, _ u: String) -> some View {
        LabeledContent(l) { Text("\(v.formatted(.number.precision(.fractionLength(0...1)))) \(u)").monospacedDigit() }
    }
    private func stepButton(_ icon: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon).font(.title3.weight(.bold)).foregroundStyle(Brand.green)
                .frame(width: 48, height: 48).background(Brand.greenSoft, in: Circle())
        }
        .buttonStyle(.plain)
    }
    /// − / +: by one unit for countable units, by a quarter of the usual amount for grams.
    private func bump(_ dir: Double) {
        if byFood {
            let q = qty ?? base
            let step = unit == "g" || unit == "ml" ? max(5, (base / 4).rounded()) : (q < 1 || (q.truncatingRemainder(dividingBy: 1) != 0) ? 0.5 : 1)
            let v = max(step, q + dir * step)
            qtyText = v.formatted(.number.precision(.fractionLength(0...2)).grouping(.never).locale(Locale(identifier: "en_US_POSIX")))
        } else {
            factor = max(0.25, ((factor + dir * 0.25) * 4).rounded() / 4)
        }
    }
    private func setMultiple(_ m: Double) {
        if byFood { qtyText = (base * m).formatted(.number.precision(.fractionLength(0...2)).grouping(.never).locale(Locale(identifier: "en_US_POSIX"))) }
        else { factor = m }
    }

    private func load() async {
        meal = store.mealKey(of: food)
        note = food.note ?? ""
        if let t = food.time {
            let p = t.split(separator: ":").compactMap { Int($0) }
            if p.count == 2, let d = Calendar.current.date(bySettingHour: p[0], minute: p[1], second: 0, of: Date()) { time = d; hasTime = true }
        }
        parts = (food.raw["mi"]?.array ?? []).compactMap { $0.object }
        guard !isMeal, let ref = food.ref, let i = await store.engineRef.food(ref, meal: food.meal) else { return }
        info = i
        qtyText = (food.qty ?? i.def.qty).formatted(.number.precision(.fractionLength(0...3)).grouping(.never).locale(Locale(identifier: "en_US_POSIX")))
        unit = food.unit ?? i.def.unit
    }
    private func recalc() async {
        if byFood, let q = qty, let m = await store.engineRef.macros(food.ref!, qty: q, unit: unit) {
            live = Totals(kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat)
        } else if isMeal {
            let t = parts.reduce(into: Totals()) { t, x in t.kcal += x["kcal"]?.number ?? 0; t.protein += x["protein"]?.number ?? 0; t.carbs += x["carbs"]?.number ?? 0; t.fat += x["fat"]?.number ?? 0 }
            live = Totals(kcal: t.kcal * factor, protein: t.protein * factor, carbs: t.carbs * factor, fat: t.fat * factor)
        } else if !byFood {
            live = Totals(kcal: food.kcal * factor, protein: food.protein * factor, carbs: food.carbs * factor, fat: food.fat * factor)
        }
    }

    private func save() {
        var t: String?
        if hasTime { let c = Calendar.current.dateComponents([.hour, .minute], from: time); t = String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0) }
        Task {
            var raw = food.raw
            if byFood, let q = qty, q != food.qty || unit != food.unit, let r = await store.engineRef.reamount(food.raw, qty: q, unit: unit) {
                raw = r
            } else if isMeal || !byFood {
                let originalParts = (food.raw["mi"]?.array ?? []).compactMap { $0.object }
                if factor != 1 || parts.count != originalParts.count {
                    func scale(_ o: [String: JSONValue]) -> [String: JSONValue] {
                        var x = o
                        for k in ["kcal", "protein", "carbs", "fat", "g", "qty"] { if let v = x[k]?.number { x[k] = .number(k == "qty" || k == "g" ? (v * factor * 1000).rounded() / 1000 : (v * factor).rounded()) } }
                        return x
                    }
                    if isMeal { raw["mi"] = .array(parts.map { .object(scale($0)) }) }
                    let s = shown
                    raw["kcal"] = .number(min(10000, s.kcal.rounded())); raw["protein"] = .number(s.protein.rounded())
                    raw["carbs"] = .number(s.carbs.rounded()); raw["fat"] = .number(s.fat.rounded())
                }
            }
            if raw != food.raw { store.replace(food, with: raw, on: day) }
            if let fresh = store.items(day).first(where: { $0.id == food.id }) {
                store.updateDetails(fresh, on: day, time: t, meal: meal, note: note)
            }
            dismiss()
        }
    }
    /// A meal logged as one entry becomes its foods, each on its own.
    private func split() {
        let items: [[String: JSONValue]] = parts.map { var x = $0; x["meal"] = .string(store.mealKey(of: food)); x.removeValue(forKey: "id"); if let t = food.time { x["t"] = .string(t) }; return x }
        store.delete(food, on: day)
        store.add(items, to: day, label: String(localized: "Split into \(items.count) foods"))
        dismiss()
    }
}

/// Where a food's calories come from: protein, carbs and fat as a small ring.
struct MacroDonut: View {
    let p: Double, c: Double, f: Double
    var body: some View {
        let kp = p * 4, kc = c * 4, kf = f * 9, t = max(kp + kc + kf, 0.0001)
        ZStack {
            Circle().stroke(Brand.card2, lineWidth: 10)
            if kp + kc + kf > 0 {
                seg(0, kp / t, Brand.protein)
                seg(kp / t, (kp + kc) / t, Brand.carbs)
                seg((kp + kc) / t, 1, Brand.fat)
            }
        }
        .padding(5)
        .accessibilityHidden(true)
    }
    private func seg(_ a: Double, _ b: Double, _ col: Color) -> some View {
        Circle().trim(from: a + 0.006, to: max(a + 0.006, b - 0.006)).stroke(col, style: StrokeStyle(lineWidth: 10, lineCap: .butt)).rotationEffect(.degrees(-90))
    }
}
