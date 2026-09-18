# Spark — App Flow & UI Structure Map

Research synthesis from **Tinder**, **Bumble**, **Hinge**, **Badoo**, and **Coffee Meets Bagel** (2024–2026 patterns). Spark implements the shared industry workflow with our drag-to-target discovery mechanic.

## Competitor pattern matrix

| Pattern | Tinder | Bumble | Hinge | Badoo / CMB | Spark copies |
|---------|--------|--------|-------|-------------|--------------|
| **Post-like (no mutual)** | Silent; keep swiping | Silent; keep swiping | Comment sent; keep browsing | Bagel queue / pass | **Waiting for match** modal + “Find more people” (Tinder/Bumble silent flow) |
| **Match celebration** | Full-screen “It’s a Match!” + dual avatars | Full-screen + Opening Move prompt | Subtle toast; comment-first | Match screen | **Full-screen gradient celebration** with Send Message / Keep Swiping (Tinder) |
| **Likes inbox** | Gold blur grid + count badge | Beeline blur + Premium CTA | Roses / likes tab | Encounters blur | **Blurred grid + count badge + Spark+ CTA** (Tinder Gold / Bumble Beeline) |
| **Daily like limit** | ~100/12h; paywall at cap | Daily cap; Premium unlimited | 8 free likes/day | Limited free actions | **10/day free + banner + LikeLimitModal → Spark+** |
| **Empty deck** | “Out of people” + widen search | Same + Snooze | “You’re all caught up” | Expand radius | **“No more people nearby” + Widen filters + Discovery settings** |
| **Matches list** | New matches row + inbox | New matches + 24h expiry ring | “Your turn” badge | Chat list | **New matches row + Your turn + Expires in Xh** (Bumble urgency) |
| **Chat openers** | GIFs, suggested messages | Opening Moves, icebreakers | Prompt replies | Quick replies | **AI reply suggestions** (3 chips, prefill composer) + icebreaker chips |
| **Profile detail** | Photo carousel, bio | Badges, modes | **Prompt cards** interleaved with photos | Interests | **Hinge-style prompt cards** in profile sheet |
| **Safety** | Report/block in chat & profile | Safety Center hub | Report/block | Safety tips | **Safety Center + report/block in chat menu & profile sheet** |
| **Tab badges** | Likes count, unread messages | Beeline count, chat badge | Likes + matches | Notifications | **Dynamic Likes count + Matches unread/your-turn badge** |
| **Premium upsell** | Blurred like tap, like limit, Boost | Beeline tap, Spotlight | Rose limit, Hinge+ | Credits | **Likes tap, like limit modal, Spark+ from Profile** |
| **Discovery gesture** | Swipe left/right (patented) | Swipe | Tap like on prompts | Swipe / tap | **Drag card → trash / heart** (legal differentiator) |
| **Daily curated batch** | Top Picks / Chemistry | — | Most Compatible daily | Bagels at noon | **"Today's picks · X of Y left"** batch indicator (CMB) |
| **Super-like / Rose** | Super Like (swipe up) | SuperSwipe | Rose (1 free/week) | Crush highlight | **Spark Rose** center button + **full-screen celebration** + result modal (Hinge/Tinder) |
| **Top Picks / Standouts** | Top Picks | For You (4/day) | Standouts (Roses only) | Bagels at noon | **Standouts row** — 3 curated profiles on Discover |
| **Recently active** | Active status dot | Online now | Active today | Online badge | **Recently active strip** on Discover |
| **Explore categories** | Explore / Passport stacks | Modes (Date/BFF) | — | Encounters filters | **Explore screen** — Serious / New / Nearby stacks |
| **Super Likes sent** | Super Likes tab (Gold) | SuperSwipe sent | Roses sent | — | **Super Likes sent** section in Likes tab |
| **Super Matches** | — | — | — | — | **Super Matches** row in Matches tab |
| **Compatibility signal** | Smart Photos / Top Picks | — | Most Compatible badge | Match % | **"Most Compatible"** badge on daily pick (Hinge) |
| **Spotlight / Crush** | Boost visibility | Spotlight | Standouts | Crush moment | **"Crush"** badge + pulsing ring on spotlight profile (Badoo) |
| **Match screen CTAs** | Send Message + Keep Swiping | Opening Move + chat | Comment-first toast | Quick reply | **"Start talking"** (primary) + **"Keep looking"** (outline) + Opening Move card (Bumble) |
| **Pass / like effects** | Stamp overlays | Color flashes | Subtle animations | Quick fade | **Big red heart burst** (like) + **dark vignette fade** (pass) |
| **Action buttons** | Red X / green heart | Same palette | Rose + heart | Pass / like buttons | **White trash** + **red heart** drop targets |

