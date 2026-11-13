import SwiftUI

/// Age, sex, height and (optional) body fat: what the expenditure formula starts from.
struct AboutYouSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var sex = "female"
    @State private var age = ""
    @State private var height = ""
    @State private var bodyFat = ""

    private func num(_ s: String) -> Double? { Double(s.replacingOccurrences(of: ",", with: ".")) }
    private var valid: Bool { (13...100).contains(Int(num(age) ?? 0)) && (120...230).contains(num(height) ?? 0) && (bodyFat.isEmpty || (3...60).contains(num(bodyFat) ?? 0)) }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Sex", selection: $sex) { Text("Female").tag("female"); Text("Male").tag("male"); Text("Other").tag("other") }
                        .pickerStyle(.segmented)
                }
                Section {
                    numberRow("Age", $age, "years", .numberPad)
                    numberRow("Height", $height, "cm", .decimalPad)
                    numberRow("Body fat (optional)", $bodyFat, "%", .decimalPad)
                } footer: { Text("Body fat makes resting burn and protein more precise.") }
            }
            .brandList()
            .navigationTitle("About you")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save).disabled(!valid) }
            }
            .onAppear {
                guard let p = store.overview?.profile else { return }
                sex = p.sex ?? "female"
                if let a = store.overview?.age { age = String(a) }
                if let h = p.heightCm { height = String(Int(h.rounded())) }
                if let b = p.bodyFat { bodyFat = b.formatted(.number.grouping(.never).locale(Locale(identifier: "en_US_POSIX"))) }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func numberRow(_ title: LocalizedStringKey, _ text: Binding<String>, _ unit: LocalizedStringKey, _ keyboard: UIKeyboardType) -> some View {
        LabeledContent(title) {
            HStack(spacing: 4) {
                TextField("", text: text).keyboardType(keyboard).multilineTextAlignment(.trailing).frame(maxWidth: 90)
                Text(unit).foregroundStyle(.secondary)
            }
        }
    }

    private func save() {
        guard let a = num(age), let h = num(height) else { return }
        let year = Calendar.current.component(.year, from: Date()) - Int(a)
        store.setProfile { p in
            p["sex"] = .string(sex); p["birthYear"] = .number(Double(year)); p["heightCm"] = .number(h)
            if let b = num(bodyFat), !bodyFat.isEmpty { p["bodyFat"] = .number(b) } else { p.removeValue(forKey: "bodyFat") }
        }
        dismiss()
    }
}

/// Steps and workouts: the moving part of your expenditure.
struct ActivitySheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var steps = 6000.0
    @State private var days = 3
    @State private var type = "lifting"
    @State private var minutes = 60
    @State private var intensity = "moderate"

    var body: some View {
        NavigationStack {
            Form {
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
            }
            .brandList()
            .navigationTitle("Activity")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .onAppear {
                guard let p = store.overview?.profile else { return }
                steps = Double(p.steps ?? 6000)
                if let t = p.training { days = t.days; type = t.type; minutes = t.minutes; intensity = t.intensity }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func save() {
        store.setProfile { p in
            p["steps"] = .number(steps)
            p["training"] = .object(["days": .number(Double(days)), "type": .string(type), "minutes": .number(Double(minutes)), "intensity": .string(intensity)])
            p["paceAt"] = .number(Double(Day.number(Day.today))) // a new activity restarts the 2-week check, like the web app
        }
        dismiss()
    }
}

struct GoalWeightSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var text = ""

    var body: some View {
        NavigationStack {
            Form {
                HStack {
                    TextField("Goal weight", text: $text).keyboardType(.decimalPad).font(.brand(.title2, .semibold))
                    Text(LocalizedStringKey(store.unit)).foregroundStyle(.secondary)
                }
                if store.overview?.goalKg != nil {
                    Button("Remove goal weight", role: .destructive) { store.setSetting("goalKg", nil); dismiss() }
                }
            }
            .brandList()
            .navigationTitle("Goal weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save).disabled(kg == nil) }
            }
            .onAppear { if let g = store.overview?.goalKg { text = Fmt.weight(g, unit: store.unit) } }
        }
        .presentationDetents([.height(260)])
    }
    private var kg: Double? {
        guard let v = Double(text.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")) else { return nil }
        let k = store.unit == "lb" ? v / 2.20462 : v
        return (20...400).contains(k) ? k : nil
    }
    private func save() { if let k = kg { store.setSetting("goalKg", .number((k * 10).rounded() / 10)) }; dismiss() }
}

/// What your log says you burn: food eaten against how your weight moved, last 4 weeks.
struct MeasuredSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                if let m = store.overview?.measured {
                    if m.ready, let t = m.tdee {
                        Section {
                            Text("\(Fmt.kcal((t / 10).rounded() * 10)) kcal").font(Brand.num(48, .semibold))
                            if let i = m.intake { LabeledContent("Ate a day") { Text(Fmt.kcal(i)) } }
                            if let r = m.rateKgWk { LabeledContent("Weight change a week") { Text("\(Fmt.weight(r, unit: store.unit)) \(store.unit)") } }
                            LabeledContent("Days logged") { Text("\(m.calDays)/\(m.days ?? m.calDays)") }
                        } footer: { Text("What you ate vs how your weight moved, last 4 weeks.") }
                        if let c = m.coverage, c < 0.8 {
                            Section { Text("Unlogged days hide what you ate, so this may read low. It counts less until you log more days.").foregroundStyle(Brand.amber) }
                        }
                        if let p = m.partial, p > 0 { Section { Text("Left out \(p) days that looked half-logged.").foregroundStyle(.secondary) } }
                    } else {
                        Section {
                            LabeledContent("Days logged") { Text("\(min(m.calDays, m.needCal))/\(m.needCal)") }
                            LabeledContent("Days of weigh-ins") { Text("\(min(m.span, m.needSpan))/\(m.needSpan)") }
                        } footer: { Text("Log every day and weigh in to learn your real burn.") }
                    }
                }
            }
            .brandList()
            .navigationTitle("Measured expenditure")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
        .presentationDetents([.medium, .large])
    }
}

