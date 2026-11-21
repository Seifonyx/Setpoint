import SwiftUI
import UIKit
import WebKit

/// Import a recipe from a link (or from its pasted ingredient list): most recipe sites describe their recipe in a
/// standard way (schema.org Recipe), so Setpoint reads its name, servings and ingredients, matches each ingredient to
/// the food list, and shows you every match to check before the recipe opens for saving.
struct ImportRecipeSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    /// The finished recipe (name, servings, items), for the recipe editor to open.
    let done: ([String: JSONValue]) -> Void
    @State private var link = ""
    @State private var pasting = UserDefaults.standard.string(forKey: "open") == "importrecipe" // build-server screenshots
    @State private var pasted = UserDefaults.standard.string(forKey: "open") == "importrecipe"
        ? "2 cups all-purpose flour\n3 large eggs\n1 ½ cups (360 ml) milk\n2 tablespoons butter, melted\n1 tsp salt\nSalt and pepper to taste" : ""
    @State private var name = ""
    @State private var servings = 4
    @State private var rows: [Row] = []
    @State private var working = false
    @State private var error: String?
    @State private var swapping: Int?
    @State private var browsing: URL?   // a site that turned the quick read away: opened in a real browser view instead
    @FocusState private var focused: Bool

    struct Row: Identifiable {
        let id = UUID()
        var line: String
        var on: Bool
        var sure: Bool
        var found: Bool
        var skipped: Bool
        var name: String
        var kind: String?
        var amount: String
        var kcal: Double
        var item: [String: JSONValue]?
    }

    var body: some View {
        NavigationStack {
            List {
                if rows.isEmpty { source } else { review }
            }
            .brandList()
            .navigationTitle(rows.isEmpty ? "Import a recipe" : "Check the ingredients")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                if !rows.isEmpty {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Continue", action: finish).buttonStyle(.glassProminent).tint(Brand.green)
                            .disabled(!rows.contains { $0.on && $0.item != nil })
                    }
                }
            }
            .sheet(item: Binding(get: { browsing.map(Browse.init) }, set: { browsing = $0?.url })) { b in
                RecipeBrowser(url: b.url) { r in
                    browsing = nil
                    Task { await match(r.lines, title: r.name, serves: r.servings ?? 4) }
                }
            }
            .sheet(item: Binding(get: { swapping.map(Swap.init) }, set: { swapping = $0?.index })) { s in
                IngredientPicker { item in replace(s.index, with: item) }
            }
            .task { if pasting && !pasted.isEmpty && rows.isEmpty { await match(pasted.components(separatedBy: .newlines), title: "Pancakes", serves: 4) } }
        }
    }
    private struct Swap: Identifiable { let index: Int; var id: Int { index } }
    private struct Browse: Identifiable { let url: URL; var id: String { url.absoluteString } }

    // MARK: Where the recipe comes from

    @ViewBuilder private var source: some View {
        if !pasting {
            Section {
                HStack(spacing: 10) {
                    Image(systemName: "link").foregroundStyle(Brand.ink2)
                    TextField("Recipe link", text: $link)
                        .keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .focused($focused).submitLabel(.go).onSubmit { Task { await fromLink() } }
                    if link.isEmpty {
                        Button("Paste") { link = UIPasteboard.general.string ?? "" }.font(.brand(.subheadline, .semibold)).buttonStyle(.plain).foregroundStyle(Brand.green)
                    }
                }
                Button { Task { await fromLink() } } label: {
                    HStack { if working { ProgressView() } else { Image(systemName: "square.and.arrow.down") }; Text("Import") }.font(.brand(.body, .semibold))
                }
                .disabled(link.trimmingCharacters(in: .whitespaces).isEmpty || working)
            } footer: {
                if let error { Text(error).foregroundStyle(Brand.danger) }
                else { Text("Copy the link from the recipe's page. Setpoint reads its ingredients and finds each one; you check them before saving.") }
            }
            Section {
                Button("Paste the ingredients instead", systemImage: "list.bullet") { withAnimation { pasting = true; error = nil } }
            } footer: { Text("For a recipe that isn't online, or a site that doesn't import: one ingredient a line.") }
        } else {
            Section {
                TextField("Recipe name", text: $name)
                TextField("2 cups flour\n3 eggs\n1 tbsp olive oil", text: $pasted, axis: .vertical).lineLimit(6...14).focused($focused)
                Button { Task { await match(pasted.components(separatedBy: .newlines), title: name, serves: servings) } } label: {
                    HStack { if working { ProgressView() } else { Image(systemName: "magnifyingglass") }; Text("Find these ingredients") }.font(.brand(.body, .semibold))
                }
                .disabled(pasted.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || working)
            } header: { Text("Ingredients, one a line") } footer: {
                if let error { Text(error).foregroundStyle(Brand.danger) }
            }
            Section { Button("Import from a link instead", systemImage: "link") { withAnimation { pasting = false; error = nil } } }
        }
    }

    // MARK: Checking the matches

    @ViewBuilder private var review: some View {
        Section {
            TextField("Recipe name", text: $name).font(.brand(.headline))
            Stepper(value: $servings, in: 1...100) {
                HStack { Text("Servings"); Spacer(); Text("\(servings)").font(Brand.num(22, .semibold)).monospacedDigit() }
            }
        }
        Section {
            ForEach(rows.indices, id: \.self) { i in
                let r = rows[i]
                HStack(spacing: 12) {
                    Button { rows[i].on.toggle() } label: {
                        Image(systemName: r.on ? "checkmark.circle.fill" : "circle").font(.title3).foregroundStyle(r.on ? Brand.green : Brand.ink2)
                    }
                    .buttonStyle(.plain).disabled(r.item == nil)
                    // tap the food to swap it for another one
                    Button { swapping = i } label: {
                        HStack(spacing: 12) {
                            if r.found { FoodIcon(kind: r.kind ?? "food", size: 30) }
                            VStack(alignment: .leading, spacing: 3) {
                                Text(r.found ? r.name : r.line).lineLimit(2).foregroundStyle(r.found ? Brand.ink : Brand.ink2)
                                Group {
                                    if r.skipped { Text("Left out: nothing to count") }
                                    else if !r.found { Text("Not found: tap to choose a food") }
                                    else { Text("“\(r.line)”").lineLimit(1) }
                                }
                                .font(.brand(.footnote)).foregroundStyle(Brand.ink2)
                                if r.found && !r.sure {
                                    Label("Check the amount", systemImage: "exclamationmark.triangle.fill").font(.brand(.caption, .semibold)).foregroundStyle(Brand.amber)
                                }
                            }
                            Spacer(minLength: 6)
                            if r.found {
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text(Fmt.kcal(r.kcal)).font(Brand.num(17, .semibold)).monospacedDigit()
                                    Text(r.amount).font(.brand(.caption)).foregroundStyle(Brand.ink2).lineLimit(1)
                                }
                            }
                        }
                        .contentShape(.rect)
                    }
                    .buttonStyle(.plain)
                }
                .opacity(r.on || !r.found ? 1 : 0.5)
            }
        } header: {
            let n = rows.filter { $0.on && $0.item != nil }.count
            Text("\(n) of \(rows.count) ingredients")
        } footer: {
            let k = rows.filter { $0.on }.reduce(0) { $0 + $1.kcal }
            Text("About \(Fmt.kcal(k / Double(max(servings, 1)))) kcal a serving. Tap an ingredient to swap it for another food.")
        }
    }

    // MARK: Work

    private func fromLink() async {
        var t = link.trimmingCharacters(in: .whitespacesAndNewlines)
        if !t.lowercased().hasPrefix("http") { t = "https://" + t }
        guard let url = URL(string: t), url.host != nil else { error = String(localized: "That link doesn't look right."); return }
        working = true; error = nil; defer { working = false }
        var req = URLRequest(url: url); req.timeoutInterval = 15
        // recipe sites serve their full page to a normal iPhone browser
        req.setValue("Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1", forHTTPHeaderField: "User-Agent")
        let got = try? await URLSession.shared.data(for: req)
        let status = (got?.1 as? HTTPURLResponse)?.statusCode ?? 0
        let html = got.map { String(data: $0.0, encoding: .utf8) ?? String(decoding: $0.0, as: UTF8.self) } ?? ""
        guard status < 400, let r = await store.engineRef.recipe(fromHTML: html), !r.lines.isEmpty else {
            // Many big recipe sites turn away a quick read like this (it looks like a robot). Open the page in a real
            // browser view instead: it gets through, and the recipe is read from there.
            browsing = url
            return
        }
        await match(r.lines, title: r.name, serves: r.servings ?? 4)
    }

    private func match(_ lines: [String], title: String, serves: Int) async {
        let clean = lines.map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        guard !clean.isEmpty else { return }
        working = true; defer { working = false }
        // just after opening the app the food list may still be loading: wait for it (up to 15 s), or every
        // ingredient would come back "not found"
        var waited = 0
        while !store.foodsReady && waited < 75 { try? await Task.sleep(for: .milliseconds(200)); waited += 1 }
        let found = await store.engineRef.importLines(clean)
        name = title; servings = serves
        withAnimation {
            rows = found.map { l in
                Row(line: l.line, on: l.ok, sure: l.sure ?? false, found: l.ok, skipped: l.skip == true, name: l.name ?? "", kind: l.kind,
                    amount: l.amt ?? "", kcal: l.kcal ?? 0, item: l.item)
            }
        }
    }

    /// Another food for an ingredient (chosen with its amount in the usual picker).
    private func replace(_ i: Int, with item: [String: JSONValue]) {
        guard rows.indices.contains(i) else { return }
        rows[i].item = item; rows[i].found = true; rows[i].skipped = false; rows[i].on = true; rows[i].sure = true
        rows[i].name = item["name"]?.string ?? rows[i].name
        rows[i].kcal = item["kcal"]?.number ?? 0
        rows[i].amount = Fmt.amount(item["qty"]?.number ?? 1, item["unit"]?.string ?? "g")
        Task { if let ref = item["ref"]?.string { rows[i].kind = await store.engineRef.kinds(of: [ref])[ref] } }
    }

    private func finish() {
        let items = rows.filter { $0.on }.compactMap { $0.item }.map { JSONValue.object($0) }
        let nm = name.trimmingCharacters(in: .whitespaces)
        done(["name": .string(nm.isEmpty ? String(localized: "Imported recipe") : String(nm.prefix(60))), "servings": .number(Double(servings)), "items": .array(items)])
        dismiss()
    }
}

