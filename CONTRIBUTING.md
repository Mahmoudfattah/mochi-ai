# Contributing

## Setup

1. Install Node.js 22.12.0 or newer and npm.
2. Clone the repository and run `npm ci`.
3. Start the app with `npm run dev`.

No Supabase account or API keys are needed for the M0 foundation.

## Useful scripts

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run format` / `npm run format:check`

## Layer boundaries

`src/domain/` and `src/conversation/` are core layers. They must never import
React, React DOM, or anything under `@/features/**`. Keep domain logic pure and
independent of presentation code.

## Pull request checklist

- [ ] Keep changes within the approved milestone and its scope.
- [ ] Preserve the layer boundaries and keep persona values in config.
- [ ] Add or update tests for behavior changes.
- [ ] Run lint, typecheck, tests, formatting checks, and the production build.
- [ ] Confirm no secrets or personal data are included.
- [ ] Update directly related documentation.
