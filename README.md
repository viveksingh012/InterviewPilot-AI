# InterviewPilot-AI

An AI-powered mock interview platform. Candidates create a custom interview
(role, experience level, topics, difficulty), the AI interviewer asks
questions, follows up dynamically on thin answers, evaluates each response,
and generates a full performance report at the end.

Stack: **React (Vite)** + **Node.js / Express** + **PostgreSQL**, built to
match the PRD's architecture (controller → service → DB, isolated AI service
layer, JWT auth, strict resource ownership).

This has been built and smoke-tested end-to-end (register → create → start →
answer → follow-up → complete → report → dashboard) against a real
PostgreSQL instance.

---

## 1. Project structure

```
interviewpilot-ai/
├── server/                 # Express API
│   ├── src/
│   │   ├── config/db.js        # PostgreSQL connection pool
│   │   ├── controllers/        # Thin HTTP handlers
│   │   ├── services/           # Business logic (auth, interviews, sessions, AI, evaluation)
│   │   ├── middleware/         # JWT auth, error handling
│   │   ├── routes/             # Route definitions
│   │   ├── db/schema.sql       # Full Postgres schema
│   │   ├── db/migrate.js       # Runs schema.sql against DATABASE_URL
│   │   └── server.js           # App entry point
│   ├── .env.example
│   └── package.json
│
└── client/                 # React (Vite) frontend
    ├── src/
    │   ├── pages/               # Home, Login, Register, Dashboard, Interviews,
    │   │                        # CreateInterview, InterviewDetail, InterviewSession,
    │   │                        # InterviewReport, NotFound
    │   ├── components/          # Navbar, ProtectedRoute, ScoreBadge, ErrorBanner
    │   ├── context/AuthContext.jsx
    │   ├── services/            # api.js, authService.js, interviewService.js
    │   └── index.css            # Design system (tokens, components)
    ├── .env.example
    └── package.json
```

---

## 2. Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local install, Docker, or a hosted instance like Supabase/Neon/RDS)

---

## 3. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interviewpilot

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

# AI_PROVIDER controls which LLM is used to run interviews:
#   "mock"      -> no API key needed, deterministic canned responses (default, great for local dev/demo)
#   "openai"    -> set OPENAI_API_KEY (and optionally OPENAI_MODEL)
#   "anthropic" -> set ANTHROPIC_API_KEY (and optionally ANTHROPIC_MODEL)
AI_PROVIDER=mock
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

Create the database, then run the migration:

```bash
# if using local Postgres:
createdb interviewpilot

npm run migrate     # applies server/src/db/schema.sql
npm run dev          # starts the API on http://localhost:5000
```

Health check: `curl http://localhost:5000/api/health`

### Switching on real AI

Set `AI_PROVIDER=openai` or `AI_PROVIDER=anthropic` and add the matching API
key. The AI service (`src/services/aiService.js`) is fully isolated behind
one function, `completeJSON(systemPrompt, userPrompt)` — swapping providers
or adding a new one (e.g. a local model) only touches that one file, per the
PRD's scalability requirement (§28, §33).

---

## 4. Frontend setup

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev             # starts on http://localhost:5173
```

The Vite dev server also proxies `/api/*` to `http://localhost:5000`, so the
frontend works even without setting `VITE_API_URL` explicitly during local
development.

Open **http://localhost:5173**.

---

## 5. Using the app

1. Register an account.
2. From the dashboard, click **Create new interview** — pick a role,
   experience level, interview type, difficulty, topics, and optionally
   custom instructions.
3. Click **Start interview**. The AI generates the initial question set.
4. Answer each question. If an answer is thin or ambiguous, the AI inserts a
   follow-up question right after it — this is visible live in the
   transcript.
5. Once all questions are answered, click **Finish and get my report** (or
   **End interview now** at any point to force-complete early).
6. View your score breakdown, strengths, weaknesses, recommendations, and
   question-by-question feedback on the report page.
7. Return to **Interviews** to see history, or **Dashboard** to track your
   average score and weak topics over time.

---

## 6. API reference

All `/api/interviews/*` and `/api/dashboard` routes require
`Authorization: Bearer <token>`.

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

POST   /api/interviews
GET    /api/interviews
GET    /api/interviews/:id
PATCH  /api/interviews/:id
DELETE /api/interviews/:id

POST   /api/interviews/:id/start
POST   /api/interviews/:id/answer     { questionId, answer }
POST   /api/interviews/:id/next
POST   /api/interviews/:id/complete   { force?: boolean }
GET    /api/interviews/:id/report

GET    /api/dashboard
```

Every response follows `{ success, data | message }`. Errors use standard
HTTP status codes (400/401/403/404/409/422/429/500) as specified in the PRD.

---

## 7. Security notes

- Passwords are hashed with bcrypt (cost factor 12).
- JWT is verified on every protected request; `req.user` is derived from the
  **token**, never from the request body — client-supplied `userId` values
  are never trusted.
- Every interview/question/answer lookup checks `user_id` ownership before
  returning data (`getOwnedInterview` in `interviewService.js`); a user
  requesting another user's interview ID gets `403 Forbidden`, verified in
  testing.
- Rate limiting (`express-rate-limit`) and `helmet` are enabled by default.
- AI provider API keys live only in the backend `.env` and are never sent to
  the client.

---

## 8. Known scope (matches PRD §4 Non-Goals for V1)

Not included in this build, called out explicitly as future work: recruiter
dashboard, payments, live video avatar, voice interviews, multi-company
admin. The mock AI provider is a stand-in for a real LLM call — swap
`AI_PROVIDER` to `openai` or `anthropic` with a valid key for real dynamic
question generation and evaluation.

---

## 9. Deployment

- **Backend**: any Node host (Render, Railway, Fly.io, EC2, etc). Set the
  env vars from `.env.example`, point `DATABASE_URL` at your production
  Postgres, run `npm run migrate` once, then `npm start`.
- **Frontend**: `npm run build` produces a static `dist/` you can deploy to
  Vercel, Netlify, Cloudflare Pages, or any static host. Set
  `VITE_API_URL` to your deployed backend's URL at build time.
- **Database**: any managed Postgres (Supabase, Neon, RDS, Railway).
