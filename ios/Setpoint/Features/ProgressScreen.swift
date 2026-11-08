import SwiftUI

/// Phase 0 placeholder for Progress (weight chart and history arrive in Phase 4).
struct ProgressScreen: View {
    @State private var range = 1

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("Range", selection: $range) {
                        Text("1M").tag(0); Text("3M").tag(1); Text("6M").tag(2); Text("1Y").tag(3)
                    }
                    .pickerStyle(.segmented)
                    VStack(alignment: .leading) {
                        Text("Weight trend").font(.subheadline).foregroundStyle(.secondary)
                        Text("88.7 kg").font(.system(size: 34, weight: .bold, design: .rounded))
                    }
                }
                Section("Coming in Phase 4") {
                    Label("Weight chart", systemImage: "chart.xyaxis.line")
                    Label("Nutrition history", systemImage: "calendar")
                    Label("Body measurements", systemImage: "ruler")
                }
            }
            .navigationTitle("Progress")
        }
    }
}

#Preview { ProgressScreen() }
