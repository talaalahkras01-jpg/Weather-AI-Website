import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  Bell,
  CalendarDays,
  Check,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  Globe2,
  LocateFixed,
  Menu,
  Moon,
  MoreHorizontal,
  Navigation,
  RefreshCw,
  Search,
  Settings2,
  Sun,
  Sunrise,
  Sunset,
  Umbrella,
  Wind,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const queryClient = new QueryClient();

type Unit = 'c' | 'f';
type WeatherKind = 'sunny' | 'partly' | 'rain' | 'drizzle' | 'cloudy';

type CityWeather = {
  name: string;
  region: string;
  country: string;
  timezone: string;
  updated: string;
  tempC: number;
  feelsC: number;
  highC: number;
  lowC: number;
  humidity: number;
  windKph: number;
  windDirection: string;
  visibility: number;
  uv: number;
  kind: WeatherKind;
  condition: string;
  sunrise: string;
  sunset: string;
  brief: string;
  note: string;
  rainChance: number;
  hourly: { time: string; tempC: number; kind: WeatherKind; rain: number }[];
  days: { day: string; date: string; highC: number; lowC: number; kind: WeatherKind; rain: number }[];
};

const cityData: Record<string, CityWeather> = {
  'San Francisco': {
    name: 'San Francisco',
    region: 'California',
    country: 'United States',
    timezone: 'PST · UTC−08:00',
    updated: 'Updated just now',
    tempC: 17,
    feelsC: 16,
    highC: 19,
    lowC: 12,
    humidity: 68,
    windKph: 14,
    windDirection: 'WNW',
    visibility: 16,
    uv: 4,
    kind: 'partly',
    condition: 'Partly cloudy',
    sunrise: '7:23 AM',
    sunset: '5:12 PM',
    brief: 'A soft start, a bright middle.',
    note: 'The marine layer should lift by late morning. A light jacket will carry you from the cool start into a comfortable afternoon.',
    rainChance: 8,
    hourly: [
      { time: 'Now', tempC: 17, kind: 'partly', rain: 8 },
      { time: '10 AM', tempC: 17, kind: 'partly', rain: 5 },
      { time: '11 AM', tempC: 18, kind: 'sunny', rain: 4 },
      { time: '12 PM', tempC: 18, kind: 'sunny', rain: 3 },
      { time: '1 PM', tempC: 19, kind: 'sunny', rain: 2 },
      { time: '2 PM', tempC: 19, kind: 'partly', rain: 3 },
      { time: '3 PM', tempC: 18, kind: 'partly', rain: 5 },
      { time: '4 PM', tempC: 17, kind: 'partly', rain: 7 },
    ],
    days: [
      { day: 'Today', date: 'Feb 14', highC: 19, lowC: 12, kind: 'partly', rain: 8 },
      { day: 'Sat', date: 'Feb 15', highC: 18, lowC: 11, kind: 'sunny', rain: 6 },
      { day: 'Sun', date: 'Feb 16', highC: 16, lowC: 10, kind: 'cloudy', rain: 12 },
      { day: 'Mon', date: 'Feb 17', highC: 17, lowC: 11, kind: 'drizzle', rain: 26 },
      { day: 'Tue', date: 'Feb 18', highC: 18, lowC: 12, kind: 'partly', rain: 10 },
      { day: 'Wed', date: 'Feb 19', highC: 20, lowC: 12, kind: 'sunny', rain: 4 },
      { day: 'Thu', date: 'Feb 20', highC: 19, lowC: 13, kind: 'sunny', rain: 5 },
    ],
  },
  'Copenhagen': {
    name: 'Copenhagen',
    region: 'Capital Region',
    country: 'Denmark',
    timezone: 'CET · UTC+01:00',
    updated: 'Updated just now',
    tempC: 4,
    feelsC: 1,
    highC: 6,
    lowC: 1,
    humidity: 79,
    windKph: 21,
    windDirection: 'SW',
    visibility: 10,
    uv: 1,
    kind: 'drizzle',
    condition: 'Light drizzle',
    sunrise: '7:42 AM',
    sunset: '5:04 PM',
    brief: 'A raincoat kind of morning.',
    note: 'A fine mist hangs around through lunch, with a cooler breeze off the water. Keep your plans moving, but keep them close to cover.',
    rainChance: 44,
    hourly: [
      { time: 'Now', tempC: 4, kind: 'drizzle', rain: 44 },
      { time: '10 AM', tempC: 4, kind: 'drizzle', rain: 48 },
      { time: '11 AM', tempC: 5, kind: 'cloudy', rain: 40 },
      { time: '12 PM', tempC: 5, kind: 'cloudy', rain: 35 },
      { time: '1 PM', tempC: 6, kind: 'partly', rain: 24 },
      { time: '2 PM', tempC: 6, kind: 'partly', rain: 20 },
      { time: '3 PM', tempC: 5, kind: 'cloudy', rain: 27 },
      { time: '4 PM', tempC: 4, kind: 'drizzle', rain: 35 },
    ],
    days: [
      { day: 'Today', date: 'Feb 14', highC: 6, lowC: 1, kind: 'drizzle', rain: 44 },
      { day: 'Sat', date: 'Feb 15', highC: 7, lowC: 2, kind: 'cloudy', rain: 29 },
      { day: 'Sun', date: 'Feb 16', highC: 5, lowC: 0, kind: 'rain', rain: 53 },
      { day: 'Mon', date: 'Feb 17', highC: 4, lowC: -1, kind: 'cloudy', rain: 20 },
      { day: 'Tue', date: 'Feb 18', highC: 6, lowC: 1, kind: 'partly', rain: 18 },
      { day: 'Wed', date: 'Feb 19', highC: 8, lowC: 2, kind: 'sunny', rain: 10 },
      { day: 'Thu', date: 'Feb 20', highC: 7, lowC: 1, kind: 'partly', rain: 17 },
    ],
  },
  'Tokyo': {
    name: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    timezone: 'JST · UTC+09:00',
    updated: 'Updated just now',
    tempC: 11,
    feelsC: 10,
    highC: 15,
    lowC: 7,
    humidity: 53,
    windKph: 9,
    windDirection: 'N',
    visibility: 20,
    uv: 3,
    kind: 'sunny',
    condition: 'Clear skies',
    sunrise: '6:29 AM',
    sunset: '5:21 PM',
    brief: 'Make room for a little sun.',
    note: 'Clear and cool with a gentle north wind. It is a good day for the long way home, especially once the afternoon warms up.',
    rainChance: 3,
    hourly: [
      { time: 'Now', tempC: 11, kind: 'sunny', rain: 3 },
      { time: '10 AM', tempC: 12, kind: 'sunny', rain: 2 },
      { time: '11 AM', tempC: 13, kind: 'sunny', rain: 2 },
      { time: '12 PM', tempC: 14, kind: 'sunny', rain: 1 },
      { time: '1 PM', tempC: 15, kind: 'sunny', rain: 1 },
      { time: '2 PM', tempC: 15, kind: 'partly', rain: 2 },
      { time: '3 PM', tempC: 14, kind: 'partly', rain: 3 },
      { time: '4 PM', tempC: 13, kind: 'sunny', rain: 2 },
    ],
    days: [
      { day: 'Today', date: 'Feb 14', highC: 15, lowC: 7, kind: 'sunny', rain: 3 },
      { day: 'Sat', date: 'Feb 15', highC: 14, lowC: 6, kind: 'partly', rain: 6 },
      { day: 'Sun', date: 'Feb 16', highC: 12, lowC: 5, kind: 'cloudy', rain: 11 },
      { day: 'Mon', date: 'Feb 17', highC: 13, lowC: 6, kind: 'sunny', rain: 4 },
      { day: 'Tue', date: 'Feb 18', highC: 16, lowC: 7, kind: 'sunny', rain: 2 },
      { day: 'Wed', date: 'Feb 19', highC: 17, lowC: 8, kind: 'partly', rain: 5 },
      { day: 'Thu', date: 'Feb 20', highC: 15, lowC: 7, kind: 'sunny', rain: 3 },
    ],
  },
  'Lisbon': {
    name: 'Lisbon',
    region: 'Lisbon District',
    country: 'Portugal',
    timezone: 'WET · UTC±00:00',
    updated: 'Updated just now',
    tempC: 15,
    feelsC: 15,
    highC: 18,
    lowC: 11,
    humidity: 61,
    windKph: 12,
    windDirection: 'NW',
    visibility: 18,
    uv: 4,
    kind: 'sunny',
    condition: 'Bright and clear',
    sunrise: '7:31 AM',
    sunset: '6:07 PM',
    brief: 'An easy day is waiting.',
    note: 'Bright skies and a mild breeze make this a low-friction day. Leave the layers light and make time for an outside pause.',
    rainChance: 5,
    hourly: [
      { time: 'Now', tempC: 15, kind: 'sunny', rain: 5 },
      { time: '10 AM', tempC: 16, kind: 'sunny', rain: 4 },
      { time: '11 AM', tempC: 17, kind: 'sunny', rain: 3 },
      { time: '12 PM', tempC: 18, kind: 'sunny', rain: 3 },
      { time: '1 PM', tempC: 18, kind: 'sunny', rain: 2 },
      { time: '2 PM', tempC: 18, kind: 'partly', rain: 4 },
      { time: '3 PM', tempC: 17, kind: 'partly', rain: 5 },
      { time: '4 PM', tempC: 16, kind: 'sunny', rain: 3 },
    ],
    days: [
      { day: 'Today', date: 'Feb 14', highC: 18, lowC: 11, kind: 'sunny', rain: 5 },
      { day: 'Sat', date: 'Feb 15', highC: 19, lowC: 11, kind: 'sunny', rain: 4 },
      { day: 'Sun', date: 'Feb 16', highC: 17, lowC: 10, kind: 'partly', rain: 13 },
      { day: 'Mon', date: 'Feb 17', highC: 16, lowC: 10, kind: 'drizzle', rain: 28 },
      { day: 'Tue', date: 'Feb 18', highC: 17, lowC: 11, kind: 'partly', rain: 12 },
      { day: 'Wed', date: 'Feb 19', highC: 18, lowC: 11, kind: 'sunny', rain: 6 },
      { day: 'Thu', date: 'Feb 20', highC: 19, lowC: 12, kind: 'sunny', rain: 4 },
    ],
  },
};

