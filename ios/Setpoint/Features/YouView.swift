import SwiftUI
import UIKit

/// You: account and sync, your plan, and data in and out.
struct YouView: View {
    @Environment(Store.self) private var store
    @Environment(Account.self) private var account
    @Binding var importing: Bool
    @State private var shareURL: URL?
    @State private var error: String?
    @State private var showPlan = UserDefaults.standard.string(forKey: "open") == "plan" // build-server screenshots

    var body: some View {
        NavigationStack {
            List {
                Section {
                    NavigationLink { AccountView() } label: {
                        LabeledContent {
                            if account.busy { ProgressView() } else if let s = account.session { Text(s.email).lineLimit(1) } else { Text("Not signed in") }
                        } label: { Label("Account", systemImage: account.signedIn ? "checkmark.icloud" : "person.crop.circle.badge.plus") }
                    }
                }
                Section {
                    NavigationLink { PlanView() } label: {
                        LabeledContent {
                            if let t = store.overview?.plan?.target { Text("\(Fmt.kcal((t / 10).rounded() * 10)) kcal").monospacedDigit() }
                        } label: { Label("Plan", systemImage: "target") }
                    }
                }
                Section {
                    NavigationLink { DeviceSettingsView() } label: { Label("Settings", systemImage: "gearshape") }
                }
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
            .navigationDestination(isPresented: $showPlan) { PlanView() }
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
