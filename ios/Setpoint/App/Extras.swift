import SwiftUI
import UserNotifications
import LocalAuthentication

/// Settings that belong to this iPhone (not synced): reminders, Face ID lock, haptics.
enum DeviceSettings {
    static let haptics = "haptics"
    static let lock = "faceIDLock"
    static let weighReminder = "remindWeigh"
    static let weighTime = "remindWeighTime"   // minutes after midnight
    static let foodReminder = "remindFood"
    static let foodTime = "remindFoodTime"
}

/// Local reminders (they work with a free Apple ID; nothing goes through a server).
enum Reminders {
    static func requestPermission() async -> Bool {
        (try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }
    /// Schedules (or clears) the daily reminders from the saved settings.
    static func update() {
        let c = UNUserNotificationCenter.current(), d = UserDefaults.standard
        c.removePendingNotificationRequests(withIdentifiers: ["weigh", "food"])
        if d.bool(forKey: DeviceSettings.weighReminder) {
            add("weigh", minutes: d.object(forKey: DeviceSettings.weighTime) as? Int ?? 7 * 60 + 30,
                title: String(localized: "Time to weigh in"), body: String(localized: "Step on the scale before you eat or drink, and log it in Setpoint."))
        }
        if d.bool(forKey: DeviceSettings.foodReminder) {
            add("food", minutes: d.object(forKey: DeviceSettings.foodTime) as? Int ?? 20 * 60 + 30,
                title: String(localized: "Log today's food"), body: String(localized: "A quick check that today's meals are in your diary."))
        }
    }
    private static func add(_ id: String, minutes: Int, title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title; content.body = body; content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: DateComponents(hour: minutes / 60, minute: minutes % 60), repeats: true)
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: id, content: content, trigger: trigger))
    }
}

/// Face ID lock: covers the app when it goes to the background, and asks for Face ID (or the passcode) to open it.
struct LockCover: ViewModifier {
    @AppStorage(DeviceSettings.lock) private var lockOn = false
    @Environment(\.scenePhase) private var phase
    @State private var locked = UserDefaults.standard.bool(forKey: DeviceSettings.lock)
    @State private var trying = false

    func body(content: Content) -> some View {
        content
            .overlay {
                if locked || (lockOn && phase != .active) {
                    ZStack {
                        Rectangle().fill(.background).ignoresSafeArea()
                        VStack(spacing: 18) {
                            Image(systemName: "lock.fill").font(.system(size: 44)).foregroundStyle(.secondary)
                            Text("Setpoint is locked").font(.title3.weight(.semibold))
                            if locked { Button("Unlock", systemImage: "faceid") { unlock() }.buttonStyle(.glassProminent).controlSize(.large) }
                        }
                    }
                    .transition(.opacity)
                }
            }
            .onChange(of: phase) { _, p in
                if p == .background && lockOn { locked = true }
                if p == .active && locked { unlock() }
            }
            .task { if locked { unlock() } }
    }
    private func unlock() {
        guard locked, !trying else { return }
        trying = true
        let ctx = LAContext()
        var err: NSError?
        guard ctx.canEvaluatePolicy(.deviceOwnerAuthentication, error: &err) else { locked = false; trying = false; return }
        ctx.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: String(localized: "Unlock Setpoint")) { ok, _ in
            Task { @MainActor in
                if ok { withAnimation { locked = false } }
                trying = false
            }
        }
    }
}

/// Settings for this iPhone.
struct DeviceSettingsView: View {
    @Environment(Store.self) private var store
    @AppStorage(DeviceSettings.haptics) private var haptics = true
    @AppStorage(DeviceSettings.lock) private var lock = false
    @AppStorage(DeviceSettings.weighReminder) private var weigh = false
    @AppStorage(DeviceSettings.weighTime) private var weighTime = 7 * 60 + 30
    @AppStorage(DeviceSettings.foodReminder) private var foodOn = false
    @AppStorage(DeviceSettings.foodTime) private var foodTime = 20 * 60 + 30
    @State private var denied = false

    var body: some View {
        Form {
            Section {
                Picker("Weight unit", selection: Binding(get: { store.unit }, set: { store.setSetting("unit", .string($0)) })) {
                    Text("kg").tag("kg"); Text("lb").tag("lb")
                }
                Picker("Week starts on", selection: Binding(get: { Int(store.root["settings"]?.object?["weekStart"]?.number ?? 5) },
                                                            set: { store.setSetting("weekStart", .number(Double($0))) })) {
                    ForEach(0..<7, id: \.self) { i in Text(Calendar.current.weekdaySymbols[i]).tag(i) }
                }
                Toggle("Track calories", isOn: Binding(get: { store.root["settings"]?.object?["trackCalories"]?.bool ?? true },
                                                       set: { store.setSetting("trackCalories", .bool($0)) }))
            } footer: { Text("These sync with the web app.") }

            Section {
                Toggle("Weigh-in reminder", isOn: $weigh)
                if weigh { DatePicker("Time", selection: time($weighTime), displayedComponents: .hourAndMinute) }
                Toggle("Food log reminder", isOn: $foodOn)
                if foodOn { DatePicker("Time", selection: time($foodTime), displayedComponents: .hourAndMinute) }
            } header: { Text("Reminders") } footer: {
                if denied { Text("Notifications are off for Setpoint. Turn them on in the Settings app.").foregroundStyle(.orange) }
            }
            Section {
                Toggle("Lock with Face ID", isOn: $lock)
                Toggle("Haptics", isOn: $haptics)
            } footer: { Text("These are for this iPhone only.") }
            Section {
                Link(destination: URL(string: UIApplication.openSettingsURLString)!) { Label("Language", systemImage: "globe") }
            } footer: { Text("Choose English or العربية for Setpoint in the Settings app.") }
        }
        .navigationTitle("Settings")
        .onChange(of: weigh) { _, on in changed(on) }
        .onChange(of: foodOn) { _, on in changed(on) }
        .onChange(of: weighTime) { Reminders.update() }
        .onChange(of: foodTime) { Reminders.update() }
    }

    private func changed(_ on: Bool) {
        Task {
            if on, !(await Reminders.requestPermission()) { denied = true; weigh = false; foodOn = false }
            Reminders.update()
        }
    }
    private func time(_ m: Binding<Int>) -> Binding<Date> {
        Binding(get: { Calendar.current.date(bySettingHour: m.wrappedValue / 60, minute: m.wrappedValue % 60, second: 0, of: Date()) ?? Date() },
                set: { let c = Calendar.current.dateComponents([.hour, .minute], from: $0); m.wrappedValue = (c.hour ?? 0) * 60 + (c.minute ?? 0) })
    }
}
