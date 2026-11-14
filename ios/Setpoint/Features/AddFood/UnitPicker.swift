import SwiftUI

/// The unit next to an amount: shows "Large · 50 g" and opens the full list. Changing the unit keeps the same
/// amount of food (2 large eggs → 100 g), so you never have to work it out yourself.
struct UnitButton: View {
    let units: [FoodUnit]
    @Binding var unit: String
    @Binding var qtyText: String
    @State private var choosing = UserDefaults.standard.string(forKey: "open") == "units" // build-server screenshots

    var body: some View {
        Button { choosing = true } label: {
            HStack(spacing: 4) {
                Text(current.map(UnitList.name) ?? unit).lineLimit(1)
                Image(systemName: "chevron.down").font(.caption2.weight(.bold))
            }
            .font(.brand(.subheadline, .semibold))
            .foregroundStyle(Brand.green)
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(Brand.card2, in: .rect(cornerRadius: Radius.chip))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text("Unit"))
        .accessibilityValue(Text(current.map(UnitList.name) ?? unit))
        .sheet(isPresented: $choosing) {
            UnitList(units: units, selected: unit, qty: UnitList.number(qtyText)) { new in
                if let q = UnitList.number(qtyText), let old = current, let next = units.first(where: { $0.label == new }) {
                    qtyText = UnitList.text(UnitList.convert(q * old.g, to: next))
                }
                unit = new
            }
            .presentationDetents([.medium, .large])
        }
    }
    private var current: FoodUnit? { units.first { $0.label == unit } }
}

/// Every unit for a food, in two groups: its sizes and servings first (smallest to largest), then weights and volumes.
/// Each row shows what one of it weighs, and what your current amount would be in it.
struct UnitList: View {
    let units: [FoodUnit]
    let selected: String
    let qty: Double?
    let pick: (String) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                let servings = units.filter { $0.weight != true }, weights = units.filter { $0.weight == true }
                if !servings.isEmpty { Section("Sizes and servings") { ForEach(servings, id: \.label, content: row) } }
                if !weights.isEmpty { Section("Weight and volume") { ForEach(weights, id: \.label, content: row) } }
            }
            .brandList()
            .navigationTitle("Unit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
    }

    private func row(_ u: FoodUnit) -> some View {
        Button { pick(u.label); dismiss() } label: {
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(Self.name(u)).font(.brand(.body)).foregroundStyle(Brand.ink)
                        if u.mine == true { Text("Yours").font(.brand(.caption, .semibold)).foregroundStyle(Brand.green) }
                    }
                    if !(u.weight == true && u.label == "g") { Text(Self.weightText(u)).font(.brand(.footnote)).foregroundStyle(Brand.ink2) }
                }
                Spacer(minLength: 8)
                if let q = qty, let cur = units.first(where: { $0.label == selected }), u.label != selected {
                    // what the same amount of food is in this unit
                    Text(Self.text(Self.convert(q * cur.g, to: u)) + (u.weight == true ? " " + u.display : "")).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).monospacedDigit()
                }
                if u.label == selected { Image(systemName: "checkmark").font(.body.weight(.semibold)).foregroundStyle(Brand.green) }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(u.label == selected ? .isSelected : [])
    }

    // MARK: Helpers

    /// "Large", "Cup, chopped", "g": capitalised, except the short weight units.
    static func name(_ u: FoodUnit) -> String {
        let t = u.display
        if ["g", "oz", "kg", "lb", "ml", "tbsp", "tsp", "fl oz"].contains(t) { return t }
        return t.prefix(1).uppercased() + t.dropFirst()
    }
    static func weightText(_ u: FoodUnit) -> String {
        let g = u.g >= 10 ? Fmt.kcal(u.g) : u.g.formatted(.number.precision(.fractionLength(0...1)))
        return u.label == "ml" ? String(localized: "about \(g) g per ml") : String(localized: "\(g) g each")
    }
    /// Grams in a unit, rounded the way you'd measure: whole grams, tenths of kg/lb/oz, quarters of a serving.
    static func convert(_ grams: Double, to u: FoodUnit) -> Double {
        let q = grams / max(u.g, 0.0001)
        switch u.label {
        case "g", "ml": return max(1, q.rounded())
        case "kg", "lb", "oz": return max(0.1, (q * 10).rounded() / 10)
        default: return max(0.25, (q * 4).rounded() / 4)
        }
    }
    static func number(_ s: String) -> Double? {
        Double(s.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".")).flatMap { $0 > 0 ? $0 : nil }
    }
    static func text(_ v: Double) -> String {
        v.formatted(.number.precision(.fractionLength(0...2)).grouping(.never).locale(Locale(identifier: "en_US_POSIX")))
    }
}
