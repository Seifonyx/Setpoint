import SwiftUI
import VisionKit

/// Apple's live scanner (the one the Camera app uses): point at a barcode and it's read straight away.
struct BarcodeScreen: View {
    @Environment(\.dismiss) private var dismiss
    let found: (String) -> Void
    @State private var typed = ""
    @State private var typing = false

    var body: some View {
        NavigationStack {
            Group {
                if DataScannerViewController.isSupported && DataScannerViewController.isAvailable {
                    Scanner { code in found(code) }.ignoresSafeArea()
                } else {
                    ContentUnavailableView("Camera not available", systemImage: "camera", description: Text("Allow camera access in Settings, or type the number."))
                }
            }
            .navigationTitle("Scan barcode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .primaryAction) { Button("Type the number", systemImage: "keyboard") { typing = true } }
            }
            .alert("Barcode number", isPresented: $typing) {
                TextField("Barcode", text: $typed).keyboardType(.numberPad)
                Button("Look up") { let d = typed.filter(\.isNumber); if d.count >= 8 { found(d) } }
                Button("Cancel", role: .cancel) {}
            }
        }
    }
}

private struct Scanner: UIViewControllerRepresentable {
    let found: (String) -> Void

    func makeUIViewController(context: Context) -> DataScannerViewController {
        let vc = DataScannerViewController(recognizedDataTypes: [.barcode(symbologies: [.ean13, .ean8, .upce, .code128])], qualityLevel: .balanced,
                                           isHighFrameRateTrackingEnabled: false, isHighlightingEnabled: true)
        vc.delegate = context.coordinator
        try? vc.startScanning()
        return vc
    }
    func updateUIViewController(_ vc: DataScannerViewController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(found: found) }

    @MainActor final class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let found: (String) -> Void
        private var done = false
        init(found: @escaping (String) -> Void) { self.found = found }
        func dataScanner(_ s: DataScannerViewController, didAdd items: [RecognizedItem], allItems: [RecognizedItem]) {
            guard !done else { return }
            for item in items {
                if case .barcode(let b) = item, let v = b.payloadStringValue, v.count >= 8 {
                    done = true
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                    s.stopScanning()
                    found(v)
                    return
                }
            }
        }
    }
}
