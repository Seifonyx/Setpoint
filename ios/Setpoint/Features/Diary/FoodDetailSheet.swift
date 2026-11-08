import SwiftUI

/// Tap a logged food: what's in it, and its time, meal and note. (Changing the amount comes with the food list in Phase 2.)
struct FoodDetailSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let food: FoodItem
    let day: String
    @State private var hasTime = false
    @State private var time = Date()
    @State private var meal = ""
    @State private var note = ""
    @State private var confirmDelete = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(food.displayName).font(.title2.weight(.bold))
                        if let q = food.qty, let u = food.unit, food.ref != nil {
                            Text(Fmt.amount(q, u)).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                    LabeledContent("Calories") { Text("\(Fmt.kcal(food.kcal)) kcal").monospacedDigit() }
                    LabeledContent("Protein") { Text("\(Fmt.grams(food.protein)) g").monospacedDigit() }
                    LabeledContent("Carbs") { Text("\(Fmt.grams(food.carbs)) g").monospacedDigit() }
                    LabeledContent("Fat") { Text("\(Fmt.grams(food.fat)) g").monospacedDigit() }
                }
                if !food.mealContents.isEmpty {
                    Section("In this meal") {
                        ForEach(Array(food.mealContents.enumerated()), id: \.offset) { _, f in
                            LabeledContent(f.name.isEmpty ? String(localized: "Quick add") : f.name) { Text(Fmt.kcal(f.kcal)).monospacedDigit() }
                        }
                    }
                }
                Section {
                    Toggle("Time eaten", isOn: $hasTime.animation())
                    if hasTime {
                        DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute)
                    }
                    Picker("Meal", selection: $meal) {
                        ForEach(store.meals) { m in Text(m.name).tag(m.key) }
                    }
                    TextField("Note", text: $note, axis: .vertical).lineLimit(1...4)
                }
                Section {
                    Button("Delete", role: .destructive) { confirmDelete = true }
                }
            }
            .navigationTitle(food.isPlanned ? "Planned" : "Food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
                if food.isPlanned && day <= Day.today {
                    ToolbarItem(placement: .bottomBar) {
                        Button("Mark as eaten", systemImage: "checkmark.circle") { store.markEaten(food, on: day); dismiss() }
                    }
                }
            }
            .confirmationDialog("Delete \(food.displayName)?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete", role: .destructive) { store.delete(food, on: day); dismiss() }
            }
            .onAppear {
                meal = store.mealKey(of: food)
                note = food.note ?? ""
                if let t = food.time {
                    let p = t.split(separator: ":").compactMap { Int($0) }
                    if p.count == 2, let d = Calendar.current.date(bySettingHour: p[0], minute: p[1], second: 0, of: Date()) { time = d; hasTime = true }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func save() {
        var t: String?
        if hasTime { // saved as 24-hour "HH:mm" in Western digits, whatever the phone's language
            let c = Calendar.current.dateComponents([.hour, .minute], from: time)
            t = String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0)
        }
        store.updateDetails(food, on: day, time: t, meal: meal, note: note)
        dismiss()
    }
}
