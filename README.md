# Daily Reflection

A polished mobile MVP for a premium-feeling daily reflection habit app built with Expo, React Native, and TypeScript.

## Run locally

1. Install a current Node.js LTS release.
2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npm run start
```

4. Open on iOS, Android, or Expo Go.

## Key files

- `App.tsx`: app entry and providers.
- `src/context/AppContext.tsx`: local-first app state, persistence, favorites, onboarding, theme, and daily reflection logic.
- `src/data/reflections.ts`: 120 original reflection seed questions.
- `src/theme/tokens.ts`: palette, spacing, and radius tokens for the premium paper UI.
- `src/theme/presets.ts`: future premium personalization presets for paper and typography styles.
- `src/navigation/AppNavigator.tsx`: onboarding gate, tabs, and detail navigation.
- `src/screens/TodayScreen.tsx`: calendar-paper card UI, favorite action, share flow placeholder.
- `src/services/notificationService.ts`: daily local notification scheduling abstraction.
- `src/services/widgetReflectionService.ts`: widget-ready formatter for future daily reflection surfaces.

## Notes

- Content is seeded locally and uses only `sourceType: "original_reflection"`.
- The share flow captures the reflection card view as an image via `react-native-view-shot`.
- Preferences, favorites, archive selections, onboarding state, and notification time are stored locally with AsyncStorage.
# app-building
# daily-reflection-backend
# daily-reflection-backend
# daily-reflection-backend
