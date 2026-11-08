import SwiftUI

/// Phase 0 placeholder for You / Settings.
struct YouView: View {
    @State private var adaptive = true

    var body: some View {
        NavigationStack {
            List {
                Section {
                    NavigationLink { Text("Settings") } label: { Label("Settings", systemImage: "gearshape") }
                    NavigationLink { Text("Plan") } label: { Label("Plan", systemImage: "list.clipboard") }
                }
                Section("Energy expenditure") {
                    Toggle(isOn: $adaptive) { Label("Adaptive expenditure", systemImage: "arrow.triangle.2.circlepath") }
                }
                Section {
                    LabeledContent("Version", value: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")
                } footer: {
                    Text("Native preview · Phase 0")
                }
            }
            .navigationTitle("You")
        }
    }
}

#Preview { YouView() }
