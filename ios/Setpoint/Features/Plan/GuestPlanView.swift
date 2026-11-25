import SwiftUI

/// Plan › Someone else: targets for a friend or family member, from the same maths as yours (the web app's guest
/// calculator, via the engine). Kept in root["guest"] (synced, like the web app), never in your profile, so your own
/// plan doesn't change. Nothing to save: the numbers update as you type and are kept for next time.
struct GuestPlanView: View {
    @Environment(Store.self) private var store
    @State private var sex = ""
    @State private var age = ""
    @State private var weight = ""
    @State private var height = ""
    @State private var steps = 7000.0
    @State private var days = 0
    @State private var type = "lifting"
    @State private var minutes = 60
    @State private var intensity = "moderate"
    @State private var paceKg = 0.0
    @State private var result: GuestPlan?
    @State private var loaded = false

    /// What was typed, as a number: Arabic-Indic digits (an Arabic iPhone's keypad) and either decimal mark work.
    private func num(_ s: String) -> Double? {
        let western = String(s.trimmingCharacters(in: .whitespaces).unicodeScalars.map { u -> Character in
            switch u.value {
            case 0x0660...0x0669: Character(UnicodeScalar(u.value - 0x0660 + 48)!)
            case 0x06F0...0x06F9: Character(UnicodeScalar(u.value - 0x06F0 + 48)!)
            default: Character(u)
            }
        })
        return Double(western.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: "."))
    }
    /// A number written back into a box: plain digits, so it always reads back the same.
    private func plain(_ v: Double) -> String {
        v.formatted(.number.grouping(.never).precision(.fractionLength(0...1)).locale(Locale(identifier: "en_US_POSIX")))
    }
    private var lb: Bool { store.unit == "lb" }

    /// Their numbers in the web app's format; anything out of range is left empty (as the web app does).
    private var guest: [String: JSONValue] {
        var g: [String: JSONValue] = [
            "steps": .number(steps), "paceKg": .number(paceKg),
            "training": .object(["days": .number(Double(days)), "type": .string(type), "minutes": .number(Double(minutes)), "intensity": .string(intensity)]),
        ]
        g["sex"] = sex.isEmpty ? .null : .string(sex)
        g["age"] = num(age).flatMap { (13...100).contains($0) ? .number($0.rounded()) : nil } ?? .null
        g["kg"] = num(weight).flatMap { w in let k = lb ? w / 2.20462 : w; return (20...400).contains(k) ? .number((k * 100).rounded() / 100) : nil } ?? .null
        g["heightCm"] = num(height).flatMap { (120...230).contains($0) ? .number(($0 * 10).rounded() / 10) : nil } ?? .null
        return g
    }
    private var key: String {
        (try? JSONEncoder().encode(JSONValue.object(guest))).map { String(decoding: $0, as: UTF8.self) } ?? ""
    }

    var body: some View {
        List {
            Section { resultCard }
            Section("Sex") {
                Picker("Sex", selection: $sex) { Text("Female").tag("female"); Text("Male").tag("male"); Text("Other").tag("other") }
                    .pickerStyle(.segmented)
            }
            Section("Body") {
                NumberField(label: "Age", text: $age, unit: "years", placeholder: "–").keyboardType(.numberPad)
                NumberField(label: "Weight", text: $weight, unit: LocalizedStringKey(store.unit), placeholder: "–").keyboardType(.decimalPad)
                NumberField(label: "Height", text: $height, unit: "cm", placeholder: "–").keyboardType(.decimalPad)
            }
            Section {
                LabeledContent("Daily steps") { Text(Int(steps).formatted()).monospacedDigit() }
                Slider(value: $steps, in: 0...25000, step: 500)
            }
            Section("Workouts") {
                Stepper(value: $days, in: 0...7) { LabeledContent("A week") { Text("\(days)").monospacedDigit() } }
                if days > 0 {
                    Picker("Type", selection: $type) { Text("Lifting").tag("lifting"); Text("Cardio").tag("cardio"); Text("HIIT").tag("mixed"); Text("Sports").tag("sports") }
                    Picker("Length", selection: $minutes) { ForEach([30, 45, 60, 90], id: \.self) { Text("\($0) min").tag($0) } }
                    Picker("Effort", selection: $intensity) { Text("Easy").tag("light"); Text("Moderate").tag("moderate"); Text("Hard").tag("hard") }
                }
            }
            Section("Goal") {
                let dir = result?.dir ?? "maintain", i = result?.i ?? 0
                Picker("Goal", selection: Binding(get: { dir }, set: { setPace($0, dir == $0 ? i : ($0 == "lose" ? 1 : 0)) })) {
                    Text("Lose").tag("lose"); Text("Maintain").tag("maintain"); Text("Gain").tag("gain")
                }
                .pickerStyle(.segmented)
                if dir != "maintain", let r = result {
                    Picker("Pace per week", selection: Binding(get: { i }, set: { setPace(dir, $0) })) {
                        ForEach(Array((r.rates[dir] ?? []).enumerated()), id: \.offset) { n, v in Text("\(v.formatted()) \(r.unit)").tag(n) }
                    }
                }
            }
        }
        .brandList()
        .navigationTitle("Someone else")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) { Button("Clear", action: clear).disabled(sex.isEmpty && age.isEmpty && weight.isEmpty && height.isEmpty) }
        }
        .onAppear(perform: load)
        // the numbers follow what you type; what you typed is kept (synced) a moment after you stop
        .task(id: "\(loaded)|\(key)") {
            guard loaded else { return }
            let g = guest
            let r = await store.engineRef.guestPlan(g)
            withAnimation(.snappy) { result = r }
            try? await Task.sleep(for: .milliseconds(800))
            if !Task.isCancelled, store.root["guest"] != .object(g) { store.setRoot("guest", .object(g)) }
        }
    }

    @ViewBuilder private var resultCard: some View {
        if let r = result, r.ready, let tdee = r.tdee, let target = r.target {
            VStack(spacing: 14) {
                HStack(alignment: .firstTextBaseline) {
                    stat(tdee, "Maintenance", Brand.ink)
                    stat(target, r.dir == "lose" ? "To lose" : r.dir == "gain" ? "To gain" : "Target", Brand.green)
                }
                Divider()
                HStack {
                    macro(r.protein, "Protein"); macro(r.fat, "Fat"); macro(r.carbs, "Carbs")
                }
                VStack(spacing: 4) {
                    if let l = r.level, !l.isEmpty { Text(l).font(.brand(.subheadline)).foregroundStyle(Brand.ink2) }
                    if let w = r.warn, !w.isEmpty {
                        Label(w, systemImage: "exclamationmark.triangle.fill").font(.brand(.subheadline, .medium)).foregroundStyle(Brand.danger)
                    }
                }
                .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .accessibilityElement(children: .combine)
            .accessibilityIdentifier("guest-result")
        } else {
            Text("Add sex, age, weight and height").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                .frame(maxWidth: .infinity).padding(.vertical, 10)
        }
    }
    private func stat(_ v: Double, _ label: LocalizedStringKey, _ color: Color) -> some View {
        VStack(spacing: 2) {
            Text(Fmt.kcal(v)).font(Brand.num(30, .semibold)).monospacedDigit().foregroundStyle(color).contentTransition(.numericText())
            Text(label).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
        }
        .frame(maxWidth: .infinity)
    }
    private func macro(_ v: Double?, _ label: LocalizedStringKey) -> some View {
        VStack(spacing: 2) {
            Text("\(Fmt.grams(v ?? 0)) g").font(Brand.num(19, .semibold)).monospacedDigit().foregroundStyle(Brand.ink).contentTransition(.numericText())
            Text(label).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
        }
        .frame(maxWidth: .infinity)
    }

    private func load() {
        guard !loaded else { return }
        let g = store.root["guest"]?.object ?? [:]
        sex = g["sex"]?.string ?? ""
        age = g["age"]?.number.map { plain($0.rounded()) } ?? ""
        weight = g["kg"]?.number.map { plain(lb ? $0 * 2.20462 : $0) } ?? ""
        height = g["heightCm"]?.number.map { plain($0.rounded()) } ?? ""
        steps = g["steps"]?.number ?? 7000
        if let t = g["training"]?.object {
            days = Int(t["days"]?.number ?? 0); type = t["type"]?.string ?? "lifting"
            minutes = Int(t["minutes"]?.number ?? 60); intensity = t["intensity"]?.string ?? "moderate"
        }
        paceKg = g["paceKg"]?.number ?? 0
        loaded = true
    }
    private func setPace(_ dir: String, _ i: Int) {
        Task { paceKg = await store.engineRef.paceValue(dir, max(0, i)) }
    }
    /// Start again for someone new (the web app's Clear).
    private func clear() {
        withAnimation(.snappy) {
            sex = ""; age = ""; weight = ""; height = ""; steps = 7000
            days = 0; type = "lifting"; minutes = 60; intensity = "moderate"; paceKg = 0
        }
    }
}
