import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { describe, getForecast, searchPlaces, type Forecast, type Place } from "@/lib/weather";

type Search = { lat: number; lon: number; name: string; unit: "celsius" | "fahrenheit" };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    lat: Number(s.lat) || 24.8607,
    lon: Number(s.lon) || 67.0011,
    name: typeof s.name === "string" ? s.name : "Karachi, Pakistan",
    unit: s.unit === "fahrenheit" ? "fahrenheit" : "celsius",
  }),
  head: () => ({
    meta: [
      { title: "Skycast — Live Weather Dashboard" },
      { name: "description", content: "Search any city for live conditions, a 24-hour temperature chart and a 7-day forecast." },
      { property: "og:title", content: "Skycast — Live Weather Dashboard" },
      { property: "og:description", content: "Live conditions, hourly charts and 7-day forecasts for any city worldwide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const FAV_KEY = "skycast:favorites";

function Dashboard() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [favs, setFavs] = useState<Place[]>([]);
  useEffect(() => {
    try { setFavs(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { /* ignore */ }
  }, []);

  const q = useQuery({
    queryKey: ["forecast", search.lat, search.lon, search.unit],
    queryFn: () => getForecast(search.lat, search.lon, search.unit),
    staleTime: 5 * 60_000,
  });

  const go = (p: Place) =>
    navigate({ search: (s) => ({ ...s, lat: p.latitude, lon: p.longitude, name: [p.name, p.country].filter(Boolean).join(", ") }) });

  const isFav = favs.some((f) => f.latitude === search.lat && f.longitude === search.lon);
  const toggleFav = () => {
    const next = isFav
      ? favs.filter((f) => !(f.latitude === search.lat && f.longitude === search.lon))
      : [...favs, { id: Date.now(), name: search.name.split(",")[0] ?? search.name, country: search.name.split(", ")[1], latitude: search.lat, longitude: search.lon }];
    setFavs(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => go({ id: 0, name: "My location", latitude: +pos.coords.latitude.toFixed(4), longitude: +pos.coords.longitude.toFixed(4) }),
      () => alert("Location access was denied."),
    );
  };

  const day = q.data?.current.is_day ?? 1;
  const u = search.unit === "celsius" ? "°C" : "°F";

  return (
    <div className={`skycast min-h-screen ${day ? "sky-day" : "sky-night"} transition-all`}>
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-center">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-3xl float-slow">🌤️</span>
            <h1 className="truncate text-2xl font-bold">Skycast</h1>
          </div>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <CitySearch onPick={go} />
            <Button variant="ghost" onClick={locate} title="Use my location" aria-label="Use my location" className="glass h-11 w-11 shrink-0 justify-self-start p-0 text-sm hover:bg-secondary">📍</Button>
            <div role="group" aria-label="Temperature unit" className="glass flex h-11 shrink-0 justify-self-end overflow-hidden p-1 text-sm">
              {(["celsius", "fahrenheit"] as const).map((x) => (
                <Button variant="ghost" key={x} aria-pressed={search.unit === x} onClick={() => navigate({ search: (s) => ({ ...s, unit: x }) })}
                  className={`h-full rounded-xl px-3 transition ${search.unit === x ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  {x === "celsius" ? "°C" : "°F"}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {favs.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {favs.map((f) => (
               <Button variant="ghost" key={`${f.latitude},${f.longitude}`} onClick={() => go(f)}
                className="h-auto min-h-11 max-w-full whitespace-normal rounded-full border border-border bg-secondary/60 px-3 py-2 text-sm hover:bg-secondary"><span className="min-w-0 break-words">★ {f.name}</span></Button>
            ))}
          </div>
        )}

        <main className="mt-6 min-w-0 sm:mt-8">
          {q.isPending && <Skeleton />}
          {q.isError && (
            <div className="glass p-8 text-center">
              <p className="text-lg font-semibold">Couldn't load the weather.</p>
              <p className="mt-1 text-sm text-muted-foreground">{(q.error as Error).message}</p>
               <Button onClick={() => q.refetch()} className="mt-4 h-11 rounded-xl px-4 font-semibold">Try again</Button>
            </div>
          )}
          {q.data && <Content key={`${search.lat}${search.lon}`} data={q.data} name={search.name} u={u} isFav={isFav} toggleFav={toggleFav} />}
        </main>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Data by Open-Meteo · Built by Muhammad Sufiyan
        </footer>
      </div>
    </div>
  );
}

function CitySearch({ onPick }: { onPick: (p: Place) => void }) {
  const [text, setText] = useState("");
  const [deb, setDeb] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDeb(text), 300); return () => clearTimeout(t); }, [text]);
  const r = useQuery({ queryKey: ["places", deb], queryFn: () => searchPlaces(deb), enabled: deb.length >= 2 });

  return (
    <div className="relative col-span-2 min-w-0 sm:col-span-1">
      <input value={text} onChange={(e) => { setText(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Search a city…" aria-label="Search a city"
        className="glass h-11 w-full px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      {open && deb.length >= 2 && (
        <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-border bg-popover shadow-2xl">
          {r.isFetching && <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>}
          {r.isError && <p className="px-4 py-3 text-sm text-destructive">Search failed. Try again.</p>}
          {r.data?.length === 0 && !r.isFetching && <p className="px-4 py-3 text-sm text-muted-foreground">No cities found.</p>}
          {r.data?.map((p) => (
            <Button variant="ghost" key={p.id} onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(p); setText(""); setOpen(false); }}
              className="block h-auto min-h-11 w-full whitespace-normal rounded-none px-4 py-3 text-left text-sm hover:bg-secondary">
              <span className="block break-words font-semibold">{p.name}</span>
              <span className="block break-words text-muted-foreground">{[p.admin1, p.country].filter(Boolean).join(", ")}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function Content({ data, name, u, isFav, toggleFav }: { data: Forecast; name: string; u: string; isFav: boolean; toggleFav: () => void }) {
  const c = data.current;
  const d = describe(c.weather_code, c.is_day);
  const time = (iso: string) => iso.slice(11, 16);
  const nowIdx = Math.max(0, data.hourly.time.findIndex((t) => t >= c.time.slice(0, 13)));
  const hours = data.hourly.time.slice(nowIdx, nowIdx + 24).map((t, i) => ({
    t, temp: data.hourly.temperature_2m[nowIdx + i] ?? 0, rain: data.hourly.precipitation_probability[nowIdx + i] ?? 0,
  }));

  return (
    <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-3">
      <section className="glass fade-up min-w-0 p-4 sm:p-8 lg:col-span-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Now in</p>
            <h2 className="break-words text-xl font-semibold sm:text-3xl">{name}</h2>
          </div>
          <Button variant="ghost" onClick={toggleFav} aria-label="Save city" aria-pressed={isFav} className={`h-11 shrink-0 rounded-full border border-border px-3 text-sm ${isFav ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-secondary"}`}>
            {isFav ? "★ Saved" : "☆ Save"}
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
          <span className="shrink-0 text-5xl sm:text-8xl float-slow">{d.icon}</span>
          <div className="min-w-0">
            <p className="font-display text-5xl font-bold tabular-nums sm:text-7xl">{Math.round(c.temperature_2m)}<span className="text-2xl sm:text-4xl">{u}</span></p>
            <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">{d.label} · feels like {Math.round(c.apparent_temperature)}{u}</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Humidity" value={`${c.relative_humidity_2m}%`} />
          <Stat label="Wind" value={`${Math.round(c.wind_speed_10m)} km/h`} />
          <Stat label="Pressure" value={`${Math.round(c.pressure_msl)} hPa`} />
          <Stat label="UV index" value={`${data.daily.uv_index_max[0]?.toFixed(1) ?? "–"}`} />
        </div>
      </section>

      <section className="glass fade-up min-w-0 p-4 sm:p-6" style={{ animationDelay: "80ms" }}>
        <h3 className="font-semibold">Sun</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <Stat label="Sunrise" value={time(data.daily.sunrise[0] ?? "")} />
          <Stat label="Sunset" value={time(data.daily.sunset[0] ?? "")} />
          <Stat label="Rain chance today" value={`${data.daily.precipitation_probability_max[0] ?? 0}%`} />
        </div>
      </section>

      <section className="glass fade-up min-w-0 p-4 sm:p-6 lg:col-span-3" style={{ animationDelay: "140ms" }}>
        <h3 className="font-semibold">Next 24 hours</h3>
        <HourlyChart hours={hours} u={u} />
      </section>

      <section className="glass fade-up min-w-0 p-4 sm:p-6 lg:col-span-3" style={{ animationDelay: "200ms" }}>
        <h3 className="font-semibold">7-day forecast</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {data.daily.time.map((t, i) => {
            const dd = describe(data.daily.weather_code[i] ?? 0);
            return (
              <div key={t} className="min-w-0 rounded-2xl bg-secondary/50 p-3 text-center transition hover:-translate-y-1 hover:bg-secondary sm:p-4">
                <p className="text-sm text-muted-foreground">{i === 0 ? "Today" : new Date(t + "T12:00").toLocaleDateString("en", { weekday: "short" })}</p>
                <p className="my-2 text-3xl">{dd.icon}</p>
                <p className="text-sm font-semibold">
                  <span className="text-warm">{Math.round(data.daily.temperature_2m_max[i] ?? 0)}°</span>{" "}
                  <span className="text-cold">{Math.round(data.daily.temperature_2m_min[i] ?? 0)}°</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">💧 {data.daily.precipitation_probability_max[i] ?? 0}%</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-display text-base font-semibold sm:text-lg">{value}</p>
    </div>
  );
}

function HourlyChart({ hours, u }: { hours: { t: string; temp: number; rain: number }[]; u: string }) {
  const W = 960, H = 200, P = 28;
  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps) - 1, max = Math.max(...temps) + 1;
  const x = (i: number) => P + (i * (W - 2 * P)) / Math.max(1, hours.length - 1);
  const y = (v: number) => H - P - ((v - min) / (max - min || 1)) * (H - 2 * P);
  const line = hours.map((h, i) => `${i ? "L" : "M"}${x(i)},${y(h.temp)}`).join(" ");
  const area = `${line} L${x(hours.length - 1)},${H - P} L${x(0)},${H - P} Z`;
  return (
    <div className="mt-4 min-w-0">
      <div tabIndex={0} role="region" aria-label="Hourly temperature and rain chart" className="max-w-full overflow-x-auto overscroll-x-contain rounded-md focus-visible:outline-2 focus-visible:outline-ring">
      <svg role="img" aria-label="Temperature and rain chance over the next 24 hours" viewBox={`0 0 ${W} ${H + 20}`} className="block w-full min-w-[640px]">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {hours.map((h, i) => (
          <rect key={"r" + i} x={x(i) - 6} y={H - P - h.rain * 0.4} width="12" height={h.rain * 0.4} rx="3" fill="var(--accent)" opacity="0.35" />
        ))}
        <path d={area} fill="url(#g)" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        {hours.map((h, i) => i % 3 === 0 && (
          <g key={i}>
            <circle cx={x(i)} cy={y(h.temp)} r="4" fill="var(--primary)" />
            <text x={x(i)} y={y(h.temp) - 10} textAnchor="middle" fontSize="12" fill="var(--foreground)">{Math.round(h.temp)}{u.slice(0, 1)}</text>
            <text x={x(i)} y={H + 10} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">{h.t.slice(11, 16)}</text>
          </g>
        ))}
      </svg>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Line: temperature · Bars: chance of rain</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="glass h-80 animate-pulse lg:col-span-2" />
      <div className="glass h-80 animate-pulse" />
      <div className="glass h-56 animate-pulse lg:col-span-3" />
    </div>
  );
}