/// A recipe page opened in a real browser view, for sites that turn a quick read away. Each time the page finishes
/// loading (and every couple of seconds while it settles), Setpoint looks for the recipe in it; if the site asks you
/// to prove you're a person, you can do that right here.
struct RecipeBrowser: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let url: URL
    let found: (PageRecipe) -> Void
    @State private var page = RecipePageBox()
    @State private var tries = 0

    var body: some View {
        NavigationStack {
            RecipeWebView(page: page, url: url)
                .ignoresSafeArea(edges: .bottom)
                .navigationTitle("Reading the recipe…")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } } }
                .safeAreaInset(edge: .bottom) {
                    Label(tries > 12 ? "No recipe found on this page yet. If the site shows a check, finish it; or go back and paste the ingredients."
                                     : "Looking for the recipe on this page…", systemImage: tries > 12 ? "exclamationmark.circle" : "magnifyingglass")
                        .font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                        .padding(12).frame(maxWidth: .infinity).glassEffect(.regular, in: .rect(cornerRadius: 18)).padding(12)
                }
                .task {
                    while !Task.isCancelled {
                        try? await Task.sleep(for: .seconds(2))
                        tries += 1
                        if let html = await page.html(), let r = await store.engineRef.recipe(fromHTML: html), !r.lines.isEmpty { found(r); return }
                    }
                }
        }
    }
}

/// The browser view's page, kept so the sheet can ask it for its HTML.
@MainActor
final class RecipePageBox {
    let view: WKWebView = {
        let c = WKWebViewConfiguration()
        c.websiteDataStore = .default()
        return WKWebView(frame: .zero, configuration: c)
    }()
    func html() async -> String? {
        guard !view.isLoading else { return nil }
        return try? await view.evaluateJavaScript("document.documentElement.outerHTML") as? String
    }
}

struct RecipeWebView: UIViewRepresentable {
    let page: RecipePageBox
    let url: URL
    func makeUIView(context: Context) -> WKWebView { page.view.load(URLRequest(url: url)); return page.view }
    func updateUIView(_ v: WKWebView, context: Context) {}
}
