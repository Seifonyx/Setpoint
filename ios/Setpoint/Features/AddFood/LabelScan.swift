import SwiftUI
import UIKit
import Vision

/// Photograph a nutrition label; the iPhone reads it (on device) and fills in a new food for you to check.
struct LabelCamera: UIViewControllerRepresentable {
    let done: (UIImage?) -> Void
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let p = UIImagePickerController()
        p.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        p.delegate = context.coordinator
        return p
    }
    func updateUIViewController(_ vc: UIImagePickerController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(done: done) }
    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let done: (UIImage?) -> Void
        init(done: @escaping (UIImage?) -> Void) { self.done = done }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            done(info[.originalImage] as? UIImage)
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { done(nil) }
    }
}

enum LabelReader {
    struct Values: Sendable { var kcal: Double?; var protein: Double?; var carbs: Double?; var fat: Double?; var grams: Double? }

    /// Reads the text on the label and picks out calories, protein, carbs, fat and the serving weight.
    @MainActor static func read(_ image: UIImage) async -> Values {
        guard let cg = image.cgImage else { return Values() }
        let lines: [String] = await withCheckedContinuation { cont in
            let req = VNRecognizeTextRequest { r, _ in
                let out = (r.results as? [VNRecognizedTextObservation] ?? []).compactMap { $0.topCandidates(1).first?.string }
                cont.resume(returning: out)
            }
            req.recognitionLevel = .accurate
            req.usesLanguageCorrection = false
            nonisolated(unsafe) let request = req
            nonisolated(unsafe) let image = cg
            DispatchQueue.global(qos: .userInitiated).async {
                do { try VNImageRequestHandler(cgImage: image, options: [:]).perform([request]) } catch { cont.resume(returning: []) }
            }
        }
        return parse(lines.joined(separator: "\n"))
    }

    static func parse(_ text: String) -> Values {
        let t = text.replacingOccurrences(of: ",", with: ".")
        func first(_ pattern: String) -> Double? {
            guard let re = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]),
                  let m = re.firstMatch(in: t, range: NSRange(t.startIndex..., in: t)), m.numberOfRanges > 1,
                  let r = Range(m.range(at: 1), in: t) else { return nil }
            return Double(t[r])
        }
        let n = "(\\d+(?:\\.\\d+)?)"
        var v = Values()
        v.kcal = first("\(n)\\s*kcal") ?? first("calories[^\\d\\n]{0,12}\(n)") ?? first("energy[^\\d\\n]{0,20}\(n)\\s*k?cal")
        v.protein = first("protein[^\\d\\n]{0,15}\(n)\\s*g")
        v.carbs = first("carbohydrates?[^\\d\\n]{0,15}\(n)\\s*g") ?? first("carbs[^\\d\\n]{0,15}\(n)\\s*g")
        v.fat = first("total\\s+fat[^\\d\\n]{0,15}\(n)\\s*g") ?? first("(?:^|\\n)\\s*fat[^\\d\\n]{0,15}\(n)\\s*g")
        v.grams = first("serving size[^\\d\\n]{0,15}\(n)\\s*g") ?? first("per\\s*\(n)\\s*g")
        return v
    }
}
