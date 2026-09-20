# Unified Pulse (Spark + Ember)

## Before

- **Navigation:** Already a single `DisguiseNavigator` swapped with `MainTabs` via `MainShell` / `WorldSwitchVeil` — not two Pulse stacks.
- **Branding split:** Ember disguise tab bar used Pulse blue while Spark disguise tabs used Spark pink; Ember dating theme still applied Harbor gold button tokens inside disguise.
- **Content routing:** Feed builders read `preferences.sparkSection` directly, so section was always “live” rather than explicitly tied to **when the user entered** Pulse from dating.

## After

- **One Pulse shell:** Same navigator, masthead, and **Pulse blue** tab bar for both Spark and Ember entry paths.
- **`pulseContextSection`:** Snapshotted in `setDisguiseMode(true)` from the current `preferences.sparkSection` (also initialized on hydrate). Updated when the user changes Spark/Ember in Pulse settings via `setSparkSection`.
- **Section-aware content:** Feed weave, reporter links, mini-window profile resolution, and actioned-feed filters use `usePulseContextSection()` / `useDisguiseWorld()` instead of raw preferences.
- **Leave label:** Unlock copy still reflects the section you return to (`pulseContextSection` while in disguise).

## Manual test steps

1. **Spark → Pulse:** Leave disguise default on; unlock to Spark dating. Tap Pulse tab → feed mini-profiles should match Spark pool (singles). Tab bar accents are Pulse blue.
2. **Ember → Pulse:** Toggle to Ember on discover; tap Pulse tab again → feed should show Ember-appropriate woven profiles; tab bar still Pulse blue (not gold/pink).
3. **Re-entry after toggle:** From Pulse, leave to dating, switch Spark ↔ Ember, tap Pulse tab → woven profiles and reporter taps should match the new section.
4. **In-Pulse section toggle:** Pulse settings → Spark/Ember toggle → feed should refresh to the other pool without leaving disguise.
5. **Regression:** Pull-to-refresh / load-more on feed; open reporter mini-window like/pass; leave Pulse unlock flow still says Spark or Ember correctly.
