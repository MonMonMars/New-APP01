# Spark admin panel (MVP)

## Secret entry (not in tab bar)

| Platform | How to open |
|----------|-------------|
| **iOS / Android** | Profile tab → scroll to bottom → tap **Spark {version}** **7 times** within ~2.5s |
| **Web** | Navigate to `{baseUrl}/admin` (e.g. `/admin` on local demo, or `/New-APP01/admin` when `EXPO_PUBLIC_BASE_PATH` is set) |

Then sign in with an email on the admin allowlist.

## Environment

```bash
# Required: comma-separated staff emails (lowercase recommended)
EXPO_PUBLIC_ADMIN_ALLOWLIST=you@company.com,ops@company.com

# Optional role maps (first match wins after local role store)
EXPO_PUBLIC_ADMIN_SUPERADMINS=you@company.com
EXPO_PUBLIC_ADMIN_PROFILE_EDITORS=editor@company.com
EXPO_PUBLIC_ADMIN_MODERATORS=mod@company.com
EXPO_PUBLIC_ADMIN_VIEWERS=viewer@company.com

# Dev only — allows any email when allowlist is empty (never in production)
EXPO_PUBLIC_ADMIN_DEV_OPEN=true
```

Supabase (optional): set `app_metadata.admin_role` to `viewer` | `moderator` | `profile_editor` | `superadmin` for signed-in users.

## RBAC matrix

| Permission | Viewer | Moderator | Profile editor | Super admin |
|------------|:------:|:---------:|:--------------:|:-----------:|
| Access admin UI | ✓ | ✓ | ✓ | ✓ |
| View demo/AI profile metadata in app | ✓ | ✓ | ✓ | ✓ |
| View analytics (dashboard stub) | ✓ | ✓ | ✓ | ✓ |
| Run backend actions (stub) | | ✓ | | ✓ |
| Edit catalog profiles | | | ✓ | ✓ |
| Toggle demo / account kind | | | ✓ | ✓ |
| Manage admin roles | | | | ✓ |
| See demo billing hints in shop | | | | ✓ |

## What public users no longer see

- AI / demo badges on profile cards and chat headers
- “AI practice match” chat banner and profile disclaimer
- Discover hub “AI practice matches” row
- Demo billing banner in shop (unless superadmin signed in)
- “Demo” badge on purchase history (unless superadmin signed in)
- “AI generated” label on disguise ad previews (timestamp only for consumers)

Internal flags remain in data: `isDemoProfile`, `accountKind`, `isAiPersona`.

## Production TODO

- Supabase tables: `admin_users`, `admin_profile_overrides` with RLS
- Edge functions for profile CRUD instead of AsyncStorage overrides
- Audit log for admin edits
