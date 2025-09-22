# Dependency and Tooling Alignment Overview

This document summarizes the infrastructure updates that standardized dependency versions and Node.js tooling across the monorepo.

## Axios Version Pinning

- All workspaces (`backend/`, `apps/mobile/`, `packages/api-client/`, and the root) depend on **axios@1.12.2**.
- The root `package.json` records this constraint under `dependencyVersionPolicy`, ensuring future `deps:check` runs catch drift.

## Node.js Toolchain Standardization

- Every package now declares `engines.node` as **20.18.1** and `engines.npm` as **10.8.2**.
- Volta metadata mirrors these versions so managed environments stay consistent.
- A new [`.nvmrc`](../.nvmrc) file guides `nvm` users to the same Node.js version.

## Dependency Consistency Tooling

- The `npm run deps:check` script verifies that shared dependencies (currently axios) stay aligned between workspaces.
- A GitHub Actions workflow (`.github/workflows/deps-check.yml`) runs the same check in CI.
- Developers can run `npm run deps:check` locally after modifying dependencies to confirm compliance.

## ESLint Compatibility

- Added a root-level `eslint.config.js` to support running lint checks with ESLint 9 while keeping legacy configs intact inside workspaces.

## Installation Notes

- Run `npm install` from the repository root after pulling changes to refresh the workspace lockfile with the standardized versions.
- If using `nvm`, execute `nvm use` to adopt the pinned Node.js release before running scripts.
