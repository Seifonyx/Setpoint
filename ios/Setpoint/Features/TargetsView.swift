import SwiftUI

struct TargetsData: Decodable, Sendable {
    struct Range: Decodable, Sendable, Equatable { let goal: Double?; let hi: Double? }
    struct Row: Decodable, Sendable, Identifiable {
        let key: String; let label: String; let unit: String; let group: String
        let plan: Bool          // calories and macros: the minimum comes from your plan
        let rec: Range          // recommended for your age and sex
        let own: Range?         // yours, when you've set one
        let use: Range          // what's in use
        var id: String { key }
    }
    struct Group: Decodable, Sendable { let key: String; let label: String }
    let groups: [Group]
    let rows: [Row]
}

/// Targets: for every nutrient, a minimum to reach and a maximum to stay under. They start at the recommended
/// amounts for your age and sex (calories and macros come from your plan); change any of them, and put the ones
/// you care about most on your Today page.
struct TargetsView: View {
    @Environment(Store.self) private var store
    @State private var data: TargetsData?
    @State private var editing: TargetsData.Row?
    @State private var highlighting = false

    var body: some View {
        List {
            Section {
                Button { highlighting = true } label: {
                    LabeledContent {
                        Text("\(Highlights.keys(store).count) of \(Highlights.max)").foregroundStyle(Brand.ink2)
                    } label: { TileLabel("On your Today page", "star.fill", Brand.amber) }
                }
                .tint(.primary)
            } footer: {
                Text("A bar turns green once you reach the minimum, and red if you go over the maximum.")
            }
            if let d = data {
                ForEach(order(d), id: \.key) { g in section(g, d.rows.filter { r in r.group == g.key }) }
            } else {
                SkeletonRows(count: 6)
            }
        }
        .brandList()
        .navigationTitle("Targets")
        .task(id: "\(store.version)") { data = await store.engineRef.targets(Day.today) }
        .sheet(item: $editing) { r in TargetEditor(row: r).presentationDetents([.medium, .large]) }
        .sheet(isPresented: $highlighting) { HighlightPicker() }
    }

    /// Calories and macros first, then vitamins, minerals, fats, and the rest of the general ones.
    private func order(_ d: TargetsData) -> [TargetsData.Group] {
        let gen: [TargetsData.Group] = d.groups.filter { $0.key == "gen" }
        let rest: [TargetsData.Group] = d.groups.filter { $0.key != "gen" }
        return gen + rest
    }
    @ViewBuilder private func section(_ g: TargetsData.Group, _ rows: [TargetsData.Row]) -> some View {
        if !rows.isEmpty {
            Section(g.label) {
                ForEach(rows) { r in Button { editing = r } label: { row(r) }.tint(.primary) }
            }
        }
    }

    private func row(_ r: TargetsData.Row) -> some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(r.label).foregroundStyle(Brand.ink)
                    if r.own != nil { Text("Yours").font(.brand(.caption, .semibold)).foregroundStyle(Brand.green) }
                }
                Text(TargetEditor.rangeText(r.use, unit: r.unit)).font(.brand(.footnote)).foregroundStyle(Brand.ink2).monospacedDigit()
            }
            Spacer(minLength: 8)
            if Highlights.keys(store).contains(r.key) { Image(systemName: "star.fill").font(.caption).foregroundStyle(Brand.amber).accessibilityLabel(Text("On your Today page")) }
            Image(systemName: "chevron.forward").font(.caption.weight(.semibold)).foregroundStyle(Brand.ink2.opacity(0.6))
        }
        .contentShape(Rectangle())
    }
}

/// One nutrient's minimum and maximum. Empty means none. "Use recommended" goes back to the starting values.
struct TargetEditor: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let row: TargetsData.Row
    @State private var minText = ""
    @State private var maxText = ""
    @State private var highlighted = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    if row.plan {
                        LabeledContent("Minimum") { Text(row.use.goal.map { Self.num($0) + " " + row.unit } ?? "–").monospacedDigit().foregroundStyle(Brand.ink2) }
                    } else {
                        NumberField(label: "Minimum", text: $minText, unit: LocalizedStringKey(row.unit), placeholder: "–")
                    }
                    NumberField(label: "Maximum", text: $maxText, unit: LocalizedStringKey(row.unit), placeholder: "–")
                } footer: {
                    if row.plan {
                        Text("The minimum comes from your plan, so it moves with your goal. Change it in Plan. You can set a maximum here.")
                    } else {
                        Text("Recommended for you: \(Self.rangeText(row.rec, unit: row.unit)). Leave a box empty for no minimum or no maximum.")
                    }
                }
                if !row.plan && !["kcal"].contains(row.key) {
                    Section {
                        Toggle(isOn: $highlighted) { Label("On your Today page", systemImage: "star") }
                            .disabled(!highlighted && Highlights.keys(store).count >= Highlights.max)
                    } footer: {
                        if !highlighted && Highlights.keys(store).count >= Highlights.max { Text("Your Today page already shows \(Highlights.max). Remove one to add this.") }
                    }
                }
                if row.own != nil {
                    Section {
                        Button("Use recommended") { store.setNutTarget(row.key, nil); dismiss() }
                    }
                }
            }
            .brandList()
            .navigationTitle(row.label)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save).disabled(invalid) }
            }
            .onAppear {
                minText = row.use.goal.map(UnitList.text) ?? ""   // plain digits, no thousands separator, so it reads back exactly
                maxText = row.use.hi.map(UnitList.text) ?? ""
                highlighted = Highlights.keys(store).contains(row.key)
            }
        }
    }

    private func value(_ s: String) -> Double? { UnitList.number(s.trimmingCharacters(in: .whitespaces)) }
    /// A maximum below the minimum can't be met.
    private var invalid: Bool {
        if let lo = row.plan ? row.use.goal : value(minText), let hi = value(maxText) { return hi < lo }
        return false
    }
    private func save() {
        let lo = row.plan ? nil : value(minText), hi = value(maxText)
        let changedMin = !row.plan && lo != row.use.goal, changedMax = hi != row.use.hi
        if changedMin || changedMax {
            // the same as recommended: no need to keep a custom target
            if lo == row.rec.goal && hi == row.rec.hi && !row.plan { store.setNutTarget(row.key, nil) }
            else { store.setNutTarget(row.key, .init(goal: row.plan ? nil : lo, hi: hi)) }
        }
        if highlighted != Highlights.keys(store).contains(row.key) { Highlights.toggle(row.key, store) }
        dismiss()
    }

    static func num(_ v: Double) -> String {
        v >= 100 ? Fmt.kcal(v) : v.formatted(.number.precision(.fractionLength(0...1)).grouping(.never))
    }
    static func rangeText(_ r: TargetsData.Range, unit: String) -> String {
        let u = Bundle.main.localizedString(forKey: unit, value: nil, table: nil)
        switch (r.goal, r.hi) {
        case let (lo?, hi?): return String(localized: "\(num(lo)) to \(num(hi)) \(u)")
        case let (lo?, nil): return String(localized: "at least \(num(lo)) \(u)")
        case let (nil, hi?): return String(localized: "at most \(num(hi)) \(u)")
        default: return String(localized: "No target")
        }
    }
}

