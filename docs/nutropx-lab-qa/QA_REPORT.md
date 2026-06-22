# QA Report - Nutropx Lab (Android)

**Date:** 2026-06-22
**Build:** v1.2 (versionCode 3), package `com.nutropx.lab`
**App type:** WebView app (Next.js front-end inside Android System WebView)
**Device:** Google Pixel 7a - Android 16, 1080x2400 @ 420dpi
**WebView engine:** com.google.android.webview 148.0.7778.215
**Test account:** phung n / phungnlg@gmail.com (Free plan, Level 1)
**Tooling:** Maestro 2.6.1 (UI automation) + adb (logcat, screencap, network/rotation stress)
**Min/Target SDK:** 24 / 36

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Medium   | 3 |
| Pass / OK | 4 |

App is stable (no crashes, offline-capable) but has **one blocking defect**: the
exercise catalog does not scroll, making every individual exercise unreachable.

---

## Critical

### C1 - Exercise catalog page does not scroll; all 32 exercises unreachable
- **Where:** Lab tab -> "Pick an Exercise. Start Training." page. Also reached via
  Home -> "Start Training" CTA (lands on the same page).
- **What:** The page shows the 5 Training Category cards at the top with Speed /
  Flexibility cards clipped at the bottom edge. The 32 individual exercise tiles
  (incl. the FREE ones - Number Memory, Stroop Test) and the product cards exist
  in the DOM but render below the fold. The page **will not scroll** - verified
  with 2x adb swipes and 2x Maestro percentage swipes (50%,80% -> 50%,20%); the
  view does not move at all.
- **Impact:** A Free user cannot reach or start any individual exercise from the
  catalog. Core function blocked. Tapping a category (e.g. Memory) filters the
  list correctly (confirmed in the a11y tree) but the filtered tiles are still
  below the unscrollable fold.
- **Evidence:** `screenshots/02-lab.png`, `13-lab-after-swipe.png`,
  `15-after-mswipe.png` (all identical after scroll attempts),
  `32-start-training.png` (Home CTA -> same stuck page).
- **Likely cause:** CSS overflow/height on the catalog scroll container inside the
  WebView (e.g. `height:100vh` + inner `overflow:hidden`, or a fixed-height
  wrapper). Reproduce in Chrome devtools mobile emulation at 412x915.

---

## Medium

### M1 - Blank screen flash on load (content lags nav by ~2-3s)
- Bottom navigation renders immediately, but the WebView page body is blank
  (spinner only) for ~2-3s before content paints. Users see an empty screen on
  every cold load / tab switch.
- **Evidence:** first `01-home.png` capture was fully blank w/ spinner; the same
  shot after adding an explicit content-wait rendered correctly.
- **Fix:** show a skeleton/splash until first contentful paint.

### M2 - Chat FAB overlaps the "Profile" bottom-nav tab
- The Professor 5-Brain chat launcher (avatar bubble, bottom-right) sits directly
  over the "Profile" nav item. Risk of mis-taps / blocked nav target.
- **Evidence:** `screenshots/08-profile.png`, `01-home.png` (avatar over Profile).
- **Fix:** raise the FAB above the nav bar or hide it on the nav row.

### M3 - Professor 5-Brain chat opens with an empty body
- Opening chat shows header + input + disclaimer, but the conversation area is
  blank - no welcome/intro message to orient the user.
- **Evidence:** `screenshots/09-chat-open.png`.
- **Fix:** seed an intro/greeting bubble on open.

---

## Pass / OK

- **P1 - No crashes.** Full smoke + deep flows, force-stop/relaunch cycles, network
  toggling: zero ANRs/FATALs. Only a benign `cr_AutofillHintsService` Chromium
  log, unrelated to app logic.
- **P2 - Offline works.** With Wi-Fi + mobile data disabled, the app relaunched and
  rendered Home from cache (PWA/service-worker), no error screen.
  Evidence: `screenshots/30-no-network.png`.
- **P3 - Navigation reachable.** All 5 tabs load: Home, Lab, Test (Quick Check-In
  fullscreen flow), My Brain, Profile. Test correctly hides the bottom nav and
  exposes a back arrow. Evidence: `01,02,06,07,08`.
- **P4 - Orientation locked to portrait** (forced `user_rotation=1` did not rotate).
  Acceptable for this app class. Evidence: `screenshots/31-landscape.png`.

---

## Coverage

**Tested:** app launch, all 5 nav tabs, Lab category filtering, PRO/paywall upsell
visibility, Professor 5-Brain chat open/close, offline relaunch, rotation,
force-stop/relaunch, crash/log scan.

**NOT tested (blocked or out of scope):**
- Actual gameplay of an exercise - **blocked by C1** (cannot reach a playable tile)
  and by WebView a11y nodes reporting zero bounds (no coordinate tap from the
  accessibility tree).
- Login / signup / logout flows (used an already-authenticated session).
- In-app purchase / Pro upgrade payment.
- Deep links, push notifications, account/billing edits (Save changes).

---

## How to re-run

```bash
cd temp/maestro
# smoke (all 5 tabs + chat):
~/.maestro/bin/maestro test qa.yaml
# deep (game launch + paywall - currently exposes C1):
~/.maestro/bin/maestro test qa_deep.yaml
# screenshots land in temp/maestro/screenshots/
```

Stress checks were driven directly via adb (network: `adb shell svc wifi/data
disable`; rotation: `adb shell settings put system user_rotation 1`).

---

## Recommended fix priority

1. **C1** - unblock catalog scrolling (release blocker).
2. **M1** - skeleton loader to remove blank flash.
3. **M2 / M3** - FAB overlap + empty chat (polish).
