import SwiftUI

/// The next 7 days' targets (training days and a flexible week change them), with the options that shape them.
struct WeekPlanSection: View {
    @Environment(Store.self) private var store
    @State private var days: [(String, DayPlan)] = []
    @State private var sheet: Sheet?
    enum Sheet: String, Identifiable { case train, flex, cycle; var id: String { rawValue } }

    private var settings: [String: JSONValue] { store.root["settings"]?.object ?? [:] }

    var body: some View {
        Section {
            ForEach(days, id: \.0) { d, p in
                LabeledContent {
                    HStack(spacing: 6) {
                        if p.training == true { Image(systemName: "dumbbell.fill").font(.caption).foregroundStyle(.tint) }
                        Text(Fmt.kcal(p.kcal)).monospacedDigit().fontWeight(d == Day.today ? .bold : .regular)
                    }
                } label: {
                    Text(d == Day.today ? String(localized: "Today") : Day.date(d).formatted(.dateTime.weekday(.wide)))
                }
            }
            Button { sheet = .train } label: {
                LabeledContent("Training days") { Text(trainSummary).foregroundStyle(.secondary) }
            }.tint(.primary)
            Button { sheet = .flex } label: {
                LabeledContent("Flexible week") { Text(settings["flex"]?["on"]?.bool == true ? String(localized: "On") : String(localized: "Off")).foregroundStyle(.secondary) }
            }.tint(.primary)
            Button { sheet = .cycle } label: {
                LabeledContent("Cycle and weight") { Text(settings["cycle"]?["on"]?.bool == true ? String(localized: "On") : String(localized: "Off")).foregroundStyle(.secondary) }
            }.tint(.primary)
        } header: { Text("Your week") }
        .task(id: store.version) {
            var out: [(String, DayPlan)] = []
            for i in 0..<7 { let d = Day.add(Day.today, i); if let p = await store.engineRef.dayPlan(d) { out.append((d, p)) } }
            days = out
        }
        .sheet(item: $sheet) { s in
            switch s {
            case .train: TrainingDaysSheet()
            case .flex: FlexSheet()
            case .cycle: CycleSheet()
            }
        }
    }
    private var trainSummary: String {
        let ds = (settings["train"]?["days"]?.array ?? []).compactMap { $0.number.map(Int.init) }
        if ds.isEmpty { return String(localized: "Off") }
        return ds.map { Calendar.current.shortWeekdaySymbols[$0] }.joined(separator: ", ")
    }
}

/// Weekdays in your week's order (settings.weekStart, Friday unless changed).
private func weekOrder(_ store: Store) -> [Int] {
    let ws = Int(store.root["settings"]?["weekStart"]?.number ?? 5)
    return (0..<7).map { (ws + $0) % 7 }
}

private struct DayChips: View {
    let order: [Int]
    @Binding var picked: Set<Int>
    var single = false
    var body: some View {
        HStack(spacing: 6) {
            ForEach(order, id: \.self) { d in
                let on = picked.contains(d)
                Button {
                    if single { picked = on ? [] : [d] } else if on { picked.remove(d) } else { picked.insert(d) }
                } label: {
                    Text(Calendar.current.veryShortWeekdaySymbols[d]).font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 40)
                        .background(Circle().fill(on ? AnyShapeStyle(.tint) : AnyShapeStyle(.quaternary)))
                        .foregroundStyle(on ? Color(uiColor: .systemBackground) : Color.primary)
                }
                .buttonStyle(.plain)
            }
        }
        .sensoryFeedback(.selection, trigger: picked)
    }
}

/// Training days: more on training days, less on rest days, same weekly total.
struct TrainingDaysSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var picked: Set<Int> = []

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DayChips(order: weekOrder(store), picked: $picked).listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                } footer: {
                    if picked.isEmpty { Text("No days picked: every day has the same target.") }
                    else { Text("More on training days, less on rest days. Same weekly total.") }
                }
            }
            .navigationTitle("Training days")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .onAppear { picked = Set((store.root["settings"]?["train"]?["days"]?.array ?? []).compactMap { $0.number.map(Int.init) }) }
        }
        .presentationDetents([.medium])
    }
    private func save() {
        let ds = picked.sorted()
        store.setSetting("train", ds.isEmpty ? nil : .object(["days": .array(ds.map { .number(Double($0)) })]))
        if !ds.isEmpty, store.root["profile"]?["training"] != nil {
            store.setProfile { p in
                var t = p["training"]?.object ?? [:]; t["days"] = .number(Double(ds.count)); p["training"] = .object(t)
            }
        }
        dismiss()
    }
}

