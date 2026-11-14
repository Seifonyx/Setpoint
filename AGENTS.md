# Rules for anyone working on Setpoint

These rules apply to every agent (Claude or otherwise) and every app-related suggestion, review, improvement,
redesign, feature proposal and technical recommendation. Project details (build, release, structure) are in CLAUDE.md.

## Evidence-Based Suggestions Rule

Before making any suggestions, recommendations, or proposing changes to the app, you must first inspect and analyze
the actual current state of the app.

1. **Inspect before suggesting.** Review the actual codebase, UI, existing features, navigation, architecture, and
   relevant implementations before recommending anything.
2. **No assumptions.** Never recommend changes based on guesses, generic best practices, or assumptions about how the
   app works.
3. **Identify existing functionality.** Check whether a suggested feature or improvement already exists, even if it is
   implemented differently.
4. **Understand the context.** Consider how the proposed change interacts with existing features, design decisions,
   and user workflows.
5. **Evidence-based recommendations.** Every suggestion must be supported by something you actually found in the app.
   Explain the current issue, why it matters, and how your recommendation addresses it.
6. **Be transparent.** If you cannot access or inspect the relevant code, screens, or functionality, say so
   explicitly. Never pretend you checked something you couldn't access.
7. **Avoid unnecessary changes.** Do not suggest adding, replacing, or redesigning something that already works well
   without identifying a concrete reason.
8. **Verify before concluding.** When possible, inspect the implementation and test the relevant behavior before
   claiming that something works or needs fixing.

Core principle: never suggest something just because it sounds like a good idea. Inspect first, gather evidence,
understand the existing implementation, and then make recommendations based on what is actually there. Quality and
accuracy matter more than generating suggestions quickly.

## External Research & Vibe-Coding Prevention Rule

Before proposing, implementing, or recommending any app changes, research how established, top-quality apps handle the
same features and identify potential vibe-coding mistakes.

### 1. Research top applications
- Research leading apps in the same category and other relevant, well-made apps. For Setpoint that means food and
  weight trackers first (for example Cronometer, MacroFactor, MyFitnessPal, Lose It!, Apple Health/Fitness), and
  widely praised apps (including ChatGPT, Claude and Gemini) for general interaction patterns.
- Examine how they implement similar features, interactions, navigation, layouts, and user workflows.
- Use actual screenshots, documentation, demonstrations, credible reviews, and other verifiable sources whenever
  available.
- Do not blindly copy competitors. Understand what works, why it works, and whether it fits this app's identity.
- Prioritize current information over outdated examples.

### 2. Investigate potential vibe-coding mistakes
Before implementation, actively check for common AI-assisted development mistakes, including:
- Duplicated or conflicting functionality.
- Incorrect assumptions about existing architecture.
- Broken gestures, navigation, and touch interactions.
- UI inconsistencies and poorly integrated components.
- State-management issues and race conditions.
- Unnecessary dependencies and overcomplicated implementations.
- Performance, memory, and battery problems.
- Accessibility and responsive-layout issues.
- Incomplete error handling and edge cases.
- Temporary fixes that create technical debt.
- Features that appear functional but fail in real-world usage.

### 3. Validate before implementation
- Inspect the actual codebase and relevant screens first.
- Research established implementations and technical best practices.
- Identify potential conflicts and failure scenarios before writing code.
- Choose the solution that best fits the existing architecture.
- Explain significant trade-offs when multiple approaches exist.

### 4. Evidence requirements
Every recommendation must have two foundations:
- **Internal evidence:** what you actually discovered in this app.
- **External evidence:** relevant research, established app behavior, official documentation, or credible technical
  sources.

Do not fabricate research, sources, app behavior, or testing results. If something cannot be verified, clearly state
that limitation.

### 5. Continuous verification
After implementation:
- Test the actual behavior, not just whether the code compiles (for the iPhone app: the simulator screenshots from the
  build, and launch-argument hooks such as `-tab`, `-sheet`, `-open` to reach the screen you changed).
- Check relevant edge cases and interactions.
- Compare the result against the intended design and behavior.
- Look for regressions in existing features.
- Fix discovered issues and rerun the relevant failed checks.

Non-negotiable principle: think like an experienced product engineer, not an AI that simply generates code. Inspect
the app, research proven solutions, anticipate mistakes, implement carefully, and verify the result. Never substitute
assumptions or generic AI suggestions for evidence.
