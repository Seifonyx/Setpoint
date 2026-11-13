import SwiftUI

/// One empty state for the whole app: an icon in a soft circle, a title, a line of help and (maybe) one action.
struct EmptyState: View {
    var art: EmptyArt? = nil
    var icon: String = "sparkles"
    let title: LocalizedStringKey
    let message: LocalizedStringKey
    var color: Color = Brand.green
    var action: (title: LocalizedStringKey, run: () -> Void)? = nil

    var body: some View {
        VStack(spacing: 12) {
            if let art { EmptyArtView(art: art) } else {
                Image(systemName: icon).font(.system(size: 26, weight: .semibold)).foregroundStyle(color)
                    .frame(width: 64, height: 64).background(color.opacity(0.14), in: Circle())
            }
            Text(title).font(Brand.display(20, .bold)).multilineTextAlignment(.center)
            Text(message).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            if let action {
                Button(action: action.run) { Text(action.title).font(.brand(.headline)).padding(.horizontal, 8) }
                    .buttonStyle(.glassProminent).tint(Brand.green).padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20).padding(.horizontal, 12)
        .accessibilityElement(children: .combine)
    }
}

/// Placeholder rows while something loads: soft shapes that gently pulse, instead of a spinner.
struct SkeletonRows: View {
    var count = 4
    @State private var on = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<count, id: \.self) { i in
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 10).fill(Brand.card2).frame(width: 38, height: 38)
                    VStack(alignment: .leading, spacing: 7) {
                        Capsule().fill(Brand.card2).frame(width: [170, 130, 190, 150][i % 4], height: 11)
                        Capsule().fill(Brand.card2.opacity(0.7)).frame(width: [90, 110, 70, 100][i % 4], height: 9)
                    }
                    Spacer()
                    Capsule().fill(Brand.card2).frame(width: 36, height: 11)
                }
            }
        }
        .opacity(on ? 0.45 : 1)
        .onAppear { if !reduceMotion { withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) { on = true } } }
        .accessibilityLabel(Text("Loading"))
    }
}

/// Small line drawings for empty screens, in the brand colours (drawn in code, so they're crisp at any size).
enum EmptyArt { case plate, cup, scale, target, repeating, sunrise }

