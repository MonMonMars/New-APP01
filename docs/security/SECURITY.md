# Spark — Security architecture

**Last updated:** 14 September 2026

This document describes privacy and security controls in Spark / Pulse. It is for engineering and compliance review — not legal advice.

---

## Threat model (summary)

| Threat | Mitigation in app |
|--------|-------------------|
| Shoulder surfing / public use | Pulse disguise mode, app lock (biometric/PIN), auto-disguise on background |
| Device theft / local access | Keychain/SecureStore for auth tokens; encrypted local vault for chats |
| Lock-screen leaks | Disguise-safe notification copy while in Pulse |
| Client secret extraction | OpenAI key disabled in production builds; use server proxy |
| XSS / injection in chat | Input sanitization + length limits |
| Abuse / spam | Client rate limits (server limits required for production) |
| Session hijack (web demo) | Treat web as demo-only; mobile uses SecureStore for Supabase session |

---

## Implemented controls

### 1. App lock (`src/utils/appLock.ts`)

- **Biometric** — Face ID / Touch ID via `expo-local-authentication`
- **PIN fallback** — SHA-256 hash stored in SecureStore (never plaintext)
- Required before **leaving Pulse** / opening Spark when enabled
- Settings: **Safety Center → Security settings**

### 2. Secure storage (`src/utils/secureStorage.ts`)

- Supabase auth session in **Keychain / SecureStore** (not plaintext AsyncStorage)
- PIN hash and vault encryption key in SecureStore
- Web fallback uses `localStorage` (demo only — not for production dating data)

### 3. Encrypted local vault (`src/utils/localEncryption.ts`)

- Conversations and spark notes stored in `@spark/sensitive_vault`
- Obfuscated with device-bound key from SecureStore
- **Note:** This is device-local protection, not end-to-end encryption between users

### 4. Auto-disguise & session timeout

- Optional switch to Pulse when app backgrounds
- Optional re-lock after 5 minutes in background

### 5. Input guards (`src/utils/securityGuards.ts`)

- Strip HTML/control characters from messages and reports
- Per-conversation message rate limit (client-side)
- Report rate limit

### 6. Web deploy headers (`vercel.json`)

- `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

### 7. AI disguise generation

- `EXPO_PUBLIC_OPENAI_API_KEY` is **ignored in production builds**
- Use a **Supabase Edge Function** or API gateway with auth + rate limits

---

## Production checklist (not yet fully implemented)

- [ ] Server-side matching, likes, blocks, reports (Edge Functions + RLS)
- [ ] Private photo bucket + signed URLs (not public `profile-photos`)
- [ ] Apple/Google receipt validation before `is_spark_plus`
- [ ] Account deletion Edge Function (delete `auth.users` + storage)
- [ ] WAF / DDoS protection on API
- [ ] Penetration test before public launch
- [ ] Bug bounty / security@ email in SECURITY.md

---

## Reporting vulnerabilities

Email **security@spark.app** (replace with your address). Do not disclose publicly until patched.

---

## Related docs

- [Privacy Policy](../legal/PRIVACY_POLICY.md)
- [Disguise Mode Policy](../legal/DISGUISE_MODE_POLICY.md)
- [Supabase schema](../supabase-schema.sql)
