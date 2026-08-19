import { useEffect, useMemo, useState } from "react";
import { HOURS, QUOTES } from "../lib/data";
import { CupMark } from "./Nav";

/* ------------------------------ brew lab ------------------------------- */
export function BrewLab() {
  const [dose, setDose] = useState(18);
  const [ratio, setRatio] = useState(2.0);
  const [grind, setGrind] = useState<"fine" | "medium" | "coarse">("fine");

  const water = Math.round(dose * ratio * 10) / 10;
  const time = useMemo(() => {
    const base = grind === "fine" ? 27 : grind === "medium" ? 45 : 150;
    return Math.round(base + (ratio - 2) * (grind === "fine" ? 2 : 6));
  }, [grind, ratio]);

  const fillPct = Math.min((ratio / 3) * 100, 100);

  return (
    <section id="lab" className="relative border-y border-latte/10 bg-roast">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div>
          <p className="rv text-[11px] font-bold tracking-[0.32em] uppercase text-amber">
            Brew lab
          </p>
          <h2 className="rv font-display text-4xl md:text-6xl font-light leading-[1.04] text-latte mt-4">
            Dial in your shot
            <br />
            <em className="font-medium text-crema">before you leave home.</em>
          </h2>
          <p className="rv mt-6 text-foam text-[15px] leading-relaxed max-w-md">
            The same recipe card our baristas use every morning. Slide the dose
            and ratio — we will tell you the yield and roughly how long the
            shot should run.
          </p>

          <div className="mt-10 space-y-8 max-w-md">
            <div className="rv">
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="dose" className="text-xs font-bold uppercase tracking-[0.2em] text-foam">
                  Coffee dose
                </label>
                <span className="font-display text-2xl font-semibold text-latte">
                  {dose} <span className="text-sm text-khaki">g</span>
                </span>
              </div>
              <input
                id="dose"
                type="range"
                min={12}
                max={22}
                step={0.5}
                value={dose}
                onChange={(e) => setDose(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="rv">
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="ratio" className="text-xs font-bold uppercase tracking-[0.2em] text-foam">
                  Brew ratio
                </label>
                <span className="font-display text-2xl font-semibold text-latte">
                  1 : {ratio.toFixed(1)}
                </span>
              </div>
              <input
                id="ratio"
                type="range"
                min={1.2}
                max={3}
                step={0.1}
                value={ratio}
                onChange={(e) => setRatio(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="rv">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foam mb-3">
                Grind
              </p>
              <div className="inline-flex border border-latte/20">
                {(["fine", "medium", "coarse"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrind(g)}
                    className={`px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] transition-all duration-300 ${
                      grind === g
                        ? "bg-amber text-espresso"
                        : "text-foam hover:text-latte"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* readout panel */}
        <div className="rv-r relative border border-latte/15 bg-espresso p-8 md:p-12">
          <div className="absolute -top-px -left-px h-8 w-8 border-t-2 border-l-2 border-amber" />
          <div className="absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-amber" />

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-khaki">
                In the basket
              </p>
              <p className="font-display text-6xl md:text-7xl font-semibold text-latte mt-2 tabular-nums">
                {dose}
                <span className="text-2xl text-amber">g</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-khaki">
                In the cup
              </p>
              <p className="font-display text-6xl md:text-7xl font-semibold text-crema mt-2 tabular-nums">
                {water}
                <span className="text-2xl text-amber">g</span>
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.24em] text-khaki mb-3">
              <span>Target time</span>
              <span className="text-latte">≈ {time}s</span>
            </div>
            <div className="h-2 bg-bean overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-bark via-caramel to-amber transition-[width] duration-500 ease-out"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* cup visual */}
          <div className="mt-10 flex items-end justify-center gap-6">
            <div className="relative h-28 w-24 border-2 border-latte/30 border-t-0 rounded-b-2xl overflow-hidden">
              <div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#3a2010] via-[#6b401f] to-[#b88045] transition-[height] duration-500 ease-out"
                style={{ height: `${Math.min(30 + ratio * 18, 88)}%` }}
              />
              <div className="absolute bottom-2 inset-x-0 text-center text-[9px] font-extrabold tracking-[0.2em] uppercase text-latte/80">
                espresso
              </div>
            </div>
            <p className="max-w-[180px] text-xs leading-relaxed text-foam">
              {ratio <= 1.6
                ? "Ristretto territory — syrupy, intense, short. Maja's personal setting."
                : ratio <= 2.3
                ? "Classic espresso — balanced sweetness and body. Where the Guji sings."
                : "Lungo leanings — longer, gentler, more tea-like. Great over ice."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- testimonials ---------------------------- */
export function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % QUOTES.length), 5000);
    return () => window.clearInterval(t);
  }, [paused]);

  const q = QUOTES[idx];

  return (
    <section
      className="relative mx-auto max-w-5xl px-5 md:px-8 py-24 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rv text-center">
        <svg width="44" height="34" viewBox="0 0 44 34" className="mx-auto text-caramel" fill="currentColor">
          <path d="M0 34V20.8C0 9.9 6.2 2.6 18 0l2.4 5.4C13 7.6 9.8 11.6 9.4 17H19v17H0zm25 0V20.8C25 9.9 31.2 2.6 43 0l1 5.4c-7.4 2.2-10.6 6.2-11 11.6h9.6V34H25z" transform="scale(0.95)" />
        </svg>
        <div key={idx} className="fade-swap mt-6">
          <blockquote className="font-display text-2xl md:text-4xl font-light leading-snug text-latte max-w-3xl mx-auto">
            {q.text}
          </blockquote>
          <p className="mt-8 text-sm font-bold tracking-[0.18em] uppercase text-crema">
            {q.name}
          </p>
          <p className="mt-1 text-xs text-khaki">{q.role}</p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            onClick={() => setIdx((i) => (i - 1 + QUOTES.length) % QUOTES.length)}
            className="flex h-10 w-10 items-center justify-center border border-latte/25 text-latte transition-all duration-300 hover:border-amber hover:text-amber"
            aria-label="Previous quote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex gap-2.5">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Quote ${i + 1}`}
                className={`h-1.5 transition-all duration-500 ${
                  i === idx ? "w-8 bg-amber" : "w-3 bg-latte/25 hover:bg-latte/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((i) => (i + 1) % QUOTES.length)}
            className="flex h-10 w-10 items-center justify-center border border-latte/25 text-latte transition-all duration-300 hover:border-amber hover:text-amber"
            aria-label="Next quote"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- visit -------------------------------- */
export function Visit() {
  const today = new Date().getDay(); // 0 = Sunday
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("done");
    setEmail("");
  };

  return (
    <section id="visit" className="relative border-t border-latte/10 bg-roast overflow-hidden">
      <div className="pointer-events-none absolute -right-24 -top-24 opacity-[0.05]">
        <CupMark className="h-[420px] w-[420px] text-latte" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 grid lg:grid-cols-2 gap-14">
        <div>
          <p className="rv text-[11px] font-bold tracking-[0.32em] uppercase text-amber">
            Visit us
          </p>
          <h2 className="rv font-display text-4xl md:text-6xl font-light leading-[1.04] text-latte mt-4">
            Copper counter,
            <br />
            <em className="font-medium text-crema">twelve seats, one roaster.</em>
          </h2>

          <div className="rv mt-8 space-y-3 text-[15px] text-foam">
            <p className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber shrink-0">
                <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              Götgatan 44, Södermalm, Stockholm
            </p>
            <p className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber shrink-0">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              +46 8 555 044 16
            </p>
            <a
              href="https://maps.google.com/?q=Götgatan+44+Stockholm"
              target="_blank"
              rel="noreferrer"
              className="link-underline inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-crema"
            >
              Get directions
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <form onSubmit={subscribe} className="rv mt-10 max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foam mb-3">
              Roast day reminders — every Tuesday
            </p>
            <div className="flex border border-latte/25 focus-within:border-amber transition-colors duration-300">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setState("idle");
                }}
                placeholder="you@slowmail.se"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-latte placeholder:text-khaki outline-none"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="bg-amber px-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-espresso transition-colors hover:bg-crema"
              >
                Join
              </button>
            </div>
            <p
              className={`mt-2.5 text-xs transition-all duration-300 ${
                state === "done"
                  ? "text-crema opacity-100"
                  : state === "error"
                  ? "text-amber opacity-100"
                  : "opacity-0"
              }`}
            >
              {state === "done"
                ? "You're on the list — first bag drops Tuesday 08:00."
                : state === "error"
                ? "That email looks under-extracted. Try again?"
                : "·"}
            </p>
          </form>
        </div>

        {/* hours */}
        <div className="rv-r border border-latte/15 bg-espresso p-8 md:p-10 self-start">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-medium text-latte">Opening hours</h3>
            <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-crema">
              <span className="pulse-dot h-2 w-2 rounded-full bg-amber" />
              roastery warm
            </span>
          </div>
          <ul>
            {HOURS.map((h, i) => {
              const isToday = (i + 1) % 7 === today; // HOURS starts Monday
              return (
                <li
                  key={h.day}
                  className={`flex items-center justify-between border-b border-latte/10 py-3.5 px-2 transition-colors ${
                    isToday ? "bg-bean/60 text-latte" : "text-foam"
                  }`}
                >
                  <span className={`text-sm font-semibold ${isToday ? "text-crema" : ""}`}>
                    {h.day}
                    {isToday && (
                      <span className="ml-2 bg-amber px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-espresso">
                        today
                      </span>
                    )}
                  </span>
                  <span className="font-display text-lg">{h.hours}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-khaki">
            Kitchen closes 30 minutes before the doors. The roaster runs Tue &
            Fri — come smell the first crack around 10:00.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- footer ------------------------------- */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-latte/10 bg-espresso">
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 pb-8">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-12">
          <div>
            <div className="flex items-center gap-3 text-latte">
              <CupMark className="h-8 w-8 text-amber" />
              <span className="font-display font-semibold text-2xl tracking-wide">KOPPAR</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foam">
              A small-batch roastery and slow bar in Södermalm. Ice first, milk
              second, shot last — since 2016.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Instagram",
                  d: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5zM17.8 6.2h.01",
                },
                {
                  label: "Spotify — bar playlist",
                  d: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.6 14.4a.7.7 0 0 1-1 .2c-2.6-1.6-6-2-9.9-1.1a.7.7 0 1 1-.3-1.4c4.3-1 8-.5 11 1.3a.7.7 0 0 1 .2 1zm1.2-2.9a.9.9 0 0 1-1.2.3c-3-1.9-7.6-2.4-11.2-1.3a.9.9 0 0 1-.5-1.7c4.1-1.3 9.2-.7 12.6 1.5a.9.9 0 0 1 .3 1.2zm.1-3A1 1 0 0 1 16.5 12C13 9.9 7.7 9.7 4.6 10.6a1 1 0 1 1-.6-2c3.6-1.1 9.5-.9 13.5 1.6a1 1 0 0 1 .4 1.3z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#pour"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center border border-latte/20 text-foam transition-all duration-300 hover:border-amber hover:text-amber hover:-translate-y-0.5"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d={s.d} stroke="currentColor" strokeWidth="1.6" fill="none" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-khaki mb-5">
              Shortcuts
            </p>
            <ul className="space-y-3">
              {[
                ["The pour", "pour"],
                ["Our story", "story"],
                ["Menu & bakery", "menu"],
                ["Brew lab", "lab"],
                ["Hours & visit", "visit"],
              ].map(([label, id]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="link-underline text-sm text-foam hover:text-latte transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-khaki mb-5">
              The fine grind
            </p>
            <ul className="space-y-3 text-sm text-foam">
              <li>Götgatan 44, Stockholm</li>
              <li>hello@koppar.coffee</li>
              <li>+46 8 555 044 16</li>
              <li className="pt-2 text-xs text-khaki">
                Wholesale & cuppings: Fridays 15:00
              </li>
            </ul>
          </div>
        </div>

        <p
          className="pointer-events-none select-none mt-14 text-center font-display font-bold leading-none text-outline"
          style={{ fontSize: "clamp(72px, 16vw, 220px)" }}
          aria-hidden="true"
        >
          KOPPAR
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-latte/10 pt-6 text-[11px] text-khaki">
          <span>© 2026 Koppar Roastery AB — brewed slowly, built with Three.js</span>
          <span>Ice · Milk · Shot · Repeat</span>
        </div>
      </div>
    </footer>
  );
}
