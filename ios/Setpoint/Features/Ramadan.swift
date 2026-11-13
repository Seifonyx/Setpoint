import SwiftUI

/// Ramadan mode (settings.ramadan: on, city, lat, lon, Fajr angle): Suhoor and Iftar meals, and fasting times in the Diary.
struct RamadanSheet: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss
    @State private var on = false
    @State private var cities: [City] = []
    @State private var city: City?
    @State private var times: PrayerTimes?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Ramadan mode", isOn: $on)
                } footer: { Text("Breakfast becomes Suhoor, dinner becomes Iftar, and the Diary shows Iftar time and water left before Fajr.") }
                Section {
                    Picker("City", selection: $city) { ForEach(cities, id: \.self) { Text($0.name).tag(Optional($0)) } }
                    if let t = times {
                        LabeledContent("Fajr (Suhoor ends)") { Text(Date(timeIntervalSince1970: t.fajr / 1000), format: .dateTime.hour().minute()) }
                        LabeledContent("Maghrib (Iftar)") { Text(Date(timeIntervalSince1970: t.maghrib / 1000), format: .dateTime.hour().minute()) }
                    }
                } footer: { Text("Calculated times can differ from your local mosque by a few minutes.") }
            }
            .brandList()
            .navigationTitle("Ramadan mode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel", role: .cancel) { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .task {
                cities = await store.engineRef.cities()
                let r = store.root["settings"]?["ramadan"]
                on = r?["on"]?.bool == true
                if let n = r?["city"]?.string, let lat = r?["lat"]?.number, let lon = r?["lon"]?.number {
                    let c = City(name: n, lat: lat, lon: lon, fa: r?["fa"]?.number ?? 18)
                    if !cities.contains(c) { cities.insert(c, at: 0) }
                    city = c
                } else { city = cities.first }
            }
            .task(id: city) { if let c = city { times = await store.engineRef.prayer(lat: c.lat, lon: c.lon, fa: c.fa) } }
        }
    }
    private func save() {
        if on, let c = city {
            store.setSetting("ramadan", .object(["on": .bool(true), "city": .string(c.name), "lat": .number(c.lat), "lon": .number(c.lon), "fa": .number(c.fa)]))
        } else { store.setSetting("ramadan", nil) }
        dismiss()
    }
}

/// In the Diary on today: time to Iftar while fasting, or time left to eat and drink before Fajr.
struct RamadanBanner: View {
    @Environment(Store.self) private var store
    @State private var times: PrayerTimes?
    @State private var sheet = false

    private var isRamadan: Bool { Calendar(identifier: .islamicUmmAlQura).component(.month, from: Date()) == 9 }

    var body: some View {
        Group {
            if store.ramadanOn, let t = times {
                TimelineView(.periodic(from: .now, by: 60)) { ctx in
                    let now = ctx.date.timeIntervalSince1970 * 1000
                    HStack(spacing: 12) {
                        Image(systemName: "moon.stars.fill").font(.brand(.title3)).foregroundStyle(.tint)
                        VStack(alignment: .leading, spacing: 2) {
                            if now >= t.fajr && now < t.maghrib {
                                Text("Fasting · Iftar at \(clock(t.maghrib))").font(.brand(.subheadline, .semibold))
                                Text("\(left(t.maghrib - now)) to go").font(.brand(.subheadline)).foregroundStyle(.secondary)
                            } else {
                                let fajr = now < t.fajr ? t.fajr : t.fajrNext
                                let water = max(0, store.waterGoal - store.waterOn(Day.today))
                                Text("Eating window · Suhoor until \(clock(fajr))").font(.brand(.subheadline, .semibold))
                                Text(water > 0 ? "\(left(fajr - now)) left · drink \(Fmt.ml(water)) more before Fajr" : "\(left(fajr - now)) left · water goal done")
                                    .font(.brand(.subheadline)).foregroundStyle(.secondary)
                            }
                        }
                        Spacer()
                        Button("Ramadan settings", systemImage: "gearshape") { sheet = true }.labelStyle(.iconOnly).foregroundStyle(.secondary)
                    }
                }
            } else if isRamadan && !store.ramadanOn {
                HStack(spacing: 12) {
                    Image(systemName: "moon.stars.fill").font(.brand(.title3)).foregroundStyle(.tint)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Ramadan Mubarak").font(.brand(.subheadline, .semibold))
                        Text("Turn on Ramadan mode: Suhoor and Iftar meals, with fasting times for your city.").font(.brand(.subheadline)).foregroundStyle(.secondary)
                        Button("Turn on") { sheet = true }.buttonStyle(.glassProminent).tint(Brand.green).controlSize(.small)
                    }
                }
            }
        }
        .task(id: store.version) {
            let r = store.root["settings"]?["ramadan"]
            if let lat = r?["lat"]?.number, let lon = r?["lon"]?.number { times = await store.engineRef.prayer(lat: lat, lon: lon, fa: r?["fa"]?.number ?? 18) }
        }
        .sheet(isPresented: $sheet) { RamadanSheet() }
    }
    private func clock(_ ms: Double) -> String { Date(timeIntervalSince1970: ms / 1000).formatted(.dateTime.hour().minute()) }
    private func left(_ ms: Double) -> String {
        let m = max(0, Int((ms / 60000).rounded())); return m >= 60 ? "\(m / 60)h \(m % 60)m" : "\(m)m"
    }
}
