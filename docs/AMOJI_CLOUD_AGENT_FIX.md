# Fix Amoji Cloud Agent start error

Error: `Expected object, received number` at `ports[0]` — caused by invalid `.cursor/environment.json` on **amoji_engine_02**.

## Correct file

Copy from [`patches/amoji_engine_02.cursor.environment.json`](../patches/amoji_engine_02.cursor.environment.json) into:

https://github.com/MonMonMars/amoji_engine_02/blob/main/.cursor/environment.json

**One-click edit:** https://github.com/MonMonMars/amoji_engine_02/edit/main/.cursor/environment.json

## Let Cursor Cloud push for you (recommended)

1. Open https://github.com/settings/installations
2. Click **Cursor** (or **Cursor Cloud Agent**)
3. **Repository access** → add **`amoji_engine_02`**
4. Tell your Cloud Agent: *“Amoji repo access granted — push the environment.json fix”*

## After fix

New Cloud Agent → **MonMonMars/amoji_engine_02** → branch **main** → first message:

```
Read AGENTS.md. Run npm run verify:pre-delivery. Report AMOJI_BUILD vs Vercel /api/health.
```

Send **one** message; wait for completion before follow-ups.
