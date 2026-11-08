import SwiftUI

struct DiaryView: View {
    @Environment(Store.self) private var store
    @State private var day = Day.today
    @State private var weightSheet = false
    @State private var waterSheet = false
    @State private var pickDay = false
    @State private var copying: [FoodItem]?
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
                Section {
                    SummaryCard(totals: store.totals(day), plan: store.plan(day))
                        .contentShape(.rect)
                        .simultaneousGesture(DragGesture(minimumDistance: 24).onEnded(swiped)) // swipe the card to change day
                }
                Section {
                    HStack(spacing: 12) {
                        WeightTile(entry: store.entry(day), unit: store.unit) { weightSheet = true }
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
                    MealSection(meal: meal, day: day, copying: $copying)
                }
            }
            .listSectionSpacing(14)
            .navigationTitle(title)
            .navigationSubtitle(subtitle)
            .toolbar {
                ToolbarItemGroup(placement: .topBarLeading) {
                    Button("Previous day", systemImage: "chevron.backward") { step(-1) }
                    Button("Next day", systemImage: "chevron.forward") { step(1) }
                        .disabled(day >= Day.add(Day.today, 14))
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Choose day", systemImage: "calendar") { pickDay = true }
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
            .task { if UserDefaults.standard.string(forKey: "sheet") == "weight" { weightSheet = true } } // build-server screenshots
        }
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
    private var subtitle: String { Day.date(day).formatted(.dateTime.day().month(.wide).year()) }
}

/// Wraps the foods being copied so a sheet can be shown for them.
struct CopyJob: Identifiable {
    let items: [FoodItem]
    var id: String { items.map(\.id).joined(separator: ",") }
}

// MARK: - Summary

struct SummaryCard: View {
    let totals: Totals
    let plan: DayPlan?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Calories").font(.subheadline).foregroundStyle(.secondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(Fmt.kcal(totals.kcal)).font(.system(size: 40, weight: .bold, design: .rounded)).contentTransition(.numericText())
                        if let plan { Text("/ \(Fmt.kcal(plan.kcal))").foregroundStyle(.secondary) }
                    }
                }
                Spacer()
                if let plan {
                    let left = plan.kcal - totals.kcal
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(left >= 0 ? LocalizedStringKey("Left") : LocalizedStringKey("Over")).font(.subheadline).foregroundStyle(.secondary)
                        Text(Fmt.kcal(abs(left))).font(.title2.weight(.semibold)).fontDesign(.rounded)
                            .foregroundStyle(left >= 0 ? Color.primary : Color.red)
                    }
                }
            }
            ProgressView(value: min(totals.kcal, plan?.kcal ?? max(totals.kcal, 1)), total: plan?.kcal ?? max(totals.kcal, 1))
                .tint(plan.map { totals.kcal > $0.kcal * 1.05 } == true ? .red : .orange)
            if let plan {
                HStack(spacing: 14) {
                    MacroBar(label: "Protein", value: totals.protein, target: plan.protein, color: .green)
                    MacroBar(label: "Carbs", value: totals.carbs, target: plan.carbs, color: .blue)
                    MacroBar(label: "Fat", value: totals.fat, target: plan.fat, color: .purple)
                }
            } else {
                Text("Your targets appear here once they're set in the web app.").font(.footnote).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 6)
        .animation(.snappy, value: totals)
    }
}

struct MacroBar: View {
    let label: LocalizedStringKey
    let value: Double
    let target: Double
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(Fmt.grams(value)).font(.headline).fontDesign(.rounded)
                Text("/ \(Fmt.grams(target)) g").font(.caption2).foregroundStyle(.secondary)
            }
            .lineLimit(1).minimumScaleFactor(0.7)
            ProgressView(value: min(value, max(target, 1)), total: max(target, 1)).tint(value > target * 1.1 ? .red : color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Weight and water tiles

struct WeightTile: View {
    let entry: WeighIn?
    let unit: String
    let open: () -> Void

    var body: some View {
        Button(action: open) {
            VStack(alignment: .leading, spacing: 6) {
                Label("Weight", systemImage: "scalemass").font(.subheadline).foregroundStyle(.secondary)
                if let entry {
                    HStack(alignment: .firstTextBaseline, spacing: 3) {
                        Text(Fmt.weight(entry.kg, unit: unit)).font(.title.weight(.bold)).fontDesign(.rounded)
                        Text(LocalizedStringKey(unit)).font(.subheadline).foregroundStyle(.secondary)
                    }
                    if entry.excluded { Text("Excluded").font(.caption).foregroundStyle(.secondary) }
                } else {
                    Text("Log").font(.title3.weight(.semibold)).foregroundStyle(.tint)
                }
            }
            .frame(maxWidth: .infinity, minHeight: 84, alignment: .topLeading)
            .padding(14)
            .background(Color(uiColor: .secondarySystemGroupedBackground), in: .rect(cornerRadius: 22))
        }
        .buttonStyle(.plain)
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
                    Label("Water", systemImage: "drop.fill").font(.subheadline).foregroundStyle(.secondary)
                    Spacer()
                    Button("Add a glass of water", systemImage: "plus", action: add)
                        .labelStyle(.iconOnly).buttonStyle(.glass).buttonBorderShape(.circle).controlSize(.small)
                }
                Text(Fmt.ml(ml)).font(.title.weight(.bold)).fontDesign(.rounded).contentTransition(.numericText())
                ProgressView(value: min(ml, goal), total: goal).tint(.cyan)
        }
        .frame(maxWidth: .infinity, minHeight: 84, alignment: .topLeading)
        .padding(14)
        .background(Color(uiColor: .secondarySystemGroupedBackground), in: .rect(cornerRadius: 22))
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
                Text(label).font(.subheadline.weight(.medium)).lineLimit(1)
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
