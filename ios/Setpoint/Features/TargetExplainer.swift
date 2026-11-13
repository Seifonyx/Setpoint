import SwiftUI

/// How your target works, step by step with your own numbers: what you burn (measured from your log once there's
/// enough of it, estimated until then), the pace you chose, and the target that comes out. Plus how far along the
/// learning is, and the last change and why.
struct TargetExplainer: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    if let o = store.overview, let e = o.energy, let p = o.plan {
                        let burn = (e.tdee / 10).rounded() * 10
                        let perDay = (p.pace.kg * 7700 / 7 / 10).rounded() * 10
                        step(1, "What you burn", "\(Fmt.kcal(burn)) kcal", Brand.amber) {
                            if o.measured.ready, let intake = o.measured.intake, let rate = o.measured.rateKgWk {
                                Text("Measured from your own log: you ate about \(Fmt.kcal(intake)) kcal a day while your weight trend moved \(signed(rate)) a week. What you burn is what explains both.")
                            } else {
                                Text("Estimated from your body and activity until your log can measure it.")
                                if let parts = e.parts {
                                    VStack(spacing: 6) {
                                        part("Resting", parts.bmr); part("Daily life", parts.life); part("Steps", parts.steps); part("Training", parts.train)
                                    }
                                    .padding(.top, 4)
                                }
                            }
                        }
                        step(2, "Your pace", paceTitle(p.pace), Brand.green) {
                            if p.pace.dir == "maintain" || p.pace.kg == 0 {
                                Text("You're maintaining, so you eat what you burn.")
                            } else {
                                Text("\(Fmt.weight(p.pace.kg, unit: store.unit)) \(store.unit) a week is about \(Fmt.kcal(perDay)) kcal a day \(p.pace.dir == "lose" ? String(localized: "below") : String(localized: "above")) what you burn (a kilo of body weight is about 7,700 kcal).")
                            }
                        }
                        step(3, "Your target", "\(Fmt.kcal((p.target / 10).rounded() * 10)) kcal", Brand.protein) {
                            Text(verbatim: "\(Fmt.kcal(burn)) \(p.pace.dir == "gain" ? "+" : "−") \(Fmt.kcal(p.pace.dir == "maintain" ? 0 : perDay)) ≈ \(Fmt.kcal((p.target / 10).rounded() * 10)) kcal")
                                .font(Brand.display(20, .bold)).monospacedDigit()
                            if !p.warn.isEmpty { Text(LocalizedStringKey(p.warn)).foregroundStyle(Brand.amber) }
                            Text("Protein \(Fmt.grams(p.protein)) g · carbs \(Fmt.grams(p.carbs)) g · fat \(Fmt.grams(p.fat)) g")
                                .foregroundStyle(Brand.ink2)
                        }
                        learning(o.measured)
                        VStack(alignment: .leading, spacing: 6) {
                            Label("Latest change", systemImage: "arrow.triangle.2.circlepath").font(.brand(.headline))
                            if let why = o.tuneWhy { Text(LocalizedStringKey(why)) } else {
                                Text("No change lately: your target still fits how your weight is moving.").foregroundStyle(Brand.ink2)
                            }
                        }
                        .font(.brand(.body))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .brandCard()
                    } else {
                        EmptyState(icon: "target", title: "No plan yet", message: "Set up your plan in You › Plan and this explains your target with your own numbers.").brandCard()
                    }
                }
                .padding(.horizontal, 16).padding(.bottom, 24)
            }
            .background(Brand.bg.ignoresSafeArea())
            .navigationTitle("How your target works")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
    }

    private func step<C: View>(_ n: Int, _ title: LocalizedStringKey, _ value: String, _ color: Color, @ViewBuilder _ body: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                Text("\(n)").font(Brand.display(15, .bold)).foregroundStyle(.white).frame(width: 26, height: 26).background(color, in: Circle())
                Text(title).font(.brand(.headline))
                Spacer()
                Text(value).font(Brand.display(20, .bold)).monospacedDigit().foregroundStyle(color)
            }
            VStack(alignment: .leading, spacing: 6) { body() }.font(.brand(.body)).fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
    }
    private func part(_ name: LocalizedStringKey, _ v: Double) -> some View {
        HStack { Text(name).foregroundStyle(Brand.ink2); Spacer(); Text("\(Fmt.kcal(v)) kcal").monospacedDigit() }.font(.brand(.subheadline))
    }
    private func signed(_ kg: Double) -> String {
        (kg > 0 ? "+" : kg < 0 ? "−" : "") + Fmt.weight(abs(kg), unit: store.unit) + " " + store.unit
    }
    private func paceTitle(_ p: Overview.Pace) -> String {
        p.dir == "maintain" || p.kg == 0 ? String(localized: "Maintain")
            : (p.dir == "lose" ? "−" : "+") + Fmt.weight(p.kg, unit: store.unit) + " " + store.unit + String(localized: "/wk")
    }
    /// How far the app is in learning your metabolism from your own log.
    private func learning(_ m: Overview.Measured) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(m.ready ? "Using your real numbers" : "Learning your metabolism", systemImage: m.ready ? "checkmark.seal.fill" : "brain.head.profile")
                .font(.brand(.headline)).foregroundStyle(m.ready ? Brand.green : Brand.ink)
            if !m.ready {
                bar("Days with food logged", Double(m.calDays), Double(m.needCal))
                bar("Days of weigh-ins", Double(m.span), Double(m.needSpan))
                Text("Once both are full, what you burn is measured from your own log instead of estimated, and your target follows it.")
                    .font(.brand(.footnote)).foregroundStyle(Brand.ink2)
            } else {
                Text("Your target follows what your log shows you burn, and keeps adjusting as you go.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandCard()
    }
    private func bar(_ label: LocalizedStringKey, _ v: Double, _ need: Double) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack { Text(label).font(.brand(.subheadline)); Spacer(); Text("\(Int(min(v, need))) / \(Int(need))").font(.brand(.subheadline)).monospacedDigit().foregroundStyle(Brand.ink2) }
            ProgressView(value: min(v, need), total: max(need, 1)).tint(Brand.green)
        }
    }
}
