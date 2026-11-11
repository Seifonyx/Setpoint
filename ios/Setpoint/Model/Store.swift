import Foundation
import Observation

/// All of Setpoint's data, in the web app's format, saved as one file on this iPhone.
/// The food log and weigh-ins are kept decoded for speed; everything else stays as JSON until a screen needs it.
@MainActor
@Observable
final class Store {
    private(set) var root: [String: JSONValue] = [:]
    private(set) var food: [String: [FoodItem]] = [:]
    private(set) var entries: [WeighIn] = []
    private(set) var water: [String: Double] = [:]
    /// The last change, so it can be undone from the banner.
    private(set) var undoLabel: String?
    private var undoSnap: Snapshot?
    private var undoAction: (() -> Void)?
    private let demo: Bool
    @ObservationIgnored private let engine = Engine.shared
    /// Goes up on every change (the engine and the screens use it to stay current).
    private(set) var version = 0
    /// The food list is loaded (search works).
    private(set) var foodsReady = false
    /// Each day's targets from the web app's maths (flexible week, training days, diet breaks included).
    private(set) var plans: [String: DayPlan] = [:]
    /// The Plan screens' numbers.
    private(set) var overview: Overview?

    private struct Snapshot { var food: [String: [FoodItem]]; var entries: [WeighIn]; var water: [String: Double] }

    init() {
        demo = ProcessInfo.processInfo.arguments.contains("-demo")
        if demo, let url = Bundle.main.url(forResource: "Demo", withExtension: "json"), let data = try? Data(contentsOf: url) {
            load(data)
        } else if let data = try? Data(contentsOf: Self.fileURL) {
            load(data)
        }
    }

    // MARK: Files

