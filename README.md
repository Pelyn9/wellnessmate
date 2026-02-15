# WellnessMate

Expo React Native app with Firebase auth/data, deployable to:
- Vercel (web export)
- EAS Build (Android APK)

## Local Development

```bash
npm install
npm run start
```

## Web Build (Vercel target)

```bash
npm run build:web
```

This exports static files into `dist/`, and `vercel.json` is configured to deploy that folder.

## Android APK Build (EAS)

```bash
npx eas-cli login
npm run build:apk
```

`eas.json` includes a `preview` profile that outputs an APK and a `production` profile for app bundle builds.
