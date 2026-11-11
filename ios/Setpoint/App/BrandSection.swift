import SwiftUI

/// Every list section in Setpoint: warm card rows and a Bricolage heading. It shadows SwiftUI's Section inside this
/// app, so all screens get the look without each one repeating it. (Rows that set their own background keep it.)
struct Section<Parent: View, Content: View, Footer: View>: View {
    private let header: Parent
    private let content: Content
    private let footer: Footer

    init(@ViewBuilder content: () -> Content, @ViewBuilder header: () -> Parent, @ViewBuilder footer: () -> Footer) {
        self.content = content(); self.header = header(); self.footer = footer()
    }

    var body: some View {
        SwiftUI.Section {
            Group { content }
                .listRowBackground(Brand.card)
                .listRowSeparatorTint(Brand.line)
        } header: {
            header.font(Brand.display(19, .bold)).foregroundStyle(Brand.ink).textCase(nil)
        } footer: {
            footer.font(.brand(.footnote)).foregroundStyle(Brand.ink2)
        }
    }
}

extension Section where Parent == EmptyView, Footer == EmptyView {
    init(@ViewBuilder content: () -> Content) { self.init(content: content, header: { EmptyView() }, footer: { EmptyView() }) }
}
extension Section where Footer == EmptyView {
    init(@ViewBuilder content: () -> Content, @ViewBuilder header: () -> Parent) { self.init(content: content, header: header, footer: { EmptyView() }) }
}
extension Section where Parent == EmptyView {
    init(@ViewBuilder content: () -> Content, @ViewBuilder footer: () -> Footer) { self.init(content: content, header: { EmptyView() }, footer: footer) }
}
extension Section where Parent == Text, Footer == EmptyView {
    init(_ title: LocalizedStringKey, @ViewBuilder content: () -> Content) { self.init(content: content, header: { Text(title) }, footer: { EmptyView() }) }
    @_disfavoredOverload
    init<S: StringProtocol>(_ title: S, @ViewBuilder content: () -> Content) { self.init(content: content, header: { Text(title) }, footer: { EmptyView() }) }
}
