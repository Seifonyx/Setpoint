import XCTest

/// Build server only: really presses, holds and drags foods in the Diary (demo data), and scrolls so the tab bar
/// shrinks while the app is open. Screenshots and a line per check go to $SHOTS (set by the workflow).
final class DiaryDragTests: XCTestCase {
    private var out: URL { URL(fileURLWithPath: ProcessInfo.processInfo.environment["SHOTS"] ?? NSTemporaryDirectory()) }
    private var log: [String] = []
    /// Each test writes its own results file (the three run on separate Macs at once).
    private var resultsFile = "drag-results.txt"

    private func shot(_ app: XCUIApplication, _ name: String) {
        try? app.screenshot().pngRepresentation.write(to: out.appendingPathComponent("\(name).png"))
    }
    private func note(_ s: String) {
        log.append(s)
        try? log.joined(separator: "\n").write(to: out.appendingPathComponent(resultsFile), atomically: true, encoding: .utf8)
    }
    /// An element's text, read in one step (it can disappear between asking whether it exists and reading it).
    @MainActor private func label(_ e: XCUIElement) -> String? { (try? e.snapshot())?.label }
    /// A short pause for the screen to settle.
    private func settle(_ seconds: Double = 0.4) { Thread.sleep(forTimeInterval: seconds) }
    /// Waits until an element's text changes (or appears), instead of a fixed pause.
    @MainActor private func waitForChange(_ e: XCUIElement, from old: String, timeout: Double) {
        let end = Date().addingTimeInterval(timeout)
        while Date() < end { if e.exists && e.label != old { return }; Thread.sleep(forTimeInterval: 0.25) }
    }
    private func el(_ app: XCUIApplication, _ id: String) -> XCUIElement { app.descendants(matching: .any).matching(identifier: id).firstMatch }
    /// Where a row is (its middle), or -1 when it isn't on screen. Read from a snapshot, which can't fail the test
    /// when the list unloads the row between asking and reading (e.frame would).
    @MainActor private func y(_ e: XCUIElement) -> Int { (try? e.snapshot()).map { Int($0.frame.midY) } ?? -1 }
    /// Press and hold `what`, then drag it to a point inside `to` (dy: 0 = its top edge, 1 = its bottom edge).
    /// True when the list reported a move (its -movelog line changed).
    @discardableResult
    @MainActor private func drag(_ what: XCUIElement, to: XCUIElement, dy: CGFloat) -> Bool {
        // both ends in the open middle of the screen (not under the top bar or the tab bar): how far a swipe scrolls
        // varies from run to run, so nudge the list a little until they are
        let app = XCUIApplication()
        // (a quick flick coasts on and overshot: once it left banana under the top bar, so the press hit the bar)
        for _ in 0..<5 {
            let top = min(y(what), y(to)), bottom = max(y(what), y(to))
            let step: CGFloat
            if top < 170 { step = 0.1 } else if bottom > 740 && top > 260 { step = -0.1 } else { break }
            // slow, and held at the end, so the list stops where it's put instead of coasting
            app.coordinate(withNormalizedOffset: CGVector(dx: 0.92, dy: 0.5))
                .press(forDuration: 0.05, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.92, dy: 0.5 + step)),
                       withVelocity: .slow, thenHoldForDuration: 0.4)
            sleep(2)
        }
        // the nudging can scroll a row out of the list (it unloads it): say so instead of failing on a missing row
        guard y(what) >= 0, y(to) >= 0 else { note("   (row scrolled off screen before the drag: skipped)"); return false }
        let mv = XCUIApplication().staticTexts.containing(NSPredicate(format: "label BEGINSWITH 'mv'")).firstMatch
        let before = mv.exists ? mv.label : ""
        // a press that lands while the list is still settling after a scroll doesn't pick the row up (on a real iPhone
        // too): if the list reported no move, press again once
        for attempt in 0..<2 {
            if attempt > 0 { note("   (drag didn't start, pressing again)"); sleep(2) }
            let a = what.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
            let b = to.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: dy))
            a.press(forDuration: 0.8, thenDragTo: b, withVelocity: .slow, thenHoldForDuration: 0.8)
            sleep(1)
            if (mv.exists ? mv.label : "") != before || !mv.exists { break }
        }
        note("   list said: \(mv.exists ? mv.label : "(no log)")")
        return !mv.exists || mv.label != before
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
        var moved = drag(banana, to: oats, dy: 0.4) // the upper part of oats that is on screen (its top can sit under the bar)
        for attempt in 2...3 where !moved {
            note("\(tag) reorder: drag didn't start, try \(attempt)")
            sleep(3)
            moved = drag(banana, to: oats, dy: 0.4)
        }
        shot(app, "drag-\(tag)-1-reorder")
        note("\(tag) reorder: banana above oats = \(y(banana) < y(oats)) (banana \(y(banana)) oats \(y(oats)))")
        XCTAssertLessThan(y(banana), y(oats), "dragging banana above oats in Breakfast")

        // 2. into another meal, between its foods: oats just above the chicken in Lunch
        let lunch = el(app, "meal-lunch")
        drag(oats, to: chicken, dy: 0.15)
        shot(app, "drag-\(tag)-2-into-lunch")
        note("\(tag) into Lunch: oats below Lunch name = \(y(oats) > y(lunch)) (oats \(y(oats)) lunch \(y(lunch)))")
        XCTAssertGreaterThan(y(oats), y(lunch), "dragging oats into Lunch")

        // 3. into an empty meal: banana just below Dinner's name
        let dinner = el(app, "meal-dinner")
        if dinner.exists {
            drag(banana, to: dinner, dy: 1.0)
            shot(app, "drag-\(tag)-3-into-dinner")
            let next = el(app, "meal-snacks")
            let intoDinner = y(banana) > y(dinner) && (y(next) < 0 || y(banana) < y(next))
            note("\(tag) into Dinner: banana between Dinner and Snacks = \(intoDinner) (banana \(y(banana)) dinner \(y(dinner)) snacks \(y(next)))")
            XCTAssertTrue(intoDinner, "dragging banana into the empty Dinner")
            if !(y(banana) > y(dinner)) {
                drag(banana, to: dinner, dy: 0.5)
                shot(app, "drag-\(tag)-4-onto-dinner-name")
                note("\(tag) onto Dinner name: banana below Dinner = \(y(banana) > y(dinner)) (banana \(y(banana)) dinner \(y(dinner)))")
            }
        } else { note("\(tag): no Dinner name found"); XCTFail("no Dinner name in the Diary") }
        do { // picking up a meal's name moves nothing
            let d = el(app, "meal-dinner"), b = el(app, "meal-breakfast")
            drag(d, to: b, dy: 0.5)
            shot(app, "drag-\(tag)-5-header-dragged")
            note("\(tag) dragging Dinner's name: Dinner \(y(el(app, "meal-dinner"))) Breakfast \(y(el(app, "meal-breakfast")))")
        }
        app.terminate()
    }

    // Three tests that run at the same time on three Macs (about equally long): keep them independent.

    /// Dragging foods in the Diary: reordering, between meals, into an empty meal.
    @MainActor func testDragFoods() {
        resultsFile = "drag-results.txt"
        run("drag", [])
    }

    /// Reordering recipe ingredients, the crash checks, ticking off a planned food, and the microphone.
    @MainActor func testInputsAndCrashes() {
        resultsFile = "check-results-inputs.txt"
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
            if y(potato) > y(oil) { note("   (recipe drag didn't take, once more)"); sleep(2); drag(potato, to: oil, dy: 0.0) }
            shot(r, "recipe-1-reorder")
            note("recipe reorder: potatoes above oil = \(y(potato) < y(oil)) (potato \(y(potato)) oil \(y(oil)))")
            XCTAssertLessThan(y(potato), y(oil), "dragging the potatoes above the oil in a recipe")
        } else { note("recipe: ingredients not found"); shot(r, "recipe-missing") }
        r.terminate()
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
        // found by what VoiceOver says (the row's own test name covers the circle's)
        let tick = t.buttons.matching(NSPredicate(format: "label BEGINSWITH 'Mark Protein bar'")).firstMatch
        // it sits further down the Diary: scroll until it's on screen (how far one swipe goes varies)
        _ = tick.waitForExistence(timeout: 10)
        for _ in 0..<3 where !(tick.exists && tick.isHittable) { t.swipeUp(velocity: .slow); sleep(2) }
        if tick.exists && tick.isHittable {
            shot(t, "tick-0-planned")
            tick.tap(); _ = tick.waitForNonExistence(timeout: 3)
            let ticked = !t.buttons.matching(NSPredicate(format: "label BEGINSWITH 'Mark Protein bar'")).firstMatch.exists
            note("tick: planned protein bar ticked off = \(ticked) · app running = \(t.state == .runningForeground)")
            XCTAssertTrue(ticked && t.state == .runningForeground, "ticking off a planned food")
            shot(t, "tick-1-eaten")
        } else { note("tick: no tick circle on the planned protein bar"); shot(t, "tick-missing"); XCTFail("no tick circle on the planned food") }
        t.terminate()

        // Plan for someone else: the demo's saved person shows their numbers; Clear starts again (your plan untouched)
        let gp = XCUIApplication()
        gp.launchArguments = ["-demo", "YES", "-tab", "you", "-open", "guest"]
        gp.launch()
        let card = el(gp, "guest-result")
        if card.waitForExistence(timeout: 10) {
            note("someone else: numbers shown = \(label(card) ?? "(none)")")
            shot(gp, "guest-0-filled")
            gp.buttons["Clear"].firstMatch.tap()
            let empty = gp.staticTexts["Add sex, age, weight and height"].firstMatch
            _ = empty.waitForExistence(timeout: 5)
            note("someone else: Clear empties it = \(empty.exists) · app running = \(gp.state == .runningForeground)")
            XCTAssertTrue(empty.exists, "Clear starts the someone-else plan again")
        } else { note("someone else: no numbers for the demo's saved person"); shot(gp, "guest-missing"); XCTFail("Plan › Someone else shows the saved person's numbers") }
        gp.terminate()

        // the microphone: allow the permission prompts and see that the app keeps going
        let m = XCUIApplication()
        m.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        m.launch()
        let mic = el(m, "add-voice")
        if mic.waitForExistence(timeout: 10) {
            mic.tap()
            let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
            for _ in 0..<3 {
                settle(1)
                for label in ["Allow", "OK", "Allow While Using App"] where springboard.buttons[label].exists { springboard.buttons[label].tap(); break }
            }
            settle(2)
            let words = m.staticTexts.containing(NSPredicate(format: "label CONTAINS[c] 'listen' OR label CONTAINS[c] 'speech' OR label CONTAINS[c] 'microphone' OR label CONTAINS[c] 'type'")).firstMatch
            note("voice: app running after the microphone = \(m.state == .runningForeground) · says: \(label(words) ?? "(nothing)")")
            shot(m, "voice-1")
        } else { note("voice: no microphone button"); shot(m, "voice-missing") }
        m.terminate()
    }

    /// The tab bar shrinking, typing amounts, the add sheet's menus, selecting several, the filter, swipe options, and
    /// the sign-in form.
    @MainActor func testMenusAndSignIn() {
        resultsFile = "check-results-menus.txt"
        // the tab bar shrinking while the app is open (names should fade)
        let app = XCUIApplication()
        app.launchArguments = ["-demo", "YES", "-tab", "diary"]
        app.launch()
        settle(1)
        app.swipeUp(velocity: .slow)
        settle()
        shot(app, "bar-runtime-compact")
        app.swipeDown(velocity: .slow)
        app.swipeDown(velocity: .fast)
        settle()
        shot(app, "bar-runtime-full")
        app.terminate()

        // amounts: tapping the middle of the amount's line (not the number box) brings up the keypad
        let f = XCUIApplication()
        f.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "food"]
        f.launch()
        let row = el(f, "amount-row")
        if row.waitForExistence(timeout: 10) {
            row.coordinate(withNormalizedOffset: CGVector(dx: 0.35, dy: 0.5)).tap()
            _ = f.keyboards.firstMatch.waitForExistence(timeout: 3)
            note("amount: keypad after tapping the middle of the line = \(f.keyboards.firstMatch.exists)")
            XCTAssertTrue(f.keyboards.firstMatch.exists, "tapping an amount's line brings up the keypad")
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
            _ = n.keyboards.firstMatch.waitForExistence(timeout: 3)
            note("form: keypad after tapping the Calories label = \(n.keyboards.firstMatch.exists)")
            XCTAssertTrue(n.keyboards.firstMatch.exists, "tapping a form label brings up the keypad")
            shot(n, "form-keyboard")
        } else { note("form: no Calories label"); shot(n, "form-missing") }
        n.terminate()

        // the camera button lists its three ways in
        let cm = XCUIApplication()
        cm.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        cm.launch()
        let cam = cm.buttons["Camera"].firstMatch
        if cam.waitForExistence(timeout: 10) {
            cam.tap(); _ = cm.buttons["Snap your plate"].firstMatch.waitForExistence(timeout: 3)
            let ways = ["Snap your plate", "Scan barcode", "Scan a nutrition label"].filter { cm.buttons[$0].firstMatch.exists }
            note("camera menu: \(ways.count) of 3 options (\(ways.joined(separator: ", ")))")
            XCTAssertEqual(ways.count, 3, "the camera menu's three ways in")
            shot(cm, "camera-menu")
        } else { note("camera menu: no camera button"); shot(cm, "camera-missing") }
        cm.terminate()

        // Possible duplicates (the demo has a protein shake saved twice): Merge leaves no copies, Undo brings it back
        let dp = XCUIApplication()
        dp.launchArguments = ["-demo", "YES", "-tab", "foods", "-open", "mine"]
        dp.launch()
        let dupRow = el(dp, "dup-row")
        if dupRow.waitForExistence(timeout: 10) {
            dupRow.tap()
            let merge = el(dp, "dup-merge")
            _ = merge.waitForExistence(timeout: 5)
            shot(dp, "duplicates")
            merge.tap()
            let tidy = dp.staticTexts["No copies left"].firstMatch
            _ = tidy.waitForExistence(timeout: 5)
            let undo = dp.buttons["Undo"].firstMatch
            note("duplicates: merged = \(tidy.exists) · undo offered = \(undo.exists)")
            XCTAssertTrue(tidy.exists, "merging the demo's two protein shakes leaves no copies")
            if undo.exists { undo.tap(); _ = merge.waitForExistence(timeout: 5) }
            note("duplicates: copy back after Undo = \(merge.exists)")
            XCTAssertTrue(merge.exists, "Undo brings the copy back")
        } else {
            note("duplicates: no Possible duplicates row in My foods"); shot(dp, "duplicates-missing")
            XCTFail("My foods shows Possible duplicates for the demo's copy")
        }
        dp.terminate()

        // selecting several in My foods takes a recipe and a saved meal too, and plans them
        let sp = XCUIApplication()
        sp.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add", "-addtab", "mine"]
        sp.launch()
        let several = sp.buttons["Select several"].firstMatch
        if several.waitForExistence(timeout: 10) {
            several.tap(); _ = sp.staticTexts["Oven potatoes"].firstMatch.waitForExistence(timeout: 3)
            for name in ["Oven potatoes", "Usual breakfast"] { sp.staticTexts[name].firstMatch.tap() }
            settle()
            let tray = sp.staticTexts.containing(NSPredicate(format: "label ENDSWITH 'selected'")).firstMatch
            note("select several: \(tray.exists ? tray.label : "(no tray)")")
            shot(sp, "select-meal-recipe")
            sp.buttons["Plan"].firstMatch.tap(); settle(1)
            (sp.buttons["Done"].firstMatch.exists ? sp.buttons["Done"] : sp.buttons["Cancel"]).firstMatch.tap(); settle(1) // back to the Diary
            let badge = sp.staticTexts.containing(NSPredicate(format: "label ENDSWITH 'planned'")).count
            note("select several: planned labels in the Diary after Plan = \(badge)")
            shot(sp, "select-planned-diary")
        } else { note("select several: no button"); shot(sp, "select-missing") }
        sp.terminate()

        // the sort and filter menu, open (Verified only should be a normal choice)
        let fm = XCUIApplication()
        fm.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        fm.launch()
        let pill = fm.buttons["Sort"].firstMatch
        if pill.waitForExistence(timeout: 10) {
            pill.tap(); _ = fm.buttons["Verified only"].firstMatch.waitForExistence(timeout: 3)
            let v = fm.buttons["Verified only"].firstMatch
            note("filter menu: Verified only exists = \(v.exists) · enabled = \(v.exists && v.isEnabled)")
            shot(fm, "filter-menu")
        } else { note("filter menu: no sort button"); shot(fm, "filter-missing") }
        fm.terminate()

        // swipe right on a food: its options; on a meal's name: the meal's options
        let sw = XCUIApplication()
        sw.launchArguments = ["-demo", "YES", "-tab", "diary"]
        sw.launch()
        let oatsRow = el(sw, "food-a0")
        if oatsRow.waitForExistence(timeout: 10) {
            sw.swipeUp(velocity: .slow); settle(1)
            oatsRow.swipeRight(); _ = sw.buttons["More"].firstMatch.waitForExistence(timeout: 3)
            shot(sw, "swipe-food")
            let more = sw.buttons["More"].firstMatch
            if more.exists {
                more.tap(); _ = sw.buttons["Copy"].firstMatch.waitForExistence(timeout: 3)
                let opts = ["Plan", "Mark as eaten", "Repeat", "Edit a copy of food", "Edit original food", "Copy", "Delete"].filter { sw.buttons[$0].firstMatch.exists }
                note("food options: \(opts.joined(separator: ", "))")
                shot(sw, "food-options")
                sw.coordinate(withNormalizedOffset: CGVector(dx: 0.96, dy: 0.5)).tap() // close it (tap beside it)
                settle()
                
            } else { note("food options: no More button after swiping") }
            let header = el(sw, "meal-lunch")
            if header.exists {
                header.swipeRight(); _ = sw.buttons["Lunch options"].firstMatch.waitForExistence(timeout: 3)
                shot(sw, "swipe-meal")
                let mo = sw.buttons["Lunch options"].firstMatch
                note("meal options button after swiping = \(mo.exists)")
                if mo.exists { mo.tap(); settle(); shot(sw, "meal-options") }
            }
        } else { note("swipe: no food rows"); shot(sw, "swipe-missing") }
        sw.terminate()

        // ⋯ then New: a food, a recipe or a meal
        let nw = XCUIApplication()
        nw.launchArguments = ["-demo", "YES", "-tab", "diary", "-sheet", "add"]
        nw.launch()
        let more = nw.buttons["More ways to add"].firstMatch
        if more.waitForExistence(timeout: 10) {
            more.tap()
            let new = nw.buttons["New"].firstMatch
            if new.waitForExistence(timeout: 3) {
                new.tap(); _ = nw.buttons["Recipe"].firstMatch.waitForExistence(timeout: 3)
                let kinds = ["Food", "Recipe", "Meal"].filter { nw.buttons[$0].firstMatch.exists }
                note("new menu: \(kinds.count) of 3 (\(kinds.joined(separator: ", ")))")
                XCTAssertEqual(kinds.count, 3, "New offers a food, a recipe and a meal")
                shot(nw, "new-menu")
            } else { note("new menu: no New in ⋯"); shot(nw, "new-missing") }
        } else { note("new menu: no ⋯ button"); shot(nw, "new-missing") }
        nw.terminate()

        // the front door: from the welcome to sign in, the form's own checks, and a sign-in the server refuses
        let a = XCUIApplication()
        a.launchArguments = ["-demo", "YES", "-auth", "welcome"]
        a.launch()
        let toSignIn = el(a, "auth-signin")
        if toSignIn.waitForExistence(timeout: 10) {
            settle()
            toSignIn.tap()
            let submit = el(a, "auth-submit"), err = el(a, "auth-error")
            _ = submit.waitForExistence(timeout: 5)
            submit.tap()
            note("auth: empty form says: \(err.waitForExistence(timeout: 3) ? err.label : "(nothing)")")
            let mail = a.textFields["auth-email"].firstMatch
            mail.tap(); mail.typeText("not-an-email")
            submit.tap(); settle()
            note("auth: bad email says: \(err.exists ? err.label : "(nothing)")")
            mail.tap(); mail.typeText("@example.com")
            let pw = a.secureTextFields["auth-password"].firstMatch
            pw.tap(); pw.typeText("wrong-password-1")
            shot(a, "auth-filled")
            submit.tap()
            waitForChange(err, from: err.exists ? err.label : "", timeout: 10) // the server answers (a refusal)
            note("auth: refused sign-in says: \(err.exists ? err.label : "(nothing)") · still on the form = \(submit.exists)")
            shot(a, "auth-refused")
        } else { note("auth: no welcome screen"); shot(a, "auth-missing") }
        a.terminate()
    }
}