const suggestedCities = ['San Francisco', 'Copenhagen', 'Tokyo', 'Lisbon'];

function weatherIcon(kind: WeatherKind, size = 24): ReactNode {
  const props = { size, strokeWidth: 1.8 };
  if (kind === 'sunny') return <Sun {...props} />;
  if (kind === 'rain') return <CloudRain {...props} />;
  if (kind === 'drizzle') return <CloudDrizzle {...props} />;
  if (kind === 'cloudy') return <Cloud {...props} />;
  return <CloudSun {...props} />;
}

function formatTemp(celsius: number, unit: Unit) {
  return unit === 'c' ? Math.round(celsius) : Math.round(celsius * 9 / 5 + 32);
}

function tempLabel(celsius: number, unit: Unit) {
  return `${formatTemp(celsius, unit)}°`;
}

function DirectionMark({ direction }: { direction: string }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
      <Navigation size={12} style={{ transform: `rotate(${direction === 'N' ? 0 : direction === 'NE' ? 45 : direction === 'E' ? 90 : direction === 'SE' ? 135 : direction === 'S' ? 180 : direction === 'SW' ? 225 : direction === 'W' ? 270 : 315}deg)` }} />
    </span>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary)/.75)] text-[hsl(var(--primary))]"><Icon size={17} /></div>
      <div className="min-w-0">
        <p className="mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-[hsl(var(--foreground))]">{value} <span className="font-medium text-[hsl(var(--muted-foreground))]">{detail}</span></p>
      </div>
    </div>
  );
}

