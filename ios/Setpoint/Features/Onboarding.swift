import SwiftUI

/// First launch: a short walk from "who are you" to your daily target, saved in the same places the Plan screens use.
struct OnboardingView: View {
    @Environment(Store.self) private var store
    @Environment(Account.self) private var account
    let finish: () -> Void
    @State private var step = 0
    @State private var signingIn = false

    // answers
    @State private var unit = Locale.current.measurementSystem == .us ? "lb" : "kg"
    @State private var sex = "female"
    @State private var age = 30
    @State private var heightCm = 170.0
    @State private var weightText = ""
    @State private var goalText = ""
    @State private var dir = "lose"
    @State private var pace = 1
    @State private var steps = 6000.0
    @State private var workouts = 3
    @State private var shown = 0.0
    @State private var arrived = false

    private let steps_ = 6

    var body: some View {
        VStack(spacing: 0) {
            if step > 0 {
                HStack {
                    Button { withAnimation(.snappy) { step -= 1 } } label: { Image(systemName: "chevron.backward").font(.body.weight(.semibold)) }
                        .buttonStyle(.glass).buttonBorderShape(.circle)
                    ProgressView(value: Double(step), total: Double(steps_ - 1)).tint(Brand.green).padding(.horizontal, 8)
                }
                .padding(.horizontal, 20).padding(.top, 8)
            }
            ZStack {
                switch step {
                case 0: welcome
                case 1: aboutYou
                case 2: weight
                case 3: goal
                case 4: activity
                default: reveal
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity), removal: .move(edge: .leading).combined(with: .opacity)))
            .id(step)
        }
        .paperPage()
        .sheet(isPresented: $signingIn, onDismiss: { if account.signedIn { finish() } }) { NavigationStack { AccountView() } }
        .sensoryFeedback(.selection, trigger: step)
    }

    // MARK: Pages

    private var welcome: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack {
                CalorieDial(eaten: shown, target: 100, protein: (shown * 0.8, 100), carbs: (shown * 0.95, 100), fat: (shown * 0.6, 100))
                    .frame(width: 220, height: 220)
            }
            .onAppear {
                withAnimation(.spring(response: 1.4, dampingFraction: 0.75).delay(0.2)) { shown = 78 }
                withAnimation(.spring(response: 0.8, dampingFraction: 0.85).delay(0.55)) { arrived = true }
            }
            VStack(spacing: 8) {
                Text("Setpoint").font(Brand.display(46, .heavy))
                Text("Eat to your target. Watch your weight trend settle where you want it.")
                    .font(.brand(.title3)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center).padding(.horizontal, 30)
            }
            .opacity(arrived ? 1 : 0).offset(y: arrived ? 0 : 18)
            Spacer()
            VStack(spacing: 12) {
                primary("Get started") { next() }
                Button("I already have an account") { signingIn = true }.font(.brand(.body, .semibold)).foregroundStyle(Brand.green)
            }
            .padding(.horizontal, 24).padding(.bottom, 20)
            .opacity(arrived ? 1 : 0).offset(y: arrived ? 0 : 24)
        }
    }

    private var aboutYou: some View {
        page("About you", "This sets how much you burn at rest.") {
            Picker("Sex", selection: $sex) { Text("Female").tag("female"); Text("Male").tag("male") }.pickerStyle(.segmented)
            card {
                Stepper(value: $age, in: 13...100) { LabeledContent("Age") { Text("\(age)").font(Brand.num(26, .semibold)).monospacedDigit() } }
            }
            card {
                VStack(alignment: .leading, spacing: 8) {
                    LabeledContent("Height") {
                        Text(unit == "lb" ? "\(Int(heightCm / 2.54) / 12)′ \(Int((heightCm / 2.54).rounded()) % 12)″" : "\(Int(heightCm.rounded())) cm")
                            .font(Brand.num(26, .semibold)).monospacedDigit()
                    }
                    Slider(value: $heightCm, in: 130...215, step: unit == "lb" ? 2.54 : 1).tint(Brand.green)
                }
            }
            Picker("Units", selection: $unit) { Text("kg · cm").tag("kg"); Text("lb · ft").tag("lb") }.pickerStyle(.segmented)
        } next: {
            store.setSetting("unit", .string(unit))
            let year = Calendar.current.component(.year, from: Date()) - age
            store.setProfile { p in p["sex"] = .string(sex); p["birthYear"] = .number(Double(year)); p["heightCm"] = .number(heightCm.rounded()) }
            next()
        }
    }

    private var weight: some View {
        page("Your weight", "Weigh in in the morning, before you eat or drink.", canContinue: kg(weightText) != nil) {
            card { field("Weight today", $weightText) }
            card { field("Goal weight (optional)", $goalText) }
        } next: {
            if let kg = kg(weightText) { store.logWeight(kg, on: Day.today, note: "", excluded: false) }
            if let g = kg(goalText) { store.setSetting("goalKg", .number((g * 10).rounded() / 10)) }
            if let w = kg(weightText), let g = kg(goalText) { dir = g < w - 0.5 ? "lose" : g > w + 0.5 ? "gain" : "maintain" }
            next()
        }
    }

    private var goal: some View {
        page("Your goal", "You can change this any time in You › Plan.") {
            Picker("Goal", selection: $dir) { Text("Lose").tag("lose"); Text("Maintain").tag("maintain"); Text("Gain").tag("gain") }.pickerStyle(.segmented)
            if dir != "maintain" {
                let rates = store.overview?.rates[dir] ?? (dir == "lose" ? [0.25, 0.5, 0.75, 1] : [0.25, 0.5])
                VStack(spacing: 10) {
                    ForEach(rates.indices, id: \.self) { i in
                        Button { pace = i } label: {
                            HStack {
                                Text("\(rates[i].formatted()) \(unit) a week").font(.brand(.body, .semibold))
                                Spacer()
                                Text(i == 0 ? "Gentle" : i == rates.count - 1 ? "Fast" : i == 1 ? "Steady" : "Brisk").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                                Image(systemName: pace == i ? "checkmark.circle.fill" : "circle").foregroundStyle(pace == i ? Brand.green : Brand.ink2)
                            }
                            .brandCard(padding: 14)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        } next: {
            Task {
                let v = await store.engineRef.paceValue(dir, dir == "maintain" ? 0 : pace)
                store.setProfile { p in p["paceKg"] = .number(v); p["paceAt"] = .number(Double(Day.number(Day.today))) }
            }
            next()
        }
    }

    private var activity: some View {
        page("How active are you?", "Steps and workouts add to what you burn.") {
            card {
                VStack(alignment: .leading, spacing: 8) {
                    LabeledContent("Daily steps") { Text(Int(steps).formatted()).font(Brand.num(26, .semibold)).monospacedDigit() }
                    Slider(value: $steps, in: 0...20000, step: 500).tint(Brand.green)
                }
            }
            card {
                Stepper(value: $workouts, in: 0...7) { LabeledContent("Workouts a week") { Text("\(workouts)").font(Brand.num(26, .semibold)).monospacedDigit() } }
            }
        } next: {
            store.setProfile { p in
                p["steps"] = .number(steps)
                p["training"] = .object(["days": .number(Double(workouts)), "type": .string("lifting"), "minutes": .number(60), "intensity": .string("moderate")])
            }
            next()
        }
    }

    private var reveal: some View {
        VStack(spacing: 20) {
            Spacer()
            Text("Your daily target").font(.brand(.title3, .semibold)).foregroundStyle(Brand.ink2)
            if let p = store.overview?.plan {
                Text(Fmt.kcal(shown)).font(Brand.num(86, .bold)).monospacedDigit().contentTransition(.numericText())
                    .onAppear { shown = 0; withAnimation(.spring(response: 1.2, dampingFraction: 0.9)) { shown = (p.target / 10).rounded() * 10 } }
                Text("kcal a day").font(.brand(.title3)).foregroundStyle(Brand.ink2)
                HStack(spacing: 12) {
                    macro("Protein", p.protein, Brand.protein); macro("Carbs", p.carbs, Brand.carbs); macro("Fat", p.fat, Brand.fat)
                }
                .padding(.horizontal, 24).padding(.top, 8)
                Text("It learns from your log and weigh-ins, and adjusts once a week.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                    .multilineTextAlignment(.center).padding(.horizontal, 40)
            } else {
                ProgressView()
            }
            Spacer()
            primary("Start logging") { UserDefaults.standard.set(true, forKey: "onboarded"); finish() }
                .padding(.horizontal, 24).padding(.bottom, 20)
        }
        .task { await store.refreshOverview() }
    }

    // MARK: Bits

    private func next() { withAnimation(.snappy) { step += 1 } }
    private func kg(_ t: String) -> Double? {
        guard let v = Double(t.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")), v > 0 else { return nil }
        let k = unit == "lb" ? v / 2.20462 : v
        return (25...350).contains(k) ? k : nil
    }
    private func page<C: View>(_ title: LocalizedStringKey, _ sub: LocalizedStringKey, canContinue: Bool = true, @ViewBuilder content: () -> C, next: @escaping () -> Void) -> some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 6) {
                Text(title).font(Brand.display(34, .heavy))
                Text(sub).font(.brand(.body)).foregroundStyle(Brand.ink2)
            }
            .padding(.top, 24)
            content()
            Spacer()
            primary("Continue", action: next).disabled(!canContinue)
        }
        .padding(.horizontal, 24).padding(.bottom, 20)
    }
    private func card<C: View>(@ViewBuilder _ c: () -> C) -> some View { c().brandCard(padding: 16) }
    private func field(_ label: LocalizedStringKey, _ text: Binding<String>) -> some View {
        HStack {
            Text(label).font(.brand(.body))
            Spacer()
            TextField("0", text: text).keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                .font(Brand.display(24, .bold)).frame(maxWidth: 110)
            Text(LocalizedStringKey(unit)).foregroundStyle(Brand.ink2)
        }
    }
    private func primary(_ title: LocalizedStringKey, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).font(.brand(.headline)).foregroundStyle(Brand.card).frame(maxWidth: .infinity, minHeight: 54)
                .background(Brand.green, in: Capsule())
        }
        .buttonStyle(.plain)
    }
    private func macro(_ l: LocalizedStringKey, _ g: Double, _ c: Color) -> some View {
        VStack(spacing: 4) {
            Text("\(Fmt.grams(g)) g").font(Brand.num(26, .semibold))
            HStack(spacing: 4) { Circle().fill(c).frame(width: 7, height: 7); Text(l).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2) }
        }
        .frame(maxWidth: .infinity).brandCard(padding: 12)
    }
}