/// How the target is worked out, in numbers.
struct BreakdownView: View {
    @Environment(Store.self) private var store

    var body: some View {
        List {
            if let o = store.overview, let p = o.plan, let e = o.energy {
                let goalK = p.pace.kg * 7700 / 7
                Section {
                    LabeledContent("Expenditure") { Text(Fmt.kcal((e.tdee / 10).rounded() * 10)) }
                    if p.pace.dir != "maintain" {
                        let amount = "\(Fmt.weight(abs(p.pace.kg), unit: o.unit)) \(NSLocalizedString(o.unit, comment: ""))"
                        LabeledContent {
                            Text((goalK < 0 ? "−" : "+") + Fmt.kcal(abs((goalK / 10).rounded() * 10)))
                        } label: {
                            if p.pace.dir == "lose" { Text("To lose \(amount) a week") } else { Text("To gain \(amount) a week") }
                        }
                    }
                    LabeledContent("Your daily target") { Text("\(Fmt.kcal((p.target / 10).rounded() * 10)) kcal").bold() }
                }
                Section {
                    LabeledContent("Protein") { Text("\(Fmt.grams(p.protein)) g · \(perKg(p.proteinPerKg)) g/kg") }
                    LabeledContent("Fat") { Text("\(Fmt.grams(p.fat)) g · \(perKg(p.fatPerKg)) g/kg") }
                    LabeledContent("Carbs") { Text("\(Fmt.grams(p.carbs)) g") }
                    if let r = p.ranges, r.protein.count >= 2, r.fat.count >= 2 {
                        Stepper(value: Binding(get: { p.proteinPerKg }, set: { v in setMacro("protein", v) }), in: r.protein[0]...r.protein[1], step: 0.1) {
                            LabeledContent("Protein per kg") { Text(perKg(p.proteinPerKg)).monospacedDigit() }
                        }
                        Stepper(value: Binding(get: { p.fatPerKg }, set: { v in setMacro("fat", v) }), in: r.fat[0]...r.fat[1], step: 0.1) {
                            LabeledContent("Fat per kg") { Text(perKg(p.fatPerKg)).monospacedDigit() }
                        }
                        if p.custom { Button("Use recommended") { store.setProfile { $0["macros"] = .object(["protein": .null, "fat": .null]) } } }
                    }
                } header: { Text("Macros") } footer: {
                    let ref = Int(p.ref.rounded())
                    switch p.refWhy {
                    case "your lean mass": Text("Protein and fat are set per kg of your lean mass (\(ref) kg). Carbs are the rest.")
                    case "healthy weight for your height": Text("Protein and fat are set per kg of a healthy weight for your height (\(ref) kg). Carbs are the rest.")
                    default: Text("Protein and fat are set per kg of your weight (\(ref) kg). Carbs are the rest.")
                    }
                }
                Section { Text("Estimates, not medical advice. See a doctor first if you're pregnant, ill or have had an eating disorder.").font(.brand(.footnote)).foregroundStyle(.secondary) }
            }
        }
        .brandList()
        .navigationTitle("Target breakdown")
    }
    private func setMacro(_ k: String, _ v: Double) {
        store.setProfile { p in
            var m = p["macros"]?.object ?? ["protein": .null, "fat": .null]
            m[k] = .number((v * 10).rounded() / 10)
            p["macros"] = .object(m)
        }
    }
    private func perKg(_ v: Double) -> String { v.formatted(.number.precision(.fractionLength(0...1))) }
}
