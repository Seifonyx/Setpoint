import SwiftUI
#if canImport(FoundationModels)
import FoundationModels
#endif

/// "2 eggs, toast and a coffee": type it or say it. Each food is found with Setpoint's own search, and you check
/// everything before it's added. On iPhones with Apple Intelligence, Apple's on-device model splits the sentence;
/// on every other iPhone, Setpoint's own reader does (the one recipe import uses), so this works everywhere.
struct DescribeMealSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let meal: String
    let day: String
    /// Opened with the microphone button: start listening straight away.
    var listen = false
    @State private var text = ""
    @State private var working = false
    @State private var matches: [Match] = []
    @State private var error: String?
    @State private var voice = VoiceInput()
    @FocusState private var focused: Bool

    struct Match: Identifiable {
        let id = UUID()
        var said: String
        var food: String
        var name: String
        var kind: String?
        var qty: Double
        var unit: String
        var kcal: Double
        var on = true
    }

    /// Apple's on-device model (iPhone 15 Pro and newer, with Apple Intelligence on). Without it, Setpoint's own reader.
    static var modelAvailable: Bool {
        #if canImport(FoundationModels)
        if case .available = SystemLanguageModel.default.availability { return true }
        #endif
        return false
    }

    var body: some View {
        NavigationStack {
            List {
                SwiftUI.Section {
                    HStack(alignment: .top, spacing: 10) {
                        TextField("2 eggs, a slice of toast and a coffee with milk", text: $text, axis: .vertical)
                            .lineLimit(2...5).focused($focused).font(.brand(.body))
                            .disabled(voice.listening)
                        Button { if voice.listening { voice.stop() } else { focused = false; Task { await voice.start() } } } label: {
                            Image(systemName: voice.listening ? "stop.fill" : "mic.fill")
                                .font(.system(size: 17, weight: .semibold)).foregroundStyle(voice.listening ? Brand.onGreen : Brand.green)
                                .frame(width: 40, height: 40)
                                .background(voice.listening ? Brand.green : Brand.greenSoft, in: Circle())
                                .symbolEffect(.pulse, isActive: voice.listening)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(Text(voice.listening ? LocalizedStringKey("Stop listening") : LocalizedStringKey("Say what you ate")))
                        .accessibilityIdentifier("describe-mic")
                    }
                    if voice.listening {
                        Label(voice.text.isEmpty ? String(localized: "Listening…") : voice.text, systemImage: "waveform")
                            .font(.brand(.subheadline)).foregroundStyle(Brand.ink2).symbolEffect(.variableColor.iterative, isActive: true)
                    }
                    Button { Task { await parse() } } label: {
                        HStack { if working { ProgressView() } else { Image(systemName: "magnifyingglass") }; Text("Find these foods") }
                            .font(.brand(.body, .semibold))
                    }
                    .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty || working || voice.listening)
                } footer: {
                    if let error = error ?? voice.error { Text(error).foregroundStyle(Brand.danger) }
                    else { Text("Type it or tap the microphone and say it. You check everything before it's added.") }
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
                                FoodIcon(kind: m.kind ?? "food", size: 32)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(m.name).lineLimit(2)
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
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { voice.stop(); dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add \(matches.filter(\.on).count)") { Task { await addAll() } }
                        .disabled(!matches.contains(where: \.on)).buttonStyle(.glassProminent).tint(Brand.green)
                }
            }
            .task {
                // what you said goes into the box, and is looked up as soon as you stop talking
                voice.finished = { said in
                    let t = said.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !t.isEmpty else { return }
                    text = t
                    Task { await parse() }
                }
                if listen { await voice.start() } else { focused = true }
            }
            .onDisappear { voice.stop() }
        }
    }

    private func parse() async {
        working = true; error = nil; defer { working = false }
        var out: [Match] = []
        #if canImport(FoundationModels)
        if Self.modelAvailable {
            do {
                let session = LanguageModelSession(instructions: "You split a description of a meal into separate foods and drinks with their amounts. Use short, generic English food names. If no amount is given, use 1 piece.")
                let r = try await session.respond(to: text, generating: ParsedMeal.self)
                for f in r.content.foods {
                    guard let hit = await store.engineRef.search(f.name, meal: meal).first(where: { $0.quick != true }) else { continue }
                    let grams = ["g", "gram", "grams", "ml"].contains(f.unit.lowercased())
                    let unit = grams ? "g" : (hit.u ?? "g")
                    let qty = grams ? f.amount : max(0.25, f.amount) * (hit.u == "g" ? (hit.q ?? 100) : 1)
                    let m = await store.engineRef.macros(hit.id, qty: qty, unit: unit)
                    out.append(Match(said: f.name, food: hit.id, name: hit.name, kind: hit.kind, qty: qty, unit: unit, kcal: m?.kcal ?? 0))
                }
            } catch {}
        }
        #endif
        // no model (or it found nothing): Setpoint's own reader, one food per part of the sentence
        if out.isEmpty {
            for l in await store.engineRef.importLines(Self.pieces(text)) where l.ok {
                guard let food = l.food, let name = l.name, let qty = l.qty, let unit = l.unit else { continue }
                out.append(Match(said: l.line, food: food, name: name, kind: l.kind, qty: qty, unit: unit, kcal: l.kcal ?? 0))
            }
        }
        matches = out
        if out.isEmpty { error = String(localized: "Couldn't find those foods. Try simpler words.") }
    }

    /// "2 eggs, toast and a coffee" → ["2 eggs", "toast", "a coffee"] (and the same in Arabic: "بيض وعيش").
    static func pieces(_ text: String) -> [String] {
        var t = " " + text.replacingOccurrences(of: "\n", with: ",") + " "
        for sep in [" and then ", " and ", " with ", " plus ", " & ", " then ", " also ", " و ", " مع ", " وكمان "] {
            t = t.replacingOccurrences(of: sep, with: ",", options: .caseInsensitive)
        }
        // Arabic "و" (and) is written onto the next word: "بيض وعيش". Split there, but not inside foods that start with و.
        let keep = ["ورق", "ورك", "وراك", "وز", "وزة", "وجبة"]
        let words = t.split(separator: " ", omittingEmptySubsequences: true).map(String.init)
        var rebuilt: [String] = []
        for (i, w) in words.enumerated() {
            if i > 0, w.hasPrefix("و"), w.count > 2, !keep.contains(where: { w.hasPrefix($0) }) { rebuilt.append(","); rebuilt.append(String(w.dropFirst())) }
            else { rebuilt.append(w) }
        }
        return rebuilt.joined(separator: " ")
            .components(separatedBy: CharacterSet(charactersIn: ",،;.؛"))
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }

    private func addAll() async {
        var items: [[String: JSONValue]] = []
        for m in matches where m.on {
            if let it = await store.engineRef.item(m.food, qty: m.qty, unit: m.unit, meal: meal) { items.append(it) }
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
