import SwiftUI
import UIKit

/// Setpoint's one look: warm and editorial. Warm paper and deep charcoal, a signature deep green with a warm amber,
/// Bricolage Grotesque for headlines and numbers, Figtree for text (IBM Plex Sans Arabic in Arabic).
enum Brand {
    // MARK: Colours (light, dark)
    static let bg = dyn(0xF5EFE4, 0x0A0A09)          // the page: warm paper / warm near-black
    static let card = dyn(0xFFFBF4, 0x161513)        // cards
    static let card2 = dyn(0xEFE7DA, 0x24221E)       // inset wells, tracks
    static let ink = dyn(0x1E1A14, 0xEAE5DC)
    static let ink2 = dyn(0x766D60, 0x9A9286)        // secondary text
    static let line = dyn(0xE4DACB, 0x292622)
    static let green = dyn(0x0F5C45, 0x4C9C7E)       // the signature (kept for the ring and the main action)
    static let greenSoft = dyn(0xDCEBE2, 0x14261F)
    static let onGreen = dyn(0xFFFBF4, 0x0A0A09)     // text on the signature green
    static let amber = dyn(0xC9801F, 0xE2A758)       // highlights, carbs
    static let protein = dyn(0xC4553A, 0xDD7860)     // terracotta
    static let carbs = amber
    static let fat = dyn(0x4F6FA3, 0x87A0D2)         // slate blue
    static let water = dyn(0x2C88A8, 0x60B2CC)
    static let danger = dyn(0xC0392B, 0xEF6B5E)     // deleting, erasing, errors and warnings: a clear red
    static let over = dyn(0xB8691C, 0xE69A4E)       // going over is a calm amber, not an alarm

    static func dyn(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(UIColor { $0.userInterfaceStyle == .dark ? rgb(dark) : rgb(light) })
    }
    static func rgb(_ v: UInt32) -> UIColor {
        UIColor(red: CGFloat((v >> 16) & 0xff) / 255, green: CGFloat((v >> 8) & 0xff) / 255, blue: CGFloat(v & 0xff) / 255, alpha: 1)
    }

    // MARK: Type
    static var arabic: Bool { Bundle.main.preferredLocalizations.first?.hasPrefix("ar") == true }
    /// Headlines and big numbers.
    static func display(_ size: CGFloat, _ weight: Font.Weight = .bold, relativeTo style: Font.TextStyle = .largeTitle) -> Font {
        if arabic { return .custom(plex(weight), size: size, relativeTo: style) }
        let name = weight == .heavy || weight == .black ? "BricolageGrotesque-ExtraBold" : weight == .semibold || weight == .medium ? "BricolageGrotesque-SemiBold" : "BricolageGrotesque-Bold"
        return .custom(name, size: size, relativeTo: style)
    }
    /// Numbers: tall and condensed, like a good watch face (Barlow Condensed). Arabic keeps IBM Plex Sans Arabic.
    static func num(_ size: CGFloat, _ weight: Font.Weight = .semibold, relativeTo style: Font.TextStyle = .largeTitle) -> Font {
        if arabic { return .custom(plex(weight == .medium ? .medium : .bold), size: size, relativeTo: style) }
        let name = weight == .bold || weight == .heavy || weight == .black ? "BarlowCondensed-Bold" : weight == .medium ? "BarlowCondensed-Medium" : "BarlowCondensed-SemiBold"
        return .custom(name, size: size, relativeTo: style)
    }
    /// Body text in a text style (scales with Dynamic Type).
    static func text(_ style: Font.TextStyle, _ weight: Font.Weight = .regular) -> Font {
        let size: CGFloat = switch style {
        case .largeTitle: 34; case .title: 28; case .title2: 22; case .title3: 20; case .headline: 17; case .body: 17
        case .callout: 16; case .subheadline: 15; case .footnote: 13; case .caption: 12; case .caption2: 11; default: 17
        }
        let w = style == .headline && weight == .regular ? .semibold : weight
        return .custom(arabic ? plex(w) : figtree(w), size: size, relativeTo: style)
    }
    private static func figtree(_ w: Font.Weight) -> String {
        w == .bold || w == .heavy || w == .black ? "Figtree-Bold" : w == .semibold ? "Figtree-SemiBold" : w == .medium ? "Figtree-Medium" : "Figtree-Regular"
    }
    private static func plex(_ w: Font.Weight) -> String {
        w == .bold || w == .heavy || w == .black ? "IBMPlexSansArabic-Bold" : w == .semibold ? "IBMPlexSansArabic-SemiBold" : w == .medium ? "IBMPlexSansArabic-Medium" : "IBMPlexSansArabic-Regular"
    }

