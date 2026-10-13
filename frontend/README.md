# Frontend

P5A establishes the technical frontend foundation for the diploma multi-agent operations platform. It contains routing, a shared staff shell, semantic tokens, truthful capability placeholders, API/auth boundaries, and lightweight tests. It does **not** implement the complete product screens.

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

Open `http://localhost:3000`. The root redirects to `/overview`.

## Commands

```bash
npm run dev        # Next.js development server
npm run build      # production build and route generation
npm run start      # serve a completed production build
npm run lint       # ESLint, including Next.js and TypeScript rules
npm run typecheck  # strict TypeScript check without output
npm test           # Vitest unit/component smoke tests
```

Vitest was selected because the foundation needs fast TypeScript unit and server-rendered component checks, not a heavyweight browser/E2E stack. No Redux, forms framework, chart library, or API-codegen tool is installed in P5A.

## Environment

`NEXT_PUBLIC_API_BASE_URL` is required before an API request is made. For local development the example uses:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

`.env.local` and other real environment files are ignored. Never place credentials, access tokens, client secrets, or real tenant data in a `NEXT_PUBLIC_*` variable.

## Backend and identity boundaries

The only currently evidenced public FastAPI routes used by this foundation are:

- `GET /health/live`
- `GET /health/ready`

Business endpoints are not invented. `src/services/api` centralizes base URL, bearer-token injection, typed JSON, consistent HTTP errors, and request/correlation IDs where returned.

Keycloak/OIDC remains the identity authority. `src/services/auth/contracts.ts` defines the future adapter boundary. P5A does not simulate successful login, store passwords, or persist access tokens in `localStorage`. Frontend visibility never replaces backend authorization.

## Design and route status

The implementation follows `docs/DESIGN.md`, Figma `03C` design-system material, the `03D` high-fidelity source, and `03E` interaction semantics. The staff shell is desktop-primary; `/chat` is a separate, mobile-important customer surface. Inter is referenced with system fallbacks because no approved redistributable local font asset is present.

All screen routes are structural placeholders, not completed high-fidelity screens. Current limits stay explicit:

- M08 external channel/provider work is deferred and not configured.
- E02 keeps `update_order` unavailable.
- M12 durable human Resume remains TARGET-only.
- M13 remains `MODEL_NOT_READY`; no forecasts are fabricated.

See [`../docs/frontend/P5A_FRONTEND_FOUNDATION.md`](../docs/frontend/P5A_FRONTEND_FOUNDATION.md) for the implementation decision record.
