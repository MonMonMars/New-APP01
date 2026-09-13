# Spark — Public Web Preview

Try the app in **any browser** (phone, laptop, tablet) using these links.

## Live preview (Cloudflare)

**https://lenses-interpreted-towns-languages.trycloudflare.com**

> This link works outside Cursor. It forwards to the dev server running in the cloud workspace.  
> Tunnels are **temporary** — if the link stops working, ask to regenerate it.

### How to test special effects

1. Complete onboarding (tap through welcome → rules → location → profile).
2. On **Discover**, drag a profile card to:
   - **Trash** (bottom-left) → red flash + particle burst + whoosh sound
   - **Heart** (bottom-right) → green flash + hearts burst + chime sound
3. Or **tap** the trash/heart buttons directly.
4. **Sound:** click anywhere on the page first (browser autoplay rule), then like/pass again.

### Alternate link (LocalTunnel)

**https://five-lizards-hang.loca.lt**

First visit may show a “Click to Continue” page — tap through it.

---

## Run locally on your machine

For a permanent setup on your computer:

```bash
git clone https://github.com/MonMonMars/New-APP01.git
cd New-APP01
npm install
npm run web
```

Open http://localhost:8081

## Phone (best experience)

```bash
npm start
```

Scan the QR code with **Expo Go** — drag, haptics, and sound work best on a real device.
