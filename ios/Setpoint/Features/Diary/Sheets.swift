import SwiftUI

/// Log or change a weigh-in: the iPhone's decimal keyboard, Cancel and Save in the bar, delete at the bottom.
struct WeightSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let day: String
    @State private var text = ""
    @State private var note = ""
    @State private var excluded = false
    @State private var kcal = ""
    @State private var confirmDelete = false
    @FocusState private var focused: Bool

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        TextField("Weight", text: $text)
                            .keyboardType(.decimalPad)
                            .font(Brand.display(34, .bold))
                            .focused($focused)
                        Text(LocalizedStringKey(store.unit)).font(.brand(.title3)).foregroundStyle(.secondary)
                    }
                    TextField("Note", text: $note)
                }
                if store.items(day).isEmpty {
                    Section {
                        HStack {
                            TextField("Calories eaten", text: $kcal).keyboardType(.numberPad)
                            Text("kcal").foregroundStyle(.secondary)
                        }
                    } footer: { Text("Didn't log food this day? Enter the total, and your expenditure still learns from it.") }
                }
                Section {
                    Toggle("Exclude from trend", isOn: $excluded)
                } footer: {
                    Text("For bloating, a salty meal or travel. It stays in your history.")
                }
                if store.entry(day) != nil {
                    Section {
                        Button("Delete weigh-in", role: .destructive) { confirmDelete = true }
                    }
                }
            }
            .brandList()
            .navigationTitle(store.entry(day) == nil ? "Log weight" : "Edit weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save).disabled(value == nil) }
            }
            .confirmationDialog("Delete this weigh-in?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete", role: .destructive) { store.deleteWeight(on: day); dismiss() }
            }
            .onAppear {
                if let e = store.entry(day) { text = Fmt.weight(e.kg, unit: store.unit); note = e.note; excluded = e.excluded; kcal = e.kcal.map { String(Int($0)) } ?? "" }
                focused = true
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var value: Double? {
        let v = Double(text.replacingOccurrences(of: ",", with: ".").replacingOccurrences(of: "٫", with: ".").filter { "0123456789.".contains($0) })
        guard let v, v > 0 else { return nil }
        let kg = store.unit == "lb" ? v / 2.20462 : v
        return (20...400).contains(kg) ? kg : nil
    }
    private func save() {
        guard let kg = value else { return }
        let k = Double(kcal.filter(\.isNumber)).flatMap { $0 > 0 ? $0 : nil }
        store.logWeight(kg, on: day, note: note.trimmingCharacters(in: .whitespaces), excluded: excluded, kcal: store.items(day).isEmpty ? .some(k) : nil)
        dismiss()
    }
}

/// Water for a day: one tap for each of your sizes, and a way to take some off.
struct WaterSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let day: String

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(Fmt.ml(store.waterOn(day))).font(Brand.display(40, .bold)).contentTransition(.numericText())
                        ProgressView(value: min(store.waterOn(day), store.waterGoal), total: store.waterGoal).tint(Brand.water)
                        Text("Goal \(Fmt.ml(store.waterGoal))").font(.brand(.subheadline)).foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
                Section("Add") {
                    let names: [LocalizedStringKey] = ["Glass", "Can", "Bottle", "Jug"]
                    ForEach(Array(store.waterSizes.enumerated()), id: \.offset) { i, ml in
                        Button { withAnimation { store.addWater(ml, on: day) } } label: {
                            LabeledContent { Text(Fmt.ml(ml)) } label: { Label(names[i], systemImage: "plus.circle.fill") }
                        }
                    }
                }
                if store.waterOn(day) > 0 {
                    Section {
                        Button("Remove \(Fmt.ml(store.waterSizes[0]))", role: .destructive) { withAnimation { store.addWater(-store.waterSizes[0], on: day) } }
                    }
                }
            }
            .brandList()
            .navigationTitle("Water")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
            .sensoryFeedback(.increase, trigger: store.waterOn(day))
        }
        .presentationDetents([.medium, .large])
    }
}

/// Jump to any day.
struct DayPickerSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var day: String
    @State private var date = Date()

    var body: some View {
        NavigationStack {
            DatePicker("Day", selection: $date, in: ...Calendar.current.date(byAdding: .day, value: 14, to: Date())!, displayedComponents: .date)
                .datePickerStyle(.graphical)
                .padding(.horizontal)
                .brandList()
                .navigationTitle("Choose day")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Today") { day = Day.today; dismiss() } }
                    ToolbarItem(placement: .confirmationAction) { Button("Done") { day = Day.iso(date); dismiss() } }
                }
                .onAppear { date = Day.date(day) }
        }
        .presentationDetents([.medium])
    }
}

/// Copy one food or a whole meal to another day.
struct CopyDaySheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    let items: [FoodItem]
    let from: String
    @State private var date = Date()

    var body: some View {
        NavigationStack {
            DatePicker("Copy to", selection: $date, displayedComponents: .date)
                .datePickerStyle(.graphical)
                .padding(.horizontal)
                .brandList()
                .navigationTitle(items.count == 1 ? "Copy food" : "Copy meal")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) { Button("Copy") { store.copy(items, to: Day.iso(date)); dismiss() } }
                }
                .onAppear { date = Day.date(from == Day.today ? Day.add(from, 1) : Day.today) }
        }
        .presentationDetents([.medium])
    }
}
