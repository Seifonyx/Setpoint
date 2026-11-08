# Setpoint for iPhone (native, SwiftUI)

- `project.yml` describes the Xcode project; the build server turns it into `Setpoint.xcodeproj` with XcodeGen.
- Every push to `ios/` builds on GitHub (`.github/workflows/ios.yml`) and publishes `Setpoint.ipa` and simulator screenshots to the **ios-latest** release.
- Install: on the iPhone, open https://github.com/Seifonyx/Setpoint/releases/tag/ios-latest, download `Setpoint.ipa`, and open it in SideStore.
- Minimum iOS 26 (Liquid Glass).
