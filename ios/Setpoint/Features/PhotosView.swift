import SwiftUI
import PhotosUI

/// Progress photos, kept on this iPhone in photos.json in the web app's backup format
/// ({ bodyPhotos: [{ id, date, added, pose, full, thumb }] } with JPEG data URLs), so backups carry them both ways.
@MainActor
@Observable
final class PhotoLibrary {
    static let shared = PhotoLibrary()
    struct Photo: Identifiable, Hashable { let id: String; var date: String; let added: Double; var pose: String?; let full: String; let thumb: String }
    private(set) var photos: [Photo] = []
    private var other: [String: JSONValue] = [:]
    private var loaded = false

    func load() {
        guard !loaded else { return }
        loaded = true
        guard let d = try? Data(contentsOf: Store.photosURL), let v = try? JSONDecoder().decode(JSONValue.self, from: d), var o = v.object else { return }
        let list = o.removeValue(forKey: "bodyPhotos")?.array ?? []
        other = o
        photos = list.compactMap { $0.object }.compactMap { p in
            guard let id = p["id"]?.string, let full = p["full"]?.string, let date = p["date"]?.string else { return nil }
            return Photo(id: id, date: date, added: p["added"]?.number ?? 0, pose: p["pose"]?.string, full: full, thumb: p["thumb"]?.string ?? full)
        }
        sort()
    }
    private func sort() { photos.sort { $0.date != $1.date ? $0.date > $1.date : $0.added > $1.added } }
    private func save() {
        var o = other
        o["bodyPhotos"] = .array(photos.map { p in
            .object(["id": .string(p.id), "date": .string(p.date), "added": .number(p.added), "pose": p.pose.map { .string($0) } ?? .null, "full": .string(p.full), "thumb": .string(p.thumb)])
        })
        if let d = try? JSONEncoder().encode(JSONValue.object(o)) { try? d.write(to: Store.photosURL, options: .atomic) }
    }
    func add(_ data: Data, date: String, pose: String?) {
        guard let img = UIImage(data: data), let full = Self.dataURL(img, max: 1600, q: 0.8), let thumb = Self.dataURL(img, max: 400, q: 0.7) else { return }
        photos.append(Photo(id: "p" + Ids.new(), date: date, added: Store.nowMs, pose: pose, full: full, thumb: thumb))
        sort(); save()
    }
    func delete(_ p: Photo) { photos.removeAll { $0.id == p.id }; save() }
    /// After a backup import replaced photos.json.
    func reload() { loaded = false; photos = []; load() }

    private static func dataURL(_ img: UIImage, max: CGFloat, q: CGFloat) -> String? {
        let k = min(1, max / Swift.max(img.size.width, img.size.height))
        let size = CGSize(width: (img.size.width * k).rounded(), height: (img.size.height * k).rounded())
        let small = UIGraphicsImageRenderer(size: size).image { _ in img.draw(in: CGRect(origin: .zero, size: size)) }
        return small.jpegData(compressionQuality: q).map { "data:image/jpeg;base64," + $0.base64EncodedString() }
    }
    static func image(_ url: String) -> UIImage? {
        guard let i = url.range(of: "base64,") else { return nil }
        return Data(base64Encoded: String(url[i.upperBound...])).flatMap(UIImage.init(data:))
    }
}

struct PhotosSection: View {
    @State private var lib = PhotoLibrary.shared
    @State private var picks: [PhotosPickerItem] = []
    @State private var pose = "front"
    @State private var showing: PhotoLibrary.Photo?
    @State private var comparing = false
    private let cols = [GridItem(.adaptive(minimum: 96), spacing: 6)]

    var body: some View {
        Section {
            if lib.photos.isEmpty { Text("Photos show changes the scale misses. They stay on this iPhone and go into your backups.").foregroundStyle(.secondary) }
            else {
                LazyVGrid(columns: cols, spacing: 6) {
                    ForEach(lib.photos) { p in
                        Button { showing = p } label: {
                            ZStack(alignment: .bottomLeading) {
                                if let ui = PhotoLibrary.image(p.thumb) { Image(uiImage: ui).resizable().scaledToFill() } else { Color.gray.opacity(0.2) }
                                Text(Day.date(p.date), format: .dateTime.month(.abbreviated).day()).font(.brand(.caption2, .semibold))
                                    .padding(.horizontal, 6).padding(.vertical, 3).background(.ultraThinMaterial, in: Capsule()).padding(4)
                            }
                            .frame(height: 130).frame(maxWidth: .infinity).clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.vertical, 4)
                if lib.photos.count >= 2 { Button("Compare first and latest", systemImage: "rectangle.split.2x1") { comparing = true } }
            }
            Picker("Pose", selection: $pose) { Text("Front").tag("front"); Text("Side").tag("side"); Text("Back").tag("back") }
            PhotosPicker(selection: $picks, maxSelectionCount: 6, matching: .images) { Label("Add photos", systemImage: "photo.badge.plus") }
        } header: { Text("Progress photos") }
        .task { lib.load() }
        .onChange(of: picks) { _, items in
            guard !items.isEmpty else { return }
            Task {
                for it in items { if let d = try? await it.loadTransferable(type: Data.self) { lib.add(d, date: Day.today, pose: pose) } }
                picks = []
            }
        }
        .sheet(item: $showing) { p in PhotoViewer(photo: p) }
        .sheet(isPresented: $comparing) { CompareView(photos: lib.photos) }
    }
}

private struct PhotoViewer: View {
    @Environment(\.dismiss) private var dismiss
    let photo: PhotoLibrary.Photo
    @State private var confirm = false
    var body: some View {
        NavigationStack {
            Group { if let ui = PhotoLibrary.image(photo.full) { Image(uiImage: ui).resizable().scaledToFit() } }
                .frame(maxWidth: .infinity, maxHeight: .infinity).background(.black)
                .brandList()
                .navigationTitle(Day.date(photo.date).formatted(.dateTime.month(.wide).day().year()))
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
                    ToolbarItem(placement: .bottomBar) {
                        Button("Delete", systemImage: "trash", role: .destructive) { confirm = true }
                    }
                }
                .confirmationDialog("Delete this photo?", isPresented: $confirm, titleVisibility: .visible) {
                    Button("Delete", role: .destructive) { PhotoLibrary.shared.delete(photo); dismiss() }
                }
        }
    }
}

private struct CompareView: View {
    @Environment(\.dismiss) private var dismiss
    let photos: [PhotoLibrary.Photo]
    @State private var a: String = ""
    @State private var b: String = ""
    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                HStack(spacing: 6) { side($a); side($b) }
            }
            .padding()
            .brandList()
            .navigationTitle("Compare")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } } }
            .onAppear { a = photos.last?.id ?? ""; b = photos.first?.id ?? "" }
        }
    }
    private func side(_ sel: Binding<String>) -> some View {
        VStack {
            if let p = photos.first(where: { $0.id == sel.wrappedValue }), let ui = PhotoLibrary.image(p.full) {
                Image(uiImage: ui).resizable().scaledToFit().clipShape(RoundedRectangle(cornerRadius: 10))
            }
            Picker("Photo", selection: sel) {
                ForEach(photos) { p in Text(Day.date(p.date), format: .dateTime.month(.abbreviated).day().year()).tag(p.id) }
            }
        }
        .frame(maxWidth: .infinity)
    }
}
