import XCTest

/// Build server only: really presses, holds and drags foods in the Diary (demo data), and scrolls so the tab bar
/// shrinks while the app is open. Screenshots and a line per check go to $SHOTS (set by the workflow).
final class DiaryDragTests: XCTestCase {
    private var out: URL { URL(fileURLWithPath: ProcessInfo.processInfo.environment["SHOTS"] ?? NSTemporaryDirectory()) }
    private var log: [String] = []

    private func shot(_ app: XCUIApplication, _ name: String) {
        try? app.screenshot().pngRepresentation.write(to: out.appendingPathComponent("\(name).png"))
    }
    private func note(_ s: String) {
        log.append(s)
        try? log.joined(separator: "\n").write(to: out.appendingPathComponent("drag-results.txt"), atomically: true, encoding: .utf8)
    }
    private func y(_ e: XCUIElement) -> CGFloat { e.exists ? e.frame.midY : -1 }

    @MainActor func testDragFoods() {
        let app = XCUIApplication()
        app.launchArguments = ["-demo", "YES", "-tab", "diary"]
        app.launch()
        let oats = app.descendants(matching: .any)["food-a0"], banana = app.descendants(matching: .any)["food-b0"]
        guard oats.waitForExistence(timeout: 10) else { note("no food rows found"); shot(app, "drag-0-missing"); return }
        // bring Breakfast up the screen so the meals below are on show
        app.swipeUp(velocity: .slow)
        sleep(1)
        shot(app, "drag-0-start")
        note("start: oats y=\(y(oats)) banana y=\(y(banana))")

        // 1. reorder inside Breakfast: banana above oats
        banana.press(forDuration: 1.0, thenDragTo: oats, withVelocity: .slow, thenHoldForDuration: 0.6)
        sleep(1)
        shot(app, "drag-1-reorder")
        note("reorder: banana above oats = \(y(banana) < y(oats)) (banana y=\(y(banana)) oats y=\(y(oats)))")

        // 2. onto another meal's name (Dinner is empty)
        let dinner = app.descendants(matching: .any)["meal-dinner"]
        if dinner.exists {
            oats.press(forDuration: 1.0, thenDragTo: dinner, withVelocity: .slow, thenHoldForDuration: 0.6)
            sleep(1)
            shot(app, "drag-2-to-dinner")
            note("to Dinner header: oats below Dinner = \(y(oats) > y(dinner)) (oats y=\(y(oats)) dinner y=\(y(dinner)))")
        } else { note("no Dinner header on screen") }

        // 3. between foods of another meal (Lunch has foods)
        let chicken = app.descendants(matching: .any)["food-c0"]
        if chicken.exists, banana.exists {
            banana.press(forDuration: 1.0, thenDragTo: chicken, withVelocity: .slow, thenHoldForDuration: 0.6)
            sleep(1)
            shot(app, "drag-3-into-lunch")
            let lunch = app.descendants(matching: .any)["meal-lunch"]
            note("into Lunch: banana below Lunch header = \(y(banana) > y(lunch)) (banana y=\(y(banana)) lunch y=\(y(lunch)))")
        }

        // 4. the tab bar shrinking while the app is open (names should fade)
        app.swipeUp(velocity: .slow)
        sleep(1)
        shot(app, "bar-runtime-compact")
        app.swipeDown(velocity: .slow)
        sleep(1)
        shot(app, "bar-runtime-full")
    }
}
