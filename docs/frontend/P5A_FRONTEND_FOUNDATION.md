# P5A — Frontend Foundation

## Stack

The frontend uses Next.js 16.4.0 App Router, React 19.3.0, TypeScript 5, Tailwind CSS 4, npm, ESLint, and Vitest. The selected runtime is Node.js 24.12.0 LTS with an explicit `>=24.12.0 <25` engine range and `.nvmrc` pin. No second frontend framework, component suite, state manager, form framework, chart library, or E2E stack was added.

## Source Authorities

Implementation is subordinate to:

1. `docs/DESIGN.md` for consolidated UX/UI and product-state rules;
2. `docs/PRD.md`, `docs/ARCHITECTURE.md`, and `docs/RULES.md` for product, trust, and system boundaries;
3. `docs/TASKS.md` and `docs/MEMORY.md` for current milestone truth;
4. `design/README.md` and surviving `design/figma-plugins/` sources for the approved 03C/03D/03E design evidence.

Figma `03C — Design System` remains design-system authority, `03D — High-Fidelity Screens` visual authority for P0 screens, and `03E — Interactive Prototype` interaction reference. P5A did not edit Figma or its plugin sources.

## Project Structure

```text
frontend/
├── src/
│   ├── app/                 # App Router groups and route placeholders
│   ├── components/
│   │   ├── domain/          # truthful foundation-page composition
│   │   ├── layout/          # shared staff shell
│   │   └── ui/              # small reusable primitives
│   ├── features/foundation/ # placeholder definitions and boundaries
│   ├── lib/                 # navigation and environment configuration
│   ├── services/
│   │   ├── api/             # typed request/health boundary
│   │   └── auth/            # future Keycloak/OIDC adapter contract
│   ├── styles/              # semantic tokens and responsive primitives
│   └── types/               # auth and product-state types
├── .env.example
├── .nvmrc
├── package.json
├── package-lock.json
└── vitest.config.ts
```

Empty architectural layers were not populated merely for symmetry. New abstractions should follow concrete screen or integration needs.

## Routing

The root redirects to `/overview`. The `(staff)` route group supplies the shell without changing public URLs:

- `/overview`
- `/conversations` and `/conversations/[id]`
- `/escalations`
- `/customers` and `/customers/[id]`
- `/orders` and `/orders/[id]`
- `/products`
- `/inventory`
- `/documents`
- `/analytics`
- `/forecasts`
- `/integrations`
- `/settings`
- `/audit`
- `/agent-runs`

`/login` is under an auth group and outside staff navigation. `/chat` is under a customer group and does not inherit the staff shell. Dynamic placeholders do not fabricate customer, conversation, or order data.

## Design Tokens

`src/styles/globals.css` translates the approved 03C primitive palette, 4/8/12/16/24/32/48 spacing scale, 4/6/8/pill radii, and semantic aliases for page/card/subtle surfaces, primary/secondary/muted text, borders, primary action, hover, and focus. Success, pending/warning, danger, information, unknown, restricted, and waiting-human treatments use semantic state classes and text labels, so meaning does not depend on color alone.

Inter is declared first, followed by `Segoe UI`, Arial, and sans-serif. No font was downloaded or redistributed because an approved licensed local web asset was not present. Exact font loading remains a documented later integration gap.

## Staff Shell

`AppShell`, `Sidebar`, `SidebarSection`, `TopBar`, `MainContent`, and `PageHeader` establish the approved Calm Operational SaaS composition. Navigation comes from one typed definition and preserves exactly six top-level areas. Audit is visibly restricted/permissioned and Agent Runs contextual/restricted; both remain links rather than disabled controls because visibility is not authorization.

The sidebar's future business switch and the header's current-business indicator have distinct roles. Both truthfully show that no authorized business/session is available. The shell is desktop-primary and collapses to a single column at narrower widths; the customer surface receives 44px mobile touch targets.

## API Boundary

`src/services/api/client.ts` provides an environment-driven base URL, typed JSON return values, an asynchronous bearer-token hook, consistent `ApiError`, and propagation of `x-request-id` or `x-correlation-id` into failures. Only evidenced `/health/live` and `/health/ready` contracts were typed. No business endpoint or Pydantic-equivalent schema was invented.

