# 🚦 Red Light, Green Light (RLGL)

**Red Light, Green Light (RLGL)** is a modern, high-performance, discrete SaaS web application designed for real-time location coordination, booth availability tracking, and preference matchmaking at adult entertainment venues.

---

## 🌟 Key Features

* 📍 **Venue & Location Discovery:** Integrated map and geofenced venue finder (*Adult World Lawrenceville, Painted Post, Elmira, Binghamton*).
* 🚦 **Red Light / Green Light Status Protocol:** Real-time visibility indicators:
  * 🟢 **Green Light:** Active / Available Now
  * 🟡 **Yellow Light:** Arriving Soon
  * 🔴 **Red Light:** Occupied / Busy
* 🤝 **Preference Protocol Matrix:** Clear preference options (`GIVE`, `RECEIVE`, `GIVE_OR_RECEIVE`, `HANGOUT / WATCH VIDEOS`).
* 🔒 **Privacy & Safety First:**
  * Anonymous discrete handles (*e.g., `NeonKnight99`*).
  * **Panic Hide Button:** One-tap instant UI mask to National Weather Service radar.
  * Auto-expiring timeslots and zero-log messaging.
* 💳 **$5/Month Membership Model:** Integrated Stripe recurring subscription architecture.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 14+ (App Router / TypeScript / React 18)
* **Styling:** Tailwind CSS + Lucide Icons (Dark-mode luxury aesthetic)
* **Database ORM:** Prisma ORM + PostgreSQL Schema
* **Payment Engine:** Stripe Subscriptions ($5/mo recurring billing)

---

## 🚀 Skywalker Development Workflow & Local Setup

### 1. The Skywalker Local Gauntlet
```bash
# Run lint, TypeScript check, and Next.js production build
npm run lint
npx tsc --noEmit
npm run build
```

### 2. Version Bumping & Development Branching
Always create feature branches (`feature/your-feature-name`), pass the Local Gauntlet, commit changes, and merge via pull request.

---

## 📄 License
Private SaaS Platform — All Rights Reserved.
