# Spark — App Flow & UI Structure Map

Research synthesis from **Tinder**, **Bumble**, and **Hinge** (2024–2025 patterns). Spark implements the shared industry workflow with our drag-to-target discovery mechanic.

## Industry-standard user journey

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Onboarding │ -> │ Profile setup│ -> │  Discovery  │ -> │ Match modal  │
│  + rules    │    │ + location   │    │  (cards)    │    │ (mutual like)│
└─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                              │                    │
                                              v                    v
                                       ┌──────────────┐    ┌──────────────┐
                                       │ Pass (trash) │    │ Chat thread  │
                                       └──────────────┘    └──────────────┘
```

| Phase | Tinder | Bumble | Hinge | Spark |
|-------|--------|--------|-------|-------|
| Onboarding | House rules early, location last | Guidelines at end, modes (Date/BFF) | Prompt-heavy profile first | Welcome → rules → location → profile |
| Discovery | Swipe cards, photo-first | Swipe + Opening Moves | Like specific prompts | **Drag card → trash / heart** |
| Likes inbox | Gold blur grid | Beeline blur | Roses / likes tab | Blurred grid + upgrade CTA |
| Matches | New matches row + inbox | Expiring matches ring | "Your turn" badge | New matches + messages + your turn |
| Chat | GIFs, safety | Icebreakers, voice/video | Focused thread | Icebreaker chips, bubbles |
| Profile | Edit, settings, premium | Verification, modes | Prompts editor | Stats, interests, settings |

## Screen map (Spark)

```
Root Stack
├── OnboardingFlow
│   ├── Welcome (Apple / phone)
│   ├── House Rules
│   ├── Location permission
│   └── Profile setup
└── Main (Bottom Tabs)
    ├── Discover
    │   ├── Card deck (drag → trash / heart)
    │   ├── Profile detail sheet (scroll: prompts, interests)
    │   └── Match modal
    ├── Likes
    │   ├── Upgrade banner
    │   └── Blurred like grid
    ├── Matches
    │   ├── New matches (horizontal)
    │   └── Message list (your turn, unread)
    ├── Profile
    │   ├── Edit profile
    │   ├── Stats
    │   └── Settings rows
    └── Chat (stack push)
        ├── Header (avatar, video)
        ├── Icebreakers (empty state)
        └── Composer
```

## Navigation pattern

- **Bottom tabs** (4): Discover, Likes, Matches, Profile — matches Tinder/Bumble thumb-zone convention.
- **Stack overlay**: Chat pushes on top of tabs.
- **Modals**: Match celebration, full profile detail.

## Discovery UX (Spark differentiator)

Unlike Tinder swipe-left/right:

1. User sees **one card** from the deck.
2. **Drag** toward **trash** (bottom-left) = pass.
3. **Drag** toward **heart** (bottom-right) = like.
4. Drop outside zones → card springs back.

This avoids direct replication of Tinder's patented swipe gesture while keeping familiar dating-app mental model.

## Data flow (prototype)

- `AppContext` holds: discover queue, likes, passes, matches, conversations.
- Mutual match IDs: `1`, `3`, `5` (demo).
- Seed conversations with Ava and Mia.
- Incoming likes: blurred profiles `7`–`10`.

## References

- [Tinder vs Bumble UI comparison](https://medium.com/design-bootcamp/decoding-ui-ux-quick-comparison-of-tinder-and-bumble-9a3cb2b76f28)
- [Dating app UI/UX tips (Purrweb)](https://www.purrweb.com/blog/tips-to-create-a-successful-dating-app-ui-and-ux/)
- [Tinder browsing flow (Page Flows)](https://pageflows.com/post/ios/general-browsing/tinder/)
