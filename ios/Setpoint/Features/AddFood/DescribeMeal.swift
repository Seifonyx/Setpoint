import SwiftUI
#if canImport(FoundationModels)
import FoundationModels
#endif

/// "2 eggs, toast and a coffee": Apple's on-device model splits it into foods, Setpoint's own search finds each one,
/// and you confirm before anything is added. Only offered where the on-device model is available (iPhone 15 Pro and newer).
struct DescribeMealSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let meal: String
    let day: String
    @State private var text = ""
    @State private var working = false
    @State private var matches: [Match] = []
    @State private var error: String?
    @FocusState private var focused: Bool

    struct Match: Identifiable {
        let id = UUID()
        var said: String
        var hit: FoodHit
        var qty: Double
        var unit: String
        var kcal: Double
        var on = true
    }

    static var available: Bool {
        #if canImport(FoundationModels)
        if case .available = SystemLanguageModel.default.availability { return true }
        #endif
        return false
    }

    var body: some View {
        NavigationStack {
            List {
                SwiftUI.Section {
                    TextField("2 eggs, a slice of toast and a coffee with milk", text: $text, axis: .vertical)
                        .lineLimit(2...5).focused($focused).font(.brand(.body))
                    Button { Task { await parse() } } label: {
                        HStack { if working { ProgressView() } else { Image(systemName: "magnifyingglass") }; Text("Find these foods") }
                            .font(.brand(.body, .semibold))
                    }
                    .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty || working)
                } footer: {
                    if let error { Text(error).foregroundStyle(Brand.danger) } else { Text("Works on this iPhone, offline. You check everything before it's added.") }
                }
                .listRowBackground(Brand.card)
                if !matches.isEmpty {
                    Section {
                        ForEach($matches) { $m in
                            HStack(spacing: 12) {
                                Button { m.on.toggle() } label: {
                                    Image(systemName: m.on ? "checkmark.circle.fill" : "circle").font(.title3).foregroundStyle(m.on ? Brand.green : Brand.ink2)
                                }
                                .buttonStyle(.plain)
                                FoodIcon(kind: m.hit.kind ?? "food", size: 32)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(m.hit.name).lineLimit(2)
                                    Text("“\(m.said)” · \(Fmt.amount(m.qty, m.unit))").font(.brand(.subheadline)).foregroundStyle(Brand.ink2).lineLimit(1)
                                }
                                Spacer()
                                Text(Fmt.kcal(m.kcal)).font(.brand(.body, .semibold)).monospacedDigit()
                            }
                            .opacity(m.on ? 1 : 0.45)
                        }
                    } header: { Text("Found") }
                }
            }
            .brandList()
            .navigationTitle("Describe what you ate")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add \(matches.filter(\.on).count)") { Task { await addAll() } }
                        .disabled(!matches.contains(where: \.on)).buttonStyle(.glassProminent).tint(Brand.green)
                }
            }
            .onAppear { focused = true }
        }
    }

    private func parse() async {
        working = true; error = nil; defer { working = false }
        #if canImport(FoundationModels)
        do {
            let session = LanguageModelSession(instructions: "You split a description of a meal into separate foods and drinks with their amounts. Use short, generic English food names. If no amount is given, use 1 piece.")
            let r = try await session.respond(to: text, generating: ParsedMeal.self)
            var out: [Match] = []
            for f in r.content.foods {
                guard let hit = await store.engineRef.search(f.name, meal: meal).first(where: { $0.quick != true }) else { continue }
                let grams = ["g", "gram", "grams", "ml"].contains(f.unit.lowercased())
                let unit = grams ? "g" : (hit.u ?? "g")
                let qty = grams ? f.amount : max(0.25, f.amount) * (hit.u == "g" ? (hit.q ?? 100) : 1)
                let m = await store.engineRef.macros(hit.id, qty: qty, unit: unit)
                out.append(Match(said: f.name, hit: hit, qty: qty, unit: unit, kcal: m?.kcal ?? 0))
            }
            matches = out
            if out.isEmpty { error = String(localized: "Couldn't find those foods. Try simpler words.") }
        } catch {
            self.error = String(localized: "Couldn't read that. Try again in simpler words.")
        }
        #endif
    }

    private func addAll() async {
        var items: [[String: JSONValue]] = []
        for m in matches where m.on {
            if let it = await store.engineRef.item(m.hit.id, qty: m.qty, unit: m.unit, meal: meal) { items.append(it) }
        }
        store.add(items, to: day)
        dismiss()
    }
}

#if canImport(FoundationModels)
@Generable
struct ParsedMeal {
    @Guide(description: "Each separate food or drink mentioned")
    var foods: [ParsedFood]
}

@Generable
struct ParsedFood {
    @Guide(description: "A short, generic English name for the food, like egg, white toast, coffee with milk, grilled chicken breast")
    var name: String
    @Guide(description: "How many or how much, as a number")
    var amount: Double
    @Guide(description: "The unit: g or ml for weights, otherwise piece, slice, cup, tbsp, tsp or bowl")
    var unit: String
}
#endif
