import SwiftUI
import UIKit

/// You: data in and out for now (settings and plan arrive in later phases).
struct YouView: View {
    @Environment(Store.self) private var store
    @Binding var importing: Bool
    @State private var shareURL: URL?
    @State private var error: String?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button { importing = true } label: { Label("Import from the web app", systemImage: "square.and.arrow.down") }
                    Button {
                        do { shareURL = try store.exportBackup() } catch { self.error = error.localizedDescription }
                    } label: { Label("Back up", systemImage: "square.and.arrow.up") }
                } header: {
                    Text("Your data")
                } footer: {
                    Text("Import a backup made in the web app (Settings › Back up). Backups made here can be restored in the web app too.")
                }
                Section {
                    LabeledContent("Days logged", value: store.food.keys.count.formatted())
                    LabeledContent("Weigh-ins", value: store.entries.count.formatted())
                }
                Section {
                    LabeledContent("Version", value: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")
                }
            }
            .navigationTitle("You")
            .sheet(item: Binding(get: { shareURL.map(SharedFile.init) }, set: { shareURL = $0?.url })) { f in
                ShareSheet(url: f.url).presentationDetents([.medium, .large])
            }
            .alert("Couldn't back up", isPresented: Binding(get: { error != nil }, set: { if !$0 { error = nil } })) {
                Button("OK", role: .cancel) {}
            } message: { Text(error ?? "") }
        }
    }
}

struct SharedFile: Identifiable { let url: URL; var id: String { url.path } }

/// The iPhone share sheet (Save to Files, AirDrop, Mail…).
struct ShareSheet: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> UIActivityViewController { UIActivityViewController(activityItems: [url], applicationActivities: nil) }
    func updateUIViewController(_ vc: UIActivityViewController, context: Context) {}
}