## Industry-standard user journey

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Onboarding │ -> │ Profile setup│ -> │  Discovery  │ -> │ Match modal  │
│  + rules    │    │ + location   │    │  (cards)    │    │ (mutual like)│
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                                              │                    │
                                              v                    v
                                       ┌──────────────┐    ┌──────────────┐
                                       │ Pass (trash) │    │ Chat thread  │
                                       └──────────────┘    └──────────────┘
                                              │
                                              v (one-sided like)
                                       ┌──────────────┐
                                       │ Waiting modal│
                                       │ Find more    │
                                       └──────────────┘
```

| Phase | Tinder | Bumble | Hinge | Spark |
|-------|--------|--------|-------|-------|
| Onboarding | House rules early, location last | Guidelines at end, modes (Date/BFF) | Prompt-heavy profile first | Welcome → rules → location → profile |
| Discovery | Swipe cards, photo-first | Swipe + Opening Moves | Like specific prompts | **Drag card → trash / heart** |
| Post-like | Keep swiping | Keep swiping | Keep browsing | **Waiting modal → Find more people** |
| Likes inbox | Gold blur grid | Beeline blur | Roses / likes tab | Blurred grid + badge + Spark+ CTA |
| Matches | New matches row + inbox | Expiring matches ring | "Your turn" badge | New matches + messages + your turn + expiry |
| Chat | GIFs, safety | Icebreakers, voice/video | Focused thread | AI suggestions, demo auto-replies, icebreaker chips, report/block menu |
| Profile | Edit, settings, premium | Verification, modes | Prompts editor | Stats, interests, Safety & Spark+ links |
| Paywall | Like limit, blur tap | Beeline tap | Rose limit | Like limit modal, Likes tap, Spark+ screen |

## Screen map (Spark)

```
Root Stack
├── OnboardingFlow
│   ├── Welcome (Apple / phone)
│   ├── House Rules
│   ├── Location permission
│   └── Profile setup
└── Main (Bottom Tabs)
    ├── Pulse (Discover hub — branded tab with Pulse logo + label)
    │   ├── Discover card deck (drag → trash / heart / rose)
    │   ├── Hub sheet → map preview (Esri tiles + avatar pins), Explore, preferences
    │   ├── Search radius pill + Expand location sheet (25 → Anywhere)
    │   ├── Batch loading — 6 profiles at a time, “Search more people” CTA
    │   ├── Like limit pill + modal
    │   ├── Empty deck (expand radius / search more)
    │   ├── Waiting for match modal
    │   ├── Standouts row (Top Picks) + Recently active strip
    │   ├── Explore button → Explore screen (category stacks)
    │   ├── Spark Rose → SuperLikeCelebration + SuperLikeResultModal
    │   ├── Profile detail sheet (prompts, report/block)
    │   └── Full-screen match celebration
    ├── MapDiscover (stack push from Discover Hub)
    │   ├── Esri street map with real lat/lng + avatar pins
    │   ├── Pan / pinch zoom + zoom +/- controls
    │   ├── Tap pin → preview card → add to deck
    │   └── “Search this area” → filter pool + reload batch
    ├── Explore (stack push from Discover)
    │   ├── Serious daters / New members / Nearby categories
    │   └── Tap profile → prioritize in deck
    ├── Likes
    │   ├── Count badge banner
    │   ├── Super Likes sent row (pending / matched status)
    │   ├── Blurred like grid → Spark+
    │   └── Tab badge (incoming count)
    ├── Matches
    │   ├── Super Matches row (rose badge)
    │   ├── New matches (horizontal, expiry)
    │   ├── Message list (your turn, unread, expires)
    │   └── Tab badge (new + unread + your turn)
    ├── Profile
    │   ├── Edit profile
    │   ├── Stats
    │   └── Settings → Safety, Spark+
    ├── Chat (stack push)
    │   ├── Header (avatar, expiry, safety menu)
    │   ├── AI opener/reply suggestions (prefill composer)
    │   ├── Demo profiles: AI opening message + auto-reply
    │   ├── Icebreakers (empty state fallback)
    │   └── Composer
    ├── SparkPlus (modal)
    └── Safety (stack push)
