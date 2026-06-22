# Nutropx Lab - QA Findings

**Build:** v1.2 (versionCode 3) - `com.nutropx.lab`
**Stack:** Capacitor wrapper around a Next.js static export (`webDir: out`), arm64-v8a only
**Device:** Pixel 7a, Android 16, 1080x2400 @ 420dpi, System WebView 148
**Account:** Free plan, Level 1 - **Tools:** Maestro 2.6.1 + adb
**Screenshots:** all referenced PNGs live in [`screenshots/`](screenshots/) (click any to view)

---

## 1. Bug list

### BUG-1 (Blocker) - Exercise catalog does not scroll; no exercise can be started
- **Steps:**
  1. Open app -> tap **Lab** (or Home -> "Start Training").
  2. Page "Pick an Exercise. Start Training." shows 5 category cards; Speed/Flexibility clipped at bottom.
  3. Swipe up to reach the exercise tiles.
- **Expected:** page scrolls to the 32 exercise tiles (incl. free Number Memory / Stroop) + Start.
- **Actual:** page does not move at all. Verified 2x adb swipe + 2x Maestro swipe (50%,80%->50%,20%). Free user can never open an exercise.
- **Note:** tapping a category (e.g. Memory) correctly filters the list in the DOM, but filtered tiles are still below the unscrollable fold.
- **Screens:**

| Lab (top, won't scroll) | After 2x swipe (identical) | Home CTA -> same stuck page |
|---|---|---|
| ![Lab](screenshots/02-lab.png) | ![After swipe](screenshots/15-after-mswipe.png) | ![Start Training](screenshots/32-start-training.png) |

### BUG-2 (Medium) - Chat: message bubble + input field overlap the disclaimer banner
- **Steps:**
  1. Tap the Professor 5-Brain chat FAB.
  2. Observe the area between the cyan header and the input field.
- **Expected:** message list, disclaimer banner, and the input field sit in separate, non-overlapping rows.
- **Actual:** the first message bubble (avatar + empty rounded bubble) renders clipped **behind** the "Professor 5-Brain is a wellness coach... Not medical advice." disclaimer, and the input textfield sits directly on top of the same band - the chat header/disclaimer/input rows are stacked with no spacing and overlap each other.
- **Impact:** broken, unpolished chat layout; the clipped bubble looks like a rendering glitch.
- **Likely cause:** the chat panel uses absolute/fixed positioning (or a `100vh`/`100dvh` container under the overlaid status bar - same family as BUG-1) so the scroll list, sticky disclaimer, and input collide instead of using a flex column with `min-height:0`.
- **Screens:** clipped bubble behind disclaimer + input overlapping the band:

![Chat overlap](screenshots/chat-overlap.png)

### BUG-3 (Medium) - Chat FAB overlaps the "Profile" bottom-nav tab
- **Steps:** any screen with bottom nav -> look bottom-right.
- **Expected:** chat launcher clear of nav targets.
- **Actual:** Professor 5-Brain avatar bubble sits over the Profile tab -> mis-tap / blocked target.
- **Screens:** avatar bubble over Profile tab (bottom-right):

![Profile](screenshots/08-profile.png)

### BUG-4 (Low) - Professor 5-Brain chat opens with an empty body
- **Steps:** tap the chat FAB.
- **Expected:** a welcome/intro message.
- **Actual:** header + input + disclaimer only; conversation area blank.
- **Screens:** empty conversation body on open:

![Chat](screenshots/09-chat-open.png)