# Agent Guidelines

- Use the repository's npm-based workspace tooling; avoid introducing yarn or pnpm lockfiles.
- When updating Android build workflows, prefer the shared Gradle wrapper launched via `scripts/run-android-gradle.js`.
- Keep the Mobile section of `README.md` in sync with any CLI or script changes for the React Native app.
- Clean up large temporary Android build artefacts (e.g. `build/`, downloaded SDKs) before committing.
