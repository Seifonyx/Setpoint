import SwiftUI

/// Your account: who's signed in, how the sync is doing, signing out and deleting the account.
/// (Signing in and creating an account happen at the front door: AuthFlow.)
struct AccountView: View {
    @Environment(Account.self) private var account
    @State private var working = false
    @Environment(\.dismiss) private var dismiss
    @State private var note: String?
    @State private var confirmOut = false
    @State private var confirmDelete = false
    @State private var unsavedOut = false

    var body: some View {
        List {
            if let s = account.session { signedIn(s) }
        }
        .brandList()
        .navigationTitle("Account")
        .alert(note ?? "", isPresented: Binding(get: { note != nil }, set: { if !$0 { note = nil } })) { Button("OK", role: .cancel) {} }
        .task { if account.signedIn { await account.refreshAccount() } }
        .onChange(of: account.signedIn) { _, signedIn in if !signedIn { dismiss() } } // signed out: back to You, under the sign-in screen
    }

    // MARK: Signed in

    @ViewBuilder private func signedIn(_ s: Account.Session) -> some View {
        Section {
            LabeledContent("Signed in as") { Text(s.email).lineLimit(1).truncationMode(.middle) }
            if s.password && !s.verified {
                Button("Send verification email") { act { try await account.sendVerification(); note = String(localized: "Sent. Check your inbox.") } }
            }
        } footer: {
            if s.password && !s.verified { Text("Verify your email so you can always get back into your account.") }
        }
        if account.stuck {
            Section {
                Label("Some changes haven't reached your account yet", systemImage: "exclamationmark.icloud").foregroundStyle(Brand.amber)
            } footer: {
                Text("They're safe on this iPhone and are saved to your account by themselves once you're back online.")
            }
        }
        Section {
            NavigationLink { LegalView(id: "privacy") } label: { Text("Privacy Policy") }
            NavigationLink { LegalView(id: "terms") } label: { Text("Terms of Use") }
        }
        Section {
            Button("Sign out", role: .destructive) { confirmOut = true }.foregroundStyle(Brand.danger)
                .confirmationDialog("Sign out?", isPresented: $confirmOut, titleVisibility: .visible) {
                    // save to the account first: after this you only get back in by signing in
                    Button("Sign out", role: .destructive) { signOut() }
                } message: { Text("Your log is saved in your account. Sign in again to get back to it.") }
                // changes that couldn't be saved: say so, and let you try again rather than lose them
                .confirmationDialog("Some changes haven't reached your account", isPresented: $unsavedOut, titleVisibility: .visible) {
                    Button("Try again") { signOut() }
                    Button("Sign out anyway", role: .destructive) { account.signOut() }
                } message: { Text("They're only on this iPhone, probably because you're offline. If you sign out now and a different account signs in here, they'll be lost.") }
                .disabled(working)
        }
        Section {
            Button("Delete account", role: .destructive) { confirmDelete = true }.foregroundStyle(Brand.danger)
                .confirmationDialog("Delete your account?", isPresented: $confirmDelete, titleVisibility: .visible) {
                    Button("Delete account", role: .destructive) {
                        act { try await account.deleteAccount() }
                    }
                } message: { Text("Deletes your account and everything saved in it, for good. What's on this iPhone stays, and joins the next account you sign in with.") }
        }
    }

    /// Saves everything first; signs out only when nothing would be lost (otherwise asks).
    private func signOut() {
        Task {
            working = true
            let saved = await account.saveEverything()
            working = false
            if saved { account.signOut() } else { unsavedOut = true }
        }
    }
    private func act(_ work: @escaping () async throws -> Void) {
        working = true
        Task {
            do { try await work() }
            catch { note = error.localizedDescription }
            working = false
        }
    }
}