```

## Navigation pattern

- **Bottom tabs** (4): Pulse (Discover), Likes, Matches, Profile — matches Tinder/Bumble thumb-zone convention; Pulse tab uses branded logo + “Pulse” label like other tabs.
- **Stack overlay**: Chat, Safety push on top of tabs; Spark+ presents as modal.
- **Modals**: Waiting for match, like limit, profile detail sheet.
- **Full-screen**: Match celebration (Tinder-style, not a small sheet).

## Discovery UX (Spark differentiator)

Unlike Tinder swipe-left/right:

1. User sees **one card** from the deck.
2. **Tap** left/right on the photo to browse multiple images (Tinder-style dots).
3. **Drag** toward **trash** (bottom-left) = pass, or **tap** the trash button.
4. **Drag** toward **heart** (bottom-right) = like, or **tap** the heart button.
5. Drop outside zones → card springs back.
6. **Discovery settings** filter by distance and age range.
7. **One-sided like** → waiting modal; **mutual like** → full-screen celebration → chat.

This avoids direct replication of Tinder's patented swipe gesture while keeping familiar dating-app mental model.

## Monetization touchpoints (copied patterns)

| Trigger | Source app | Spark screen |
|---------|-----------|--------------|
| Tap blurred like | Tinder Gold | Likes grid → Spark+ |
| Daily like cap | Tinder / Hinge | LikeLimitModal → Spark+ |
| Likes tab badge | Tinder “99+” | Tab badge + banner count |
| See who liked you CTA | Bumble Beeline | Likes banner button |

## Data flow (prototype)

- `AppContext` holds: discover queue (batched), pool total, likes, passes, pending likes, matches, conversations, daily like count, blocked IDs.
- Discover loads **6 profiles per batch** from a pool filtered by radius (25 → 50 → 100 → 250 → Anywhere) and optional map search center (`mapSearchLat` / `mapSearchLng`).
- Profiles carry **real latitude/longitude** for map placement; `SearchMapView` uses Esri tiles with avatar pins.
- **Demo / AI chat profiles** receive AI opening messages and gated auto-replies via `chatReplyCoach` + `demoChatLlm`.
- Seed matches with empty threads get **demo openers** from `seedState.ts`.
- See `profiles.ts` header comment for full QA bucket map (IDs, likes, matches, pending).

## References

- [Best Dating App Designs 2026](https://gummble.com/blog/best-dating-app-designs-2026) — prompt cards, celebration, blur paywall
- [Tinder Gold blur-to-reveal strategy](https://startupspells.com/p/tinder-gold-conversion-strategy-blur-to-reveal-paywall-ux)
- [Match-to-message UX patterns](https://medium.com/@post.uz/match-to-message-ux-designing-dating-chat-in-figma-8a8e7c6a8d9a)
- [Tinder vs Bumble UI comparison](https://medium.com/design-bootcamp/decoding-ui-ux-quick-comparison-of-tinder-and-bumble-9a3cb2b76f28)
- [Dating app UI/UX tips (Purrweb)](https://www.purrweb.com/blog/tips-to-create-a-successful-dating-app-ui-and-ux/)
