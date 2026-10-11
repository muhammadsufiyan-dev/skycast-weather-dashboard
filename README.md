# Skycast — Live Weather Dashboard

A responsive weather dashboard: search any city, see live conditions, a 24-hour temperature/rain chart and a 7-day forecast.

## Features
- City search with autocomplete
- Live conditions: temperature, feels-like, humidity, wind, pressure, UV
- 24-hour chart (temperature + rain chance)
- 7-day forecast, sunrise/sunset
- °C / °F toggle, "use my location", saved favorite cities
- Shareable URLs (city and unit are stored in the link)
- Day/night themed background, loading skeletons, error retry

## Tech
React 19, TanStack Start / Router / Query, TypeScript, Tailwind CSS v4, [Open-Meteo](https://open-meteo.com) API (no API key needed).

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # run the production build
```

## Author
Muhammad Sufiyan

## Links
- Live demo: https://muhammadsufiyan-dev.github.io/skycast-weather-dashboard/
- Repository: https://github.com/muhammadsufiyan-dev/skycast-weather-dashboard

## Responsive update
The search field spans the full phone width, controls have touch-friendly targets, city names wrap safely, forecast tiles adapt to the available width, and only the hourly chart scrolls horizontally.

## Update your existing repository (Windows PowerShell)
1. Extract this complete ZIP. Do not delete your existing project folder or its hidden `.git` folder.
2. Copy everything inside this ZIP's project folder into your existing local `skycast-weather-dashboard` folder. Choose **Replace the files in the destination**. Include `.github` and `.gitignore`.
3. Open PowerShell inside your existing project folder and run:

```powershell
npm install
npm run dev
```

Open http://localhost:3000, then press Ctrl+C when finished testing.

```powershell
git status
git add .
git commit -m "Improve Skycast responsive layout for all devices"
git push origin main
```

Do not run `git init` and do not force-push. If Git reports a remote update, run `git pull --no-rebase origin main` and then push again. If conflicts appear, stop and resolve them before pushing.

4. On GitHub open **Actions → Deploy to GitHub Pages** and wait for the green check. If Pages is not enabled, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Open the live demo and press Ctrl+Shift+R. This project does not need Firebase secrets or API keys.
