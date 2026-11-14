import SwiftUI

/// Tap a logged food: how much you had (the number and its unit, with the calories beside them), its protein, carbs
/// and fat against today's targets, and its vitamins and minerals. A meal or a recipe also lists what's in it, each
/// one changeable for this day. Nothing else: moving, repeating and deleting are in the ⋯ menu.
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
    @State private var partsEdited = false
    @State private var recipe: [String: JSONValue]?         // a recipe's ingredients for this day
    @State private var recipeEdited = false
    @State private var resetRecipe = false
    @State private var editingPart: PartJob?
    struct PartJob: Identifiable { let id = UUID(); let index: Int; let part: [String: JSONValue]; let inRecipe: Bool }
    @State private var meal = ""
    @State private var hasTime = false
    @State private var time = Date()
    @State private var note = ""
    @State private var rows: [NutrientRow] = []
    @State private var allNutrients = false
    @State private var confirmDelete = false
    @State private var repeating = false

    private var repeatRec: [String: JSONValue]? {
        guard let rid = food.raw["rep"]?.string else { return nil }
        return (store.root["repeats"]?.array ?? []).compactMap { $0.object }.first { $0["id"]?.string == rid }
    }
    private var isMeal: Bool { !(food.raw["mi"]?.array ?? []).isEmpty }
    private var isRecipe: Bool { food.ref?.hasPrefix("r") == true }
    private var recipeItems: [[String: JSONValue]] { (recipe?["items"]?.array ?? []).compactMap { $0.object } }
    private var byFood: Bool { food.ref != nil && info != nil && !isMeal }
    private var qty: Double? { Double(qtyText.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")).flatMap { $0 > 0 ? $0 : nil } }
    private var base: Double { food.qty ?? info?.def.qty ?? 1 }
    private var shown: Totals { live ?? Totals(kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat) }

    var body: some View {
        NavigationStack {
            List {
                summary
                if isMeal { mealFoods }
                if isRecipe && recipe != nil { recipeFoods }
                if !rows.isEmpty { nutrientList }
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
                        Menu("Move to", systemImage: "arrow.right") {
                            ForEach(store.meals.filter { $0.key != store.mealKey(of: food) }) { m in
                                Button(m.name) { store.move(food, to: m.key, on: day); dismiss() }
                            }
                        }
                        Divider()
                        Button("Delete", systemImage: "trash", role: .destructive) { confirmDelete = true }
                    } label: { Image(systemName: "ellipsis") }
                }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save).buttonStyle(.glassProminent).tint(Brand.green) }
            }
            .sheet(item: $editingPart) { job in
                PartAmountSheet(part: job.part) { updated in
                    if job.inRecipe {
                        var items = recipe?["items"]?.array ?? []
                        if job.index < items.count { items[job.index] = .object(updated) }
                        recipe?["items"] = .array(items); recipeEdited = true
                    } else if job.index < parts.count {
                        parts[job.index] = updated; partsEdited = true
                    }
                }
            }
            .sheet(isPresented: $repeating) { RepeatSheet(item: repeatRec?["item"]?.object ?? food.raw, existing: repeatRec) }
            .confirmationDialog("Delete \(food.displayName)?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete", role: .destructive) { store.delete(food, on: day); dismiss() }
            }
            .task { await load() }
            .task(id: "\(qtyText)|\(unit)|\(factor)|\(parts.count)|\(partsEdited)|\(parts.description.count)|\(recipe?.description.count ?? 0)") { await recalc() }
        }
        .presentationDetents([.large])
        .sensoryFeedback(.selection, trigger: qtyText)
    }

    private var iconKind: String { isMeal ? "meal" : isRecipe ? "recipe" : kind ?? (food.ref == nil ? "quick" : "food") }

    // MARK: Sections

    /// One card: the food, its amount on a single line (number, unit, calories), and protein, carbs and fat.
    private var summary: some View {
        let plan = store.plans[day] ?? store.plan(day)
        return Section {
            HStack(spacing: 12) {
                FoodIcon(kind: iconKind, size: 40, name: food.displayName)
                VStack(alignment: .leading, spacing: 2) {
                    Text(food.displayName).font(Brand.display(20, .bold)).lineLimit(2)
                    if !source.isEmpty { Text(source).font(.brand(.caption)).foregroundStyle(Brand.ink2) }
                }
            }
            .padding(.vertical, 6)
            .listRowBackground(Wash(color: FoodIcon.colors[iconKind] ?? Brand.green))
            // the amount, on one line (not for meals and recipes: you change what's in them instead)
            if !isMeal && !isRecipe { HStack(spacing: 10) {
                Text("Amount").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                Spacer()
                if byFood {
                    TextField("Amount", text: $qtyText).keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                        .font(Brand.num(22, .semibold)).monospacedDigit().frame(width: 76)
                        .padding(.horizontal, 8).padding(.vertical, 4).background(Brand.card2, in: .rect(cornerRadius: Radius.chip))
                    UnitButton(units: info?.units ?? [], unit: $unit, qtyText: $qtyText).fixedSize()
                } else {
                    Stepper(value: $factor, in: 0.25...10, step: 0.25) {
                        Text(Fmt.fraction(factor) + "×").font(Brand.num(22, .semibold)).monospacedDigit().frame(maxWidth: .infinity, alignment: .trailing)
                    }
                    .fixedSize()
                }
            } }
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 5) {
                    Text("Calories").font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
                    Text(Fmt.kcal(shown.kcal)).font(Brand.num(22, .semibold)).monospacedDigit().contentTransition(.numericText())
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                macroBar("Protein", shown.protein, plan?.protein, Brand.protein)
                macroBar("Carbs", shown.carbs, plan?.carbs, Brand.carbs)
                macroBar("Fat", shown.fat, plan?.fat, Brand.fat)
            }
            .padding(.vertical, 2)
        }
        .animation(.snappy, value: shown)
    }

    private func macroBar(_ l: LocalizedStringKey, _ g: Double, _ t: Double?, _ c: Color) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(l).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text("\(Fmt.grams(g)) g").font(Brand.num(18, .semibold)).monospacedDigit().contentTransition(.numericText())
                if let t, t > 0 { Text("\(Int((g / t * 100).rounded()))%").font(.brand(.caption)).foregroundStyle(Brand.ink2).monospacedDigit() }
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.card2)
                    Capsule().fill(c).frame(width: geo.size.width * min(1, g / max(t ?? g, 1)))
                }
            }
            .frame(height: 5)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var mealFoods: some View {
        Section {
            ForEach(parts.indices, id: \.self) { i in
                let it = parts[i]
                Button { if it["ref"]?.string != nil { editingPart = PartJob(index: i, part: it, inRecipe: false) } } label: {
                HStack(spacing: 10) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(it["name"]?.string ?? String(localized: "Quick add")).lineLimit(1)
                        if let q = it["qty"]?.number, let u = it["unit"]?.string { Text(Fmt.amount(q * factor, u)).font(.brand(.subheadline)).foregroundStyle(Brand.ink2) }
                    }
                    Spacer()
                    Text(Fmt.kcal((it["kcal"]?.number ?? 0) * factor)).font(.brand(.body, .semibold)).monospacedDigit()
                    if it["ref"]?.string != nil { Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Brand.ink2) }
                }
                .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .swipeActions { Button("Remove", systemImage: "minus.circle", role: .destructive) { withAnimation { _ = parts.remove(at: i); partsEdited = true } } }
            }
        } header: { Text("In this meal") } footer: { Text("Tap a food to change it, swipe to remove. For this day only.") }
    }

    private var recipeFoods: some View {
        Section {
            ForEach(recipeItems.indices, id: \.self) { i in
                let it = recipeItems[i]
                Button { editingPart = PartJob(index: i, part: it, inRecipe: true) } label: {
                    HStack(spacing: 10) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(it["name"]?.string ?? "").lineLimit(1)
                            if let q = it["qty"]?.number, let u = it["unit"]?.string { Text(Fmt.amount(q, u)).font(.brand(.subheadline)).foregroundStyle(Brand.ink2) }
                        }
                        Spacer()
                        Text(Fmt.kcal(it["kcal"]?.number ?? 0)).font(.brand(.body, .semibold)).monospacedDigit()
                        Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Brand.ink2)
                    }
                    .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .swipeActions {
                    Button("Remove", systemImage: "minus.circle", role: .destructive) {
                        var items = recipe?["items"]?.array ?? []; items.remove(at: i); recipe?["items"] = .array(items); recipeEdited = true
                    }
                }
            }
            if food.raw["rc"] != nil || recipeEdited {
                Button("Use the saved recipe", systemImage: "arrow.uturn.backward") { resetRecipe = true; recipeEdited = false; Task { await loadRecipe(saved: true) } }
                    
            }
        } header: { Text("Ingredients") } footer: { Text("Tap an ingredient to change it, swipe to remove. For this day only.") }
    }

    /// Vitamins, minerals and fiber in this amount, as a share of your daily targets (most covered first).
    private var nutrientList: some View {
        let sorted = rows.sorted { pct($0) > pct($1) }
        let shownRows = allNutrients ? sorted : Array(sorted.prefix(6))
        return Section {
            ForEach(shownRows) { r in
                let p = pct(r), limit = r.goal == nil && r.hi != nil
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(r.label).font(.brand(.subheadline))
                        Spacer()
                        Text(amountText(r)).font(.brand(.footnote)).foregroundStyle(Brand.ink2).monospacedDigit()
                        Text(p > 0 ? "\(Int((p * 100).rounded()))%" : "–").font(.brand(.subheadline, .semibold)).monospacedDigit()
                            .frame(minWidth: 44, alignment: .trailing)
                    }
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Brand.card2)
                            Capsule().fill(limit ? (p > 1 ? Brand.over : Brand.ink2) : Brand.green).frame(width: g.size.width * min(1, p))
                        }
                    }
                    .frame(height: 4)
                }
                .padding(.vertical, 2)
            }
            if rows.count > 6 {
                Button(allNutrients ? "Show fewer" : "Show all \(rows.count)") { withAnimation(.snappy) { allNutrients.toggle() } }
                    .font(.brand(.subheadline, .semibold))
            }
        } header: { Text("Nutrients") } footer: { Text("Share of your daily targets.") }
    }
    private func pct(_ r: NutrientRow) -> Double { let t = r.goal ?? r.hi ?? 0; return t > 0 ? r.v / t : 0 }
    private func amountText(_ r: NutrientRow) -> String {
        (r.v >= 10 ? Int(r.v.rounded()).formatted() : r.v.formatted(.number.precision(.fractionLength(0...1)))) + " " + r.unit
    }

    // MARK: Bits

    /// Where the food comes from, in a few words.
    private var source: String {
        var s: [String] = []
        if isMeal { s.append(String(localized: "Meal · \(parts.count) foods")) }
        else if isRecipe { s.append(String(localized: "Recipe")) }
        else if info?.custom == true { s.append(String(localized: "My food")) }
        else if info?.est == true { s.append(String(localized: "Estimate")) }
        else if food.ref?.hasPrefix("u") == true { s.append("USDA") }
        else if food.ref == nil { s.append(String(localized: "Quick add")) }
        if food.isPlanned { s.append(String(localized: "Planned")) }
        if repeatRec != nil { s.append(String(localized: "Repeating")) }
        return s.joined(separator: " · ")
    }
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
            Text("\(Fmt.grams(g)) g").font(Brand.num(22, .semibold)).monospacedDigit().contentTransition(.numericText())
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
        if isRecipe { await loadRecipe(saved: false) }
        guard !isMeal, let ref = food.ref, let i = await store.engineRef.food(ref, meal: food.meal) else { return }
        info = i
        qtyText = (food.qty ?? i.def.qty).formatted(.number.precision(.fractionLength(0...3)).grouping(.never).locale(Locale(identifier: "en_US_POSIX")))
        unit = food.unit ?? i.def.unit
    }
    private func loadRecipe(saved: Bool) async {
        var raw = food.raw
        if saved { raw.removeValue(forKey: "rc") }
        recipe = await store.engineRef.recipeOf(raw)
    }
    /// The item as it would be saved: new amount, then (for recipes) this day's ingredients.
    private func edited() async -> [String: JSONValue] {
        var raw = food.raw
        if byFood, let q = qty, q != food.qty || unit != food.unit, let r = await store.engineRef.reamount(raw, qty: q, unit: unit) { raw = r }
        if isRecipe && (recipeEdited || resetRecipe) {
            if let r = await store.engineRef.applyRecipe(raw, recipeEdited ? recipe : nil) { raw = r }
        }
        return raw
    }
    private func recalc() async {
        let r = await edited()
        let list = await store.engineRef.itemNutrientRows(r)
        let k = byFood ? 1 : factor
        rows = list.map { NutrientRow(key: $0.key, label: $0.label, unit: $0.unit, v: $0.v * k, goal: $0.goal, hi: $0.hi) }
        if isRecipe && (recipeEdited || resetRecipe) {
            let r = await edited()
            live = Totals(kcal: r["kcal"]?.number ?? 0, protein: r["protein"]?.number ?? 0, carbs: r["carbs"]?.number ?? 0, fat: r["fat"]?.number ?? 0)
        } else if byFood, let q = qty, let m = await store.engineRef.macros(food.ref!, qty: q, unit: unit) {
            live = Totals(kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat)
        } else if isMeal {
            let t = parts.reduce(into: Totals()) { t, x in t.kcal += x["kcal"]?.number ?? 0; t.protein += x["protein"]?.number ?? 0; t.carbs += x["carbs"]?.number ?? 0; t.fat += x["fat"]?.number ?? 0 }
            live = Totals(kcal: t.kcal * factor, protein: t.protein * factor, carbs: t.carbs * factor, fat: t.fat * factor)
        } else if !byFood {
            live = Totals(kcal: food.kcal * factor, protein: food.protein * factor, carbs: food.carbs * factor, fat: food.fat * factor)
        }
    }

    private func save() {
        Task {
            var raw = await edited()
            if isMeal || !byFood {
                if factor != 1 || partsEdited {
                    func scale(_ o: [String: JSONValue]) -> [String: JSONValue] {
                        var x = o
                        for k in ["kcal", "protein", "carbs", "fat", "g", "qty"] { if let v = x[k]?.number { x[k] = .number(k == "qty" || k == "g" ? (v * factor * 1000).rounded() / 1000 : (v * factor).rounded()) } }
                        return x
                    }
                    if isMeal { raw["mi"] = .array(parts.map { .object(scale($0)) }); raw["adj"] = .bool(true) } // adjusted for this day, like the web app
                    let s = shown
                    raw["kcal"] = .number(min(10000, s.kcal.rounded())); raw["protein"] = .number(s.protein.rounded())
                    raw["carbs"] = .number(s.carbs.rounded()); raw["fat"] = .number(s.fat.rounded())
                }
            }
            if raw != food.raw { store.replace(food, with: raw, on: day) }
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

/// Change the amount of one food inside a logged meal or recipe (this day only).
struct PartAmountSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let part: [String: JSONValue]
    let done: ([String: JSONValue]) -> Void
    @State private var units: [FoodUnit] = []
    @State private var qtyText = ""
    @State private var unit = ""
    @State private var kcal: Double?

    private var qty: Double? { Double(qtyText.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")).flatMap { $0 > 0 ? $0 : nil } }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 12) {
                        TextField("Amount", text: $qtyText).keyboardType(.decimalPad).font(Brand.num(28, .semibold)).monospacedDigit().frame(maxWidth: 120)
                        Spacer(minLength: 0)
                        UnitButton(units: units, unit: $unit, qtyText: $qtyText)
                    }
                    if let k = kcal { LabeledContent("Calories") { Text("\(Fmt.kcal(k)) kcal").monospacedDigit().contentTransition(.numericText()) } }
                } header: { Text(part["name"]?.string ?? "") }
            }
            .brandList()
            .navigationTitle("Amount")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Done", action: save).disabled(qty == nil) }
            }
            .task {
                guard let ref = part["ref"]?.string, let info = await store.engineRef.food(ref, meal: "lunch") else { return }
                units = info.units
                unit = part["unit"]?.string ?? info.def.unit
                qtyText = (part["qty"]?.number ?? info.def.qty).formatted(.number.precision(.fractionLength(0...2)).grouping(.never).locale(Locale(identifier: "en_US_POSIX")))
            }
            .task(id: "\(qtyText)|\(unit)") {
                guard let ref = part["ref"]?.string, let q = qty, !unit.isEmpty else { return }
                kcal = await store.engineRef.macros(ref, qty: q, unit: unit)?.kcal
            }
        }
        .presentationDetents([.height(280)])
    }
    private func save() {
        guard let q = qty else { return }
        Task {
            var raw = part
            if raw["meal"] == nil { raw["meal"] = .string("lunch") } // reamount needs a full item; recipe ingredients keep only their own fields
            if var r = await store.engineRef.reamount(raw, qty: q, unit: unit) {
                if part["meal"] == nil { r.removeValue(forKey: "meal") }
                done(r)
            }
            dismiss()
        }
    }
}

/// A flat, faint tint of the food's colour behind its name: no blur, no glow.
struct Wash: View {
    let color: Color
    @Environment(\.colorScheme) private var scheme
    var body: some View {
        ZStack { Brand.card; color.opacity(scheme == .dark ? 0.14 : 0.10) }
            .overlay(TopSheen())
    }
}
