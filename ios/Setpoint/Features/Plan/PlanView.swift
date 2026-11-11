import SwiftUI

/// Plan: your daily target, goal and expenditure. Every number comes from the web app's own maths (via the engine).
struct PlanView: View {
    @Environment(Store.self) private var store
    @State private var about = false
    @State private var activity = false
    @State private var goalWeight = false
    @State private var measured = false

    enum Page: Hashable { case goal, week, energy }
    /// nil: the overview (target and categories); otherwise one category's page.
    var page: Page? = nil

    var body: some View {
        List {
            if let o = store.overview {
                switch page {
                case nil:
                    if !o.ready || o.kg == nil {
                        Section {
                            ContentUnavailableView {
                                Label("Let's work out your targets", systemImage: "target")
                            } description: {
                                Text(!o.ready ? "Add your age, sex and height." : "Log your weight in the Diary to finish.")
                            } actions: {
                                if !o.ready { Button("About you") { about = true }.buttonStyle(.glassProminent) }
                            }
                        }
                    }
                    if let p = o.plan { targetSection(p, o) }
                    Section {
                        if let p = o.plan {
                            NavigationLink { PlanView(page: .goal) } label: {
                                row("Goal", goalSummary(p, o), "flag.checkered", Brand.amber)
                            }
                            NavigationLink { PlanView(page: .week) } label: {
                                row("Your week", weekSummary, "calendar", Brand.water)
                            }
                        }
                        NavigationLink { PlanView(page: .energy) } label: {
                            row("Energy expenditure", o.energy.map { "\(Fmt.kcal(round10($0.tdee))) kcal · " + sourceLabel($0) } ?? "", "flame.fill", Brand.protein)
                        }
                    }
                    Section("Inputs") {
                        Button { activity = true } label: { row("Activity", activitySummary(o), "figure.walk", Brand.green) }
                        Button { about = true } label: { row("About you", aboutSummary(o), "person.text.rectangle", Brand.fat) }
                    }
                    .tint(.primary)
                case .goal?:
                    if let p = o.plan { goalSection(p, o) }
                case .week?:
                    WeekPlanSection()
                case .energy?:
                    expenditureSection(o)
                    Section { ExpenditureChart() }
                }
            } else {
                ProgressView()
            }
        }
        .brandList()
        .navigationTitle(pageTitle)
        .sheet(isPresented: $about) { AboutYouSheet() }
        .sheet(isPresented: $activity) { ActivitySheet() }
        .sheet(isPresented: $goalWeight) { GoalWeightSheet() }
        .sheet(isPresented: $measured) { MeasuredSheet() }
        .task { await store.refreshOverview() }
    }

    // MARK: Sections

