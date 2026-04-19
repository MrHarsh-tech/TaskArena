# TaskArena — Legacy → MERN Migration Analysis

## 📁 Project Overview

| | Legacy (`_legacy`) | MERN Stack (current) |
|---|---|---|
| **Frontend** | Next.js 14 + TypeScript + Tailwind | React 18 + Vite + Tailwind |
| **Backend** | Next.js API Routes (serverless) | Express.js + Node.js |
| **Database** | PostgreSQL via Prisma ORM | MongoDB via Mongoose |
| **Auth** | NextAuth.js (session-based) | JWT (localStorage) |
| **Validation** | Zod | Manual checks |
| **Styling** | Tailwind + custom design tokens | Plain Tailwind utilities |

---

## 🏗️ Architecture Comparison

### Legacy (`_legacy/src/app/`)
```
app/
├── page.tsx                    ← Landing page (hero, features, CTA)
├── layout.tsx                  ← Root layout + Navbar
├── globals.css                 ← Full design system (tokens, animations)
├── dashboard/page.tsx          ← 29 KB full analytics dashboard
├── challenges/
│   ├── page.tsx                ← Challenge listing
│   ├── [id]/page.tsx           ← Challenge detail + attempt (21 KB)
│   └── create/page.tsx         ← Create challenge
├── leaderboard/page.tsx        ← 9.9 KB rich leaderboard
├── quick-play/page.tsx         ← 16.8 KB quick play with countdown
├── login/page.tsx
├── register/page.tsx
└── api/
    ├── auth/[...nextauth]/     ← NextAuth
    ├── auth/register/
    ├── challenges/route.ts     ← GET list + POST create
    ├── challenges/[id]/route.ts ← GET + PUT + DELETE (soft)  
    ├── challenges/[id]/attempt/route.ts ← POST + GET (grading engine)
    ├── dashboard/route.ts      ← Progress + recent + active paths
    ├── dashboard/student-analytics/route.ts  ← Full analytics
    ├── dashboard/instructor-analytics/route.ts ← Full analytics
    ├── leaderboard/route.ts    ← Global + per-challenge
    ├── learning-paths/         ← (exists in API folder)
    ├── quick-play/             ← (exists in API folder)
    ├── bookmarks/
    ├── categories/
    └── rewards/route.ts        ← Mystery reward system
```

### MERN Stack (current)
```
server/
├── server.js                   ← Express + Mongoose setup
├── middleware/auth.js          ← JWT protect + instructor guard
├── models/
│   ├── User.js                 ✅ Complete
│   ├── Challenge.js            ✅ Complete
│   ├── Question.js             ✅ Complete
│   ├── Attempt.js              ✅ Complete
│   ├── Progress.js             ✅ Complete
│   └── LearningPath.js         ✅ Complete
├── controllers/
│   ├── authController.js       ✅ register + login + getMe
│   ├── challengeController.js  ✅ list + detail + create + submitAttempt
│   ├── dashboardController.js  ⚠️  MINIMAL — only basic stats  
│   ├── leaderboardController.js ⚠️ MINIMAL — XP-only ranking
│   ├── pathsController.js      ✅ getLearningPaths + getPathById
│   └── quickPlayController.js  ✅ getMysteryChallenge
└── routes/
    ├── auth.js                 ✅ register + login + me
    ├── challenges.js           ✅ CRUD + attempt
    ├── dashboard.js            ⚠️  Only /dashboard
    ├── leaderboard.js          ✅ route exists
    ├── paths.js                ✅ route exists
    └── quickPlay.js            ✅ route exists

client/src/
├── context/AuthContext.jsx     ✅ login + register + logout + me
├── components/Navbar.jsx       ✅ exists (need to verify quality)
├── pages/
│   ├── Dashboard.jsx           ⚠️  Basic — missing analytics, level/XP card
│   ├── Challenges.jsx          ✅ List + filter by difficulty (basic)
│   ├── ChallengeDetail.jsx     ✅ MCQ + Fill-in-blank + submit + result
│   ├── CreateChallenge.jsx     ✅ Full question builder
│   ├── Leaderboard.jsx         ⚠️  Basic — XP-sorted, missing avg score/per-challenge
│   ├── QuickPlay.jsx           ⚠️  Button only — missing countdown timer
│   ├── LearningPaths.jsx       ⚠️  List only — missing path detail + progress
│   ├── Login.jsx               (present)
│   └── Register.jsx            (present)
└── App.jsx                     ✅ All routes wired
```

---

## ✅ What Is Already Done (MERN)

