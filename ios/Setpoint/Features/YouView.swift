import SwiftUI
import UIKit

/// You: account and sync, your plan, and data in and out.
struct YouView: View {
    @Environment(Store.self) private var store
    @Environment(Account.self) private var account
    @Binding var importing: Bool
    @State private var shareURL: URL?
    @State private var error: String?
    @State private var explain = false
    @State private var showPlan = ["plan", "guest"].contains(UserDefaults.standard.string(forKey: "open") ?? "") // build-server screenshots
    @State private var showSettings = ["settings", "ramadan"].contains(UserDefaults.standard.string(forKey: "open") ?? "")
    @State private var showFasting = UserDefaults.standard.string(forKey: "open") == "fasting"
    @State private var showExport = UserDefaults.standard.string(forKey: "open") == "export"
    @State private var showTargets = UserDefaults.standard.string(forKey: "open") == "targets"
    @State private var showLegal = UserDefaults.standard.string(forKey: "open") == "legal"

    var body: some View {
        NavigationStack {
            List {
                // you, at the top: your account and whether it's syncing
                Section {
                    NavigationLink { AccountView() } label: {
                        HStack(spacing: 14) {
                            ZStack {
                                Circle().fill(Brand.greenSoft)
                                if let e = account.session?.email, let c = e.first {
                                    Text(String(c).uppercased()).font(Brand.display(24, .bold)).foregroundStyle(Brand.green)
                                } else {
                                    Image(systemName: "person.fill").font(.title2).foregroundStyle(Brand.green)
                                }
                            }
                            .frame(width: 56, height: 56)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(account.session?.email ?? String(localized: "Not signed in")).font(.brand(.headline)).lineLimit(1)
                                // saving to your account happens out of sight; only a problem is worth a line here
                                if account.stuck {
                                    Label("Not saved to your account yet", systemImage: "exclamationmark.icloud.fill")
                                        .font(.brand(.footnote)).foregroundStyle(Brand.amber)
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                YouHighlights()
                Section {
                    NavigationLink { PlanView() } label: {
                        LabeledContent {
                            if let t = store.overview?.plan?.target { Text("\(Fmt.kcal((t / 10).rounded() * 10)) kcal").monospacedDigit() }
                        } label: { TileLabel("Plan", "target", Brand.green) }
                    }
                    NavigationLink { TargetsView() } label: { TileLabel("Targets", "slider.horizontal.3", Brand.protein) }
                    NavigationLink { CheckInView() } label: {
                        LabeledContent {
                            if CheckInView.due && store.entries.count >= 3 {
                                Text("New").font(.brand(.subheadline, .semibold)).foregroundStyle(Brand.green)
                            }
                        } label: { TileLabel("Weekly check-in", "chart.line.uptrend.xyaxis", Brand.amber) }
                    }
                } header: {
                    // how the target is worked out: the i beside the section's name
                    HStack(spacing: 6) {
                        Text("Your plan")
                        Button { explain = true } label: {
                            Image(systemName: "info.circle").font(.system(size: 17, weight: .semibold)).foregroundStyle(Brand.blue)
                                .frame(width: 30, height: 30).contentShape(.rect)
                        }
                        .buttonStyle(.borderless)
                        .accessibilityLabel(Text("How your target works"))
                    }
                }
                Section {
                    NavigationLink { DeviceSettingsView() } label: { TileLabel("Settings", "gearshape.fill", Brand.ink2) }
                    NavigationLink { FastingView() } label: {
                        LabeledContent {
                            if store.root["fast"]?.object?["start"]?.number != nil { Text("Fasting").foregroundStyle(Brand.green) }
                        } label: { TileLabel("Fasting timer", "timer", Brand.protein) }
                    }
                } header: { Text("App") }
                Section {
                    Button {
                        do { shareURL = try store.exportBackup() } catch { self.error = error.localizedDescription }
                    } label: { TileLabel("Back up", "square.and.arrow.up", Brand.water) }
                    Button { importing = true } label: { TileLabel("Restore from a backup", "square.and.arrow.down", Brand.water) }
                    NavigationLink { ExportView() } label: { TileLabel("Export to a spreadsheet", "tablecells", Brand.green) }
                } header: {
                    Text("Your data")
                } footer: {
                    Text("A backup is one file with everything in it, to restore from. Keep it in Files or iCloud Drive. A spreadsheet export is for reading your data in Numbers or Excel.")
                }
                Section {} footer: {
                    Text(verbatim: "Setpoint \(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "") · "
                         + String(localized: "\(store.food.keys.count) days logged") + " · " + String(localized: "\(store.entries.count) weigh-ins"))
                        .frame(maxWidth: .infinity).multilineTextAlignment(.center)
                }
            }
            .brandList()
            .shrinksTabBar()
            .navigationTitle("You")
            .navigationDestination(isPresented: $showPlan) { PlanView() }
            .navigationDestination(isPresented: $showSettings) { DeviceSettingsView() }
            .navigationDestination(isPresented: $showFasting) { FastingView() }
            .navigationDestination(isPresented: $showExport) { ExportView() }
            .navigationDestination(isPresented: $showTargets) { TargetsView() }
            .navigationDestination(isPresented: $showLegal) { LegalView(id: UserDefaults.standard.string(forKey: "legal") ?? "privacy") }
            .sheet(isPresented: $explain) { TargetExplainer() }
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

/// A row label with its icon on a small coloured tile, like the iPhone's Settings: colour where it helps you find things.
struct TileLabel: View {
    let title: LocalizedStringKey
    let icon: String
    let color: Color
    init(_ title: LocalizedStringKey, _ icon: String, _ color: Color) { self.title = title; self.icon = icon; self.color = color }
    var body: some View {
        Label {
            Text(title).foregroundStyle(Brand.ink)
        } icon: {
            Image(systemName: icon).font(.system(size: 14, weight: .semibold)).foregroundStyle(.white)
                .frame(width: 28, height: 28).background(color, in: .rect(cornerRadius: Radius.icon))
        }
    }
}