    private static var folder: URL {
        let u = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: u, withIntermediateDirectories: true)
        return u
    }
    private static var fileURL: URL { folder.appendingPathComponent("setpoint.json") }
    private static var photosURL: URL { folder.appendingPathComponent("photos.json") }

    private func load(_ data: Data) {
        guard let v = try? JSONDecoder().decode(JSONValue.self, from: data), let o = v.object else { return }
        root = o
        food = (o["food"]?.object ?? [:]).mapValues { ($0.array ?? []).compactMap { $0.object }.map(FoodItem.init(raw:)) }
        entries = (o["entries"]?.array ?? []).compactMap { $0.object }.map(WeighIn.init(raw:)).sorted { $0.date < $1.date }
        water = (o["water"]?.object ?? [:]).compactMapValues { $0.number }
    }

    private func save() {
        root["food"] = .object(food.filter { !$0.value.isEmpty }.mapValues { .array($0.map { .object($0.raw) }) })
        root["entries"] = .array(entries.map { .object($0.raw) })
        root["water"] = .object(water.mapValues { .number($0) })
        version += 1
        guard let data = try? JSONEncoder().encode(JSONValue.object(root)) else { return }
        if !demo { try? data.write(to: Self.fileURL, options: .atomic) }
        let v = version, text = String(decoding: data, as: UTF8.self)
        Task { [engine] in
            await engine.setState(text, version: v)
            await MainActor.run { self.plans = [:] }
            await self.refreshOverview()
        }
    }

    // MARK: The engine

    /// On launch (and coming back to the app): load the food list, then do what the web app does on every open.
    func start() async {
        save()
        await engine.loadFoods()
        foodsReady = await engine.foodsReady
        await tick()
    }
    func tick() async {
        guard let t = await engine.tick(), let label = Self.tuneLabel(t) else { await refreshOverview(); return }
        await adoptEngineState()
        undoSnap = nil
        undoLabel = label
        undoAction = { [weak self] in
            guard let self else { return }
            Task { await self.engine.undoTune(); await self.adoptEngineState() }
        }
    }
    private static func tuneLabel(_ t: JSONValue) -> String? {
        if t["goal"]?.bool == true { return String(localized: "Goal reached! Your target is now maintenance") }
        if t["hold"]?.bool == true { return nil }
        guard let c = t["change"]?.number, c != 0 else { return nil }
        return c > 0 ? String(localized: "Target raised by \(Fmt.kcal(abs(c))) kcal") : String(localized: "Target lowered by \(Fmt.kcal(abs(c))) kcal")
    }
    /// The engine changed something itself (goals remembered, a weekly adjustment): take its copy.
    func adoptEngineState() async {
        guard let text = await engine.state(), let data = text.data(using: .utf8) else { return }
        load(data)
        save()
    }
    func refreshOverview() async { overview = await engine.overview() }
    func refreshPlan(_ day: String) async {
        if let p = await engine.dayPlan(day) { plans[day] = p }
    }
    /// Change part of your data (profile, settings, favorites…) and save.
    func setRoot(_ key: String, _ value: JSONValue) { root[key] = value; save() }
    func setProfile(_ change: (inout [String: JSONValue]) -> Void) {
        var p = root["profile"]?.object ?? [:]; change(&p); root["profile"] = .object(p); save()
    }
    func setSetting(_ key: String, _ value: JSONValue?) {
        var s = root["settings"]?.object ?? [:]; s[key] = value; root["settings"] = .object(s); save()
    }
    var engineRef: Engine { engine }

    /// Foods for a day, as the web app adds them: today gets the time, days still to come are planned.
    func add(_ items: [[String: JSONValue]], to day: String, label: String? = nil) {
        guard !items.isEmpty else { return }
        let c = Calendar.current.dateComponents([.hour, .minute], from: Date())
        let now = String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0)
        let ms = JSONValue.number((Date().timeIntervalSince1970 * 1000).rounded())
        let new = items.map { raw -> FoodItem in
            var r = raw
            if r["id"]?.string == nil { r["id"] = .string(Ids.new()) }
            if day > Day.today { r["plan"] = .bool(true); r.removeValue(forKey: "t") }
            else if day == Day.today, r["t"] == nil { r["t"] = .string(now) }
            r["u"] = ms
            return FoodItem(raw: r)
        }
        remember(label ?? String(localized: "Added \(new.count) foods"))
        food[day, default: []].append(contentsOf: new)
        save()
    }
    func replace(_ item: FoodItem, with raw: [String: JSONValue], on day: String) {
        remember(String(localized: "Amount changed"))
        guard var list = food[day], let i = list.firstIndex(where: { $0.id == item.id }) else { return }
        var r = raw; r["u"] = .number((Date().timeIntervalSince1970 * 1000).rounded())
        list[i] = FoodItem(raw: r); food[day] = list
        save()
    }

    var isEmpty: Bool { food.isEmpty && entries.isEmpty }

    // MARK: Import / export (the web app's backup file)

    enum ImportError: LocalizedError {
        case notSetpoint
        var errorDescription: String? { String(localized: "That isn't a Setpoint backup.") }
    }

    /// Replaces everything with a backup from the web app (Settings › Back up). Photos are kept aside for later.
    func importBackup(_ data: Data) throws {
        guard let v = try? JSONDecoder().decode(JSONValue.self, from: data), var o = v.object,
              o["entries"] != nil || o["food"] != nil else { throw ImportError.notSetpoint }
        var photos: [String: JSONValue] = [:]
        for k in ["foodPhotos", "bodyPhotos"] { if let p = o.removeValue(forKey: k) { photos[k] = p } }
        for k in ["app", "exported", "version"] { o.removeValue(forKey: k) }
        if !photos.isEmpty, let pd = try? JSONEncoder().encode(JSONValue.object(photos)) { try? pd.write(to: Self.photosURL, options: .atomic) }
        let enc = try JSONEncoder().encode(JSONValue.object(o))
        load(enc)
        undoSnap = nil; undoLabel = nil
        save()
    }

    /// A backup in the same format the web app writes, so it can be restored there too.
    func exportBackup() throws -> URL {
        save()
        var o = root
        o["app"] = .string("Setpoint")
        o["exported"] = .string(ISO8601DateFormatter().string(from: Date()))
        if let pd = try? Data(contentsOf: Self.photosURL), let p = try? JSONDecoder().decode(JSONValue.self, from: pd), let po = p.object {
            for (k, v) in po { o[k] = v }
        }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("setpoint-backup-\(Day.today).json")
        try JSONEncoder().encode(JSONValue.object(o)).write(to: url, options: .atomic)
        return url
    }

    // MARK: Settings the diary needs

    private var settings: [String: JSONValue] { root["settings"]?.object ?? [:] }
    var unit: String { settings["unit"]?.string == "lb" ? "lb" : "kg" }

    var meals: [MealCategory] {
        let custom = (settings["meals"]?.array ?? []).compactMap { v -> MealCategory? in
            guard let k = v["k"]?.string, let n = v["n"]?.string else { return nil }
            return MealCategory(key: k, name: n)
        }
        if !custom.isEmpty { return custom }
        return [MealCategory(key: "breakfast", name: String(localized: "Breakfast")), MealCategory(key: "lunch", name: String(localized: "Lunch")),
                MealCategory(key: "dinner", name: String(localized: "Dinner")), MealCategory(key: "snacks", name: String(localized: "Snacks"))]
    }
    func mealKey(of item: FoodItem) -> String {
        let keys = meals.map(\.key)
        return keys.contains(item.meal) ? item.meal : (keys.last ?? "snacks")
    }

    var waterGoal: Double {
        if let g = settings["waterGoal"]?.number { return g }
        switch root["profile"]?["sex"]?.string { case "male": return 2500; case "female": return 2000; default: return 2200 }
    }
    var waterSizes: [Double] {
        let s = (settings["waterSizes"]?.array ?? []).compactMap { $0.number }
        return s.count == 4 ? s : [250, 330, 500, 1000]
    }

    // MARK: A day

    func items(_ day: String) -> [FoodItem] { food[day] ?? [] }
    /// What counts towards a day: food you ate. Planned food only counts on days still to come.
    func eaten(_ day: String) -> [FoodItem] { day > Day.today ? items(day) : items(day).filter { !$0.isPlanned } }

    func totals(_ day: String) -> Totals {
        let its = eaten(day)
        if its.isEmpty, let k = entry(day)?.kcal { return Totals(kcal: k) }
        return its.reduce(into: Totals()) { t, f in t.kcal += f.kcal; t.protein += f.protein; t.carbs += f.carbs; t.fat += f.fat }
    }

    /// The day's targets as the web app recorded them (the newest ones on or before that day), with training days.
    func plan(_ day: String) -> DayPlan? {
        guard let goals = root["goals"]?.object, let key = goals.keys.filter({ $0 <= day }).max(), let g = goals[key] else { return nil }
        var p = DayPlan(kcal: g["k"]?.number ?? 0, protein: g["p"]?.number ?? 0, carbs: g["c"]?.number ?? 0, fat: g["f"]?.number ?? 0)
        if let td = g["td"]?.array?.compactMap({ $0.number }).map({ Int($0) }), !td.isEmpty, let tx = g["tx"]?.number, let rx = g["rx"]?.number {
            let override = root["dayType"]?[day]?.string
            let train = override.map { $0 == "t" } ?? td.contains(Day.weekday(day))
            let dk = train ? tx : -rx
            p.kcal += dk
            p.carbs = max(0, ((p.carbs + dk / 4) / 5).rounded() * 5)
            p.training = train
        }
        return p.kcal > 0 ? p : nil
    }

    func entry(_ day: String) -> WeighIn? { entries.last(where: { $0.date == day }) }
    func waterOn(_ day: String) -> Double { water[day] ?? 0 }

    // MARK: Changes (each can be undone from the banner)

    private func remember(_ label: String) {
        undoSnap = Snapshot(food: food, entries: entries, water: water)
        undoAction = nil
        undoLabel = label
    }
    func undo() {
        if let a = undoAction { undoAction = nil; undoLabel = nil; a(); return }
        guard let s = undoSnap else { return }
        food = s.food; entries = s.entries; water = s.water
        undoSnap = nil; undoLabel = nil
        save()
    }
    func clearUndo() { undoSnap = nil; undoAction = nil; undoLabel = nil }

    private func stamp(_ item: inout FoodItem) { item.raw["u"] = .number((Date().timeIntervalSince1970 * 1000).rounded()) }

    private func edit(_ day: String, _ id: String, _ change: (inout FoodItem) -> Void) {
        guard var list = food[day], let i = list.firstIndex(where: { $0.id == id }) else { return }
        change(&list[i]); stamp(&list[i])
        food[day] = list
        save()
    }

    func delete(_ item: FoodItem, on day: String) {
        remember(String(localized: "Removed \(item.displayName)"))
        food[day]?.removeAll { $0.id == item.id }
        save()
    }
    func addAnother(_ item: FoodItem, on day: String) {
        var c = item.copy(); stamp(&c)
        food[day, default: []].append(c)
        clearUndo(); save()
    }
    func move(_ item: FoodItem, to meal: String, on day: String) {
        edit(day, item.id) { $0.meal = meal }
    }
    func markEaten(_ item: FoodItem, on day: String) {
        edit(day, item.id) { f in
            f.isPlanned = false
            if day == Day.today { // saved as 24-hour "HH:mm" in Western digits, whatever the phone's language
                let c = Calendar.current.dateComponents([.hour, .minute], from: Date())
                f.raw["t"] = .string(String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0))
            }
        }
    }
    func copy(_ items: [FoodItem], to day: String) {
        let copies = items.filter { !$0.isDailyTotal }.map { f -> FoodItem in var c = f.copy(); stamp(&c); return c }
        guard !copies.isEmpty else { return }
        remember(String(localized: "Copied \(copies.count) foods"))
        food[day, default: []].append(contentsOf: copies)
        save()
    }
    func copyFromYesterday(meal: String, to day: String) -> Int {
        let prev = eaten(Day.add(day, -1)).filter { mealKey(of: $0) == meal && !$0.isDailyTotal }
        guard !prev.isEmpty else { return 0 }
        remember(String(localized: "Added from yesterday"))
        food[day, default: []].append(contentsOf: prev.map { f -> FoodItem in var c = f.copy(meal: meal); stamp(&c); return c })
        save()
        return prev.count
    }
    func removeMeal(_ meal: String, on day: String) {
        remember(String(localized: "Meal cleared"))
        food[day]?.removeAll { mealKey(of: $0) == meal && !$0.isDailyTotal }
        save()
    }

    /// Time, meal and note from the food's details (amounts change in Phase 2, with the food list).
    func updateDetails(_ item: FoodItem, on day: String, time: String?, meal: String, note: String) {
        remember(String(localized: "Food updated"))
        edit(day, item.id) { f in
            if let time { f.raw["t"] = .string(time) } else { f.raw.removeValue(forKey: "t") }
            f.meal = meal
            let n = note.trimmingCharacters(in: .whitespacesAndNewlines)
            if n.isEmpty { f.raw.removeValue(forKey: "note") } else { f.raw["note"] = .string(String(n.prefix(140))) }
        }
    }
    func dailyTotals(_ day: String) -> [FoodItem] { items(day).filter(\.isDailyTotal) }

    func logWeight(_ kg: Double, on day: String, note: String, excluded: Bool) {
        remember(String(localized: "Weight saved"))
        var raw = entry(day)?.raw ?? [:]
        raw["date"] = .string(day)
        raw["kg"] = .number((kg * 10000).rounded() / 10000)
        raw["note"] = .string(note)
        if excluded { raw["x"] = .bool(true) } else { raw.removeValue(forKey: "x") }
        entries.removeAll { $0.date == day }
        entries.append(WeighIn(raw: raw))
        entries.sort { $0.date < $1.date }
        save()
    }
    func deleteWeight(on day: String) {
        remember(String(localized: "Weight deleted"))
        entries.removeAll { $0.date == day }
        save()
    }
    func addWater(_ ml: Double, on day: String) {
        remember(String(localized: "Water added"))
        water[day] = max(0, (water[day] ?? 0) + ml)
        if water[day] == 0 { water.removeValue(forKey: day) }
        save()
    }
}
