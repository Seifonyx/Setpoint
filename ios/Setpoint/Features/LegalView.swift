import SwiftUI

/// The legal pages (Privacy Policy, Terms of Use, Cookies & Storage, Refund Policy), read from the app's own copy
/// (Resources/Legal.json, made from ios/legal by ios/legal/build.js), so they open without the internet.
struct LegalDoc: Decodable, Sendable {
    struct Page: Decodable, Sendable, Identifiable, Hashable {
        let id: String
        let title: String
        let meta: String
        let sections: [Section]
    }
    struct Section: Decodable, Sendable, Hashable {
        let heading: String
        let blocks: [Block]
    }
    struct Block: Decodable, Sendable, Hashable {
        let p: String?
        let list: [String]?
    }
    let pages: [Page]

    static let shared: LegalDoc = {
        guard let url = Bundle.main.url(forResource: "Legal", withExtension: "json"), let data = try? Data(contentsOf: url),
              let doc = try? JSONDecoder().decode(LegalDoc.self, from: data) else { return LegalDoc(pages: []) }
        return doc
    }()
    static func page(_ id: String) -> Page? { shared.pages.first { $0.id == id } }
}

/// Links inside the app's text that open a legal page here: setpoint-legal://terms, …privacy, …cookies, …refunds.
enum LegalLink {
    static let scheme = "setpoint-legal"
    static func page(_ url: URL) -> String? { url.scheme == scheme ? url.host : nil }
}

/// A legal page as a sheet: its title, sections and links; links to the other legal pages open inside it.
struct LegalSheet: View {
    let page: String
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            LegalView(id: page)
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
        }
    }
}

struct LegalView: View {
    let id: String
    @State private var next: LegalDoc.Page?

    var body: some View {
        ScrollView {
            if let page = LegalDoc.page(id) {
                VStack(alignment: .leading, spacing: 26) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(page.title).font(Brand.display(32, .heavy)).fixedSize(horizontal: false, vertical: true)
                        Text(page.meta).font(.brand(.subheadline)).foregroundStyle(Brand.ink2)
                    }
                    ForEach(page.sections, id: \.self) { s in
                        VStack(alignment: .leading, spacing: 10) {
                            Text(s.heading).font(Brand.display(20, .bold)).accessibilityAddTraits(.isHeader)
                            ForEach(s.blocks, id: \.self) { b in
                                if let p = b.p { text(p) }
                                if let list = b.list {
                                    VStack(alignment: .leading, spacing: 8) {
                                        ForEach(list, id: \.self) { item in
                                            HStack(alignment: .firstTextBaseline, spacing: 10) {
                                                Circle().fill(Brand.ink2).frame(width: 5, height: 5).alignmentGuide(.firstTextBaseline) { $0[.bottom] + 4 }
                                                text(item)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 22).padding(.top, 8).padding(.bottom, 40)
                .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                ContentUnavailableView("Not available", systemImage: "doc.text")
            }
        }
        .paperPage()
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(item: $next) { LegalView(id: $0.id) }
        // a link to another legal page opens it here; email and web links go to Mail and Safari as usual
        .environment(\.openURL, OpenURLAction { url in
            if let id = LegalLink.page(url), let p = LegalDoc.page(id) { next = p; return .handled }
            return .systemAction
        })
    }

    private func text(_ markdown: String) -> some View {
        Text((try? AttributedString(markdown: markdown, options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? AttributedString(markdown))
            .font(.brand(.body)).foregroundStyle(Brand.ink).tint(Brand.green).lineSpacing(3)
            .fixedSize(horizontal: false, vertical: true)
            .textSelection(.enabled)
    }
}
