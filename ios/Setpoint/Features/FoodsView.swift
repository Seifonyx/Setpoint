import SwiftUI

/// Phase 0 placeholder for Foods (the food database and search arrive in Phase 2).
struct FoodsView: View {
    @State private var query = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Your foods") {
                    Label("Meals", systemImage: "takeoutbag.and.cup.and.straw")
                    Label("Recipes", systemImage: "frying.pan")
                    Label("Custom foods", systemImage: "carrot")
                }
            }
            .navigationTitle("Foods")
            .searchable(text: $query, prompt: "Search foods")
        }
    }
}

#Preview { FoodsView() }