/// Flexible week: eat less one day and later days get more; optionally one bigger day.
struct FlexSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var on = false
    @State private var big: Set<Int> = [5]
    @State private var extra = 0

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Flexible week", isOn: $on)
                } footer: { Text("Your weekly total stays the same: eat less one day and later days get more. You can give one day extra.") }
                if on {
                    Section("Bigger day") {
                        DayChips(order: weekOrder(store), picked: $big, single: true).listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                    }
                    Section {
                        Picker("Extra on that day", selection: $extra) {
                            Text("None").tag(0); ForEach([200, 400, 600, 800], id: \.self) { Text("+\($0)").tag($0) }
                        }
                        .pickerStyle(.segmented)
                    } header: { Text("Extra on that day") } footer: {
                        Text(store.overview?.profile.sex == "male" ? "Each day stays at 75–135% of normal, never under 1,500 kcal. Unlogged days count as on target." : "Each day stays at 75–135% of normal, never under 1,200 kcal. Unlogged days count as on target.")
                    }
                }
            }
            .navigationTitle("Flexible week")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .onAppear {
                let f = store.root["settings"]?["flex"]
                on = f?["on"]?.bool == true; extra = Int(f?["extra"]?.number ?? 0)
                if let b = f?["big"]?.number { big = [Int(b)] }
            }
            .onChange(of: big) { _, b in if !b.isEmpty && extra == 0 { extra = 400 } }
        }
        .presentationDetents([.large])
    }
    private func save() {
        let b = big.first
        store.setSetting("flex", on ? .object(["on": .bool(true), "big": (extra > 0 && b != nil) ? .number(Double(b!)) : .null, "extra": .number(Double(extra))]) : nil)
        dismiss()
    }
}

/// Cycle and weight: shades the days around a period on the weight chart (water can add 0.5–2 kg).
struct CycleSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var date = Date()

    private var cycle: [String: JSONValue] { store.root["settings"]?["cycle"]?.object ?? ["on": .bool(false), "starts": .array([])] }
    private var starts: [String] { (cycle["starts"]?.array ?? []).compactMap { $0.string }.sorted() }
    private func set(_ change: (inout [String: JSONValue]) -> Void) { var c = cycle; change(&c); store.setSetting("cycle", .object(c)) }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Show on the weight chart", isOn: Binding(get: { cycle["on"]?.bool == true }, set: { v in set { $0["on"] = .bool(v) } }))
                } footer: { Text("Shades period days on your weight chart, since water can add 0.5–2 kg.") }
                if cycle["on"]?.bool == true {
                    Section("Add a period start") {
                        DatePicker("Date", selection: $date, in: ...Date(), displayedComponents: .date)
                        Button("Add") {
                            let d = Day.iso(date)
                            set { c in var s = (c["starts"]?.array ?? []).compactMap { $0.string }; if !s.contains(d) { s.append(d) }; c["starts"] = .array(s.sorted().map { .string($0) }) }
                        }
                    }
                    if !starts.isEmpty {
                        Section {
                            ForEach(starts.reversed(), id: \.self) { d in
                                Text(Day.date(d), format: .dateTime.weekday(.abbreviated).month(.abbreviated).day().year())
                                    .swipeActions { Button("Remove", systemImage: "trash", role: .destructive) { set { $0["starts"] = .array(starts.filter { $0 != d }.map { .string($0) }) } } }
                            }
                        } footer: { Text("Stays private in your Setpoint data. It only changes how the chart is shaded.") }
                    }
                }
            }
            .navigationTitle("Cycle and weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
    }
}
