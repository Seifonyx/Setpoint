import SwiftUI
import UIKit

/// Tells you when a newer build is out. iOS doesn't let a sideloaded app replace itself, so the Diary shows a small card
/// whose Update button hands the new build to AltStore (its install link), which installs it over this one and keeps
/// your data. SideStore takes the same link if that's what you use; with neither, it opens the release page.
/// It reads the source the build publishes (sidestore.json, AltStore's source format), at most every few hours, and
/// never in the screenshots or UI tests (demo data) or in a build that didn't come from the build server (build 1).
@MainActor @Observable
final class UpdateCheck {
    static let shared = UpdateCheck()
    /// The newer build's number, while one is waiting and you haven't put it off.
    private(set) var available: Int?
    /// Where the newer build's .ipa is.
    @ObservationIgnored private var download: URL?

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
        download = (version["downloadURL"] as? String).flatMap(URL.init(string:))
        withAnimation(.snappy) { available = build > Self.current && build != later ? build : nil }
    }

    func putOff() {
        later = available ?? later
        withAnimation(.snappy) { available = nil }
    }

    /// Installs the newer build: AltStore's install link (`altstore://install?url=`), then SideStore's (it kept the
    /// same link), then AltStore's own My Apps, and the release page when none of them is there.
    func install() {
        var tries: [URL] = []
        if let ipa = download?.absoluteString.addingPercentEncoding(withAllowedCharacters: .alphanumerics) {
            tries += ["altstore", "sidestore"].compactMap { URL(string: "\($0)://install?url=\(ipa)") }
        }
        tries += [URL(string: "altstore://")!, URL(string: "sidestore://")!, Self.releasePage]
        Self.open(tries)
    }

    private static func open(_ urls: [URL]) {
        guard let url = urls.first else { return }
        UIApplication.shared.open(url) { opened in if !opened { Self.open(Array(urls.dropFirst())) } }
    }
}

/// The card at the top of the Diary: a new build is ready to install with AltStore.
struct UpdateBanner: View {
    let build: Int
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "arrow.down.circle.fill").font(.brand(.title3)).foregroundStyle(Brand.green)
            VStack(alignment: .leading, spacing: 4) {
                Text("Update available").font(.brand(.subheadline, .semibold))
                Text("Build \(build) is ready. Tap Update to install it with AltStore.")
                    .font(.brand(.subheadline)).foregroundStyle(.secondary)
                HStack(spacing: 10) {
                    Button("Update") { UpdateCheck.shared.install() }
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
