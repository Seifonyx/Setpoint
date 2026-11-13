import SwiftUI

struct DiaryView: View {
    @Environment(Store.self) private var store
    @State private var day = Day.today
    @State private var weightSheet = false
    @State private var waterSheet = false
    @State private var pickDay = false
    @State private var copying: [FoodItem]?
    @State private var adding: AddJob?
    @State private var score: DayScore?
    @State private var kinds: [String: String] = [:]
    @State private var showScore = false
    @Environment(\.layoutDirection) private var direction
    @Binding var importing: Bool

    var body: some View {
        NavigationStack {
            List {
                if store.isEmpty {
                    Section {
                        ContentUnavailableView {
                            Label("Bring your diary over", systemImage: "square.and.arrow.down")
                        } description: {
                            Text("In the Setpoint web app, open Settings › Back up, then import that file here.")
                        } actions: {
                            Button("Import backup") { importing = true }.buttonStyle(.glassProminent)
                        }
                    }
                }
                if day == Day.today && (store.ramadanOn || Calendar(identifier: .islamicUmmAlQura).component(.month, from: Date()) == 9) {
                    Section { RamadanBanner() }
                }
                if day == Day.today && store.entries.count >= 3 && CheckInBanner.due {
                    Section { CheckInBanner() }
                }
                Section {
                    SummaryPager(day: day, totals: store.totals(day), plan: store.plans[day] ?? store.plan(day))
                }
                Section {
                    HStack(spacing: 12) {
                        WeightTile(entry: store.entry(day), unit: store.unit, recent: store.entries.filter { $0.date <= day && !$0.excluded }.suffix(14).map(\.kg)) { weightSheet = true }
                        WaterTile(ml: store.waterOn(day), goal: store.waterGoal) { store.addWater(store.waterSizes[0], on: day) } open: { waterSheet = true }
                    }
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
                }
                let totalsSaved = store.dailyTotals(day)
                if !totalsSaved.isEmpty {
                    Section {
                        ForEach(totalsSaved) { f in
                            LabeledContent { Text(Fmt.kcal(f.kcal)).monospacedDigit() } label: {
                                Text("Daily total")
                                Text("Calories saved with your weigh-in")
                            }
                            .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) { withAnimation { store.delete(f, on: day) } } }
                        }
                    }
                }
                ForEach(store.meals) { meal in
                    MealSection(meal: meal, day: day, copying: $copying, kinds: kinds) { adding = AddJob(meal: meal.key) }
                }
            }
            .listSectionSpacing(14)
            .brandList()
            .navigationTitle(title)
            .navigationSubtitle(subtitle)
            .toolbar {
                ToolbarItemGroup(placement: .topBarLeading) {
                    Button("Previous day", systemImage: "chevron.backward") { step(-1) }
                    Button("Next day", systemImage: "chevron.forward") { step(1) }
                        .disabled(day >= Day.add(Day.today, 14))
                }
                ToolbarItemGroup(placement: .topBarTrailing) {
                    ShareLink(item: shareText) { Label("Share day", systemImage: "square.and.arrow.up") }
                    Button("Choose day", systemImage: "calendar") { pickDay = true }
                    Button("Add food", systemImage: "plus") { adding = AddJob(meal: mealNow) }
                        .buttonStyle(.glassProminent)
                }
            }
            .safeAreaInset(edge: .bottom) { UndoBanner() }
            .sheet(isPresented: $weightSheet) { WeightSheet(day: day) }
            .sheet(isPresented: $waterSheet) { WaterSheet(day: day) }
            .sheet(isPresented: $pickDay) { DayPickerSheet(day: $day) }
            .sheet(item: Binding(get: { copying.map(CopyJob.init) }, set: { copying = $0?.items })) { job in
                CopyDaySheet(items: job.items, from: day)
            }
            .sensoryFeedback(.selection, trigger: day)
            .sheet(item: $adding) { job in AddFoodSheet(meal: job.meal, day: day) }
            .onChange(of: store.request) { _, r in
                if r == .addFood { day = Day.today; adding = AddJob(meal: mealNow); store.request = nil }
            }
            .task { if store.request == .addFood { adding = AddJob(meal: mealNow); store.request = nil } }
            .task(id: "\(day)|\(store.version)") { await store.refreshPlan(day); score = await store.engineRef.dayScore(day); kinds = await store.engineRef.itemKinds(day) }
            .sheet(isPresented: $showScore) { if let sc = score { DayScoreSheet(score: sc) } }
            .task { let f = UserDefaults.standard.string(forKey: "sheet"); if f == "weight" { weightSheet = true } else if f == "add" { adding = AddJob(meal: "lunch") } } // build-server screenshots
        }
    }

    private func gradeColor(_ g: String) -> Color { g == "A" ? Brand.green : g == "B" ? Brand.water : g == "C" ? Brand.amber : Brand.over }

    /// The day as plain text, for Messages, Notes or a coach.
    private var shareText: String {
        let t = store.totals(day)
        var lines = [Day.date(day).formatted(.dateTime.weekday(.wide).month(.wide).day()),
                     "\(Fmt.kcal(t.kcal)) kcal · P \(Fmt.grams(t.protein)) g · C \(Fmt.grams(t.carbs)) g · F \(Fmt.grams(t.fat)) g"]
        for m in store.meals {
            let list = store.items(day).filter { $0.meal == m.key }
            guard !list.isEmpty else { continue }
            lines.append("")
            lines.append(m.name)
            lines += list.map { "• \($0.displayName) · \(Fmt.kcal($0.kcal)) kcal" }
        }
        if let w = store.entry(day) { lines.append(""); lines.append(String(localized: "Weight") + ": \(Fmt.weight(w.kg, unit: store.unit)) \(store.unit)") }
        return lines.joined(separator: "\n")
    }

    private func swiped(_ v: DragGesture.Value) {
        let dx = v.translation.width
        guard abs(dx) > 60, abs(dx) > abs(v.translation.height) * 1.5 else { return }
        let forward = direction == .rightToLeft ? dx > 0 : dx < 0 // swipe towards the start of the line for the next day
        if forward && day >= Day.add(Day.today, 14) { return }
        step(forward ? 1 : -1)
    }

    private func step(_ n: Int) {
        withAnimation(.snappy) { day = Day.add(day, n) }
        store.clearUndo()
    }

    private var title: String {
        switch day {
        case Day.today: String(localized: "Today")
        case Day.add(Day.today, -1): String(localized: "Yesterday")
        case Day.add(Day.today, 1): String(localized: "Tomorrow")
        default: Day.date(day).formatted(.dateTime.weekday(.wide))
        }
    }
    /// The meal for the time of day (your own categories: the first one).
    private var mealNow: String {
        let h = Calendar.current.component(.hour, from: Date()), keys = store.meals.map(\.key)
        let guess = h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 21 ? "dinner" : "snacks"
        return keys.contains(guess) ? guess : (keys.first ?? "snacks")
    }
    private var subtitle: String { Day.date(day).formatted(.dateTime.day().month(.wide).year()) }
}

