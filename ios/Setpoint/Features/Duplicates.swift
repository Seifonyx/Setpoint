import SwiftUI

/// Possible duplicates among your own foods (the web app's own rules: same name and serving, calories within 5%).
/// Each group shows its copies, most-logged first and ticked; Merge keeps the ticked one and moves your diary,
/// recipes, meals and favorites over to it. Undo from the banner puts everything back.
/// Shown from My foods only when there's something to merge (like Photos' Duplicates album).
struct DuplicatesView: View {
    @Environment(Store.self) private var store
    @State private var groups: [[DupFood]] = []
    @State private var loaded = false
    /// The ticked food in each group, by the group's first id (the most-logged one when it opens).
    @State private var keep: [String: String] = [:]

    var body: some View {
        List {
            if loaded && groups.isEmpty {
                Section {
                    EmptyState(icon: "checkmark.circle", title: "No copies left",
                               message: "Your foods are nice and tidy.")
                }
            }
            if !groups.isEmpty {
                Section {
                    Text("Merging keeps the ticked food and moves your diary, recipes, meals and favorites over to it.")
                        .font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                        .listRowBackground(Color.clear)
                        .listRowInsets(EdgeInsets(top: 4, leading: 4, bottom: 4, trailing: 4))
                }
            }
            ForEach(groups, id: \.first?.id) { g in
                let key = g.first?.id ?? "", picked = keep[key] ?? key
                Section {
                    ForEach(g) { f in
                        Button { keep[key] = f.id } label: { row(f, picked: f.id == picked) }
                            .buttonStyle(.plain)
                            .accessibilityAddTraits(f.id == picked ? .isSelected : [])
                    }
                    Button {
                        guard let k = g.first(where: { $0.id == picked }) else { return }
                        Task { await store.mergeFoods(keep: k, drop: g.filter { $0.id != k.id }) }
                    } label: {
                        Label("Merge into the ticked one", systemImage: "arrow.triangle.merge")
                            .font(.brand(.body, .semibold)).foregroundStyle(Brand.green)
                    }
                    .accessibilityIdentifier("dup-merge")
                }
            }
        }
        .brandList()
        .navigationTitle("Possible duplicates")
        .navigationBarTitleDisplayMode(.inline)
        .hidesTabBar()
        .overlay(alignment: .bottom) { UndoBanner().animation(.snappy, value: store.undoLabel) }
        .task(id: "\(store.version)|\(store.foodsReady)") {
            let gs = await store.engineRef.dupGroups()
            withAnimation(loaded ? Animation.snappy : nil) { groups = gs }
            loaded = true
        }
    }

    private func row(_ f: DupFood, picked: Bool) -> some View {
        HStack(spacing: 12) {
            Image(systemName: picked ? "checkmark.circle.fill" : "circle").font(.title3)
                .foregroundStyle(picked ? Brand.green : Brand.ink2)
            VStack(alignment: .leading, spacing: 2) {
                Text(f.name).font(.brand(.body)).foregroundStyle(Brand.ink).lineLimit(2)
                Group { if let g = f.g { Text("1 \(f.unit) · \(Fmt.grams(g)) g") } else { Text(verbatim: "1 \(f.unit)") } }
                    .font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                Text("\(Fmt.kcal(f.kcal)) kcal · P \(Fmt.grams(f.p)) · C \(Fmt.grams(f.c)) · F \(Fmt.grams(f.f))")
                    .font(.brand(.subheadline)).monospacedDigit().foregroundStyle(Brand.ink2)
                if f.uses > 0 {
                    Text(f.uses == 1 ? LocalizedStringKey("Logged once") : "Logged \(f.uses) times").font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                }
            }
            Spacer(minLength: 0)
        }
        .contentShape(.rect)
    }
}