| Feature | Status | Notes |
|---|---|---|
| **User Registration** | ✅ Done | bcrypt hash, JWT token, Progress auto-created |
| **User Login** | ✅ Done | JWT 30-day expiry |
| **Auth Middleware** | ✅ Done | `protect` + `instructor` guards |
| **Auth Context (client)** | ✅ Done | login, register, logout, me fetch |
| **All Mongoose Models** | ✅ Done | User, Challenge, Question, Attempt, Progress, LearningPath |
| **List Challenges** | ✅ Done | Published only, creator populated |
| **Challenge Detail + Questions** | ✅ Done | Questions fetched separately |
| **Create Challenge (Instructor)** | ✅ Done | MCQ + Fill-in-blank questions via Question.insertMany |
| **Submit Attempt** | ✅ Done | Grading, XP, Progress update |
| **Basic Dashboard** | ✅ Done | XP, completed, avg score, streak, recent attempts |
| **Quick Play** | ✅ Done | Random published challenge |
| **Learning Paths List** | ✅ Done | Published paths with steps |
| **Leaderboard (basic)** | ✅ Done | Sorted by XP |
| **All Routes Wired** | ✅ Done | Express server + React Router |

---

## ❌ What Is Missing (Needs Porting from Legacy)

### 🔴 HIGH PRIORITY — Core Missing Features

#### 1. Landing/Home Page (`/`)
- **Legacy:** 250-line rich hero section with features grid, "How it works", CTA section, social proof stats
- **MERN:** Dashboard is shown at `/` — **No landing page exists** for logged-out users
- **Action:** Create `Home.jsx` page, update `App.jsx` routing (show dashboard if logged in, landing if not)

#### 2. Dashboard — Student Analytics (CRITICAL GAP)
- **Legacy:** `GET /api/dashboard/student-analytics` returns:
  - Score trend (last 10 attempts line chart)
  - Category performance radar  
  - Difficulty breakdown
  - Weekly activity heatmap (28 days)
  - Strengths & weaknesses
  - Completion rate (completed vs abandoned)
  - Time spent stats
- **MERN server:** `dashboardController.js` returns **only** `stats + recentAttempts` — no analytics
- **MERN client:** `Dashboard.jsx` shows **only 4 stat cards** — no charts, no analytics
- **Action:** Add `GET /api/dashboard/student-analytics` route + controller, add Recharts to client

#### 3. Dashboard — Instructor Analytics (COMPLETELY MISSING)
- **Legacy:** `GET /api/dashboard/instructor-analytics` returns:
  - Overview (challenges, students reached, pass rate, total attempts)
  - Challenge performance table
  - Score distribution buckets
  - Question difficulty analysis
  - Completion funnel
  - Engagement timeline (30 days)
  - Hardest questions top-5
  - Fill-in-blank wrong answer analysis
- **MERN:** **0% implemented** — no route, no controller, no client page
- **Action:** Full implementation needed

#### 4. Leaderboard — Full Featured
- **Legacy:** Supports both **global** (by avg score from Progress) AND **per-challenge** (best attempt per user with dedup)
- **MERN server:** Only XP-sorted `User.find()` — doesn't use Progress at all, no per-challenge
- **MERN client:** Shows XP/Level only — missing avg score, total attempts, challenges completed columns
- **Action:** Rewrite `leaderboardController.js` + enhance `Leaderboard.jsx`

#### 5. Challenge Detail — Missing Features
- **Legacy:** Shows creator name, category, time limit, max attempts counter, bookmarks count
- **MERN client:** Shows "By Instructor" hardcoded — creator not displayed, no metadata
- **Legacy result screen:** Shows XP multiplier, mystery reward toast, path progress notification
- **MERN result screen:** Shows basic score + XP only
- **Action:** Enhance `ChallengeDetail.jsx`

#### 6. Quick Play — Missing Countdown Timer
- **Legacy:** 16.8 KB page with animated countdown, difficulty selector, category filter, streak tracking
- **MERN:** 44-line page — just a button that redirects
- **Action:** Enhance `QuickPlay.jsx` with timer and filters

#### 7. Learning Path Detail Page (MISSING ROUTE)
- **Legacy:** Path detail with step-by-step progress, per-step challenge links, XP bonus display
- **MERN:** `LearningPaths.jsx` has links to `/paths/:id` but **that route has no page component**
- **Action:** Create `LearningPathDetail.jsx` page + add route in `App.jsx`

### 🟡 MEDIUM PRIORITY — Quality/Polish

#### 8. Bookmarks System (NOT PORTED)
- **Legacy:** `GET/POST/DELETE /api/bookmarks` — full bookmark management
- **MERN:** No route, no model, no UI
- **Action:** Add Bookmark model, API route, and bookmark button on challenge cards

#### 9. Categories System (NOT PORTED)
- **Legacy:** `GET /api/categories` — categories with iconName, color, slug
- **MERN:** No Category model exists (only referenced in Challenge)
- **Dashboard filter:** Challenges page has no category filter
- **Action:** Create Category model + seeder + filter UI

#### 10. Reward/Mystery System (NOT PORTED)
- **Legacy:** Full `mystery-rewards.ts` lib + `GET /api/rewards` — XP multipliers, badges
- **MERN:** XP is awarded but no mystery reward rolls, no reward toasts, no badge system
- **Action:** Port reward logic to `rewardService.js` + add to `submitAttempt`

