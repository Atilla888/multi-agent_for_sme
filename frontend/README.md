# Frontend

P5A–P5G/H implement the approved screen coverage. P5I adds real Keycloak authentication and available safe FastAPI reads; unsupported capabilities remain explicitly labelled fixtures or unavailable states. See the [P5I report](../docs/frontend/P5I_FULLSTACK_INTEGRATION_IMPLEMENTATION.md) and [final capability matrix](../docs/frontend/P5I_FINAL_CAPABILITY_MATRIX.md).

## Requirements

- Node.js 24.12.0 LTS (see `.nvmrc`; supported range `>=24.12.0 <25`)
- npm 11.6.2 or a compatible npm release supplied with Node 24
- the existing FastAPI platform when exercising real API calls

Use npm only. The committed `package-lock.json` is the dependency authority for this frontend.

## Setup

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000` to match APP_ORIGIN. The root redirects to protected `/overview`; staff routes require real sign-in. `/chat` remains a separate unconfigured customer preview.

## Commands

```bash
npm run dev        # Next.js development server
npm run build      # production build and route generation
npm run start      # serve a completed production build
npm run lint       # ESLint, including Next.js and TypeScript rules
npm run typecheck  # strict TypeScript check without output
npm test           # Vitest unit/component smoke tests
npm run preview    # render every screen with sample data to .preview/*.html for design review
```

Vitest was selected because the foundation needs fast TypeScript unit and server-rendered component checks, not a heavyweight browser/E2E stack. No Redux, forms framework, chart library, or API-codegen tool is installed in P5A.

## Environment

`NEXT_PUBLIC_API_BASE_URL` is required before an API request is made. For local development the example uses:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

`.env.local` and other real environment files are ignored. Never place credentials, access tokens, client secrets, or real tenant data in a `NEXT_PUBLIC_*` variable.

## Backend and identity boundaries

Available health routes are:

- `GET /health/live`
- `GET /health/ready`

P5I adds authenticated `GET /me`, `/products`, `/products/{id}`, `/inventory`, `/customers/{id}`, `/orders/{id}` and `/analytics/sales` over existing services. The WhatsApp demo adds `GET /conversations` and `GET /conversations/{id}`, which the Inbox reads when a staff member is signed in (see [the WhatsApp demo guide](../docs/WHATSAPP_DEMO.md)). `src/services/api` centralizes server bearer/business scope, typed DTO validation, timeout, semantic errors and request UUIDs. No generic tool RPC or business mutation is exposed.

Keycloak/OIDC remains the identity authority. Configure server-only APP_ORIGIN, API_SERVER_BASE_URL, OIDC_ISSUER, OIDC_CLIENT_ID and APP_BUSINESS_ID in an ignored runtime env; OIDC_CLIENT_SECRET is optional for a confidential client. Register exact `/api/auth/callback` and `/login` post-logout URLs, S256 PKCE and the existing backend audience. Provision the actual issuer/subject application user and business membership. See [the auth decision](../docs/frontend/P5I_AUTH_DECISION.md). Backend transport uses optional `platform/infra/compose/compose.p5i.yaml` with explicit OIDC/CORS settings.

Passwords are collected only by Keycloak. Browser stores only an opaque HttpOnly session ID; tokens stay on the Next.js server. The local MVP uses one Node instance and expires sessions on restart or token expiry. Production requires HTTPS and shared session deployment planning. Frontend visibility never replaces backend authorization. P5I_ENABLE_FIXTURE_REVIEW defaults false; explicit fixture review still requires staff authentication.

## Design and route status

The UI is written for shop owners and operators, not engineers. Design rules, all in `src/styles/globals.css` and the shared components:

- One accent colour, hairline borders, translucent sidebar and toolbar, the system font stack, and a dark variant that follows the OS. Reduced motion, reduced transparency and high contrast are respected.
- Every screen starts with the same header: title, one-sentence purpose, and a **Sample data** or **Live data** tag instead of a banner. Status badges use plain words (`Needs checking`, `Needs a person`, `Not ready yet`) that map one-to-one onto the backend states in `src/types/states.ts`; the meaning of each state is unchanged, only the wording.
- Sidebar labels are plain language (Inbox, Needs review, Reports, Channels, Activity log, AI activity); the routes behind them are unchanged. Screens that need an extra permission show a lock instead of a text marker.
- Controls that are not available yet are shown disabled with a short note next to them. Nothing is labelled with internal phase or milestone codes.

`npm run preview` renders every screen with sample data into `.preview/` (git-ignored) so the design can be reviewed in a browser without Keycloak or the backend; `PREVIEW_THEME=dark npm run preview` renders the dark variant. The staff shell is desktop-primary with a tablet icon rail and a phone tab bar; `/chat` is a separate, mobile-first customer surface.

Screen implementations reuse the approved system; their REAL/FIXTURE/UNAVAILABLE/TARGET status is explicit in the matrix. Current limits stay explicit:

- M08 external channel/provider work is deferred and not configured.
- E02 keeps `update_order` unavailable.
- M12 durable human Resume remains TARGET-only.
- M13 remains `MODEL_NOT_READY`; no forecasts are fabricated.

See [`../docs/frontend/P5A_FRONTEND_FOUNDATION.md`](../docs/frontend/P5A_FRONTEND_FOUNDATION.md) for the implementation decision record.
