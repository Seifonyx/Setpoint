import SwiftUI

// MARK: Fasting timer (state.fast in the web app: goal hours, start time, the last 100 fasts)

struct FastingView: View {
    @Environment(Store.self) private var store
    private static let goals = [12, 14, 16, 18, 20, 24]

    private var fast: [String: JSONValue] { store.root["fast"]?.object ?? ["goal": .number(16), "start": .null, "log": .array([])] }
    private var goal: Int { Int(fast["goal"]?.number ?? 16) }
    private var start: Date? { fast["start"]?.number.map { Date(timeIntervalSince1970: $0 / 1000) } }
    private var log: [[String: JSONValue]] { (fast["log"]?.array ?? []).compactMap { $0.object } }
    private func set(_ change: (inout [String: JSONValue]) -> Void) { var f = fast; change(&f); store.setRoot("fast", .object(f)) }

    var body: some View {
        List {
            Section {
                TimelineView(.periodic(from: .now, by: 1)) { ctx in
                    let elapsed = start.map { ctx.date.timeIntervalSince($0) } ?? 0
                    let goalS = Double(goal) * 3600
                    VStack(spacing: 14) {
                        ZStack {
                            Circle().stroke(.quaternary, lineWidth: 14)
                            Circle().trim(from: 0, to: min(1, elapsed / goalS))
                                .stroke(elapsed >= goalS ? Color.green : Color.accentColor, style: StrokeStyle(lineWidth: 14, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                            VStack(spacing: 4) {
                                Text(duration(elapsed)).font(.system(size: 40, weight: .bold, design: .rounded)).monospacedDigit()
                                if start != nil {
                                    if elapsed >= goalS { Text("Goal reached").foregroundStyle(.green) }
                                    else { Text("\(duration(goalS - elapsed)) to go").foregroundStyle(.secondary) }
                                } else { Text("Not fasting").foregroundStyle(.secondary) }
                            }
                        }
                        .frame(width: 220, height: 220)
                        .padding(.vertical, 8)
                        if let s = start {
                            Button("End fast", systemImage: "stop.fill") {
                                let e = Date()
                                set { f in
                                    let entry: JSONValue = .object(["s": .number((s.timeIntervalSince1970 * 1000).rounded()), "e": .number((e.timeIntervalSince1970 * 1000).rounded()), "g": .number(Double(goal))])
                                    f["log"] = .array(Array(([entry] + (f["log"]?.array ?? [])).prefix(100)))
                                    f["start"] = .null
                                }
                            }
                            .buttonStyle(.glassProminent).controlSize(.large)
                            DatePicker("Started", selection: Binding(get: { s }, set: { d in set { $0["start"] = .number((d.timeIntervalSince1970 * 1000).rounded()) } }),
                                       in: Date().addingTimeInterval(-7 * 86400)...Date())
                        } else {
                            Button("Start fast", systemImage: "play.fill") { set { $0["start"] = .number(Store.nowMs) } }
                                .buttonStyle(.glassProminent).controlSize(.large)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
                Picker("Goal", selection: Binding(get: { goal }, set: { g in set { $0["goal"] = .number(Double(g)) } })) {
                    ForEach(Self.goals, id: \.self) { Text("\($0) h").tag($0) }
                }
            }
            if !log.isEmpty {
                Section("Recent fasts") {
                    ForEach(log.prefix(20).indices, id: \.self) { i in
                        let x = log[i], s = (x["s"]?.number ?? 0) / 1000, e = (x["e"]?.number ?? 0) / 1000, g = x["g"]?.number ?? 16
                        LabeledContent {
                            Text(duration(e - s)).monospacedDigit().foregroundStyle(e - s >= g * 3600 ? Color.green : Color.secondary)
                        } label: {
                            Text(Date(timeIntervalSince1970: s), format: .dateTime.weekday(.abbreviated).month(.abbreviated).day())
                            Text("Goal \(Int(g)) h")
                        }
                    }
                }
            }
        }
        .navigationTitle("Fasting")
    }
    private func duration(_ t: Double) -> String {
        let m = max(0, Int(t / 60)); return String(format: "%d:%02d", m / 60, m % 60)
    }
}

// MARK: Body measurements (state.measures: dated rows, lengths in cm)

struct BodySection: View {
    @Environment(Store.self) private var store
    @State private var adding = false
    static let parts: [(String, LocalizedStringKey)] = [("waist", "Waist"), ("hips", "Hips"), ("chest", "Chest"), ("arm", "Arm"), ("thigh", "Thigh"), ("neck", "Neck")]

    private var rows: [[String: JSONValue]] { (store.root["measures"]?.array ?? []).compactMap { $0.object }.sorted { ($0["date"]?.string ?? "") < ($1["date"]?.string ?? "") } }
    private var inches: Bool { store.unit == "lb" }
    private func len(_ cm: Double) -> String { (inches ? cm / 2.54 : cm).formatted(.number.precision(.fractionLength(0...1))) }

    var body: some View {
        let ms = rows
        Section {
            if ms.isEmpty { Text("Measure your waist and more every few weeks. They often move when the scale doesn't.").foregroundStyle(.secondary) }
            ForEach(Self.parts, id: \.0) { key, name in
                let vals = ms.compactMap { m in m[key]?.number.map { (m["date"]?.string ?? "", $0) } }
                if let last = vals.last {
                    LabeledContent {
                        HStack(spacing: 8) {
                            Text("\(len(last.1)) \(inches ? "in" : "cm")").monospacedDigit().fontWeight(.semibold)
                            if vals.count > 1, let first = vals.first {
                                let d = last.1 - first.1
                                Text((d < 0 ? "−" : "+") + len(abs(d))).font(.subheadline).monospacedDigit().foregroundStyle(.secondary)
                            }
                        }
                    } label: {
                        Text(name)
                        Text(Day.date(last.0), format: .dateTime.month(.abbreviated).day())
                    }
                }
            }
            Button("Add measurements", systemImage: "ruler") { adding = true }
        } header: { Text("Measurements") } footer: { if ms.count > 1 { Text("Change since your first measurement.") } }
        .sheet(isPresented: $adding) { MeasureSheet(inches: inches) }
    }
}

struct MeasureSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let inches: Bool
    @State private var date = Date()
    @State private var vals: [String: String] = [:]
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                DatePicker("Date", selection: $date, in: ...Date(), displayedComponents: .date)
                Section {
                    ForEach(BodySection.parts, id: \.0) { key, name in
                        LabeledContent(name) {
                            HStack(spacing: 4) {
                                TextField("—", text: Binding(get: { vals[key] ?? "" }, set: { vals[key] = $0 }))
                                    .keyboardType(.decimalPad).multilineTextAlignment(.trailing).frame(maxWidth: 90)
                                Text(inches ? "in" : "cm").foregroundStyle(.secondary)
                            }
                        }
                    }
                } footer: { if let error { Text(error).foregroundStyle(.red) } else { Text("Fill in any you measured.") } }
            }
            .navigationTitle("Measurements")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
        }
    }
    private func save() {
        let day = Day.iso(date)
        var row: [String: JSONValue] = ["date": .string(day)]
        for (k, v) in vals where !v.trimmingCharacters(in: .whitespaces).isEmpty {
            guard let n = Double(v.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")) else { error = String(localized: "Check the numbers"); return }
            let cm = inches ? n * 2.54 : n
            guard (10...300).contains(cm) else { error = String(localized: "Check the numbers"); return }
            row[k] = .number((cm * 10).rounded() / 10)
        }
        guard row.count > 1 else { error = String(localized: "Fill in at least one"); return }
        var all = (store.root["measures"]?.array ?? []).compactMap { $0.object }
        if let i = all.firstIndex(where: { $0["date"]?.string == day }) { all[i].merge(row) { $1 } } else { all.append(row) }
        all.sort { ($0["date"]?.string ?? "") < ($1["date"]?.string ?? "") }
        store.setRoot("measures", .array(all.map { .object($0) }))
        dismiss()
    }
}

// MARK: Phases (a cut, a bulk, a diet break: the chart and trend start from the latest one)

struct PhasesSection: View {
    @Environment(Store.self) private var store
    @State private var adding = false
    @State private var label = ""
    @State private var date = Date()

    private var phases: [[String: JSONValue]] { (store.root["phases"]?.array ?? []).compactMap { $0.object }.sorted { ($0["date"]?.string ?? "") > ($1["date"]?.string ?? "") } }

    var body: some View {
        let list = phases
        Section {
            ForEach(list.indices, id: \.self) { i in
                let p = list[i], start = p["date"]?.string ?? "", end = i > 0 ? list[i - 1]["date"]?.string : nil
                let es = store.entries.filter { $0.date >= start && (end == nil || $0.date < end!) }
                LabeledContent {
                    if es.count >= 2, let a = es.first, let b = es.last {
                        let d = b.kg - a.kg
                        Text((d < 0 ? "−" : "+") + Fmt.weight(abs(d), unit: store.unit) + " " + store.unit).monospacedDigit()
                    }
                } label: {
                    HStack { Text(p["label"]?.string ?? String(localized: "Phase")); if i == 0 { Text("Now").font(.caption.weight(.semibold)).padding(.horizontal, 6).padding(.vertical, 2).background(Capsule().fill(.tint.opacity(0.15))) } }
                    Text("Since \(Day.date(start).formatted(.dateTime.month(.abbreviated).day().year()))")
                }
                .swipeActions {
                    Button("Delete", systemImage: "trash", role: .destructive) {
                        store.setRoot("phases", .array((store.root["phases"]?.array ?? []).filter { $0["date"]?.string != start }))
                    }
                }
            }
            Button(list.isEmpty ? "Start a phase" : "New phase", systemImage: "flag") { label = ""; date = Date(); adding = true }
        } header: { Text("Phases") } footer: { if list.isEmpty { Text("Mark a cut, bulk or diet break.") } }
        .alert("New phase", isPresented: $adding) {
            TextField("Name (e.g. Cut)", text: $label)
            Button("Cancel", role: .cancel) {}
            Button("Start today") {
                let day = Day.today
                var all = (store.root["phases"]?.array ?? []).filter { $0["date"]?.string != day }
                all.append(.object(["date": .string(day), "label": .string(String(label.trimmingCharacters(in: .whitespaces).prefix(40)))]))
                all.sort { ($0["date"]?.string ?? "") < ($1["date"]?.string ?? "") }
                store.setRoot("phases", .array(all))
            }
        }
    }
}