struct AddJob: Identifiable { let meal: String; var id: String { meal } }

/// Wraps the foods being copied so a sheet can be shown for them.
struct CopyJob: Identifiable {
    let items: [FoodItem]
    var id: String { items.map(\.id).joined(separator: ",") }
}

// MARK: - Summary

/// The top of the Diary: swipe between the calorie dial and your vitamins and minerals.
struct SummaryPager: View {
    let day: String
    let totals: Totals
    let plan: DayPlan?
    @State private var page = UserDefaults.standard.string(forKey: "page") == "micros" ? 1 : 0 // build-server screenshots

    var body: some View {
        VStack(spacing: 10) {
            TabView(selection: $page) {
                SummaryCard(totals: totals, plan: plan).tag(0)
                MicrosCard(day: day).tag(1)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .frame(height: 372)
            HStack(spacing: 6) {
                ForEach(0..<2, id: \.self) { i in
                    Capsule().fill(i == page ? Brand.green : Brand.ink2.opacity(0.25)).frame(width: i == page ? 18 : 6, height: 6)
                }
            }
            .animation(.snappy, value: page)
            .accessibilityHidden(true)
        }
        .padding(.bottom, 4)
        .sensoryFeedback(.selection, trigger: page)
    }
}

struct SummaryCard: View {
    let totals: Totals
    let plan: DayPlan?

