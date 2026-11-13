import SwiftUI

/// One empty state for the whole app: an icon in a soft circle, a title, a line of help and (maybe) one action.
struct EmptyState: View {
    let icon: String
    let title: LocalizedStringKey
    let message: LocalizedStringKey
    var color: Color = Brand.green
    var action: (title: LocalizedStringKey, run: () -> Void)? = nil

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 26, weight: .semibold)).foregroundStyle(color)
                .frame(width: 64, height: 64).background(color.opacity(0.14), in: Circle())
            Text(title).font(Brand.display(20, .bold)).multilineTextAlignment(.center)
            Text(message).font(.brand(.subheadline)).foregroundStyle(Brand.ink2).multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            if let action {
                Button(action: action.run) { Text(action.title).font(.brand(.headline)).padding(.horizontal, 8) }
                    .buttonStyle(.glassProminent).padding(.top, 4)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20).padding(.horizontal, 12)
        .accessibilityElement(children: .combine)
    }
}

/// Placeholder rows while something loads: soft shapes that gently pulse, instead of a spinner.
struct SkeletonRows: View {
    var count = 4
    @State private var on = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<count, id: \.self) { i in
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 10).fill(Brand.card2).frame(width: 38, height: 38)
                    VStack(alignment: .leading, spacing: 7) {
                        Capsule().fill(Brand.card2).frame(width: [170, 130, 190, 150][i % 4], height: 11)
                        Capsule().fill(Brand.card2.opacity(0.7)).frame(width: [90, 110, 70, 100][i % 4], height: 9)
                    }
                    Spacer()
                    Capsule().fill(Brand.card2).frame(width: 36, height: 11)
                }
            }
        }
        .opacity(on ? 0.45 : 1)
        .onAppear { if !reduceMotion { withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) { on = true } } }
        .accessibilityLabel(Text("Loading"))
    }
}