#### 11. Challenge PUT/DELETE (Soft-Archive) Missing
- **Legacy:** `PUT /api/challenges/[id]` (update) + `DELETE` (soft-archive with `archivedAt`)
- **MERN:** No update/delete routes — the route file only has GET + POST + attempt
- **Action:** Add to `challenges.js` routes + `challengeController.js`

#### 12. Challenges — Filtering/Search (MISSING)
- **Legacy:** Supports `?difficulty=`, `?tag=`, `?search=`, `?categoryId=`, `?creatorId=` query params
- **MERN:** Returns all published challenges with no filtering
- **Action:** Add query param filtering to `getChallenges()`

#### 13. User Profile / Avatar
- **Legacy:** `avatarUrl` field used throughout — displayed in leaderboard, challenge creator
- **MERN:** `avatarUrl` field exists in model but never displayed anywhere in UI
- **Action:** Add avatar display to Navbar, leaderboard, challenge cards

### 🟢 LOW PRIORITY — Nice to Have

#### 14. Design System / Overall UI Quality
- **Legacy:** Rich `globals.css` with CSS custom properties, gradient tokens, `mesh-gradient`, animations, `glass-card`, `btn-primary` etc.
- **MERN:** Basic Tailwind classes — no custom design tokens, looks plain
- **Action:** Port the design system from `_legacy/src/app/globals.css` to `client/src/index.css`

#### 15. Navbar Quality
- **Legacy:** 7.1 KB full navbar with dark mode toggle, XP/level display, mobile hamburger menu
- **MERN:** `Navbar.jsx` is 2.2 KB — likely basic (need to check quality)

#### 16. `404 Not Found` Page
- **Legacy:** Has route handling and graceful 404
- **MERN:** No fallback route

---

## 🔧 Bug/Issues Found in Current MERN Code

| # | Location | Issue |
|---|---|---|
| 1 | `ChallengeDetail.jsx:76` | `result.attempt.percentage` — the server returns `attempt` nested inside response, but `submitAttempt` controller returns `{ attempt, xpEarned, newXp, newLevel }`. So `result.attempt.percentage` is correct. But need to verify question `text` vs `body` field name mismatch (legacy uses `body`, MERN model uses `text`) |
| 2 | `challengeController.js:29` | `{ ...challenge.toObject(), questions }` — this works but question options use subdocument `_id` as ObjectIds. On client `ChallengeDetail.jsx:145`, option text is accessed as `option.text` which matches the model. ✅ |
| 3 | `dashboardController.js:9` | Returns 404 if no Progress found — should return 200 with zero defaults instead (new users will see error) |
| 4 | `App.jsx` | No protected route wrapper — unauthenticated users can navigate to `/challenges/create`, `/dashboard` etc. directly |
| 5 | `challengeController.js:94` | `answer.selectedOptionId.toString()` will throw if `selectedOptionId` is null/undefined for fill-in-blank answers |
| 6 | `server.js:12` | `app.use(cors())` with no origin config — allows all origins (fine for dev, needs restriction for production) |
| 7 | `middleware/auth.js:19-21` | If no token, still reaches the `if (!token)` block even if token was invalid (error was caught above) — should return after catch to avoid double response |

---

## 📊 Migration Completion Estimate

| Category | Complete |
|---|---|
| **Backend Models** | 100% ✅ |
| **Auth System** | 100% ✅ |
| **Basic CRUD** | 80% ⚠️ |
| **Analytics / Advanced API** | 15% ❌ |
| **Frontend Pages** | 60% ⚠️ |
| **UI/Design Quality** | 40% ⚠️ |
| **Overall** | **~55%** |

---

## 🗺️ Recommended Implementation Order

### Phase 1 — Fix Bugs + Core Gaps
1. Fix `dashboardController.js` — return 200 with defaults if no Progress
2. Fix `auth.js` middleware double-response bug
3. Add protected route wrapper in `App.jsx`
4. Add Landing/Home page (`Home.jsx`)
5. Add challenge soft-delete and update routes

### Phase 2 — Student Analytics
6. Add `GET /api/dashboard/student-analytics` endpoint
7. Install `recharts` in client
8. Enhance `Dashboard.jsx` with score trend chart + weekly heatmap + category performance

### Phase 3 — Leaderboard + Challenges Enhancement
9. Rewrite `leaderboardController.js` — use Progress model, add per-challenge mode
10. Enhance `Leaderboard.jsx` — avg score, challenges completed columns
11. Add challenge filtering to `getChallenges()` + filter UI in `Challenges.jsx`
12. Enhance `ChallengeDetail.jsx` — show creator, metadata, better result screen

### Phase 4 — Missing Features
13. Create `LearningPathDetail.jsx` page + route
14. Enhance `QuickPlay.jsx` with countdown timer
15. Port Instructor Analytics dashboard
16. Add Bookmarks model + API + UI

### Phase 5 — Design Polish
17. Port design system from `_legacy/globals.css` to `client/src/index.css`
18. Enhance Navbar quality
19. Add 404 page
20. Add mystery reward system
