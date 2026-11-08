import SwiftUI

/// Phase 0 placeholder: the shape of the Diary with sample numbers, to judge the native look. Real data comes in Phase 1.
struct DiaryView: View {
    private let meals: [(String, Int, [(String, Int)])] = [
        ("Breakfast", 426, [("Oats", 300), ("Banana", 126)]),
        ("Lunch", 900, [("Chicken rice", 900)]),
        ("Dinner", 0, []),
        ("Snacks", 0, [])
    ]

    var body: some View {
        NavigationStack {
            List {
                Section {
                    SummaryCard(eaten: 1326, target: 2360)
                        .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16))
                }
                ForEach(meals, id: \.0) { meal in
                    Section {
                        ForEach(meal.2, id: \.0) { food in
                            HStack {
                                Text(LocalizedStringKey(food.0))
                                Spacer()
                                Text(food.1, format: .number).foregroundStyle(.secondary).monospacedDigit()
                            }
                            .swipeActions { Button("Delete", systemImage: "trash", role: .destructive) {} }
                            .contextMenu {
                                Button("Add another", systemImage: "plus") {}
                                Button("Copy to another day", systemImage: "doc.on.doc") {}
                                Button("Delete", systemImage: "trash", role: .destructive) {}
                            }
                        }
                        Button("Add food", systemImage: "plus") {}
                    } header: {
                        HStack {
                            Text(LocalizedStringKey(meal.0))
                            Spacer()
                            if meal.1 > 0 { Text("\(meal.1) kcal").monospacedDigit() }
                        }
                    }
                }
            }
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Add", systemImage: "plus") {}
                        .buttonStyle(.glassProminent)
                }
            }
        }
    }
}

struct SummaryCard: View {
    let eaten: Int
    let target: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Calories").font(.subheadline).foregroundStyle(.secondary)
            HStack(alignment: .firstTextBaseline) {
                Text(eaten, format: .number).font(.system(size: 40, weight: .bold, design: .rounded)).monospacedDigit()
                Text("/ \(target) kcal").foregroundStyle(.secondary)
                Spacer()
                Text("\(target - eaten) left").font(.headline).monospacedDigit()
            }
            ProgressView(value: Double(eaten), total: Double(target)).tint(.orange)
        }
    }
}

#Preview { DiaryView() }
