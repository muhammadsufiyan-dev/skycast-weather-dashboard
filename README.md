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