/// The nutrients on the Today page's second card (up to 8, as in your synced settings).
enum Highlights {
    static let max = 8
    static let defaults = ["fib", "fe", "ca", "k", "mg", "vD", "b12", "vC"]
    static let excluded: Set<String> = ["kcal", "p", "c", "f"]
    @MainActor static func keys(_ store: Store) -> [String] {
        let own = (store.root["settings"]?.object?["highlights"]?.array ?? []).compactMap(\.string).filter { !excluded.contains($0) }
        return own.isEmpty ? defaults : Array(own.prefix(max))
    }
    @MainActor static func set(_ keys: [String], _ store: Store) {
        store.setSetting("highlights", keys.isEmpty ? .null : .array(keys.prefix(max).map { .string($0) }))
    }
    @MainActor static func toggle(_ k: String, _ store: Store) {
        var ks = keys(store)
        if let i = ks.firstIndex(of: k) { ks.remove(at: i) } else if ks.count < max { ks.append(k) }
        set(ks, store)
    }
}

/// Pick what the Today page's nutrient card shows: tap to add or remove, up to 8.
struct HighlightPicker: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var data: TargetsData?
    @State private var picked: [String] = []

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("\(picked.count) of \(Highlights.max) picked").font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.ink2)
                    Button("Use the starting set") { withAnimation(.snappy) { picked = Highlights.defaults } }
                }
                if let d = data {
                    ForEach(groups(d), id: \.key) { g in groupSection(g, rows: rows(d, g)) }
                }
            }
            .brandList()
            .navigationTitle("On your Today page")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save") { Highlights.set(picked, store); dismiss() }.disabled(picked.isEmpty) }
            }
            .sensoryFeedback(.selection, trigger: picked)
            .task { picked = Highlights.keys(store); data = await store.engineRef.targets(Day.today) }
        }
    }

    private func groups(_ d: TargetsData) -> [TargetsData.Group] {
        let first: [TargetsData.Group] = d.groups.filter { $0.key != "gen" }
        let last: [TargetsData.Group] = d.groups.filter { $0.key == "gen" }
        return first + last
    }
    private func rows(_ d: TargetsData, _ g: TargetsData.Group) -> [TargetsData.Row] {
        d.rows.filter { r in r.group == g.key && !Highlights.excluded.contains(r.key) }
    }
    @ViewBuilder private func groupSection(_ g: TargetsData.Group, rows: [TargetsData.Row]) -> some View {
        if !rows.isEmpty {
            Section(g.label) { ForEach(rows) { r in pickRow(r) } }
        }
    }
    private func pickRow(_ r: TargetsData.Row) -> some View {
        let on = picked.contains(r.key), full = picked.count >= Highlights.max
        return Button { toggle(r.key, on: on) } label: {
            HStack {
                Text(r.label).foregroundStyle(on || !full ? Brand.ink : Brand.ink2)
                Spacer()
                Image(systemName: on ? "checkmark.circle.fill" : "circle").foregroundStyle(on ? Brand.green : Brand.ink2.opacity(0.5))
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(on ? .isSelected : [])
    }
    private func toggle(_ k: String, on: Bool) {
        withAnimation(.snappy) {
            if on { picked.removeAll { $0 == k } } else if picked.count < Highlights.max { picked.append(k) }
        }
    }
}

/// How a nutrient is doing against its targets, the same everywhere: grey on the way to the minimum, green once it's
/// reached, red over the maximum. Something with only a maximum (sodium) stays grey until it goes over.
enum TargetColor {
    static func of(_ v: Double, goal: Double?, hi: Double?) -> Color {
        if let hi, v > hi { return Brand.danger }
        if let goal, v >= goal { return Brand.green }
        return Brand.ink2
    }
    /// How full the bar is: towards the minimum, or towards the maximum when there's no minimum.
    static func fill(_ v: Double, goal: Double?, hi: Double?) -> Double {
        guard let t = goal ?? hi, t > 0 else { return 0 }
        return min(1, v / t)
    }
}
