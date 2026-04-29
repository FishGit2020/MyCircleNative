# E2E Tests (Maestro)

Native E2E tests use [Maestro](https://maestro.mobile.dev/) — a YAML-based mobile UI testing framework.

## Setup

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify
maestro --version
```

## Running

```bash
# Build a development client (one-time)
pnpm build:dev:ios       # or build:dev:android

# Run smoke flow against an installed dev build
maestro test e2e/maestro/smoke.yaml

# Run all flows
maestro test e2e/maestro/
```

## Adding flows

Each `.yaml` file under `e2e/maestro/` is a Maestro flow. Use `appId: com.youpenghuang.mycircle` (iOS) or `com.mycircle.app` (Android).

See [Maestro docs](https://maestro.mobile.dev/) for the flow reference.

## Web parity

The web (`MyCircle`) repo runs Playwright in `e2e/`. This native suite mirrors the same smoke-level coverage: home renders, primary tabs reachable, no auth-required crashes.
