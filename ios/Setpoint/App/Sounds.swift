import AVFoundation

/// Two small sounds, off unless you turn them on in Settings: a soft tick when you log, a warm chime when you hit a
/// target. They follow the ring/silent switch and mix with whatever else is playing.
@MainActor
enum Sounds {
    static let key = "sounds"
    enum Kind: String { case tick, chime }
    private static var players: [Kind: AVAudioPlayer] = [:]

    static func play(_ kind: Kind) {
        guard UserDefaults.standard.bool(forKey: key) else { return }
        try? AVAudioSession.sharedInstance().setCategory(.ambient, options: [.mixWithOthers])
        if players[kind] == nil, let url = Bundle.main.url(forResource: kind.rawValue, withExtension: "wav") {
            players[kind] = try? AVAudioPlayer(contentsOf: url)
            players[kind]?.volume = kind == .tick ? 0.45 : 0.6
        }
        players[kind]?.currentTime = 0
        players[kind]?.play()
    }
}