    var body: some View {
        VStack(spacing: 14) {
            ZStack {
                CalorieDial(eaten: totals.kcal, target: plan?.kcal,
                            protein: plan.map { (totals.protein, $0.protein) }, carbs: plan.map { (totals.carbs, $0.carbs) }, fat: plan.map { (totals.fat, $0.fat) })
                    .frame(width: 262, height: 262)
                // inside the rings: what's left
                VStack(spacing: 0) {
                    if let plan {
                        let left = plan.kcal - totals.kcal
                        Text(left >= 0 ? LocalizedStringKey("left") : LocalizedStringKey("over"))
                            .font(.brand(.caption, .semibold)).foregroundStyle(left >= 0 ? Brand.ink2 : Brand.over).textCase(.uppercase).tracking(1.4)
                        Text(Fmt.kcal(abs(left))).font(Brand.display(44, .heavy)).foregroundStyle(left >= 0 ? Brand.ink : Brand.over)
                            .contentTransition(.numericText()).monospacedDigit().minimumScaleFactor(0.5).lineLimit(1)
                    } else {
                        Text("eaten").font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2).textCase(.uppercase).tracking(1.4)
                        Text(Fmt.kcal(totals.kcal)).font(Brand.display(44, .heavy)).contentTransition(.numericText()).monospacedDigit().minimumScaleFactor(0.5).lineLimit(1)
                    }
                }
                .frame(maxWidth: 124)
                // in the opening at the bottom of the dial: eaten of target
                Text(plan.map { "\(Fmt.kcal(totals.kcal)) / \(Fmt.kcal($0.kcal)) kcal" } ?? String(localized: "kcal"))
                    .font(.brand(.footnote, .medium)).foregroundStyle(Brand.ink2).monospacedDigit()
                    .lineLimit(1).minimumScaleFactor(0.7).frame(maxWidth: 140)
                    .offset(y: 112)
            }
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
            .onTapGesture { if plan != nil { explain = true } } // tap the dial: how your target is worked out
            if let plan {
                HStack(spacing: 14) {
                    MacroBar(label: "Protein", value: totals.protein, target: plan.protein, color: Brand.protein)
                    MacroBar(label: "Carbs", value: totals.carbs, target: plan.carbs, color: Brand.carbs)
                    MacroBar(label: "Fat", value: totals.fat, target: plan.fat, color: Brand.fat)
                }
            } else {
                Text("Set up your plan in You › Plan to see your targets here.").font(.brand(.footnote)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center)
            }
        }
        .padding(.vertical, 8)
        .animation(.spring(response: 0.5, dampingFraction: 0.8), value: totals)
        .overlay(alignment: .top) {
            if let c = cheer {
                Label(c, systemImage: "sparkles").font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.green)
                    .padding(.horizontal, 14).padding(.vertical, 8).background(Brand.greenSoft, in: Capsule())
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .overlay {
            // the logging moment: what you just added floats up out of the dial
            if let g = gained {
                Text("+\(Fmt.kcal(g)) kcal").font(Brand.display(22, .bold)).foregroundStyle(Brand.green).monospacedDigit()
                    .padding(.horizontal, 14).padding(.vertical, 6).background(Brand.greenSoft, in: Capsule())
                    .offset(y: rise ? -150 : -70).opacity(rise ? 0 : 1)
                    .allowsHitTesting(false)
            }
        }
        .scaleEffect(pulse ? 1.025 : 1)
        .onChange(of: totals) { old, new in
            if new.kcal > old.kcal + 1 && !reduceMotion {
                gained = new.kcal - old.kcal; rise = false
                withAnimation(.spring(response: 0.25, dampingFraction: 0.5)) { pulse = true }
                withAnimation(.easeOut(duration: 1.4).delay(0.35)) { rise = true }
                Task { try? await Task.sleep(for: .milliseconds(220)); withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) { pulse = false } }
                Task { try? await Task.sleep(for: .seconds(1.8)); gained = nil }
            }
            guard let plan else { return }
            // A small moment when you reach a target (only when it's crossed, not every time).
            if old.protein < plan.protein && new.protein >= plan.protein { celebrate(String(localized: "Protein target hit")) }
            else if old.kcal < plan.kcal * 0.95 && new.kcal >= plan.kcal * 0.95 && new.kcal <= plan.kcal * 1.05 { celebrate(String(localized: "Calories on target")) }
        }
        .sensoryFeedback(.success, trigger: cheer) { _, n in n != nil }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityText)
        .accessibilityAction(named: Text("How your target works")) { explain = true }
        .sheet(isPresented: $explain) { TargetExplainer() }
    }

    @State private var cheer: String?
    @State private var explain = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var gained: Double?
    @State private var rise = false
    @State private var pulse = false
    private func celebrate(_ text: String) {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) { cheer = text }
        Task { try? await Task.sleep(for: .seconds(2.5)); withAnimation { cheer = nil } }
    }
    private var accessibilityText: Text {
        guard let plan else { return Text("\(Fmt.kcal(totals.kcal)) calories eaten") }
        let left = plan.kcal - totals.kcal
        return Text(left >= 0 ? "\(Fmt.kcal(left)) calories left of \(Fmt.kcal(plan.kcal))" : "\(Fmt.kcal(-left)) calories over \(Fmt.kcal(plan.kcal))")
            + Text(". ") + Text("Protein \(Fmt.grams(totals.protein)) of \(Fmt.grams(plan.protein)) grams, carbs \(Fmt.grams(totals.carbs)) of \(Fmt.grams(plan.carbs)), fat \(Fmt.grams(totals.fat)) of \(Fmt.grams(plan.fat)).")
    }
}

