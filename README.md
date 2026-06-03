# 👑 Math Kingdom Adventure

> The RPG that makes maths feel like an adventure — designed to help children prepare for UK Grammar School 11+ entrance exams.

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/math-kingdom-adventure/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/math-kingdom-adventure/actions/workflows/deploy.yml)

**[▶ Play Now](https://YOUR_USERNAME.github.io/math-kingdom-adventure/)**

---

## 🎮 What is this?

Math Kingdom Adventure is a free, open-source Progressive Web App (PWA) where children battle monsters by answering maths questions. It covers the **full UK curriculum from Year 3 to Year 11**, with special focus on the **11+ Grammar School entrance exam** syllabus.

- ⚔️ RPG-style battles — correct answers deal damage to monsters
- 🔥 Combo system — consecutive correct answers multiply your damage
- 🗺️ 8 world regions — each covering different maths topics
- 🎒 Equipment & pets — collectible items that boost your stats
- 📊 Parent dashboard — track progress by topic, set daily limits
- 📱 PWA — install on tablet or phone, works offline

---

## 📚 Curriculum Coverage

| Region | Year Level | Topics |
|--------|-----------|--------|
| 🌲 Greenleaf Forest | Year 3 | Addition, subtraction, multiplication |
| 🦇 Shadowbat Caverns | Year 3–4 | Times tables, division, decimals |
| 🏰 Number Castle | Year 4–5 | Long division, fractions, BODMAS |
| 🌋 Fraction Volcano | Year 5 | Fractions, percentages, negative numbers |
| ❄️ Percentage Peaks | Year 5–6 | Percentages, ratio, worded problems |
| 🌊 Algebra Ocean | Year 6 | Algebra, sequences, worded problems |
| ⚡ Geometry Fortress | Year 6 | Geometry, angles, coordinates, statistics |
| 🌑 Shadow Lair | Year 6 / 11+ | All topics, timed — final boss |

**11+ specific features:**
- Multi-step worded problems (most common failure point in 11+)
- Timed questions matching GL Assessment / CEM exam conditions
- Bronze → Silver → Gold adaptive difficulty per topic
- Topics calibrated against GL Assessment, CEM, CSSE and ISEB syllabuses

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/math-kingdom-adventure.git
cd math-kingdom-adventure
npm install
npm run dev
```

Open [http://localhost:5173/math-kingdom-adventure/](http://localhost:5173/math-kingdom-adventure/)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to GitHub Pages (Free)

1. Fork this repository
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push to `main` branch — GitHub Actions will build and deploy automatically
4. Your app will be live at `https://YOUR_USERNAME.github.io/math-kingdom-adventure/`

> **Important:** Update `base` in `vite.config.ts` to match your repository name if different.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Zustand 4 | State management |
| vite-plugin-pwa | PWA / Service Worker |
| LocalStorage | Save data (no backend needed) |

---

## 📁 Project Structure

```
src/
├── components/         # All React components by screen
│   ├── battle/        # Battle screen (core gameplay)
│   ├── map/           # World map & region detail
│   ├── menu/          # Main menu
│   ├── onboarding/    # Splash, welcome, name entry
│   ├── collection/    # Equipment & pets
│   ├── shop/          # Item shop
│   ├── challenges/    # Daily challenges
│   ├── parent/        # Parent PIN + dashboard
│   ├── achievements/  # Achievements screen
│   └── levelup/       # Level-up screen
├── engine/
│   └── questionGenerators/  # Algorithmic question generation
├── store/             # Zustand global state
├── data/              # Static game data (monsters, regions, items)
├── types/             # TypeScript interfaces
└── styles/            # Global CSS + animations
```

---

## 🗺️ Roadmap

### v1 (Current — MVP)
- [x] Full question engine (Y3–Y6 topics)
- [x] Battle system with combo
- [x] 3 playable regions
- [x] Equipment & pet systems
- [x] Parent mode
- [x] PWA offline support
- [x] GitHub Pages deployment

### v2 (Planned)
- [ ] All 8 regions complete
- [ ] Full 11+ question bank (worded, geometry, statistics)
- [ ] Sound effects & music
- [ ] Custom illustrated sprites (replacing emoji)
- [ ] Multiple child profiles

### v3 (Future)
- [ ] Scholar's Tower mode (Year 7–11)
- [ ] AI-powered hints (personalised explanations)
- [ ] Predicted 11+ readiness score
- [ ] Teacher / class mode

---

## 👨‍👩‍👧 For Parents

Math Kingdom Adventure is:
- **100% free** — no ads, no in-app purchases, no subscriptions
- **Private** — all data stays on your device; nothing is sent to any server
- **Safe** — no social features, no chat, no external links
- **Curriculum-aligned** — every question maps to UK National Curriculum standards

The **Parent Mode** (accessible via ⚙️ Settings) lets you:
- Set a daily time limit
- Adjust question timer (relaxed / normal / challenge)
- View accuracy by topic
- See suggested focus areas based on your child's weak spots

---

## 📄 Licence

MIT — free to use, modify, and distribute.

---

*Built with ❤️ to make maths genuinely enjoyable for children preparing for UK Grammar School entrance exams.*
