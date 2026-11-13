import SwiftUI
import Vision

/// Snap your plate: the iPhone's own image recognition (on this phone, free, nothing uploaded) names what it sees,
/// each name is matched to a food in the list at your usual amount, and you tick what's right before adding.
enum PlateReader {
    struct Guess: Sendable, Hashable { let label: String; let confidence: Float }
    /// Words that describe the scene rather than a food.
    private static let skip: Set<String> = ["food", "dish", "meal", "plate", "tableware", "table", "dining table", "bowl", "cutlery", "fork",
        "spoon", "knife", "cup", "container", "utensil", "kitchen", "indoor", "outdoor", "people", "adult", "hand", "structure", "produce",
        "vegetable", "fruit", "dessert", "baked goods", "snack", "ingredient", "cooking", "napkin", "tray", "platter", "wood", "textile",
        "conveyance", "machine", "material", "document", "screenshot", "liquid", "blue sky", "sky", "plant", "flower", "herb", "spice"]

    static func guesses(_ image: UIImage) async -> [Guess] {
        guard let cg = image.cgImage else { return [] }
        let orientation = CGImagePropertyOrientation(image.imageOrientation)
        return await Task.detached(priority: .userInitiated) { () -> [Guess] in
            let req = VNClassifyImageRequest()
            let handler = VNImageRequestHandler(cgImage: cg, orientation: orientation)
            guard (try? handler.perform([req])) != nil else { return [] }
            return (req.results ?? [])
                .filter { $0.confidence > 0.06 }
                .map { Guess(label: $0.identifier.replacingOccurrences(of: "_", with: " "), confidence: $0.confidence) }
                .filter { !skip.contains($0.label) }
                .prefix(14).map { $0 }
        }.value
    }
}

extension CGImagePropertyOrientation {
    init(_ o: UIImage.Orientation) {
        switch o {
        case .up: self = .up; case .down: self = .down; case .left: self = .left; case .right: self = .right
        case .upMirrored: self = .upMirrored; case .downMirrored: self = .downMirrored; case .leftMirrored: self = .leftMirrored
        case .rightMirrored: self = .rightMirrored; @unknown default: self = .up
        }
    }
}

struct PlateBox: Identifiable { let id = UUID(); let image: UIImage }

/// What's on the plate: the foods it recognised, each one a tick, with its amount to adjust.
struct PlateSheet: View {
    let image: UIImage
    let meal: String
    let day: String
    var describe: (() -> Void)? = nil
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var found: [Found] = []
    @State private var reading = true
    @State private var search = ""

    struct Found: Identifiable, Hashable {
        let hit: FoodHit
        var on: Bool
        var factor: Double = 1
        var id: String { hit.id }
    }

