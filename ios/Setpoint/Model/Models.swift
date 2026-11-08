import Foundation

/// A logged food. Backed by its original JSON, so every field the web app stores (recipe tweaks, meal contents,
/// nutrients, photos…) survives even before the iPhone app knows about it.
struct FoodItem: Identifiable, Equatable, Sendable {
    var raw: [String: JSONValue]

    var id: String { raw["id"]?.string ?? "" }
    var name: String { raw["name"]?.string ?? "" }
    var displayName: String { name.isEmpty ? String(localized: "Quick add") : name }
    var kcal: Double { raw["kcal"]?.number ?? 0 }
    var protein: Double { raw["protein"]?.number ?? 0 }
    var carbs: Double { raw["carbs"]?.number ?? 0 }
    var fat: Double { raw["fat"]?.number ?? 0 }
    var meal: String {
        get { raw["meal"]?.string ?? "snacks" }
        set { raw["meal"] = .string(newValue) }
    }
    var time: String? { raw["t"]?.string }
    var ref: String? { raw["ref"]?.string }
    var qty: Double? { raw["qty"]?.number }
    var unit: String? { raw["unit"]?.string }
    var note: String? { raw["note"]?.string }
    var isPlanned: Bool {
        get { raw["plan"]?.bool == true }
        set { if newValue { raw["plan"] = .bool(true) } else { raw.removeValue(forKey: "plan") } }
    }
    var isRepeat: Bool { raw["rep"]?.string != nil }
    var isAdjusted: Bool { raw["adj"]?.bool == true || (raw["rc"] != nil && (ref ?? "").hasPrefix("r")) }
    /// Calories saved with a weigh-in by older versions: shown on their own, not in a meal.
    var isDailyTotal: Bool { id.hasPrefix("w-") || (ref == nil && name == "Daily total") }

    /// A copy with a new id, ready to add again (what the web app's repeat/copy does).
    func copy(meal: String? = nil, keepTime: Bool = true) -> FoodItem {
        var c = raw
        for k in ["id", "plan", "pic", "u", "rep", "rc", "adj"] { c.removeValue(forKey: k) }
        if !keepTime { c.removeValue(forKey: "t") }
        c["id"] = .string(Ids.new())
        if let meal { c["meal"] = .string(meal) }
        return FoodItem(raw: c)
    }
}

struct WeighIn: Equatable, Sendable {
    var raw: [String: JSONValue]
    var date: String { raw["date"]?.string ?? "" }
    var kg: Double { raw["kg"]?.number ?? 0 }
    var note: String { raw["note"]?.string ?? "" }
    var kcal: Double? { raw["kcal"]?.number }
    var excluded: Bool { raw["x"]?.bool == true }
}

struct MealCategory: Identifiable, Hashable, Sendable {
    let key: String
    let name: String
    var id: String { key }
}

/// What a day's targets were: the web app records them whenever they change.
struct DayPlan: Equatable, Sendable {
    var kcal: Double
    var protein: Double
    var carbs: Double
    var fat: Double
    var training: Bool?
}

struct Totals: Equatable, Sendable {
    var kcal: Double = 0
    var protein: Double = 0
    var carbs: Double = 0
    var fat: Double = 0
}

enum Ids {
    /// Short unique ids like the web app's.
    static func new() -> String {
        let t = String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
        let r = String(Int.random(in: 0..<46_656), radix: 36)
        return t + r
    }
}
