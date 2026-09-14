# Spark — Trust & Verification Policy

**Effective date:** 14 September 2026  
**Last updated:** 14 September 2026  
**Applies to:** Spark mobile and web applications (the “Service”)

---

## 1. Purpose

This Trust & Verification Policy explains what Spark’s verification badges mean, how verification checks are performed, what data we collect, how long we keep it, and the limits of what verification does **not** guarantee.

Verification is designed to increase trust between members. It is **not** a background check, criminal screening, or guarantee of a person’s identity, character, or safety.

---

## 2. Verification types

Spark may offer up to three separate badges. Each badge is granted only after the corresponding check passes.

| Badge | Label in app | What it means |
|-------|----------------|---------------|
| Photo verified | **Photo verified** | A live selfie taken in the app was compared to the member’s profile photos and judged to be the same person. |
| Real person verified | **Real person** | A liveness check confirmed a real human was present (e.g. blink, head turn, pose match). Helps reduce bots and fake accounts. |
| Age verified | **Age 18+** | A government-issued ID was reviewed and the member was confirmed to be at least 18 years old. |

A member may display one, two, or all three badges. **“Fully verified”** in the app means both **Photo verified** and **Real person** badges are active.

---

## 3. How each check works

### 3.1 Photo verification

1. The member is prompted to take a real-time selfie in the app.  
2. Our systems (or a third-party identity provider) compare facial features in the selfie to the member’s uploaded profile photos.  
3. If the match score meets our threshold, the **Photo verified** badge is granted.  
4. If the match fails, the badge is not granted and the member may retry after a cooling-off period.

**You may be asked to re-verify** if you change your primary profile photo or if we detect a possible mismatch.

### 3.2 Real person (liveness) verification

1. The member completes a short guided scan (camera on, follow on-screen prompts).  
2. Liveness technology checks that the subject is a live person and not a photo, video replay, or mask.  
3. On success, the **Real person** badge is granted.

This check is separate from photo verification: it confirms *a real human* was present, not necessarily that their photos match (that is photo verification).

### 3.3 Age verification (18+)

1. The member submits images of a valid government-issued photo ID through a secure flow.  
2. A regulated identity provider extracts date of birth and confirms the member is 18 or older.  
3. On success, the **Age 18+** badge is granted.

We instruct providers to **minimize retention** of ID images where possible. Spark stores verification *status* (pass/fail and date), not full ID documents, unless law requires otherwise.

---

## 4. Data we collect for verification

| Data type | Used for | Typical retention |
|-----------|----------|-------------------|
| Live selfie / liveness video frames | Photo & real-person checks | Deleted after decision, or per provider policy (usually ≤ 30 days) |
| Facial geometry / match scores | Photo verification | Hashed or deleted after decision |
| Government ID images | Age verification | Deleted by provider after check; Spark stores status only |
| Verification timestamps & badge status | Display badges, fraud prevention | Life of account + legal hold if required |

We process this data to perform the Service, prevent fraud, and comply with law. See our Privacy Policy for broader data practices.

---

## 5. Third-party providers

Spark may use specialized identity vendors (e.g. Onfido, FaceTec, Yoti, or similar) to perform checks. Those providers act as **processors** under contract and must meet security and privacy standards. They may not use your verification data for their own marketing.

---

## 6. Your consent

By starting a verification flow, you consent to:

- Capturing and processing your biometric and identity data as described above  
- Automated comparison of your selfie to your profile photos  
- Storage of verification **status** on your account  

You may **decline** verification; some features (e.g. “Verified only” filter, boosted visibility) may be unavailable without badges.

---

## 7. What verification does NOT mean

- **Not a background check** — we do not search criminal records or sex-offender registries via these badges.  
- **Not a guarantee of safety** — always use your judgment, meet in public, and use in-app report/block tools.  
- **Not permanent** — badges may be revoked if photos change, fraud is suspected, or checks expire.  
- **Not transferable** — badges apply only to the account that completed verification.

---

## 8. Revocation and appeals

We may remove badges if:

- Profile photos no longer match the verified selfie  
- Liveness or ID fraud is suspected  
- A member is banned for policy violations  

Members may contact **support@spark.app** to appeal a revocation. We will review within a reasonable time.

---

## 9. Demo / prototype builds

Prototype and demo builds of Spark may **simulate** verification (e.g. tap “Verify (demo)”) without real biometric or ID processing. In those builds, badges are for **demonstration only** and do not represent actual identity assurance. Production releases will use live vendor checks as described above.

---

## 10. Children

Spark is for adults **18+** only. We do not knowingly verify or permit accounts for anyone under 18.

---

## 11. Changes to this policy

We may update this policy. Material changes will be communicated in-app or by email where required. Continued use after the effective date constitutes acceptance.

---

## 12. Contact

**Spark Trust & Safety**  
Email: support@spark.app  

For EU/UK data subject requests, include “Verification data request” in the subject line.

---

*This document is provided for transparency and product design. It does not constitute legal advice. Consult qualified counsel before relying on it in a production launch.*
