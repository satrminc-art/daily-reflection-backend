# daily-reflection-backend

Server-side code for the Daily Reflection product.

Contains:
- `api/` public serverless entrypoints
- `src/` backend routes, services, billing, repositories, middleware, config
- `lib/` server-only helpers used by AI follow-up and entitlement/limit enforcement

Does not contain:
- Expo / React Native screens
- mobile assets
- iOS / Android projects
- client-safe config

Current notes:
- reflection delivery is scaffolded behind `src/reflections/`
- RevenueCat webhook ingestion and normalized subscription status are in place
- auth session exchange is still scaffolded
