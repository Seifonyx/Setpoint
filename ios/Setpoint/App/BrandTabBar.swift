import SwiftUI
import UIKit

/// The tab bar's state, shared by every screen: compact while you scroll down a page, full again when you scroll up
/// or reach the top; hidden on screens with their own bottom bar (the planner) and while the keyboard is up.
@MainActor @Observable
final class TabBarState {
    static let shared = TabBarState()
    var compact = UserDefaults.standard.string(forKey: "bar") == "compact" // build-server screenshots
    private(set) var hiders = 0          // screens on show that want no tab bar
    private(set) var keyboard = false
    var hidden: Bool { hiders > 0 || keyboard }

    func hide() { hiders += 1 }
    func show() { hiders = max(0, hiders - 1) }

    private var observers: [NSObjectProtocol] = []
    init() {
        let nc = NotificationCenter.default
        observers.append(nc.addObserver(forName: UIResponder.keyboardWillShowNotification, object: nil, queue: .main) { _ in
            MainActor.assumeIsolated { TabBarState.shared.keyboard = true }
        })
        observers.append(nc.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: .main) { _ in
            MainActor.assumeIsolated { TabBarState.shared.keyboard = false }
        })
    }
}

/// Setpoint's own tab bar, so it can shrink in place (like Instagram) instead of folding into the selected tab:
/// full size with names at rest, a smaller pill with just the icons while you scroll down. It behaves like the
/// system's Liquid Glass bar: the glass reacts to your touch, and you can slide along it to switch tabs, with the
/// selection lifting into a glass lens that follows your finger.
struct BrandTabBar: View {
    @Binding var tab: AppTab
    let badge: Int
    var reselect: (AppTab) -> Void = { _ in }
    @State private var bar = TabBarState.shared
    @State private var frames: [AppTab: CGRect] = [:]
    @State private var dragging: AppTab?       // the tab under your finger while you slide
    @State private var pressed = false
    @Namespace private var pill
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private let items: [(AppTab, LocalizedStringKey, String, String)] = [
        (.diary, "Diary", "book.pages", "book.pages.fill"),
        (.progress, "Progress", "chart.bar", "chart.bar.fill"),
        (.foods, "Foods", "fork.knife.circle", "fork.knife.circle.fill"),
        (.you, "You", "person.crop.circle", "person.crop.circle.fill"),
    ]
    private var shown: AppTab { dragging ?? tab }

    var body: some View {
        let compact = bar.compact
        HStack(spacing: compact ? 4 : 2) {
            ForEach(items, id: \.0) { item in cell(item, compact: compact) }
        }
        .padding(compact ? 5 : 6)
        .glassEffect(.regular.interactive(), in: .capsule)
        .scaleEffect(pressed && !reduceMotion ? 1.02 : 1)
        .gesture(slide)
        .frame(maxWidth: compact ? 236 : .infinity)
        .padding(.horizontal, compact ? 0 : 20)
        .padding(.bottom, compact ? 2 : 0)
        .animation(reduceMotion ? nil : .spring(response: 0.38, dampingFraction: 0.82), value: compact)
        .animation(reduceMotion ? nil : .spring(response: 0.32, dampingFraction: 0.78), value: shown)
        .animation(reduceMotion ? nil : .spring(response: 0.3, dampingFraction: 0.7), value: pressed)
        .sensoryFeedback(.selection, trigger: shown)
        .coordinateSpace(.named("tabbar")) // outermost, so the finger and the tabs are measured in the same place
    }

