# daily-reflection-app boundary

This repository root now represents the future `daily-reflection-app` codebase.

App-side responsibilities in the root:
- Expo / React Native app
- onboarding, Today, preview, membership UI
- localization
- local notifications
- app-side services and API clients
- iOS / Android native projects

Backend-side responsibilities now live in:
- [`backend/`](/Users/samueltriml/Documents/App-Building/backend)

To split into two GitHub repositories later:
1. Move the current repository root contents except `backend/` into `daily-reflection-app`
2. Move `backend/` contents into `daily-reflection-backend`
3. Configure separate environment files and CI for each repo
