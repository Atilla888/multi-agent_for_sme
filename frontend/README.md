# Frontend

Staff dashboard and customer web chat, built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4.

## Requirements

- Node.js 24 (`>=24.12.0 <25`, see `.nvmrc`) and npm
- The backend from [`platform/`](../platform/README.md) for live data

Use npm only; `package-lock.json` is the source of truth for dependencies.

## Setup

```bash
npm ci
cp .env.example .env.local
npm run dev                  # http://127.0.0.1:3000
```

The root redirects to `/overview`; staff pages require sign-in. `/chat` is the customer web chat preview.

To look around without Keycloak or the backend, set `LOCAL_PREVIEW_NO_SIGN_IN=true` in `.env.local`: `npm run dev` then opens every staff page as a demo owner on sample data. Production builds ignore it.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm run start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Strict TypeScript check |
| `npm test` | Vitest unit and component tests |
| `npm run preview` | Render every screen with sample data to `.preview/*.html` — no backend or Keycloak needed. `PREVIEW_THEME=dark` for the dark variant |

## Screens

| Area | Routes |
| --- | --- |
| Overview | `/overview` |
| Conversations | `/conversations`, `/conversations/[id]`, `/escalations` |
| Business | `/customers`, `/customers/[id]`, `/orders`, `/orders/[id]`, `/products`, `/inventory` |
| Knowledge | `/documents`, `/documents/[id]` |
| Analytics | `/analytics`, `/forecasts` |
| Administration | `/integrations`, `/settings`, `/audit`, `/agent-runs` |
| Separate surfaces | `/login`, `/chat` |

**Live data:** sign-in, products, inventory, customer and order details, sales analytics and the inbox. **Sample data:** everything else, clearly tagged on screen. Append `?mode=fixture` to any staff page to see its sample version.

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL visible to the browser (no secrets) |
| `APP_ORIGIN`, `API_SERVER_BASE_URL` | Frontend origin and server-side backend URL |
| `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` | Keycloak realm and client; the secret is optional |
| `APP_BUSINESS_ID` | The shop (tenant) the dashboard works with |
| `P5I_ENABLE_FIXTURE_REVIEW` | `true` to allow sample-data screens (still requires sign-in) |

Never put credentials in a `NEXT_PUBLIC_*` variable.

## Sign-in

Keycloak handles passwords (Authorization Code flow with PKCE). The browser keeps only an opaque HttpOnly session cookie; tokens stay on the Next.js server. Sessions live in memory, so they reset when the server restarts. Production needs HTTPS and shared session storage. The backend checks every request independently — hiding something in the UI is never the security boundary. To start Keycloak for local sign-in, add `infra/compose/compose.p5i.yaml` to the backend's Compose command; the [WhatsApp demo guide](../docs/WHATSAPP_DEMO.md#6-show-it-in-the-staff-inbox-optional) walks through creating a realm and user.

## Design

Written for shop owners and operators, not engineers. Light mode is warm and human, dark mode graphite and precise; it follows the operating system. Geist for text and Geist Mono for order numbers, IDs and times. Status is a small icon plus plain words (`Needs checking`, `Needs a person`, `Not ready yet`) mapped one-to-one onto the backend states in `src/types/states.ts`; colour never carries meaning alone. Controls that aren't available yet are shown disabled with a short note. Tokens and component styles live in `src/styles/globals.css`; the full specification is [docs/DESIGN.md](../docs/DESIGN.md) (§6).

## Languages and theme

The interface is available in English, Russian and Kazakh (Cyrillic). The language switch and the System / Light / Dark switch sit above the account in the sidebar, in the More sheet on phones, on the sign-in page and in the customer chat. Both choices are remembered in cookies (`lang`, `theme`); without a saved language the browser's preferred language is used, then English. Record content (customer names, messages, product names, documents) is shown as entered.

Text lives in `src/i18n/messages/<area>.ts`, one file per screen area with English, Russian and Kazakh side by side; the namespace is the file name (`useTranslations("orders")`). English is the source: TypeScript rejects a missing or extra key, and `src/i18n/i18n.test.ts` fails if a placeholder differs or a translation is left in English. Messages use ICU syntax for placeholders and plurals.

`npm run preview` renders every screen, including the live-data ones from stub records, into `.preview/`. `PREVIEW_THEME=dark` renders the dark variant and `PREVIEW_LOCALE=ru` or `kk` renders another language.

## Not yet available

- External channels other than the WhatsApp demo
- Editing existing orders (blocked by policy; routed to a person)
- Resuming a case after a human decision
- Sales forecasts — the screen shows "model not ready" instead of inventing numbers

> `AGENTS.md` in this folder is generated by `next dev`; leave it in place.
