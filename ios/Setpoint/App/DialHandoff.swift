import SwiftUI

/// The sign-in dial flying into the Diary's dial: both screens report where their dial is (in global coordinates),
/// and for a moment one dial is drawn above everything, travelling from the first spot to the second.
@Observable @MainActor final class DialHandoff {
    static let shared = DialHandoff()
    var source: CGRect = .zero      // the sign-in dial
    var target: CGRect = .zero      // the Diary dial
    var flying = false              // the flying dial is on screen; both real dials hide
    var arrived = false             // the flying dial has reached the target (drives the spring)
    var skipNext = false            // set by an email sign-up: a new account gets the plain fade
}

/// The one dial in the air. Same placeholder values as the welcome dial, so it looks like the same dial.
struct FlyingDial: View {
    let handoff: DialHandoff
    var body: some View {
        let from = handoff.source, to = handoff.target, done = handoff.arrived
        let size = done ? to.size : from.size
        GeometryReader { g in
            let origin = g.frame(in: .global).origin
            CalorieDial(eaten: 78, target: 100, protein: (62, 100), carbs: (74, 100), fat: (47, 100),
                        lineWidth: done ? 15 : 18, ringWidth: done ? 4 : 5, ringGap: done ? 7 : 10)
                .frame(width: size.width, height: size.height)
                .position(x: (done ? to.midX : from.midX) - origin.x, y: (done ? to.midY : from.midY) - origin.y)
        }
        .ignoresSafeArea()
        .environment(\.layoutDirection, .leftToRight)
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}