function Home() {
  const [city, setCity] = useState('San Francisco');
  const [unit, setUnit] = useState<Unit>('c');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const weather = cityData[city];
  const suggestions = useMemo(() => suggestedCities.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase())), [search]);

  const selectCity = (nextCity: string) => {
    setCity(nextCity);
    setSearch('');
    setSearchOpen(false);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const exact = suggestedCities.find((item) => item.toLowerCase() === search.trim().toLowerCase());
    if (exact) selectCity(exact);
  };

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 650);
  };

  return (
    <main className="weather-app">
      <div className="weather-content mx-auto max-w-[1440px] px-5 pb-12 sm:px-8 lg:px-12">
        <header className="flex min-h-[78px] items-center justify-between gap-4 border-b border-[hsl(var(--border)/.7)]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-[13px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_7px_18px_hsl(var(--primary)/.22)]">
              <div className="absolute h-4 w-4 rounded-full border border-[hsl(var(--accent))] border-l-transparent -rotate-45" />
              <div className="absolute h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold tracking-[-.03em] text-[hsl(var(--foreground))]">weather<span className="text-[hsl(var(--primary))]">.ai</span></p>
              <p className="mono hidden text-[9px] uppercase tracking-[.17em] text-[hsl(var(--muted-foreground))] sm:block">read the sky</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="mono mr-2 text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Personal forecast</span>
            <button data-testid="button-refresh" onClick={refresh} className="soft-button flex h-9 items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] px-3 text-xs font-bold text-[hsl(var(--foreground))]" aria-label="Refresh weather">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Reading…' : 'Refresh'}
            </button>
            <button data-testid="button-settings" onClick={() => setSettingsOpen(!settingsOpen)} className="soft-button flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] text-[hsl(var(--muted-foreground))]" aria-label="Open settings">
              <Settings2 size={15} />
            </button>
          </div>
          <button data-testid="button-mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] text-[hsl(var(--foreground))] md:hidden" aria-label="Open menu">
            <Menu size={17} />
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="flex items-center justify-end gap-2 border-b border-[hsl(var(--border)/.7)] py-3 md:hidden">
            <button data-testid="button-mobile-refresh" onClick={refresh} className="soft-button flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-bold"><RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh</button>
            <button data-testid="button-mobile-settings" onClick={() => setSettingsOpen(!settingsOpen)} className="soft-button flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-bold"><Settings2 size={13} /> Settings</button>
          </div>
        )}
        {settingsOpen && (
          <div data-testid="panel-settings" className="glass fixed right-5 top-[70px] z-20 w-[230px] rounded-2xl p-4 shadow-[var(--shadow-md)] sm:right-8 lg:right-12">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold">Forecast settings</p>
              <button data-testid="button-close-settings" onClick={() => setSettingsOpen(false)} className="text-[hsl(var(--muted-foreground))]" aria-label="Close settings"><X size={15} /></button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border)/.7)] pt-3">
              <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Temperature unit</span>
              <div className="flex rounded-lg bg-[hsl(var(--secondary))] p-1">
                <button data-testid="button-settings-celsius" onClick={() => setUnit('c')} className={`rounded-md px-2 py-1 text-[10px] font-extrabold ${unit === 'c' ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>°C</button>
                <button data-testid="button-settings-fahrenheit" onClick={() => setUnit('f')} className={`rounded-md px-2 py-1 text-[10px] font-extrabold ${unit === 'f' ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>°F</button>
              </div>
            </div>
          </div>
        )}

        <section className="stagger-in mx-auto max-w-6xl pt-8 sm:pt-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mono mb-3 text-[10px] font-medium uppercase tracking-[.19em] text-[hsl(var(--primary))]">Friday, February 14 · 08:42 local time</p>
              <h1 className="max-w-2xl text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-[.98] tracking-[-.065em] text-[hsl(var(--foreground))]">
                Make room for<br /><span className="serif font-medium tracking-[-.045em] text-[hsl(var(--primary))]">what today brings.</span>
              </h1>
            </div>
            <div className="relative w-full max-w-sm">
              <form data-testid="form-location-search" onSubmit={handleSearch} className="relative" role="search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={17} />
                <input data-testid="input-location-search" value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} placeholder="Search a city" className="h-12 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] pl-11 pr-4 text-sm font-semibold outline-none transition-all placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/.1)]" />
              </form>
              {searchOpen && (
                <div className="glass absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl p-1.5">
                  {suggestions.length ? suggestions.map((suggestion) => (
                    <button data-testid={`button-suggestion-${suggestion.toLowerCase().replace(' ', '-')}`} key={suggestion} onMouseDown={() => selectCity(suggestion)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--secondary))]">
                      <span className="flex items-center gap-3"><Globe2 size={15} className="text-[hsl(var(--primary))]" /> {suggestion}</span>
                      <span className="mono text-[10px] font-normal text-[hsl(var(--muted-foreground))]">{cityData[suggestion].country}</span>
                    </button>
                  )) : (
                    <div data-testid="empty-search-results" className="px-3 py-5 text-center">
                      <p className="text-sm font-bold">No skies found</p>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Try San Francisco, Copenhagen, Tokyo, or Lisbon.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mono mr-1 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Suggested</span>
            {suggestedCities.map((suggestion) => (
              <button data-testid={`button-city-${suggestion.toLowerCase().replace(' ', '-')}`} key={suggestion} onClick={() => selectCity(suggestion)} className={`soft-button rounded-full border px-3 py-1.5 text-xs font-bold ${city === suggestion ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.6)] hover:text-[hsl(var(--primary))]'}`}>{suggestion}</button>
            ))}
          </div>
        </section>

        <section className="stagger-in stagger-1 mx-auto mt-8 max-w-6xl" onClick={() => setSearchOpen(false)}>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <article className="relative min-h-[310px] overflow-hidden rounded-[28px] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[0_20px_55px_hsl(var(--primary)/.2)] sm:p-8">
              <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full border border-[hsl(var(--accent)/.23)] bg-[hsl(var(--accent)/.08)]" />
              <div className="absolute -right-4 -top-10 h-44 w-44 rounded-full border border-[hsl(var(--accent)/.22)]" />
              <div className="absolute bottom-[-90px] left-[38%] h-48 w-48 rounded-full border border-[hsl(var(--primary-foreground)/.1)]" />
              <div className="relative flex h-full flex-col justify-between gap-14">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[hsl(var(--primary-foreground)/.78)]"><LocateFixed size={15} /><span className="text-sm font-semibold">{weather.name}, {weather.region}</span></div>
                    <p className="mono mt-1 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary-foreground)/.58)]">{weather.timezone} · {weather.updated}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary-foreground)/.1)] px-1.5 py-1.5">
                    <button data-testid="button-unit-celsius" onClick={() => setUnit('c')} className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${unit === 'c' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : 'text-[hsl(var(--primary-foreground)/.62)]'}`}>°C</button>
                    <button data-testid="button-unit-fahrenheit" onClick={() => setUnit('f')} className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${unit === 'f' ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : 'text-[hsl(var(--primary-foreground)/.62)]'}`}>°F</button>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="breathe flex h-20 w-20 items-center justify-center rounded-[26px] bg-[hsl(var(--accent)/.17)] text-[hsl(var(--accent))]">{weatherIcon(weather.kind, 48)}</div>
                    <div>
                      <div className="flex items-start"><span className="text-[clamp(4.3rem,9vw,7.1rem)] font-extrabold leading-[.8] tracking-[-.1em]">{formatTemp(weather.tempC, unit)}</span><span className="ml-2 mt-1 text-3xl font-light">°</span></div>
                      <p className="mt-3 text-sm font-semibold text-[hsl(var(--primary-foreground)/.82)]">{weather.condition} <span className="mx-1 opacity-40">·</span> Feels like {tempLabel(weather.feelsC, unit)}</p>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary-foreground)/.55)]">Today</p>
                    <p className="mt-2 font-serif text-2xl"><span className="text-[hsl(var(--accent))]">{tempLabel(weather.highC, unit)}</span> <span className="text-[hsl(var(--primary-foreground)/.5)]">{tempLabel(weather.lowC, unit)}</span></p>
                  </div>
                </div>
              </div>
            </article>

            <article className="glass flex min-h-[310px] flex-col justify-between rounded-[28px] p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <p className="mono flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Day brief</p>
                  <span className="mono rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1 text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Weather AI</span>
                </div>
                <h2 data-testid="text-day-brief" className="serif mt-8 text-4xl leading-[.95] tracking-[-.04em] text-[hsl(var(--foreground))] sm:text-[3.2rem]">{weather.brief}</h2>
                <p className="mt-5 max-w-lg text-[14px] leading-7 text-[hsl(var(--muted-foreground))]">{weather.note}</p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--border)/.7)] pt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent-foreground))]"><Check size={15} /></div>
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">Good window for an outside break</span>
                <span className="mono ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">11:00—15:00</span>
              </div>
            </article>
          </div>
        </section>

        <section className="stagger-in stagger-2 mx-auto mt-4 grid max-w-6xl gap-4 md:grid-cols-4">
          <Metric icon={Wind} label="Wind" value={`${weather.windKph} km/h`} detail={weather.windDirection} />
          <Metric icon={Droplets} label="Humidity" value={`${weather.humidity}%`} detail="comfortable" />
          <Metric icon={Umbrella} label="Rain chance" value={`${weather.rainChance}%`} detail="today" />
          <Metric icon={Compass} label="Visibility" value={`${weather.visibility} km`} detail={`UV ${weather.uv}`} />
        </section>

        <section className="stagger-in stagger-3 mx-auto mt-12 max-w-6xl">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">The day, in motion</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">Hourly outlook</h2>
            </div>
            <p className="hidden text-xs font-semibold text-[hsl(var(--muted-foreground))] sm:block">Next 8 hours · {unit === 'c' ? 'Celsius' : 'Fahrenheit'}</p>
          </div>
          <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
            {weather.hourly.map((hour, index) => (
              <div data-testid={`card-hourly-${index}`} key={hour.time} className={`min-w-[102px] rounded-2xl border p-4 text-center transition-transform hover:-translate-y-1 ${index === 0 ? 'border-[hsl(var(--accent)/.7)] bg-[hsl(var(--accent)/.15)]' : 'border-[hsl(var(--border)/.75)] bg-[hsl(var(--card)/.55)]'}`}>
                <p className="mono text-[10px] font-medium uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">{hour.time}</p>
                <div className={`my-4 flex justify-center ${hour.kind === 'sunny' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--primary))]'}`}>{weatherIcon(hour.kind, 23)}</div>
                <p className="text-lg font-extrabold tracking-[-.04em]">{tempLabel(hour.tempC, unit)}</p>
                <p className="mono mt-1 text-[9px] text-[hsl(var(--muted-foreground))]">{hour.rain}% rain</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stagger-in stagger-4 mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-[1fr_290px]">
          <div className="glass rounded-[28px] p-6 sm:p-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">A little further out</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">Seven-day outlook</h2>
              </div>
              <CalendarDays className="text-[hsl(var(--muted-foreground))]" size={20} />
            </div>
            <div className="divide-y divide-[hsl(var(--border)/.7)]">
              {weather.days.map((day, index) => (
                <div data-testid={`row-forecast-${index}`} key={day.date} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1.1fr_.8fr_1fr_auto]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${day.kind === 'sunny' ? 'bg-[hsl(var(--accent)/.16)] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`}>{weatherIcon(day.kind, 17)}</div>
                    <div><p className="text-sm font-extrabold">{day.day}</p><p className="mono text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{day.date}</p></div>
                  </div>
                  <span className="hidden text-xs font-semibold text-[hsl(var(--muted-foreground))] sm:block">{day.kind === 'sunny' ? 'Clear' : day.kind === 'partly' ? 'Partly cloudy' : day.kind === 'drizzle' ? 'Light drizzle' : day.kind === 'rain' ? 'Rain' : 'Cloudy'}</span>
                  <div className="flex items-center justify-end gap-3 text-sm font-extrabold"><span>{tempLabel(day.highC, unit)}</span><span className="font-medium text-[hsl(var(--muted-foreground))]">{tempLabel(day.lowC, unit)}</span></div>
                  <div className="hidden min-w-[75px] items-center gap-2 sm:flex"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--secondary))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${Math.min(day.rain * 1.7, 100)}%` }} /></div><span className="mono text-[9px] text-[hsl(var(--muted-foreground))]">{day.rain}%</span></div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            {alertVisible ? (
              <div data-testid="card-weather-insight" className="relative overflow-hidden rounded-[28px] bg-[hsl(var(--accent))] p-6 text-[hsl(var(--accent-foreground))]">
                <button data-testid="button-dismiss-alert" onClick={() => setAlertVisible(false)} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--accent-foreground)/.1)] transition-colors hover:bg-[hsl(var(--accent-foreground)/.2)]" aria-label="Dismiss insight"><X size={14} /></button>
                <Bell size={20} />
                <p className="mono mt-8 text-[10px] uppercase tracking-[.16em] opacity-65">Small insight</p>
                <h3 className="mt-2 text-xl font-extrabold leading-tight tracking-[-.04em]">{weather.rainChance > 30 ? 'Keep a little shelter nearby.' : 'The sky is on your side.'}</h3>
                <p className="mt-3 text-xs font-semibold leading-5 opacity-75">{weather.rainChance > 30 ? `There is a ${weather.rainChance}% chance of rain around midday. A compact umbrella will keep your plans flexible.` : 'Rain is unlikely today, so this is a good one for an unplanned detour or a longer lunch outside.'}</p>
              </div>
            ) : (
              <div data-testid="empty-insight" className="glass flex min-h-[190px] flex-col items-center justify-center rounded-[28px] p-6 text-center"><Check className="text-[hsl(var(--primary))]" /><p className="mt-3 text-sm font-extrabold">Nothing pressing overhead.</p><button data-testid="button-restore-alert" onClick={() => setAlertVisible(true)} className="mt-3 text-xs font-bold text-[hsl(var(--primary))] underline underline-offset-4">Show insight</button></div>
            )}
            <div className="glass rounded-[28px] p-5">
              <div className="flex items-center justify-between">
                <p className="mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Daylight</p>
                <Sunrise size={16} className="text-[hsl(var(--accent-foreground))]" />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div><p className="mono text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">Sunrise</p><p className="mt-1 text-sm font-extrabold">{weather.sunrise}</p></div>
                <div className="mb-2 h-px w-12 bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))]" />
                <div className="text-right"><p className="mono text-[9px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">Sunset</p><p className="mt-1 text-sm font-extrabold">{weather.sunset}</p></div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[hsl(var(--muted-foreground))]"><Moon size={14} /><span className="mono text-[9px] uppercase tracking-[.1em]">9h 49m of light</span><Sunset size={14} /></div>
            </div>
          </aside>
        </section>

        <footer className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-[hsl(var(--border)/.7)] pt-5 text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold">A quieter way to read the weather.</p>
          <div className="flex items-center gap-4"><span className="mono text-[9px] uppercase tracking-[.12em]">Local data · No sign in</span><MoreHorizontal size={15} /></div>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;