    /// Navigation bar titles in Bricolage, set once at launch.
    @MainActor static func applyAppearance() {
        let large = UIFont(name: arabic ? "IBMPlexSansArabic-Bold" : "BricolageGrotesque-Bold", size: 34) ?? .systemFont(ofSize: 34, weight: .bold)
        let small = UIFont(name: arabic ? "IBMPlexSansArabic-SemiBold" : "BricolageGrotesque-SemiBold", size: 17) ?? .systemFont(ofSize: 17, weight: .semibold)
        let ink = UIColor(Brand.ink)
        let nav = UINavigationBar.appearance()
        nav.largeTitleTextAttributes = [.font: UIFontMetrics(forTextStyle: .largeTitle).scaledFont(for: large), .foregroundColor: ink]
        nav.titleTextAttributes = [.font: UIFontMetrics(forTextStyle: .headline).scaledFont(for: small), .foregroundColor: ink]
        let seg = UISegmentedControl.appearance(), segFont = UIFont(name: arabic ? "IBMPlexSansArabic-SemiBold" : "Figtree-SemiBold", size: 13) ?? .systemFont(ofSize: 13)
        seg.setTitleTextAttributes([.font: segFont, .foregroundColor: UIColor(Brand.ink2)], for: .normal)
        seg.setTitleTextAttributes([.font: segFont, .foregroundColor: UIColor(Brand.bg)], for: .selected)
        seg.selectedSegmentTintColor = UIColor(Brand.ink)
        seg.backgroundColor = UIColor(Brand.card2)
    }
}

/// The style guide: every screen takes its spacing, corners and motion from here, so they all match.
enum Space {
    static let xs: CGFloat = 4, s: CGFloat = 8, m: CGFloat = 12, l: CGFloat = 16, xl: CGFloat = 24, xxl: CGFloat = 32
}
enum Radius {
    static let card: CGFloat = 24, tile: CGFloat = 18, chip: CGFloat = 12
}
enum Motion {
    static let snappy = Animation.snappy(duration: 0.3)
    static let gentle = Animation.spring(response: 0.55, dampingFraction: 0.85)
    static let slow = Animation.spring(response: 1.1, dampingFraction: 0.8)
}