/// The second page: the vitamins and minerals people most often run low on, for this day. Tap for all of them.
struct MicrosCard: View {
    @Environment(Store.self) private var store
    let day: String
    @State private var data: NutrientData?
    private static let keys = ["fib", "fe", "ca", "k", "mg", "vD", "b12", "vC", "zn", "na"]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                Text("Vitamins & minerals").font(Brand.display(20, .bold))
                Spacer()
                NavigationLink { NutrientsView(day: day) } label: {
                    HStack(spacing: 2) { Text("All"); Image(systemName: "chevron.right").font(.brand(.caption, .bold)) }
                        .font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.green)
                }
            }
            if let d = data, d.items > 0 {
                let rows = Self.keys.compactMap { k in d.rows.first { $0.key == k } }
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 18), GridItem(.flexible(), spacing: 18)], spacing: 20) {
                    ForEach(rows, id: \.key) { r in cell(r) }
                }
            } else {
                Spacer()
                Text("Log some food to see your vitamins and minerals.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2).frame(maxWidth: .infinity)
                Spacer()
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 8)
        .task(id: "\(day)|\(store.version)|\(store.foodsReady)") { data = await store.engineRef.nutrients(day) }
    }

    private func cell(_ r: NutrientData.Row) -> some View {
        let target = r.goal ?? r.hi ?? 0
        let pct = target > 0 ? r.v / target : 0
        let limit = r.goal == nil && r.hi != nil // things to keep under (sodium)
        let color = limit ? (pct > 1 ? Brand.over : Brand.ink2) : (pct >= 1 ? Brand.green : pct >= 0.5 ? Brand.amber : Brand.protein)
        return VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(r.label).font(.brand(.caption, .semibold)).lineLimit(1)
                Spacer(minLength: 4)
                Text("\(Int((pct * 100).rounded()))%").font(.brand(.caption, .bold)).monospacedDigit().foregroundStyle(color)
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.card2)
                    Capsule().fill(color).frame(width: g.size.width * min(1, pct))
                }
            }
            .frame(height: 5)
        }
        .opacity(r.cov < 0.5 && r.v > 0 ? 0.55 : 1)
    }
}

struct MacroBar: View {
    let label: LocalizedStringKey
    let value: Double
    let target: Double
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 5) {
                Circle().fill(color).frame(width: 7, height: 7)
                Text(label).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
            }
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(Fmt.grams(value)).font(Brand.display(19, .bold)).monospacedDigit().contentTransition(.numericText())
                Text("/ \(Fmt.grams(target)) g").font(.brand(.caption2)).foregroundStyle(Brand.ink2)
            }
            .lineLimit(1).minimumScaleFactor(0.7)
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.card2)
                    Capsule().fill(value > target * 1.1 ? Brand.over : color)
                        .frame(width: g.size.width * min(1, value / max(target, 1)))
                }
            }
            .frame(height: 5)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Weight and water tiles