    var body: some View {
        NavigationStack {
            List {
                SwiftUI.Section {
                    Image(uiImage: image).resizable().scaledToFill()
                        .frame(height: 190).frame(maxWidth: .infinity).clipped()
                        .clipShape(.rect(cornerRadius: 22))
                        .overlay(alignment: .bottomLeading) {
                            if reading {
                                Label("Looking at your plate…", systemImage: "sparkle.magnifyingglass").font(.brand(.subheadline, .semibold))
                                    .padding(.horizontal, 12).padding(.vertical, 7).background(.ultraThinMaterial, in: Capsule()).padding(10)
                            }
                        }
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets())

                if !reading && found.isEmpty {
                    Section {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Couldn't tell what's on the plate").font(.brand(.headline))
                            Text("Try a closer photo from above, in good light. Or search for it below.").font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                        }
                        .padding(.vertical, 4)
                    }
                }
                if !found.isEmpty {
                    Section {
                        ForEach($found) { $f in
                            HStack(spacing: 12) {
                                Button { withAnimation(.snappy) { f.on.toggle() } } label: {
                                    Image(systemName: f.on ? "checkmark.circle.fill" : "circle").font(.title2)
                                        .foregroundStyle(f.on ? Brand.green : Brand.ink2)
                                }
                                .buttonStyle(.plain)
                                FoodIcon(kind: f.hit.kind ?? "food", size: 32, name: f.hit.name)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(f.hit.name).font(.brand(.body)).lineLimit(1)
                                    Text(amount(f)).font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                                }
                                Spacer(minLength: 4)
                                Stepper("", value: $f.factor, in: 0.5...4, step: 0.5).labelsHidden().fixedSize()
                                    .opacity(f.on ? 1 : 0.4).disabled(!f.on)
                            }
                            .opacity(f.on ? 1 : 0.55)
                        }
                    } header: { Text("On your plate") } footer: {
                        Text("Recognised on this iPhone. Check the amounts: a photo can't weigh food.")
                    }
                }
                Section {
                    HStack {
                        Image(systemName: "magnifyingglass").foregroundStyle(Brand.ink2)
                        TextField("Something missing? Add it", text: $search).submitLabel(.search).onSubmit { Task { await addSearch() } }
                    }
                    if let describe {
                        Button { dismiss(); describe() } label: { Label("Describe it instead", systemImage: "sparkles") }
                    }
                }
            }
            .brandList()
            .navigationTitle("Your plate")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
            }
            .safeAreaInset(edge: .bottom) {
                let picked = found.filter(\.on)
                Button { Task { await add() } } label: {
                    Text(picked.isEmpty ? LocalizedStringKey("Pick what you ate") : LocalizedStringKey("Add \(picked.count) foods · \(pickedKcal) kcal"))
                        .font(.brand(.headline)).frame(maxWidth: .infinity, minHeight: 50)
                }
                .buttonStyle(.glassProminent).tint(Brand.green)
                .disabled(picked.isEmpty)
                .padding(.horizontal, 16).padding(.bottom, 8)
            }
            .task { await read() }
            .sensoryFeedback(.success, trigger: reading) { old, new in old && !new && !found.isEmpty }
        }
    }

    private var pickedKcal: String { Fmt.kcal(found.filter(\.on).reduce(0.0) { $0 + ($1.hit.kcal ?? 0) * $1.factor }) }
    private func amount(_ f: Found) -> String {
        Fmt.amount((f.hit.q ?? 1) * f.factor, f.hit.u ?? "g") + " · " + Fmt.kcal((f.hit.kcal ?? 0) * f.factor) + " " + String(localized: "kcal")
    }

    private func read() async {
        let guesses = await PlateReader.guesses(image)
        var out: [Found] = []
        for g in guesses {
            let hits = await store.engineRef.search(g.label, meal: meal)
            // keep a guess only when the food list has something that's really called that
            let word = g.label.lowercased().split(separator: " ").first.map(String.init) ?? g.label.lowercased()
            guard let h = hits.first(where: { $0.name.lowercased().contains(word) }), !out.contains(where: { $0.hit.id == h.id }) else { continue }
            out.append(Found(hit: h, on: g.confidence > 0.3 || out.isEmpty))
            if out.count >= 6 { break }
        }
        withAnimation(.snappy) { found = out; reading = false }
    }
    private func addSearch() async {
        let q = search.trimmingCharacters(in: .whitespaces)
        guard !q.isEmpty, let h = await store.engineRef.search(q, meal: meal).first else { return }
        withAnimation(.snappy) { if !found.contains(where: { $0.hit.id == h.id }) { found.append(Found(hit: h, on: true)) }; search = "" }
    }
    private func add() async {
        var items: [[String: JSONValue]] = []
        for f in found where f.on {
            if let raw = await store.engineRef.item(f.hit.id, qty: (f.hit.q ?? 1) * f.factor, unit: f.hit.u ?? "g", meal: meal) { items.append(raw) }
        }
        store.add(items, to: day, label: String(localized: "Added \(items.count) foods"))
        dismiss()
    }
}
