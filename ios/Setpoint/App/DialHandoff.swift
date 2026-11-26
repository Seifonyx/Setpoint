import SwiftUI

/// What a dial shows: the fill and the three macro rings. Equatable, so the Diary can report it when it changes.
struct DialValues: Equatable {
    var eaten: Double
    var target: Double?
    var protein: Double?, proteinTarget: Double?
    var carbs: Double?, carbsTarget: Double?
    var fat: Double?, fatTarget: Double?

    /// The sign-in card's dial while it fills: what the flying dial starts with.
    static let placeholder = DialValues(eaten: 78, target: 100, protein: 62, proteinTarget: 100, carbs: 74, carbsTarget: 100, fat: 47, fatTarget: 100)

    init(eaten: Double, target: Double?, protein: Double? = nil, proteinTarget: Double? = nil, carbs: Double? = nil, carbsTarget: Double? = nil,
         fat: Double? = nil, fatTarget: Double? = nil) {
        self.eaten = eaten; self.target = target
        self.protein = protein; self.proteinTarget = proteinTarget
        self.carbs = carbs; self.carbsTarget = carbsTarget
        self.fat = fat; self.fatTarget = fatTarget
    }
    /// The Diary's dial, from the same numbers it draws.
    init(totals: Totals, plan: DayPlan?) {
        self.init(eaten: totals.kcal, target: plan?.kcal,
                  protein: plan.map { _ in totals.protein }, proteinTarget: plan?.protein,
                  carbs: plan.map { _ in totals.carbs }, carbsTarget: plan?.carbs,
                  fat: plan.map { _ in totals.fat }, fatTarget: plan?.fat)
    }
}

/// The sign-in dial flying into the Diary's dial: both screens report where their dial is (in global coordinates),
/// and for a moment one dial is drawn above everything, travelling from the first spot to the second, and growing
/// into what the Diary's dial actually shows.
@Observable @MainActor final class DialHandoff {
    static let shared = DialHandoff()
    var source: CGRect = .zero      // the sign-in dial
    var target: CGRect = .zero      // the Diary dial, live
    var landing: CGRect = .zero     // the Diary dial, frozen at take-off: later layout changes don't move the flight
    var targetValues: DialValues?   // what the Diary dial shows now
    var landingValues: DialValues?  // ...frozen at take-off, so a sync mid-flight can't make the rings jump
    var flying = false              // the flying dial is on screen; both real dials hide
    var arrived = false             // the flying dial has reached the landing (drives the spring)
    var fading = false              // the flying dial fades out while the real one fades in under it
    var skipNext = false            // set by an email sign-up: a new account gets the plain fade

    func reset() { flying = false; arrived = false; fading = false; landing = .zero; landingValues = nil }
}

/// The one dial in the air. It starts as the sign-in dial, and on landing it shows the Diary dial's own values.
struct FlyingDial: View {
    let handoff: DialHandoff
    var body: some View {
        let from = handoff.source, to = handoff.landing, done = handoff.arrived
        let box = done ? to : from
        let v = done ? (handoff.landingValues ?? .placeholder) : .placeholder
        GeometryReader { g in
            let origin = g.frame(in: .global).origin
            CalorieDial(eaten: v.eaten, target: v.target,
                        protein: v.protein.flatMap { p in v.proteinTarget.map { (p, $0) } },
                        carbs: v.carbs.flatMap { c in v.carbsTarget.map { (c, $0) } },
                        fat: v.fat.flatMap { f in v.fatTarget.map { (f, $0) } },
                        lineWidth: done ? 15 : 9, ringWidth: done ? 4 : 3, ringGap: done ? 7 : 4)
                .frame(width: box.width, height: box.height)
                .position(x: box.midX - origin.x, y: box.midY - origin.y)
        }
        .ignoresSafeArea()
        .opacity(handoff.fading ? 0 : 1)
        .animation(.easeOut(duration: 0.18), value: handoff.fading)
        .environment(\.layoutDirection, .leftToRight)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}