struct EmptyArtView: View {
    let art: EmptyArt
    var body: some View {
        Canvas { ctx, size in
            let w = size.width, h = size.height
            let ink = GraphicsContext.Shading.color(Brand.green), dot = GraphicsContext.Shading.color(Brand.amber)
            let stroke = StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
            func line(_ pts: [CGPoint]) -> Path { var p = Path(); p.addLines(pts); return p }
            switch art {
            case .plate:
                ctx.stroke(Path(ellipseIn: CGRect(x: w * 0.25, y: h * 0.12, width: w * 0.5, height: w * 0.5)), with: ink, style: stroke)
                ctx.stroke(Path(ellipseIn: CGRect(x: w * 0.34, y: h * 0.12 + w * 0.09, width: w * 0.32, height: w * 0.32)), with: ink, style: StrokeStyle(lineWidth: 2, dash: [4, 5]))
                // fork and knife
                ctx.stroke(line([CGPoint(x: w * 0.14, y: h * 0.14), CGPoint(x: w * 0.14, y: h * 0.86)]), with: ink, style: stroke)
                for dx in [-0.04, 0.0, 0.04] { ctx.stroke(line([CGPoint(x: w * (0.14 + dx), y: h * 0.14), CGPoint(x: w * (0.14 + dx), y: h * 0.32)]), with: ink, style: stroke) }
                var knife = Path(); knife.move(to: CGPoint(x: w * 0.86, y: h * 0.86)); knife.addLine(to: CGPoint(x: w * 0.86, y: h * 0.14))
                knife.addQuadCurve(to: CGPoint(x: w * 0.86, y: h * 0.5), control: CGPoint(x: w * 0.96, y: h * 0.3))
                ctx.stroke(knife, with: ink, style: stroke)
                ctx.fill(Path(ellipseIn: CGRect(x: w * 0.47, y: h * 0.12 + w * 0.22, width: w * 0.06, height: w * 0.06)), with: dot)
            case .cup:
                var cup = Path()
                cup.move(to: CGPoint(x: w * 0.24, y: h * 0.42)); cup.addLine(to: CGPoint(x: w * 0.68, y: h * 0.42))
                cup.addLine(to: CGPoint(x: w * 0.64, y: h * 0.84)); cup.addQuadCurve(to: CGPoint(x: w * 0.28, y: h * 0.84), control: CGPoint(x: w * 0.46, y: h * 0.92))
                cup.closeSubpath()
                ctx.stroke(cup, with: ink, style: stroke)
                var handle = Path(); handle.move(to: CGPoint(x: w * 0.67, y: h * 0.5))
                handle.addCurve(to: CGPoint(x: w * 0.65, y: h * 0.72), control1: CGPoint(x: w * 0.84, y: h * 0.48), control2: CGPoint(x: w * 0.84, y: h * 0.74))
                ctx.stroke(handle, with: ink, style: stroke)
                for x in [0.38, 0.52] {
                    var steam = Path(); steam.move(to: CGPoint(x: w * x, y: h * 0.34))
                    steam.addCurve(to: CGPoint(x: w * x, y: h * 0.08), control1: CGPoint(x: w * (x - 0.07), y: h * 0.26), control2: CGPoint(x: w * (x + 0.07), y: h * 0.16))
                    ctx.stroke(steam, with: .color(Brand.amber), style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                }
            case .scale:
                ctx.stroke(Path(roundedRect: CGRect(x: w * 0.2, y: h * 0.14, width: w * 0.6, height: h * 0.72), cornerRadius: 14), with: ink, style: stroke)
                var dial = Path(); dial.addArc(center: CGPoint(x: w * 0.5, y: h * 0.48), radius: w * 0.16, startAngle: .degrees(200), endAngle: .degrees(340), clockwise: false)
                ctx.stroke(dial, with: ink, style: stroke)
                ctx.stroke(line([CGPoint(x: w * 0.5, y: h * 0.48), CGPoint(x: w * 0.58, y: h * 0.36)]), with: dot, style: stroke)
                ctx.fill(Path(ellipseIn: CGRect(x: w * 0.47, y: h * 0.45, width: w * 0.06, height: w * 0.06)), with: dot)
                ctx.stroke(line([CGPoint(x: w * 0.34, y: h * 0.72), CGPoint(x: w * 0.66, y: h * 0.72)]), with: ink, style: StrokeStyle(lineWidth: 2, lineCap: .round))
            case .target:
                for r in [0.36, 0.24, 0.12] {
                    ctx.stroke(Path(ellipseIn: CGRect(x: w * 0.5 - w * r, y: h * 0.5 - w * r, width: w * r * 2, height: w * r * 2)), with: ink, style: stroke)
                }
                ctx.fill(Path(ellipseIn: CGRect(x: w * 0.47, y: h * 0.5 - w * 0.03, width: w * 0.06, height: w * 0.06)), with: dot)
                ctx.stroke(line([CGPoint(x: w * 0.53, y: h * 0.47), CGPoint(x: w * 0.88, y: h * 0.12)]), with: dot, style: stroke)
                ctx.stroke(line([CGPoint(x: w * 0.78, y: h * 0.12), CGPoint(x: w * 0.88, y: h * 0.12), CGPoint(x: w * 0.88, y: h * 0.22)]), with: dot, style: stroke)
            case .repeating:
                var a = Path(); a.addArc(center: CGPoint(x: w * 0.5, y: h * 0.5), radius: w * 0.3, startAngle: .degrees(200), endAngle: .degrees(340), clockwise: false)
                var b = Path(); b.addArc(center: CGPoint(x: w * 0.5, y: h * 0.5), radius: w * 0.3, startAngle: .degrees(20), endAngle: .degrees(160), clockwise: false)
                ctx.stroke(a, with: ink, style: stroke); ctx.stroke(b, with: ink, style: stroke)
                let tip1 = CGPoint(x: w * 0.5 + w * 0.3 * cos(340 * .pi / 180), y: h * 0.5 + w * 0.3 * sin(340 * .pi / 180))
                ctx.stroke(line([CGPoint(x: tip1.x - 10, y: tip1.y - 4), tip1, CGPoint(x: tip1.x + 2, y: tip1.y - 11)]), with: ink, style: stroke)
                let tip2 = CGPoint(x: w * 0.5 + w * 0.3 * cos(160 * .pi / 180), y: h * 0.5 + w * 0.3 * sin(160 * .pi / 180))
                ctx.stroke(line([CGPoint(x: tip2.x + 10, y: tip2.y + 4), tip2, CGPoint(x: tip2.x - 2, y: tip2.y + 11)]), with: ink, style: stroke)
                ctx.fill(Path(ellipseIn: CGRect(x: w * 0.46, y: h * 0.46, width: w * 0.08, height: w * 0.08)), with: dot)
            case .sunrise:
                // a sun coming up over a plate's rim: a new day, nothing on it yet
                let c = CGPoint(x: w * 0.5, y: h * 0.7), r = w * 0.2
                var sun = Path(); sun.addArc(center: c, radius: r, startAngle: .degrees(180), endAngle: .degrees(360), clockwise: false)
                ctx.fill(sun, with: .color(Brand.amber.opacity(0.22)))
                ctx.stroke(sun, with: dot, style: stroke)
                for a in stride(from: 200.0, through: 340.0, by: 35.0) {
                    let t = a * .pi / 180
                    ctx.stroke(line([CGPoint(x: c.x + (r + 7) * cos(t), y: c.y + (r + 7) * sin(t)), CGPoint(x: c.x + (r + 16) * cos(t), y: c.y + (r + 16) * sin(t))]),
                               with: dot, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                }
                ctx.stroke(line([CGPoint(x: w * 0.1, y: c.y), CGPoint(x: w * 0.9, y: c.y)]), with: ink, style: stroke)
                var rim = Path(); rim.move(to: CGPoint(x: w * 0.22, y: c.y + 8))
                rim.addQuadCurve(to: CGPoint(x: w * 0.78, y: c.y + 8), control: CGPoint(x: w * 0.5, y: c.y + 22))
                ctx.stroke(rim, with: ink, style: StrokeStyle(lineWidth: 2, lineCap: .round))
            }
        }
        .frame(width: 104, height: 84)
        .accessibilityHidden(true)
    }
}

/// The opening moment: the dial from the app icon draws itself, then the app fades in behind it.
struct LaunchDial: View {
    let done: () -> Void
    @State private var fill = 0.0
    @State private var fade = false
    var body: some View {
        ZStack {
            PaperBackground().ignoresSafeArea()
            CalorieDial(eaten: fill, target: 100, protein: (fill * 0.8, 100), carbs: (fill * 0.95, 100), fat: (fill * 0.6, 100))
                .frame(width: 150, height: 150)
                .scaleEffect(fade ? 1.15 : 1)
        }
        .opacity(fade ? 0 : 1)
        .task {
            withAnimation(.spring(response: 0.9, dampingFraction: 0.8)) { fill = 78 }
            try? await Task.sleep(for: .milliseconds(850))
            withAnimation(.easeIn(duration: 0.35)) { fade = true }
            try? await Task.sleep(for: .milliseconds(380))
            done()
        }
        .accessibilityHidden(true)
    }
}

// MARK: - Forms: one clear layout everywhere (a title on every block, label left, a visible box for the value, the unit after it)

/// A number you type: its name on the left, a box you can see on the right, and the unit after it.
struct NumberField: View {
    let label: LocalizedStringKey
    @Binding var text: String
    var unit: LocalizedStringKey? = nil
    var placeholder: LocalizedStringKey = "0"
    var big = false
    var body: some View {
        HStack(spacing: 10) {
            Text(label).font(big ? .brand(.body, .semibold) : .brand(.body)).foregroundStyle(Brand.ink)
            Spacer(minLength: 8)
            TextField(placeholder, text: $text)
                .keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                .font(Brand.num(big ? 22 : 18, .semibold)).monospacedDigit()
                .padding(.horizontal, 10).padding(.vertical, big ? 7 : 5)
                .frame(width: big ? 110 : 92)
                .background(Brand.card2, in: .rect(cornerRadius: 10))
            Text(unit ?? "").font(.brand(.subheadline)).foregroundStyle(Brand.ink2).frame(width: 40, alignment: .leading)
        }
    }
}

/// Words you type (a name): a small label above a full-width box.
struct WordsField: View {
    let label: LocalizedStringKey
    @Binding var text: String
    var placeholder: LocalizedStringKey = ""
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
            TextField(placeholder, text: $text)
                .font(.brand(.body))
                .padding(.horizontal, 12).padding(.vertical, 10)
                .background(Brand.card2, in: .rect(cornerRadius: 10))
        }
        .padding(.vertical, 2)
    }
}
