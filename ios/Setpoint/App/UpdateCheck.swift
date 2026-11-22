import SwiftUI
import UIKit

/// Tells you when a newer build is out. SideStore doesn't install updates by itself, and iOS doesn't let a sideloaded
/// app replace itself, so the Diary shows a small card that opens SideStore, where Setpoint's Update button is waiting.
/// It reads the same SideStore source the build publishes (sidestore.json), at most every few hours, and never in the
/// screenshots or UI tests (demo data) or in a build that didn't come from the build server (build 1).
@MainActor @Observable
final class UpdateCheck {
    static let shared = UpdateCheck()
    /// The newer build's number, while one is waiting and you haven't put it off.
    private(set) var available: Int?

    private static let source = URL(string: "https://raw.githubusercontent.com/Seifonyx/Setpoint/main/sidestore.json")!
    private static let releasePage = URL(string: "https://github.com/Seifonyx/Setpoint/releases/tag/ios-latest")!
    @ObservationIgnored private var lastCheck = Date.distantPast
    /// The build you said "Later" to (it comes back for the next one).
    private var later: Int {
        get { UserDefaults.standard.integer(forKey: "updateLater") }
        set { UserDefaults.standard.set(newValue, forKey: "updateLater") }
    }

    /// This app's own build number (the build server's run number).
    static var current: Int { Int(Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "") ?? 0 }

    func check() async {
        guard Self.current > 1, !ProcessInfo.processInfo.arguments.contains("-demo"),
              Date().timeIntervalSince(lastCheck) > 3 * 3600 else { return }
        lastCheck = Date()
        var req = URLRequest(url: Self.source, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 10)
        req.setValue("Setpoint iOS", forHTTPHeaderField: "User-Agent")
        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let apps = json["apps"] as? [[String: Any]],
              let version = (apps.first?["versions"] as? [[String: Any]])?.first,
              let build = Int("\(version["buildVersion"] ?? "")") else { return }
        withAnimation(.snappy) { available = build > Self.current && build != later ? build : nil }
    }

    func putOff() {
        later = available ?? later
        withAnimation(.snappy) { available = nil }
    }

    /// SideStore (its Update button is on My Apps); the release page if SideStore isn't there.
    func openSideStore() {
        UIApplication.shared.open(URL(string: "sidestore://")!) { opened in
            if !opened { UIApplication.shared.open(Self.releasePage) }
        }
    }
}

/// The card at the top of the Diary: a new build is ready in SideStore.
struct UpdateBanner: View {
    let build: Int
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "arrow.down.circle.fill").font(.brand(.title3)).foregroundStyle(Brand.green)
            VStack(alignment: .leading, spacing: 4) {
                Text("Update available").font(.brand(.subheadline, .semibold))
                Text("Build \(build) is ready. Open SideStore and tap Update on Setpoint.")
                    .font(.brand(.subheadline)).foregroundStyle(.secondary)
                HStack(spacing: 10) {
                    Button("Open SideStore") { UpdateCheck.shared.openSideStore() }
                        .buttonStyle(.glassProminent).tint(Brand.green).controlSize(.small)
                    Button("Later") { UpdateCheck.shared.putOff() }
                        .buttonStyle(.glass).controlSize(.small)
                }
                .padding(.top, 2)
            }
        }
        .accessibilityElement(children: .contain)
    }
}
