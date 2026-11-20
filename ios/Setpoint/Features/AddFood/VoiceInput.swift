import Foundation
import Speech
import AVFoundation

/// Speaking what you ate: Apple's speech recognition turns it into text as you talk (on the iPhone itself where it
/// can), and it stops by itself after a short pause. In Arabic it listens for Arabic.
@MainActor
@Observable
final class VoiceInput {
    private(set) var text = ""
    private(set) var listening = false
    private(set) var error: String?
    /// Called once with the final words when listening ends by itself or with stop().
    @ObservationIgnored var finished: ((String) -> Void)?

    @ObservationIgnored private let engine = AVAudioEngine()
    @ObservationIgnored private var request: SFSpeechAudioBufferRecognitionRequest?
    @ObservationIgnored private var task: SFSpeechRecognitionTask?
    @ObservationIgnored private var quiet: Task<Void, Never>?

    /// The recogniser for the app's language (Egyptian Arabic first, then other Arabic; otherwise the phone's language).
    private static func recognizer() -> SFSpeechRecognizer? {
        let arabic = Bundle.main.preferredLocalizations.first?.hasPrefix("ar") == true
        let ids = arabic ? ["ar-EG", "ar-SA", "ar-AE"] : [Locale.current.identifier, "en-US"]
        for id in ids { if let r = SFSpeechRecognizer(locale: Locale(identifier: id)), r.isAvailable { return r } }
        return nil
    }

    func start() async {
        guard !listening else { return }
        error = nil; text = ""
        let speech = await withCheckedContinuation { c in SFSpeechRecognizer.requestAuthorization { c.resume(returning: $0) } }
        guard speech == .authorized else { error = String(localized: "Allow speech recognition for Setpoint in the Settings app to speak what you ate."); return }
        guard await AVAudioApplication.requestRecordPermission() else { error = String(localized: "Allow the microphone for Setpoint in the Settings app to speak what you ate."); return }
        guard let rec = Self.recognizer() else { error = String(localized: "Speech recognition isn't available right now. Type it instead."); return }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.record, mode: .measurement, options: .duckOthers)
            try session.setActive(true, options: .notifyOthersOnDeactivation)
            let req = SFSpeechAudioBufferRecognitionRequest()
            req.shouldReportPartialResults = true
            req.addsPunctuation = true
            if rec.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true } // stays on this iPhone where it can
            nonisolated(unsafe) let sink = req
            let input = engine.inputNode
            input.installTap(onBus: 0, bufferSize: 1024, format: input.outputFormat(forBus: 0)) { buffer, _ in sink.append(buffer) }
            engine.prepare()
            try engine.start()
            request = req
            listening = true
            task = rec.recognitionTask(with: req) { [weak self] result, err in
                let words = result?.bestTranscription.formattedString, done = result?.isFinal == true || err != nil
                Task { @MainActor in
                    guard let self, self.listening else { return }
                    if let words { self.text = words; self.waitForPause() }
                    if done { self.stop() }
                }
            }
            waitForPause()
        } catch {
            self.error = String(localized: "Couldn't start listening. Type it instead.")
            stop()
        }
    }

    /// Stops after 2 seconds without new words (and after 8 if nothing was said at all).
    private func waitForPause() {
        quiet?.cancel()
        let wait: Duration = text.isEmpty ? .seconds(8) : .seconds(2)
        quiet = Task { [weak self] in
            try? await Task.sleep(for: wait)
            guard !Task.isCancelled else { return }
            self?.stop()
        }
    }

    func stop() {
        guard listening else { return }
        listening = false
        quiet?.cancel()
        engine.stop()
        engine.inputNode.removeTap(onBus: 0)
        request?.endAudio()
        task?.finish()
        request = nil; task = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        finished?(text)
    }
}