    /// Touch anywhere on the bar: lift there, slide to another tab, let go to open it. A tap on the open tab
    /// asks it to go back to its top.
    private var slide: some Gesture {
        DragGesture(minimumDistance: 0, coordinateSpace: .named("tabbar"))
            .onChanged { v in
                pressed = true
                if let t = item(at: v.location) { dragging = t }
            }
            .onEnded { v in
                pressed = false
                let t = item(at: v.location) ?? dragging
                dragging = nil
                guard let t else { return }
                if t == tab { reselect(t) } else { tab = t }
                if bar.compact { bar.compact = false }
            }
    }
    private func item(at p: CGPoint) -> AppTab? {
        guard !frames.isEmpty else { return nil }
        // the nearest tab by its middle, so sliding past either end still lands on the end tab
        return frames.min { abs($0.value.midX - p.x) < abs($1.value.midX - p.x) }?.key
    }

    private func cell(_ item: (AppTab, LocalizedStringKey, String, String), compact: Bool) -> some View {
        let on = shown == item.0, lifted = on && dragging != nil
        return VStack(spacing: 3) {
            Image(systemName: on ? item.3 : item.2)
                .font(.system(size: compact ? 19 : 21, weight: .medium))
                .overlay(alignment: .topTrailing) {
                    if item.0 == .you && badge > 0 {
                        Text("\(badge)").font(.system(size: 11, weight: .bold)).foregroundStyle(.white)
                            .frame(minWidth: 17, minHeight: 17).background(Brand.danger, in: Circle())
                            .offset(x: 9, y: -6)
                    }
                }
            if !compact {
                Text(item.1).font(.brand(.caption2, on ? .semibold : .medium)).lineLimit(1).minimumScaleFactor(0.8)
                    .transition(.opacity.combined(with: .scale(scale: 0.6, anchor: .top)))
            }
        }
        .foregroundStyle(on ? Brand.ink : Brand.ink2)
        .frame(maxWidth: .infinity, minHeight: compact ? 38 : 50)
        .background {
            if on {
                // at rest a soft pill; while you slide it lifts into a glass lens, a little bigger, under your finger
                Group {
                    if lifted { Capsule().fill(.clear).glassEffect(.regular.interactive(), in: .capsule) }
                    else { Capsule().fill(Brand.ink.opacity(0.09)) }
                }
                .scaleEffect(lifted && !reduceMotion ? 1.12 : 1)
                .matchedGeometryEffect(id: "pill", in: pill)
            }
        }
        .scaleEffect(lifted && !reduceMotion ? 1.06 : 1)
        .contentShape(Capsule())
        .onGeometryChange(for: CGRect.self) { $0.frame(in: .named("tabbar")) } action: { frames[item.0] = $0 }
        // VoiceOver: each tab is its own button
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(item.1))
        .accessibilityAddTraits(tab == item.0 ? [.isButton, .isSelected] : .isButton)
        .accessibilityValue(item.0 == .you && badge > 0 ? Text("Your week is ready") : Text(""))
        .accessibilityAction { if tab == item.0 { reselect(item.0) } else { tab = item.0 } }
    }
}

extension View {
    /// On a tab's main scrolling page: scrolling down makes the tab bar compact, scrolling up or reaching the top
    /// makes it full again.
    func shrinksTabBar() -> some View { modifier(ShrinksTabBar()) }
    /// On a screen with its own bottom bar: no tab bar while it's on show.
    func hidesTabBar() -> some View { modifier(HidesTabBar()) }
}

private struct ShrinksTabBar: ViewModifier {
    func body(content: Content) -> some View {
        content.onScrollGeometryChange(for: CGFloat.self) { g in g.contentOffset.y + g.contentInsets.top } action: { old, new in
            let bar = TabBarState.shared
            if new < 24 { if bar.compact { bar.compact = false } ; return }  // at the top: always full
            let d = new - old
            if d > 6, !bar.compact { bar.compact = true }
            else if d < -6, bar.compact { bar.compact = false }
        }
    }
}

private struct HidesTabBar: ViewModifier {
    func body(content: Content) -> some View {
        content
            .toolbar(.hidden, for: .tabBar)
            .onAppear { TabBarState.shared.hide() }
            .onDisappear { TabBarState.shared.show() }
    }
}
