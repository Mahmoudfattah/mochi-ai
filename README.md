# Mochi AI

Mochi AI is an open-source, Egyptian Arabic personal roadmap and focus companion.

**Status:** Early development. The repository currently contains the M0 foundation only; product features are not implemented.

## Requirements

- Node.js 22.12.0 or newer (see [`.nvmrc`](./.nvmrc))
- npm

## Setup

```sh
npm ci
npm run dev
```

## Scripts

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the local Vite server              |
| `npm run build`        | Typecheck and build for production       |
| `npm run typecheck`    | Run the TypeScript project build         |
| `npm run lint`         | Run ESLint                               |
| `npm run test`         | Run Vitest once                          |
| `npm run test:watch`   | Run Vitest in watch mode                 |
| `npm run format`       | Format supported project files           |
| `npm run format:check` | Check formatting without writing changes |

See [`docs/`](./docs/) for the project vision, design system, scope, and architecture.