Native Next.js/React data capabilities remain the default. A server-state library and OpenAPI generation can be evaluated when real screen contracts justify them.

## Authentication Boundary

Keycloak/OIDC remains authoritative. `AuthAdapter` describes session lookup, login initiation, and logout without implementing a fake identity provider. Tokens must not be stored in `localStorage`; the backend must reauthorize every protected read and action. The `/login` placeholder explicitly reports that identity is not configured.

## State Semantics

`ProductState` keeps loading, valid empty, success, confirmed effect, pending/processing, known failure, permission denied, unavailable, not configured, `OUTCOME_UNKNOWN`, `MODEL_NOT_READY`, restricted, waiting human, stale/conflict, dependency unavailable, delivery failure, and TARGET-only distinct.

Known failure directs the user to current facts and a new authorized recovery. `OUTCOME_UNKNOWN` instead requires authoritative reconciliation before a mutation retry. A confirmed business effect stays separate from message delivery. Page definitions also preserve Order State versus Reservation State and Analytics ACTUAL versus Forecast PREDICTED boundaries.

## Accessibility

The foundation uses semantic landmarks, lists, headings, links, buttons, definition lists, status text, keyboard-native navigation, and a high-visibility focus ring. Restricted states include copy/structure rather than color-only meaning. ARIA is limited to useful labels/status and hidden descriptive help. These are foundations toward the approved WCAG 2.2 AA-level target, not a certification claim.

## Localization

Layouts use grid/flex with wrapping, `minmax(0, 1fr)`, fluid content widths, and no fixed English-label truncation. EN/RU/KZ and roughly 30–50% expansion are design constraints. Full message extraction, locale routing, translations, date/number formatting, and RTL decisions are later work.

## Testing

Vitest supplies fast TypeScript unit and server-rendered component smoke tests without adding browser infrastructure. Tests protect:

- the exact six-area IA and nested destinations;
- auth/customer separation and restricted navigation metadata;
- route matching;
- M08, E02, M12, and M13 truth boundaries;
- known-failure versus `OUTCOME_UNKNOWN` semantics;
- accessible status/button output;
- API URL, bearer header, HTTP error, and request-ID behavior.

The completion gate runs `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`, followed by runtime route probes and secret/change-scope checks.

## Known Current Capability Limits

- M08 is PARTIAL / BLOCKED / DEFERRED. No external channel/provider success is claimed.
- E02 keeps `update_order` restricted. No working update-order control exists.
- M12 durable Human Resume is NOT STARTED / TARGET. No fake Resume action is wired.
- M13 is NOT STARTED and current Forecast state is `MODEL_NOT_READY`; no prediction is shown.
- Staff/customer routes are intentional foundation placeholders, not finished P0 screens.
- Real Keycloak login, business selection, localization, API-driven data, forms, analytics charts, and end-to-end browser tests are not implemented.
- The exact approved Inter webfont asset is unavailable; documented system fallbacks are used.
- The production dependency audit is clean. A transitive high-severity advisory remains in the development-only ESLint toolchain; npm's suggested automatic remediation downgrades `eslint-config-next` incompatibly, so it was not forced.

## Validation

Validated on Node.js 24.12.0 and npm 11.6.2 on branch `frontend/p5-foundation`:

- `npm run lint`: PASS;
- `npm run typecheck`: PASS;
- `npm test`: PASS, 5 files and 15 tests;
- `npm run build`: PASS, Next.js production build generated all intended routes;
- production runtime probes: PASS, 21/21 static/dynamic URLs returned HTTP 200 after redirects;
- production dependency audit: PASS, 0 vulnerabilities.

Git scope, ignored-artifact, secret, clean-worktree, and remote-push evidence are completed after documentation commits and reported in the task handoff.

## Next Phase

Recommended P5B: implement the approved Conversations P0 vertical slice on top of this shell, beginning with an explicit backend-contract review and Keycloak/session integration plan. Cover list/workspace/context states and authorization-safe loading/empty/error behavior without inventing M08 live delivery or M12 durable Resume. P5B must be separately authorized and is not started by P5A.
