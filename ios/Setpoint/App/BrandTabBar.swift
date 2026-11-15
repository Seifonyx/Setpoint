import SwiftUI
import UIKit

/// The tab bar's state, shared by every screen: compact while you scroll down a page, full again when you scroll up
/// or reach the top.
@MainActor @Observable
final class TabBarState {
    static let shared = TabBarState()
    var compact = UserDefaults.standard.string(forKey: "bar") == "compact" // build-server screenshots
}

/// Shrinks the system's own Liquid Glass tab bar in place while you scroll (like Instagram): the same bar, glass and
/// touch feel, just smaller and with the names stepping aside; full size again when you scroll up or reach the top.
/// It finds the tab bar the system draws and scales its glass platter, anchored to the bottom, so pages keep their usual spacing.
struct TabBarShrinker: UIViewRepresentable {
    let compact: Bool
    func makeUIView(context: Context) -> Probe { Probe() }
    func updateUIView(_ v: Probe, context: Context) { v.apply(compact) }

    final class Probe: UIView {
        private var want = false        // what the bar should be
        private var shown: Bool?        // what it is now
        private var tries = 0
        override func didMoveToWindow() { super.didMoveToWindow(); shown = nil; tries = 0; settle() }
        func apply(_ compact: Bool) { want = compact; tries = 0; settle() }
        /// Bring the bar to the wanted size; if the system hasn't made the bar yet (at launch), try again shortly.
        private func settle() {
            guard want != shown else { return }
            guard let bar = tabBar().map(Self.platter) else {
                if tries < 20 { tries += 1; DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in self?.settle() } }
                return
            }
            let compact = want
            shown = compact
            let scale: CGFloat = compact ? 0.82 : 1
            let drop = bar.bounds.height * (1 - scale) / 2   // keep its bottom edge where it was
            let t = compact ? CGAffineTransform(translationX: 0, y: drop).scaledBy(x: scale, y: scale) : .identity
            let change = { bar.transform = t; Self.names(in: bar, hidden: compact) }
            if UIAccessibility.isReduceMotionEnabled || window == nil { change(); return }
            UIView.animate(withDuration: 0.42, delay: 0, usingSpringWithDamping: 0.82, initialSpringVelocity: 0, options: [.allowUserInteraction, .beginFromCurrentState], animations: change)
        }
        /// The tab names fade out while the bar is compact, and each icon moves down to the middle of its tab.
        /// (The system bar doesn't redraw its labels when SwiftUI changes them while it's on screen, so this is done here.)
        private static func names(in bar: UIView, hidden: Bool) {
            func labels(_ v: UIView) -> [UILabel] { (v as? UILabel).map { [$0] } ?? v.subviews.flatMap(labels) }
            for label in labels(bar) {
                label.alpha = hidden ? 0 : 1
                guard let tab = label.superview else { continue }
                for icon in tab.subviews where !(icon is UILabel) && icon.frame.height < tab.bounds.height * 0.8 && icon.frame.maxY <= label.frame.minY + 2 {
                    icon.transform = hidden ? CGAffineTransform(translationX: 0, y: tab.bounds.midY - icon.frame.midY) : .identity
                }
            }
        }
        /// On iOS 26 the glass and the tabs live in the bar's "platter" view (360×62 inside the 402×83 bar):
        /// scale that, so glass and icons shrink together.
        private static func platter(_ bar: UITabBar) -> UIView {
            bar.subviews.first { String(describing: type(of: $0)).contains("Platter") } ?? bar
        }
        private func tabBar() -> UITabBar? {
            func find(_ vc: UIViewController?) -> UITabBarController? {
                guard let vc else { return nil }
                if let t = vc as? UITabBarController { return t }
                for c in vc.children { if let t = find(c) { return t } }
                return nil
            }
            if let bar = find(window?.rootViewController)?.tabBar { return bar }
            // otherwise look through the window's views for the bar the system drew
            func scan(_ v: UIView) -> UITabBar? {
                if let b = v as? UITabBar { return b }
                for c in v.subviews { if let b = scan(c) { return b } }
                return nil
            }
            return window.flatMap(scan)
        }
    }
}

extension View {
    /// On a tab's main scrolling page: scrolling down makes the tab bar compact, scrolling up or reaching the top
    /// makes it full again.
    func shrinksTabBar() -> some View { modifier(ShrinksTabBar()) }
    /// On a screen with its own bottom bar: no tab bar while it's on show (the system hides it).
    func hidesTabBar() -> some View { modifier(HidesTabBar()) }
}

private struct ShrinksTabBar: ViewModifier {
    func body(content: Content) -> some View {
        content.onScrollGeometryChange(for: CGFloat.self) { g in g.contentOffset.y + g.contentInsets.top } action: { old, new in
            let bar = TabBarState.shared
            if UserDefaults.standard.string(forKey: "bar") == "compact" { return } // build-server screenshot holds it compact
            if new < 24 { if bar.compact { bar.compact = false } ; return }  // at the top: always full
            let d = new - old
            if d > 6, !bar.compact { bar.compact = true }
            else if d < -6, bar.compact { bar.compact = false }
        }
    }
}

private struct HidesTabBar: ViewModifier {
    func body(content: Content) -> some View { content.toolbar(.hidden, for: .tabBar) }
}
