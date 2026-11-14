import AppIntents
import SwiftUI
import WidgetKit

// MARK: Control Centre (and the Action button / Lock Screen controls)

struct AddFoodControl: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "app.setpoint.ios.control.add") {
            ControlWidgetButton(action: OpenQuickActionIntent(.addFood)) { Label("Add food", systemImage: QuickAction.addFood.icon) }
        }
        .displayName("Add food")
        .description("Opens Setpoint ready to search for a food.")
    }
}

struct ScanControl: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "app.setpoint.ios.control.scan") {
            ControlWidgetButton(action: OpenQuickActionIntent(.scan)) { Label("Scan a barcode", systemImage: QuickAction.scan.icon) }
        }
        .displayName("Scan a barcode")
        .description("Opens Setpoint's barcode scanner.")
    }
}

struct WeightControl: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "app.setpoint.ios.control.weight") {
            ControlWidgetButton(action: OpenQuickActionIntent(.weight)) { Label("Log weight", systemImage: QuickAction.weight.icon) }
        }
        .displayName("Log weight")
        .description("Opens Setpoint to log today's weight.")
    }
}

// MARK: Lock Screen: one round button per action

struct QuickEntry: TimelineEntry { let date: Date }

struct QuickProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuickEntry { QuickEntry(date: .now) }
    func getSnapshot(in context: Context, completion: @escaping (QuickEntry) -> Void) { completion(QuickEntry(date: .now)) }
    func getTimeline(in context: Context, completion: @escaping (Timeline<QuickEntry>) -> Void) {
        completion(Timeline(entries: [QuickEntry(date: .now)], policy: .never)) // it never changes
    }
}

/// The shared look: a widget has to be made with no inputs, so each action is its own small widget below.
enum QuickLock {
    @MainActor static func configuration(_ action: QuickAction) -> some WidgetConfiguration {
        StaticConfiguration(kind: "quick-" + action.rawValue, provider: QuickProvider()) { _ in
            ZStack {
                AccessoryWidgetBackground()
                Image(systemName: action.icon).font(.system(size: 22, weight: .semibold))
            }
            .widgetURL(action.url)
            .containerBackground(.clear, for: .widget)
            .accessibilityLabel(Text(action.title))
        }
        .configurationDisplayName(Text(action.title))
        .description(Text("One tap on your Lock Screen opens Setpoint to it."))
        .supportedFamilies([.accessoryCircular])
    }
}

struct AddFoodLockWidget: Widget { var body: some WidgetConfiguration { QuickLock.configuration(.addFood) } }
struct ScanLockWidget: Widget { var body: some WidgetConfiguration { QuickLock.configuration(.scan) } }
struct WeightLockWidget: Widget { var body: some WidgetConfiguration { QuickLock.configuration(.weight) } }
