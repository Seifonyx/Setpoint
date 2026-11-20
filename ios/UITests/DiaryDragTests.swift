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
    private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any).matching(identifier: id).firstMatch }
    private func y(_ e: XCUIElement) -> Int { e.exists ? Int(e.frame.midY) : -1 }
    /// Press and hold `what`, then drag it to a point inside `to` (dy: 0 = its top edge, 1 = its bottom edge).
    private func drag(_ what: XCUIElement, to: XCUIElement, dy: CGFloat) {
        let a = what.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        let b = to.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: dy))
        a.press(forDuration: 0.8, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.8)
        sleep(1)
        let mv = XCUIApplication().staticTexts.containing(NSPredicate(format: "label BEGINSWITH 'mv'")).firstMatch
        note("   list said: \(mv.exists ? mv.label : "(no log)")")
    }

    @MainActor func run(_ tag: String, _ extra: [String]) {
        let app = XCUIApplication()
        app.launchArguments = ["-demo", "YES", "-tab", "diary", "-movelog"] + extra
        app.launch()
        let oats = el(app, "food-a0"), banana = el(app, "food-b0"), chicken = el(app, "food-c0")
        guard oats.waitForExistence(timeout: 10) else { note("\(tag): no food rows found"); shot(app, "drag-\(tag)-missing"); return }
        app.swipeUp(velocity: .slow)
        sleep(3) // let the list stop coasting before pressing
        shot(app, "drag-\(tag)-0-start")
        note("\(tag) start: oats \(y(oats)) banana \(y(banana)) chicken \(y(chicken))")

        // 1. reorder inside Breakfast: banana above oats. The very first drag after launch sometimes doesn't start
        // (the list is still settling), so it gets one more try, and the log says so.
        let before = y(banana)
        drag(banana, to: oats, dy: 0.15)
        if y(banana) == before {
            note("\(tag) reorder: first drag didn't start, trying again")
            sleep(2)
            drag(banana, to: oats, dy: 0.15)
        }
        shot(app, "drag-\(tag)-1-reorder")
        note("\(tag) reorder: banana above oats = \(y(banana) < y(oats)) (banana \(y(banana)) oats \(y(oats)))")

        // 2. into another meal, between its foods: oats just above the chicken in Lunch
        let lunch = el(app, "meal-lunch")
        drag(oats, to: chicken, dy: 0.15)
        shot(app, "drag-\(tag)-2-into-lunch")
        note("\(tag) into Lunch: oats below Lunch name = \(y(oats) > y(lunch)) (oats \(y(oats)) lunch \(y(lunch)))")

        // 3. into an empty meal: banana just below Dinner's name
        let dinner = el(app, "meal-dinner")
        if dinner.exists {
            drag(banana, to: dinner, dy: 1.0)
            shot(app, "drag-\(tag)-3-into-dinner")
            let next = el(app, "meal-snacks")
            note("\(tag) into Dinner: banana between Dinner and Snacks = \(y(banana) > y(dinner) && (y(next) < 0 || y(banana) < y(next))) (banana \(y(banana)) dinner \(y(dinner)) snacks \(y(next)))")
            if !(y(banana) > y(dinner)) {
                drag(banana, to: dinner, dy: 0.5)
                shot(app, "drag-\(tag)-4-onto-dinner-name")
                note("\(tag) onto Dinner name: banana below Dinner = \(y(banana) > y(dinner)) (banana \(y(banana)) dinner \(y(dinner)))")
            }
        } else { note("\(tag): no Dinner name found") }
        do { // picking up a meal's name moves nothing
            let d = el(app, "meal-dinner"), b = el(app, "meal-breakfast")
            drag(d, to: b, dy: 0.5)
            shot(app, "drag-\(tag)-5-header-dragged")
            note("\(tag) dragging Dinner's name: Dinner \(y(el(app, "meal-dinner"))) Breakfast \(y(el(app, "meal-breakfast")))")
        }
        app.terminate()
    }

    @MainActor func testDragFoods() {
        run("drag", [])
        // recipe ingredients: press, hold and drag the potatoes above the oil
        let r = XCUIApplication()
        r.launchArguments = ["-demo", "YES", "-tab", "foods", "-open", "recipe"]
        r.launch()
        let oil = r.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'Sunflower'")).firstMatch
        let potato = r.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'Potato'")).firstMatch
        if oil.waitForExistence(timeout: 10), potato.exists {
            if potato.frame.minY > r.frame.height - 200 { r.swipeUp(velocity: .slow); sleep(1) }
            shot(r, "recipe-0-start")
            drag(potato, to: oil, dy: 0.0)
            shot(r, "recipe-1-reorder")
            note("recipe reorder: potatoes above oil = \(y(potato) < y(oil)) (potato \(y(potato)) oil \(y(oil)))")
        } else { note("recipe: ingredients not found"); shot(r, "recipe-missing") }
        r.terminate()
        // the tab bar shrinking while the app is open (names should fade)
        let app = XCUIApplication()
        app.launchArguments = ["-demo", "YES", "-tab", "diary"]
        app.launch()
        sleep(3)
        app.swipeUp(velocity: .slow)
        sleep(1)
        shot(app, "bar-runtime-compact")
        app.swipeDown(velocity: .slow)
        app.swipeDown(velocity: .fast)
        sleep(1)
        shot(app, "bar-runtime-full")
        app.terminate()

        // amounts: tapping the middle of the amount's line (not the number box) brings up the keypad
        let f = XCUIApplication()
        f.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "food"]
        f.launch()
        let row = el(f, "amount-row")
        if row.waitForExistence(timeout: 10) {
            row.coordinate(withNormalizedOffset: CGVector(dx: 0.35, dy: 0.5)).tap()
            sleep(2)
            note("amount: keypad after tapping the middle of the line = \(f.keyboards.firstMatch.exists)")
            shot(f, "amount-keyboard")
        } else { note("amount: no amount line"); shot(f, "amount-missing") }
        f.terminate()

        // number fields in forms: tapping the label opens the keypad
        let n = XCUIApplication()
        n.launchArguments = ["-demo", "YES", "-tab", "foods", "-open", "newfood"]
        n.launch()
        let cal = n.staticTexts["Calories"].firstMatch
        if cal.waitForExistence(timeout: 10) {
            cal.tap()
            sleep(2)
            note("form: keypad after tapping the Calories label = \(n.keyboards.firstMatch.exists)")
            shot(n, "form-keyboard")
        } else { note("form: no Calories label"); shot(n, "form-missing") }
        n.terminate()

        // the crashes you reported: dropping into a folded meal (Snacks), and below the last card; then ticking off a
        // planned food. After each, is the app still running?
        let c = XCUIApplication()
        c.launchArguments = ["-demo", "YES", "-tab", "diary", "-closedMeals", "snacks", "-movelog"]
        c.launch()
        let ban = el(c, "food-b0"), snacks = el(c, "meal-snacks")
        if ban.waitForExistence(timeout: 10) {
            c.swipeUp(velocity: .slow); sleep(3)
            if snacks.exists {
                drag(ban, to: snacks, dy: 0.5)
                sleep(2)
                note("crash test: into folded Snacks → app running = \(c.state == .runningForeground)")
                shot(c, "crash-1-folded-snacks")
            }
            let rice = el(c, "food-d0")
            if rice.exists, snacks.exists {
                drag(rice, to: snacks, dy: 2.5) // below the last card
                sleep(2)
                note("crash test: below the last card → app running = \(c.state == .runningForeground)")
                shot(c, "crash-2-below-last")
            }
        } else { note("crash test: no foods"); shot(c, "crash-missing") }
        c.terminate()

        let t = XCUIApplication()
        t.launchArguments = ["-demo", "YES", "-tab", "diary"]
        t.launch()
        let tick = el(t, "tick-g0")
        if tick.waitForExistence(timeout: 10) || { t.swipeUp(velocity: .slow); sleep(2); return tick.exists }() {
            if !tick.isHittable { t.swipeUp(velocity: .slow); sleep(2) }
            shot(t, "tick-0-planned")
            tick.tap(); sleep(2)
            note("tick: planned protein bar ticked off = \(!el(t, "tick-g0").exists) · app running = \(t.state == .runningForeground)")
            shot(t, "tick-1-eaten")
        } else { note("tick: no tick circle on the planned protein bar"); shot(t, "tick-missing") }
        t.terminate()

        // the microphone: allow the permission prompts and see that the app keeps going
        let m = XCUIApplication()
        m.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        m.launch()
        let mic = el(m, "add-voice")
        if mic.waitForExistence(timeout: 10) {
            mic.tap()
            let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
            for _ in 0..<3 {
                sleep(2)
                for label in ["Allow", "OK", "Allow While Using App"] where springboard.buttons[label].exists { springboard.buttons[label].tap(); break }
            }
            sleep(4)
            let words = m.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'listen' OR label CONTAINS[c] 'speech' OR label CONTAINS[c] 'microphone'")).firstMatch
            note("voice: app running after the microphone = \(m.state == .runningForeground) · says: \(words.exists ? words.label : "(nothing)")")
            shot(m, "voice-1")
        } else { note("voice: no microphone button"); shot(m, "voice-missing") }
        m.terminate()

        // describing a meal in words (the simulator has no Apple Intelligence, so this is Setpoint's own reader)
        let v = XCUIApplication()
        v.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        v.launch()
        let more = v.buttons["More ways to add"].firstMatch
        if more.waitForExistence(timeout: 10) {
            more.tap()
            let describe = v.buttons["Describe what you ate"].firstMatch
            if describe.waitForExistence(timeout: 3) {
                describe.tap()
                let box = v.textFields.firstMatch
                _ = box.waitForExistence(timeout: 5)
                box.tap(); box.typeText("2 eggs, a banana and a cup of milk")
                v.buttons["Find these foods"].firstMatch.tap()
                sleep(3)
                let found = v.staticTexts.containing(NSPredicate(format: "label BEGINSWITH '“'")).count
                note("describe: \(found) foods found for \"2 eggs, a banana and a cup of milk\"")
                shot(v, "describe-found")
            } else { note("describe: no Describe button"); shot(v, "describe-missing") }
        } else { note("describe: no menu"); shot(v, "describe-missing") }
        v.terminate()

        // the camera button lists its three ways in
        let c = XCUIApplication()
        c.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        c.launch()
        let cam = c.buttons["Camera"].firstMatch
        if cam.waitForExistence(timeout: 10) {
            cam.tap(); sleep(1)
            let ways = ["Snap your plate", "Scan barcode", "Scan a nutrition label"].filter { c.buttons[$0].firstMatch.exists }
            note("camera menu: \(ways.count) of 3 options (\(ways.joined(separator: ", ")))")
            shot(c, "camera-menu")
        } else { note("camera menu: no camera button"); shot(c, "camera-missing") }
        c.terminate()

        // the front door: from the welcome to sign in, the form's own checks, and a sign-in the server refuses
        let a = XCUIApplication()
        a.launchArguments = ["-demo", "YES", "-auth", "welcome"]
        a.launch()
        let toSignIn = el(a, "auth-signin")
        if toSignIn.waitForExistence(timeout: 10) {
            sleep(2)
            toSignIn.tap()
            let submit = el(a, "auth-submit"), err = el(a, "auth-error")
            _ = submit.waitForExistence(timeout: 5)
            submit.tap()
            note("auth: empty form says: \(err.waitForExistence(timeout: 3) ? err.label : "(nothing)")")
            let mail = a.textFields["auth-email"].firstMatch
            mail.tap(); mail.typeText("not-an-email")
            submit.tap(); sleep(1)
            note("auth: bad email says: \(err.exists ? err.label : "(nothing)")")
            mail.tap(); mail.typeText("@example.com")
            let pw = a.secureTextFields["auth-password"].firstMatch
            pw.tap(); pw.typeText("wrong-password-1")
            shot(a, "auth-filled")
            submit.tap()
            sleep(6)
            note("auth: refused sign-in says: \(err.exists ? err.label : "(nothing)") · still on the form = \(submit.exists)")
            shot(a, "auth-refused")
        } else { note("auth: no welcome screen"); shot(a, "auth-missing") }
        a.terminate()
    }
}