/// The page behind everything: warm paper with a faint grain, tinted by the time of day (a little warmer in the
/// morning, neutral at midday, softer and dimmer at night).
struct PaperBackground: View {
    @Environment(\.colorScheme) private var scheme
    var body: some View {
        TimelineView(.everyMinute) { ctx in
            ZStack {
                Brand.bg
                LinearGradient(colors: [tint(ctx.date), .clear], startPoint: .top, endPoint: .center)
                Image("Grain").resizable(resizingMode: .tile)
                    .opacity(scheme == .dark ? 0.035 : 0.05)
                    .blendMode(scheme == .dark ? .screen : .multiply)
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
    private func tint(_ d: Date) -> Color {
        let h = Double(Calendar.current.component(.hour, from: d)) + Double(Calendar.current.component(.minute, from: d)) / 60
        switch h {
        case 5..<11: return Brand.amber.opacity(scheme == .dark ? 0.07 : 0.09)        // morning: warm
        case 11..<17: return .clear                                                      // midday: plain paper
        case 17..<21: return Brand.protein.opacity(scheme == .dark ? 0.05 : 0.06)      // evening: a little glow
        default: return Color(Brand.rgb(0x2C3A5A)).opacity(scheme == .dark ? 0.12 : 0.06) // night: dimmer and cooler
        }
    }
}

/// A Setpoint card: no outlines. In the light, a soft shadow lifts it off the paper; in the dark it's one step lighter.
struct BrandCardStyle: ViewModifier {
    var padding: CGFloat
    @Environment(\.colorScheme) private var scheme
    func body(content: Content) -> some View {
        content.padding(padding)
            .background(RoundedRectangle(cornerRadius: Radius.card, style: .continuous).fill(Brand.card)
                .shadow(color: .black.opacity(scheme == .dark ? 0 : 0.06), radius: 14, y: 5))
    }
}

extension Font {
    /// Figtree (IBM Plex Sans Arabic in Arabic) in a text style.
    static func brand(_ style: Font.TextStyle, _ weight: Font.Weight = .regular) -> Font { Brand.text(style, weight) }
}

extension View {
    /// Lists and forms on the warm page with warm cards.
    func brandList() -> some View {
        self.scrollContentBackground(.hidden)
            .background(PaperBackground().ignoresSafeArea())
    }
    /// A Setpoint card: warm surface, soft corners, no outline.
    func brandCard(padding: CGFloat = Space.l) -> some View { modifier(BrandCardStyle(padding: padding)) }
    /// The paper page, for screens that aren't lists.
    func paperPage() -> some View { background(PaperBackground().ignoresSafeArea()) }
}

/// The signature: an arc that fills towards your target, with the three macros as thin arcs inside it.
struct CalorieDial: View {
    let eaten: Double
    let target: Double?
    let protein: (Double, Double)?
    let carbs: (Double, Double)?
    let fat: (Double, Double)?
    var lineWidth: CGFloat = 18

    private let start = 0.125, span = 0.75 // a 270° arc, open at the bottom

    var body: some View {
        let t = max(target ?? eaten, 1), p = min(eaten / t, 1), over = (target ?? .infinity) < eaten * 0.95
        ZStack {
            arc(1, width: lineWidth, color: Brand.card2)
            arc(p, width: lineWidth, color: over ? Brand.over : Brand.green)
            if let protein { ring(protein, inset: lineWidth + 8, color: Brand.protein) }
            if let carbs { ring(carbs, inset: lineWidth + 18, color: Brand.carbs) }
            if let fat { ring(fat, inset: lineWidth + 28, color: Brand.fat) }
            // a dot where the arc ends: "today's point"
            GeometryReader { g in
                let r = min(g.size.width, g.size.height) / 2 - lineWidth / 2
                let a = Angle.degrees(90 + 360 * (start + span * p))
                Circle().fill(Brand.amber).frame(width: lineWidth * 0.55, height: lineWidth * 0.55)
                    .shadow(color: Brand.amber.opacity(0.6), radius: 6)
                    .position(x: g.size.width / 2 + r * cos(a.radians), y: g.size.height / 2 + r * sin(a.radians))
                    .opacity(eaten > 0 ? 1 : 0)
            }
        }
        .animation(.spring(response: 0.6, dampingFraction: 0.8), value: eaten)
    }
    private func arc(_ f: Double, width: CGFloat, color: Color, inset: CGFloat = 0) -> some View {
        Circle().trim(from: 0, to: span * max(0, min(f, 1)))
            .stroke(color, style: StrokeStyle(lineWidth: width, lineCap: .round))
            .rotationEffect(.degrees(90 + 360 * start))
            .padding(width / 2 + inset)
    }
    private func ring(_ v: (Double, Double), inset: CGFloat, color: Color) -> some View {
        ZStack {
            arc(1, width: 5, color: Brand.card2, inset: inset)
            arc(v.0 / max(v.1, 1), width: 5, color: color, inset: inset)
        }
    }
}

/// The Setpoint mark: a line that settles onto a point.
struct SetpointMark: View {
    var color: Color = Brand.green
    var body: some View {
        Canvas { ctx, size in
            let w = size.width, h = size.height
            var p = Path()
            p.move(to: CGPoint(x: w * 0.08, y: h * 0.2))
            p.addCurve(to: CGPoint(x: w * 0.78, y: h * 0.66), control1: CGPoint(x: w * 0.35, y: h * 0.2), control2: CGPoint(x: w * 0.45, y: h * 0.66))
            ctx.stroke(p, with: .color(color), style: StrokeStyle(lineWidth: max(2, w * 0.08), lineCap: .round))
            let d = w * 0.18
            ctx.fill(Path(ellipseIn: CGRect(x: w * 0.78 - d / 2, y: h * 0.66 - d / 2, width: d, height: d)), with: .color(Brand.amber))
        }
    }
}