struct WeightTile: View {
    let entry: WeighIn?
    let unit: String
    var recent: [Double] = []
    let open: () -> Void

    var body: some View {
        Button(action: open) {
            VStack(alignment: .leading, spacing: 6) {
                Label("Weight", systemImage: "scalemass.fill").font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.green)
                if let entry {
                    HStack(alignment: .firstTextBaseline, spacing: 3) {
                        Text(Fmt.weight(entry.kg, unit: unit)).font(Brand.display(30, .bold)).monospacedDigit()
                        Text(LocalizedStringKey(unit)).font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                    }
                    if entry.excluded { Text("Excluded").font(.brand(.caption)).foregroundStyle(Brand.ink2) }
                } else {
                    Text("Log").font(Brand.display(30, .bold)).foregroundStyle(Brand.green)
                }
                Spacer(minLength: 0)
                Sparkline(values: recent).frame(height: 18)
            }
            .frame(maxWidth: .infinity, minHeight: 96, alignment: .topLeading)
            .padding(14)
            .background(Brand.card, in: .rect(cornerRadius: 22))
        }
        .buttonStyle(.plain)
    }
}

/// Your last couple of weeks of weigh-ins as a tiny line, ending on today's point.
struct Sparkline: View {
    let values: [Double]
    var body: some View {
        GeometryReader { g in
            if values.count >= 2, let lo = values.min(), let hi = values.max() {
                let span = max(hi - lo, 0.4), w = g.size.width, h = g.size.height
                let pts = values.enumerated().map { i, v in CGPoint(x: w * CGFloat(i) / CGFloat(values.count - 1), y: h - h * CGFloat((v - lo) / span)) }
                Path { p in p.addLines(pts) }
                    .stroke(Brand.green.opacity(0.7), style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
                Circle().fill(Brand.amber).frame(width: 7, height: 7).position(pts.last!)
            }
        }
    }
}

struct WaterTile: View {
    let ml: Double
    let goal: Double
    let add: () -> Void
    let open: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Label("Water", systemImage: "drop.fill").font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.water)
                    Spacer()
                    Button("Add a glass of water", systemImage: "plus", action: add)
                        .labelStyle(.iconOnly).symbolEffect(.bounce, value: ml).buttonStyle(.glass).buttonBorderShape(.circle).controlSize(.small)
                }
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(Fmt.ml(ml)).font(Brand.display(30, .bold)).contentTransition(.numericText()).monospacedDigit()
                    Text("of \(Fmt.ml(goal))").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                }
                .lineLimit(1).minimumScaleFactor(0.7)
                Spacer(minLength: 0)
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Brand.card2)
                        Capsule().fill(Brand.water).frame(width: g.size.width * min(1, ml / max(goal, 1)))
                    }
                }
                .frame(height: 6)
                .animation(.spring(response: 0.5, dampingFraction: 0.75), value: ml)
        }
        .frame(maxWidth: .infinity, minHeight: 96, alignment: .topLeading)
        .padding(14)
        .background(Brand.card, in: .rect(cornerRadius: 22))
        .contentShape(.rect(cornerRadius: 22))
        .onTapGesture(perform: open) // the tile opens Water; its + adds a glass (a button inside a button would swallow taps)
        .accessibilityAddTraits(.isButton)
        .sensoryFeedback(.increase, trigger: ml)
    }
}

// MARK: - Undo

/// After a change, a small glass banner offers Undo for a few seconds (like Mail's "Undo Send").
struct UndoBanner: View {
    @Environment(Store.self) private var store

    var body: some View {
        if let label = store.undoLabel {
            HStack {
                Text(label).font(.brand(.subheadline, .medium)).lineLimit(1)
                Spacer()
                Button("Undo") { withAnimation { store.undo() } }.fontWeight(.semibold)
            }
            .padding(.horizontal, 18).padding(.vertical, 12)
            .glassEffect(.regular, in: .capsule)
            .padding(.horizontal, 16).padding(.bottom, 8)
            .transition(.move(edge: .bottom).combined(with: .opacity))
            .task(id: label) {
                try? await Task.sleep(for: .seconds(5))
                withAnimation { store.clearUndo() }
            }
        }
    }
}
