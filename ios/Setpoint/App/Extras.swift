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
    static let weekReady = "remindWeek"        // "Your week is ready" at the start of each week (on unless turned off)
}

/// Local reminders (they work with a free Apple ID; nothing goes through a server).
enum Reminders {
    static func requestPermission() async -> Bool {
        (try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }
    /// Schedules the next week of reminders from the saved settings. Today's is skipped when it's already done
    /// (food logged, or weighed in), so you're only reminded when you need it.
    @MainActor static func update(_ store: Store? = nil) {
        let store = store ?? Store.shared
        let c = UNUserNotificationCenter.current(), d = UserDefaults.standard
        c.removeAllPendingNotificationRequests()
        let weighOn = d.bool(forKey: DeviceSettings.weighReminder), foodOn = d.bool(forKey: DeviceSettings.foodReminder)
        let wm = d.object(forKey: DeviceSettings.weighTime) as? Int ?? 7 * 60 + 30, fm = d.object(forKey: DeviceSettings.foodTime) as? Int ?? 20 * 60 + 30
        for i in 0..<7 {
            let day = Day.add(Day.today, i)
            if weighOn && !(i == 0 && store.entry(day) != nil) {
                add("weigh-\(day)", day: day, minutes: wm, title: String(localized: "Time to weigh in"), body: String(localized: "Step on the scale before you eat or drink, and log it in Setpoint."))
            }
            if foodOn && !(i == 0 && store.eaten(day).count >= 2) {
                add("food-\(day)", day: day, minutes: fm, title: String(localized: "Log today's food"), body: String(localized: "A quick check that today's meals are in your diary."))
            }
        }
        // the start of next week: your weekly check-in is ready
        if d.object(forKey: DeviceSettings.weekReady) as? Bool ?? true, store.entries.count >= 3 {
            let ws = Int(store.root["settings"]?["weekStart"]?.number ?? 5)
            let wd = Calendar.current.component(.weekday, from: Date()) - 1
            let next = Day.add(Day.today, (ws - wd + 7) % 7 == 0 ? 7 : (ws - wd + 7) % 7)
            add("week-\(next)", day: next, minutes: 9 * 60, title: String(localized: "Your week is ready"),
                body: String(localized: "See how last week went, and what changed in your plan."))
        }
    }
    private static func add(_ id: String, day: String, minutes: Int, title: String, body: String) {
        var comps = Calendar.current.dateComponents([.year, .month, .day], from: Day.date(day))
        comps.hour = minutes / 60; comps.minute = minutes % 60
        guard let when = Calendar.current.date(from: comps), when > Date() else { return }
        let content = UNMutableNotificationContent()
        content.title = title; content.body = body; content.sound = .default
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: id, content: content, trigger: UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)))
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
                            Text("Setpoint is locked").font(.brand(.title3, .semibold))
                            if locked { Button("Unlock", systemImage: "faceid") { unlock() }.buttonStyle(.glassProminent).tint(Brand.green).controlSize(.large) }
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
    @AppStorage(Sounds.key) private var sounds = false
    @AppStorage(DeviceSettings.lock) private var lock = false
    @AppStorage(DeviceSettings.weighReminder) private var weigh = false
    @AppStorage(DeviceSettings.weighTime) private var weighTime = 7 * 60 + 30
    @AppStorage(DeviceSettings.foodReminder) private var foodOn = false
    @AppStorage(DeviceSettings.foodTime) private var foodTime = 20 * 60 + 30
    @AppStorage(DeviceSettings.weekReady) private var weekReady = true
    @AppStorage(WidgetBridge.liveKey) private var live = false
    @State private var denied = false
    @State private var confirmErase = false
    @State private var ramadan = false
    @State private var healthBusy = false
    @State private var healthNote: String?

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
                NavigationLink("Meals") { MealsEditor() }
                NavigationLink("Repeating foods") { RepeatingView() }
                Button { ramadan = true } label: {
                    LabeledContent("Ramadan mode") { Text(store.ramadanOn ? String(localized: "On") : String(localized: "Off")).foregroundStyle(.secondary) }
                }.tint(.primary)
                Toggle("Track calories", isOn: Binding(get: { store.root["settings"]?.object?["trackCalories"]?.bool ?? true },
                                                       set: { store.setSetting("trackCalories", .bool($0)) }))
            } footer: { Text("These sync with the web app.") }

            Section {
                Toggle("Weigh-in reminder", isOn: $weigh)
                if weigh { DatePicker("Time", selection: time($weighTime), displayedComponents: .hourAndMinute) }
                Toggle("Food log reminder", isOn: $foodOn)
                if foodOn { DatePicker("Time", selection: time($foodTime), displayedComponents: .hourAndMinute) }
                Toggle("Your week is ready", isOn: $weekReady)
            } header: { Text("Reminders") } footer: {
                if denied { Text("Notifications are off for Setpoint. Turn them on in the Settings app.").foregroundStyle(Brand.danger) }
            }
            if Health.allowed { Section {
                Button {
                    healthBusy = true
                    Task {
                        switch await Health.sync(store) {
                        case .imported(let w, let st):
                            healthNote = String(localized: "Imported \(w) weigh-ins.") + (st.map { " " + String(localized: "Average steps: \($0).") } ?? "")
                        case .unavailable(let why): healthNote = why
                        }
                        healthBusy = false
                    }
                } label: {
                    HStack { Label("Import from Apple Health", systemImage: "heart.text.square"); Spacer(); if healthBusy { ProgressView() } }
                }
                .disabled(healthBusy)
            } footer: {
                Text(healthNote ?? String(localized: "Weigh-ins from your smart scale and your average steps."))
            } }
            Section {
                Toggle("Calories on the Lock Screen", isOn: $live)
            } footer: { Text("Shows today's calories left on the Lock Screen and in the Dynamic Island, and updates as you log. For widgets, touch and hold your Home Screen and tap Edit.") }
            Section {
                Toggle("Lock with Face ID", isOn: $lock)
                Toggle("Haptics", isOn: $haptics)
                Toggle("Sounds", isOn: $sounds)
            } footer: { Text("These are for this iPhone only. Sounds: a soft tick when you log, a chime when you hit a target.") }
            Section {
                Button("Erase all data on this iPhone", role: .destructive) { confirmErase = true }.foregroundStyle(Brand.danger)
                    .confirmationDialog("Erase everything on this iPhone?", isPresented: $confirmErase, titleVisibility: .visible) {
                        Button("Erase", role: .destructive) { Account.shared.signOut(); store.eraseAll() }
                    } message: { Text("Your weigh-ins, food log and settings on this iPhone are deleted. If you're signed in, you're signed out first, so your account keeps its copy.") }
            }
            Section {
                Link(destination: URL(string: UIApplication.openSettingsURLString)!) { Label("Language", systemImage: "globe") }
            } footer: { Text("Choose English or العربية for Setpoint in the Settings app.") }
        }
        .brandList()
        .navigationTitle("Settings")
        .sheet(isPresented: $ramadan) { RamadanSheet() }
        .onChange(of: weigh) { _, on in changed(on) }
        .onChange(of: foodOn) { _, on in changed(on) }
        .onChange(of: weekReady) { _, on in changed(on) }
        .onChange(of: weighTime) { Reminders.update() }
        .onChange(of: foodTime) { Reminders.update() }
        .onChange(of: live) { WidgetBridge.publish(store) }
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