    @ViewBuilder private func targetSection(_ p: Overview.Plan, _ o: Overview) -> some View {
        Section {
            VStack(alignment: .leading, spacing: 10) {
                Text("Daily target").font(.brand(.subheadline)).foregroundStyle(.secondary)
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(Fmt.kcal(round10(p.target))).font(Brand.display(44, .bold)).contentTransition(.numericText())
                    Text("kcal").foregroundStyle(.secondary)
                }
                if let e = o.energy {
                    let d = round10(p.target - e.tdee)
                    Group {
                        if abs(d) < 5 { Text("Same as your expenditure") }
                        else if d < 0 { Text("\(Fmt.kcal(-d)) kcal below your expenditure") }
                        else { Text("\(Fmt.kcal(d)) kcal above your expenditure") }
                    }
                    .font(.brand(.subheadline)).foregroundStyle(.secondary)
                }
                if !p.warn.isEmpty { Label(LocalizedStringKey(p.warn), systemImage: "exclamationmark.triangle.fill").font(.brand(.subheadline)).foregroundStyle(Brand.amber) }
                HStack(spacing: 12) {
                    macro("Protein", p.protein, 4, p, Brand.protein)
                    macro("Carbs", p.carbs, 4, p, Brand.carbs)
                    macro("Fat", p.fat, 9, p, Brand.fat)
                }
                .padding(.top, 4)
            }
            .padding(.vertical, 4)
            .animation(.snappy, value: p.target)
            NavigationLink("Target breakdown") { BreakdownView() }
        }
    }

    @ViewBuilder private func goalSection(_ p: Overview.Plan, _ o: Overview) -> some View {
        Section {
            Picker("Goal", selection: Binding(get: { p.pace.dir }, set: { setPace($0, p.pace.dir == $0 ? p.pace.i : 1) })) {
                Text("Lose").tag("lose"); Text("Maintain").tag("maintain"); Text("Gain").tag("gain")
            }
            .pickerStyle(.segmented)
            if p.pace.dir != "maintain" {
                Picker("Pace per week", selection: Binding(get: { p.pace.i }, set: { setPace(p.pace.dir, $0) })) {
                    ForEach(Array((o.rates[p.pace.dir] ?? []).enumerated()), id: \.offset) { i, v in
                        Text("\(v.formatted()) \(o.unit)").tag(i)
                    }
                }
            }
            Button { goalWeight = true } label: {
                LabeledContent("Goal weight") { Text(o.goalKg.map { "\(Fmt.weight($0, unit: o.unit)) \(o.unit)" } ?? String(localized: "Set")) }
            }
            .tint(.primary)
            if !p.eta.isEmpty { Text(LocalizedStringKey(p.eta.prefix(1).uppercased() + p.eta.dropFirst())).font(.brand(.subheadline)).foregroundStyle(.secondary) }
        }
    }

    @ViewBuilder private func expenditureSection(_ o: Overview) -> some View {
        Section {
            if let e = o.energy {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Daily expenditure").font(.brand(.subheadline)).foregroundStyle(.secondary)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(Fmt.kcal(round10(e.tdee))).font(Brand.display(34, .bold))
                        Text("kcal").foregroundStyle(.secondary)
                    }
                    Text(sourceLabel(e) + (e.level.map { " · " + NSLocalizedString($0, comment: "") } ?? "")).font(.brand(.subheadline)).foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
                if let parts = e.parts {
                    LabeledContent("Resting") { Text(Fmt.kcal(round10(parts.bmr))).monospacedDigit() }
                    LabeledContent("Movement") { Text(Fmt.kcal(round10(parts.life))).monospacedDigit() }
                    LabeledContent("Steps") { Text(Fmt.kcal(round10(parts.steps))).monospacedDigit() }
                    LabeledContent("Training") { Text(Fmt.kcal(round10(parts.train))).monospacedDigit() }
                }
            }
            Toggle(isOn: Binding(get: { o.adaptive }, set: { store.setSetting("autoAdjust", .bool($0)) })) {
                Text("Adaptive expenditure")
                Text(o.adaptive ? "Food log + weigh-ins" : "Formula only")
            }
            Button { measured = true } label: {
                LabeledContent {
                    Text(o.measured.tdee.map { Fmt.kcal(round10($0)) } ?? "\(min(o.measured.calDays, o.measured.needCal))/\(o.measured.needCal)").monospacedDigit()
                } label: {
                    Text("Measured expenditure")
                    if o.measured.ready, let c = o.measured.coverage { Text("\(Int((c * 100).rounded()))% of days logged") } else { Text("Learning") }
                }
            }
            .tint(.primary)
            if let why = o.tuneWhy {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Last weekly check").font(.brand(.subheadline, .semibold))
                    Text(LocalizedStringKey(why)).font(.brand(.subheadline)).foregroundStyle(.secondary)
                }
                .padding(.vertical, 2)
            }
        }
    }

    // MARK: Bits

    private func round10(_ v: Double) -> Double { (v / 10).rounded() * 10 }
    private func sourceLabel(_ e: Overview.Energy) -> String {
        if e.source == "measured" { return String(localized: "From your log") }
        if e.source == "calc" { return String(localized: "Formula") }
        let w = e.w ?? 0
        return w >= 0.99 ? String(localized: "From your log") : w > 0 ? String(localized: "Learning · \(Int((w * 100).rounded()))% your log") : String(localized: "Formula for now")
    }
    private func macro(_ label: LocalizedStringKey, _ g: Double, _ kcalPerG: Double, _ p: Overview.Plan, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 5) { Circle().fill(color).frame(width: 7, height: 7); Text(label).font(.brand(.caption)).foregroundStyle(.secondary) }
            Text("\(Fmt.grams(g)) g").font(.brand(.headline))
            Text("\(Int((g * kcalPerG / max(p.target, 1) * 100).rounded()))%").font(.brand(.caption2)).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    private func row(_ title: LocalizedStringKey, _ sub: String, _ icon: String, _ color: Color) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.body.weight(.semibold)).foregroundStyle(color)
                .frame(width: 34, height: 34).background(color.opacity(0.14), in: .rect(cornerRadius: 10))
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.brand(.body, .semibold))
                if !sub.isEmpty { Text(sub).font(.brand(.subheadline)).foregroundStyle(.secondary).lineLimit(1) }
            }
        }
    }
    private var pageTitle: LocalizedStringKey {
        switch page { case nil: "Plan"; case .goal?: "Goal"; case .week?: "Your week"; case .energy?: "Energy expenditure" }
    }
    private func goalSummary(_ p: Overview.Plan, _ o: Overview) -> String {
        let pace = Fmt.weight(abs(p.pace.kg), unit: o.unit) + " " + o.unit
        let dir = p.pace.dir == "lose" ? String(localized: "Lose \(pace) a week") : p.pace.dir == "gain" ? String(localized: "Gain \(pace) a week") : String(localized: "Maintain")
        return o.goalKg.map { dir + " · " + String(localized: "goal \(Fmt.weight($0, unit: o.unit)) \(o.unit)") } ?? dir
    }
    private var weekSummary: String {
        let s = store.root["settings"]?.object ?? [:]
        var parts: [String] = []
        if !(s["train"]?["days"]?.array ?? []).isEmpty { parts.append(String(localized: "Training days")) }
        if s["flex"]?["on"]?.bool == true { parts.append(String(localized: "Flexible week")) }
        if s["cycle"]?["on"]?.bool == true { parts.append(String(localized: "Cycle")) }
        return parts.isEmpty ? String(localized: "Same target every day") : parts.joined(separator: " · ")
    }
    private func activitySummary(_ o: Overview) -> String {
        let steps = (o.profile.steps ?? 0).formatted()
        guard let t = o.profile.training, t.days > 0 else { return String(localized: "\(steps) steps · no workouts") }
        return String(localized: "\(steps) steps · \(t.days)× a week")
    }
    private func aboutSummary(_ o: Overview) -> String {
        guard o.ready else { return String(localized: "Not set") }
        var parts: [String] = []
        if let s = o.profile.sex { parts.append(NSLocalizedString(s.capitalized, comment: "")) }
        if let a = o.age { parts.append("\(a)") }
        if let h = o.profile.heightCm { parts.append("\(Int(h.rounded())) cm") }
        if let bf = o.profile.bodyFat { parts.append("\(bf.formatted())% fat") }
        return parts.joined(separator: " · ")
    }
    private func setPace(_ dir: String, _ i: Int) {
        Task {
            let v = await store.engineRef.paceValue(dir, max(0, i))
            store.setProfile { p in p["paceKg"] = .number(v); p["paceAt"] = .number(Double(Day.number(Day.today))) }
        }
    }
}
