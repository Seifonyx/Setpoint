import WidgetKit
import SwiftUI
import AppIntents
import ActivityKit

/// Setpoint's widgets: Today (Home Screen and Lock Screen), Weight, and the Live Activity.
/// They read the summary the app writes (Shared/WidgetShared.swift); the water button adds water from the widget.
@main
struct SetpointWidgets: WidgetBundle {
    var body: some Widget {
        TodayWidget()
        WeightWidget()
        DayLiveActivity()
    }
}

// MARK: Timeline

struct DayEntry: TimelineEntry {
    let date: Date
    let day: WidgetDay?
}

struct DayProvider: TimelineProvider {
    func placeholder(in context: Context) -> DayEntry { DayEntry(date: .now, day: .sample) }
    func getSnapshot(in context: Context, completion: @escaping (DayEntry) -> Void) {
        let d = WidgetDay.load()?.on(Day.today)
        completion(DayEntry(date: .now, day: d ?? (context.isPreview ? .sample : nil)))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DayEntry>) -> Void) {
        let now = Date(), midnight = Calendar.current.startOfDay(for: now.addingTimeInterval(86_400))
        let d = WidgetDay.load()
        // At midnight the new day starts empty, until the app writes again.
        let entries = [DayEntry(date: now, day: d?.on(Day.iso(now))), DayEntry(date: midnight, day: d?.on(Day.iso(midnight)))]
        completion(Timeline(entries: entries, policy: .after(midnight.addingTimeInterval(60))))
    }
}

// MARK: Shared pieces

/// The number in the middle: calories left (or over), or eaten when there's no target.
func headline(eaten: Double, target: Double, track: Bool = true) -> (number: String, label: String) {
    if !track || target <= 0 { return (Fmt.kcal(eaten), String(localized: "kcal")) }
    let left = target - eaten
    return left >= 0 ? (Fmt.kcal(left), String(localized: "left")) : (Fmt.kcal(-left), String(localized: "over"))
}

/// The signature arc, sized for widgets: 270°, open at the bottom.
struct MiniDial: View {
    var progress: Double
    var over: Bool
    var width: CGFloat
    var body: some View {
        ZStack {
            arc(1, Brand.card2)
            arc(progress, over ? Brand.over : Brand.green).widgetAccentable()
        }
    }
    private func arc(_ f: Double, _ color: Color) -> some View {
        Circle().trim(from: 0, to: 0.75 * max(0, min(f, 1)))
            .stroke(color, style: StrokeStyle(lineWidth: width, lineCap: .round))
            .rotationEffect(.degrees(135))
            .padding(width / 2)
    }
}

struct DialWithNumber: View {
    var eaten: Double, target: Double, track: Bool = true
    var width: CGFloat = 11
    var size: CGFloat = 30
    var body: some View {
        let h = headline(eaten: eaten, target: target, track: track)
        ZStack {
            MiniDial(progress: target > 0 && track ? min(eaten / target, 1) : 0, over: track && target > 0 && eaten > target * 1.05, width: width)
            VStack(spacing: -2) {
                Text(verbatim: h.number).font(Brand.display(size)).monospacedDigit().minimumScaleFactor(0.5).lineLimit(1)
                Text(verbatim: h.label).font(.brand(.caption2, .medium)).foregroundStyle(Brand.ink2)
            }
            .padding(.horizontal, width + 6)
        }
    }
}

struct MacroBar: View {
    var name: LocalizedStringKey
    var value: Double, target: Double
    var color: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 4) {
                Text(name).font(.brand(.caption2, .semibold)).foregroundStyle(Brand.ink2)
                Spacer(minLength: 2)
                Text(verbatim: target > 0 ? "\(Fmt.grams(value)) / \(Fmt.grams(target)) \(String(localized: "g"))" : "\(Fmt.grams(value)) \(String(localized: "g"))")
                    .font(.brand(.caption2)).monospacedDigit().foregroundStyle(Brand.ink)
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Brand.card2)
                    Capsule().fill(color).frame(width: g.size.width * (target > 0 ? min(value / target, 1) : 0)).widgetAccentable()
                }
            }
            .frame(height: 5)
        }
    }
}

