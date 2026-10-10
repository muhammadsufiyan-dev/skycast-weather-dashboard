export type Place = {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type Forecast = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
    pressure_msl: number;
  };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[] };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_probability_max: number[];
  };
};

export async function searchPlaces(q: string): Promise<Place[]> {
  if (q.trim().length < 2) return [];
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`,
  );
  if (!r.ok) throw new Error(`City search failed (${r.status})`);
  const j = await r.json();
  return j.results ?? [];
}

export async function getForecast(lat: number, lon: number, unit: "celsius" | "fahrenheit"): Promise<Forecast> {
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day,pressure_msl",
    hourly: "temperature_2m,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: unit,
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) throw new Error(`Forecast failed (${r.status})`);
  return r.json();
}

const CODES: Record<number, [string, string]> = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"], 48: ["Rime fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"], 71: ["Light snow", "🌨️"], 73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"], 77: ["Snow grains", "🌨️"], 80: ["Showers", "🌦️"], 81: ["Rain showers", "🌧️"], 82: ["Violent showers", "⛈️"],
  85: ["Snow showers", "🌨️"], 86: ["Heavy snow showers", "❄️"], 95: ["Thunderstorm", "⛈️"], 96: ["Storm & hail", "⛈️"], 99: ["Severe storm", "⛈️"],
};
export const describe = (code: number, isDay = 1): { label: string; icon: string } => {
  const [label, icon] = CODES[code] ?? ["Unknown", "🌡️"];
  return { label, icon: !isDay && code <= 1 ? "🌙" : icon };
};