struct WaterButton: View {
    var water: Double
    var body: some View {
        Button(intent: WidgetWaterIntent()) {
            Label { Text(verbatim: Fmt.ml(water)).monospacedDigit() } icon: { Image(systemName: "drop.fill") }
                .font(.brand(.caption, .semibold))
                .foregroundStyle(Brand.water)
                .padding(.horizontal, 10).padding(.vertical, 6)
                .frame(maxWidth: .infinity)
                .background(Capsule().fill(Brand.water.opacity(0.14)))
        }
        .buttonStyle(.plain)
    }
}

struct SetUpNote: View {
    var body: some View {
        VStack(spacing: 6) {
            SetpointMark().frame(width: 30, height: 30)
            Text("Open Setpoint once to set up this widget.").font(.brand(.caption)).multilineTextAlignment(.center).foregroundStyle(Brand.ink2)
        }
    }
}

// MARK: Today

struct TodayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "today", provider: DayProvider()) { entry in
            TodayView(day: entry.day)
                .containerBackground(Brand.card, for: .widget)
                .widgetURL(URL(string: "setpoint://diary"))
        }
        .configurationDisplayName("Today")
        .description("Calories left, macros and water.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

struct TodayView: View {
    var day: WidgetDay?
    @Environment(\.widgetFamily) private var family

    var body: some View {
        if let d = day {
            switch family {
            case .systemSmall: small(d)
            case .systemMedium: medium(d)
            case .accessoryCircular: circular(d)
            case .accessoryRectangular: rectangular(d)
            default: inline(d)
            }
        } else if family == .accessoryInline || family == .accessoryCircular {
            Image(systemName: "fork.knife")
        } else if family == .accessoryRectangular {
            Text("Open Setpoint once to set up this widget.").font(.caption)
        } else {
            SetUpNote()
        }
    }

    private func small(_ d: WidgetDay) -> some View {
        VStack(spacing: 8) {
            DialWithNumber(eaten: d.eaten, target: d.target, track: d.trackCalories)
            WaterButton(water: d.water)
        }
    }

    private func medium(_ d: WidgetDay) -> some View {
        HStack(spacing: 16) {
            DialWithNumber(eaten: d.eaten, target: d.target, track: d.trackCalories)
                .frame(width: 128)
            VStack(alignment: .leading, spacing: 7) {
                HStack {
                    Text("Today").font(Brand.display(15, .semibold))
                    Spacer()
                    if let kg = d.weightKg {
                        Label { Text(verbatim: "\(Fmt.weight(kg, unit: d.unit)) \(d.unit)").monospacedDigit() } icon: { Image(systemName: "scalemass") }
                            .font(.brand(.caption2, .medium)).foregroundStyle(Brand.ink2)
                    }
                }
                MacroBar(name: "Protein", value: d.protein, target: d.proteinTarget, color: Brand.protein)
                MacroBar(name: "Carbs", value: d.carbs, target: d.carbsTarget, color: Brand.carbs)
                MacroBar(name: "Fat", value: d.fat, target: d.fatTarget, color: Brand.fat)
                HStack(spacing: 8) {
                    WaterButton(water: d.water)
                    Link(destination: URL(string: "setpoint://add")!) {
                        Label("Add food", systemImage: "plus")
                            .font(.brand(.caption, .semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 10).padding(.vertical, 6)
                            .frame(maxWidth: .infinity)
                            .background(Capsule().fill(Brand.green))
                    }
                }
            }
        }
    }

    private func circular(_ d: WidgetDay) -> some View {
        let h = headline(eaten: d.eaten, target: d.target, track: d.trackCalories)
        return Gauge(value: d.trackCalories ? d.progress : 0) {
            Image(systemName: "fork.knife")
        } currentValueLabel: {
            Text(verbatim: h.number).monospacedDigit().minimumScaleFactor(0.5)
        }
        .gaugeStyle(.accessoryCircular)
        .widgetAccentable()
    }

    private func rectangular(_ d: WidgetDay) -> some View {
        let h = headline(eaten: d.eaten, target: d.target, track: d.trackCalories)
        return VStack(alignment: .leading, spacing: 1) {
            Text(verbatim: "\(h.number) \(h.label)").font(.headline).monospacedDigit().widgetAccentable()
            Text(verbatim: "\(String(localized: "P")) \(Fmt.grams(d.protein)) · \(String(localized: "C")) \(Fmt.grams(d.carbs)) · \(String(localized: "F")) \(Fmt.grams(d.fat))")
                .font(.caption).monospacedDigit()
            Text(verbatim: "\(Fmt.ml(d.water))").font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func inline(_ d: WidgetDay) -> some View {
        let h = headline(eaten: d.eaten, target: d.target, track: d.trackCalories)
        return Label { Text(verbatim: "\(h.number) \(h.label)") } icon: { Image(systemName: "fork.knife") }
    }
}

// MARK: Weight

struct WeightWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "weight", provider: DayProvider()) { entry in
            WeightView(day: entry.day)
                .containerBackground(Brand.card, for: .widget)
                .widgetURL(URL(string: "setpoint://diary"))
        }
        .configurationDisplayName("Weight")
        .description("Your latest weigh-in and how it's trending.")
        .supportedFamilies([.systemSmall, .accessoryRectangular, .accessoryCircular])
    }
}

struct Sparkline: View {
    var values: [Double]
    var body: some View {
        GeometryReader { g in
            let lo = values.min() ?? 0, hi = values.max() ?? 1, span = max(hi - lo, 0.2)
            let pts = values.enumerated().map { i, v in
                CGPoint(x: values.count > 1 ? g.size.width * CGFloat(i) / CGFloat(values.count - 1) : g.size.width / 2,
                        y: g.size.height * (1 - CGFloat((v - lo) / span)))
            }
            Path { p in
                guard let first = pts.first else { return }
                p.move(to: first)
                for pt in pts.dropFirst() { p.addLine(to: pt) }
            }
            .stroke(Brand.green, style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
            .widgetAccentable()
            if let last = pts.last {
                Circle().fill(Brand.amber).frame(width: 7, height: 7).position(last)
            }
        }
    }
}

struct WeightView: View {
    var day: WidgetDay?
    @Environment(\.widgetFamily) private var family

    var body: some View {
        if let d = day, let kg = d.weightKg {
            let change = d.recent.count > 1 ? kg - d.recent[0] : 0
            let changeText = (change > 0 ? "+" : change < 0 ? "−" : "") + Fmt.weight(abs(change), unit: d.unit)
            switch family {
            case .accessoryCircular:
                VStack(spacing: 0) {
                    Text(verbatim: Fmt.weight(kg, unit: d.unit)).font(.system(size: 15, weight: .bold)).monospacedDigit().minimumScaleFactor(0.6)
                    Text(verbatim: d.unit).font(.caption2)
                }
                .widgetAccentable()
            case .accessoryRectangular:
                HStack(spacing: 8) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(verbatim: "\(Fmt.weight(kg, unit: d.unit)) \(d.unit)").font(.headline).monospacedDigit().widgetAccentable()
                        Text(verbatim: changeText).font(.caption).monospacedDigit()
                    }
                    if d.recent.count > 1 { Sparkline(values: d.recent).frame(height: 30) }
                }
            default:
                VStack(alignment: .leading, spacing: 4) {
                    Text("Weight").font(.brand(.caption, .semibold)).foregroundStyle(Brand.ink2)
                    HStack(alignment: .firstTextBaseline, spacing: 3) {
                        Text(verbatim: Fmt.weight(kg, unit: d.unit)).font(Brand.display(32)).monospacedDigit().minimumScaleFactor(0.6)
                        Text(verbatim: d.unit).font(.brand(.footnote, .medium)).foregroundStyle(Brand.ink2)
                    }
                    if d.recent.count > 1 {
                        Text(verbatim: changeText).font(.brand(.caption, .semibold)).monospacedDigit()
                            .foregroundStyle(change <= 0 ? Brand.green : Brand.amber)
                        Sparkline(values: d.recent).padding(.vertical, 4)
                    } else {
                        Spacer()
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        } else if day != nil {
            if family == .accessoryCircular { Image(systemName: "scalemass") }
            else { Text("No weigh-ins yet").font(.brand(.caption)).foregroundStyle(Brand.ink2) }
        } else if family == .systemSmall {
            SetUpNote()
        } else {
            Image(systemName: "scalemass")
        }
    }
}

// MARK: Live Activity

struct DayLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DayActivity.self) { ctx in
            LiveLockView(s: ctx.state)
                .padding(16)
                .activityBackgroundTint(Brand.card)
                .activitySystemActionForegroundColor(Brand.ink)
                .widgetURL(URL(string: "setpoint://diary"))
        } dynamicIsland: { ctx in
            let s = ctx.state
            let h = headline(eaten: s.eaten, target: s.target)
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    MiniDial(progress: s.target > 0 ? min(s.eaten / s.target, 1) : 0, over: s.eaten > s.target * 1.05, width: 6)
                        .frame(width: 48, height: 48)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: -2) {
                        Text(verbatim: h.number).font(Brand.display(26)).monospacedDigit()
                        Text(verbatim: h.label).font(.brand(.caption, .medium)).foregroundStyle(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 10) {
                        MacroBar(name: "Protein", value: s.protein, target: s.proteinTarget, color: Brand.protein)
                        MacroBar(name: "Carbs", value: s.carbs, target: s.carbsTarget, color: Brand.carbs)
                        MacroBar(name: "Fat", value: s.fat, target: s.fatTarget, color: Brand.fat)
                    }
                    .environment(\.colorScheme, .dark)
                }
            } compactLeading: {
                MiniDial(progress: s.target > 0 ? min(s.eaten / s.target, 1) : 0, over: s.eaten > s.target * 1.05, width: 3.5)
                    .frame(width: 20, height: 20)
            } compactTrailing: {
                Text(verbatim: h.number).font(.brand(.caption, .semibold)).monospacedDigit().foregroundStyle(Brand.green)
            } minimal: {
                MiniDial(progress: s.target > 0 ? min(s.eaten / s.target, 1) : 0, over: s.eaten > s.target * 1.05, width: 3.5)
                    .frame(width: 20, height: 20)
            }
            .keylineTint(Brand.green)
        }
    }
}

struct LiveLockView: View {
    var s: DayActivity.ContentState
    var body: some View {
        HStack(spacing: 16) {
            DialWithNumber(eaten: s.eaten, target: s.target, width: 8, size: 22)
                .frame(width: 92, height: 92)
            VStack(alignment: .leading, spacing: 6) {
                MacroBar(name: "Protein", value: s.protein, target: s.proteinTarget, color: Brand.protein)
                MacroBar(name: "Carbs", value: s.carbs, target: s.carbsTarget, color: Brand.carbs)
                MacroBar(name: "Fat", value: s.fat, target: s.fatTarget, color: Brand.fat)
                Label { Text(verbatim: "\(Fmt.ml(s.water)) / \(Fmt.ml(s.waterGoal))").monospacedDigit() } icon: { Image(systemName: "drop.fill") }
                    .font(.brand(.caption2, .medium)).foregroundStyle(Brand.water)
            }
        }
    }
}
