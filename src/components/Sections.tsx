import { useEffect, useRef, useState } from "react";
import { IMG, MARQUEE_WORDS, ORIGINS } from "../lib/data";
import { useCart } from "../store";

/* ------------------------------- marquee ------------------------------- */
export function Marquee() {
  const row = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="marquee-hover overflow-hidden border-y border-latte/10 bg-roast py-5 select-none">
      <div className="animate-marquee flex w-max items-center gap-8">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8">
            <span
              className={`whitespace-nowrap font-display text-2xl md:text-3xl ${
                i % 2 ? "italic font-light text-foam" : "font-medium text-latte"
              }`}
            >
              {w}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-caramel shrink-0">
              <path
                d="M12 2c1.4 4.5 4.5 7.6 10 10-5.5 2.4-8.6 5.5-10 10-1.4-4.5-4.5-7.6-10-10 5.5-2.4 8.6-5.5 10-10z"
                fill="currentColor"
              />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ counters ------------------------------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const dur = 1500;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          setVal(Math.round(to * (1 - Math.pow(1 - t, 3))));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------- story --------------------------------- */
const STATS = [
  { to: 9, suffix: "", label: "years roasting" },
  { to: 14, suffix: "", label: "origins on rotation" },
  { to: 312, suffix: "k", label: "cups poured" },
  { to: 6, suffix: " a.m.", label: "first bun out of the oven" },
];

export function Story() {
  return (
    <section id="story" className="relative mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-36">
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-14 md:gap-20">
        {/* sticky text column */}
        <div className="md:sticky md:top-28 md:self-start">
          <p className="rv text-[11px] font-bold tracking-[0.32em] uppercase text-amber">
            Our story
          </p>
          <h2 className="rv font-display text-4xl md:text-6xl font-light leading-[1.04] text-latte mt-4">
            We built a roastery
            <br />
            around one stubborn
            <br />
            <em className="font-medium text-crema">sixty-second pour.</em>
          </h2>
          <div className="mt-7 space-y-5 text-foam text-[15px] md:text-base leading-relaxed max-w-lg">
            <p className="rv">
              Koppar started in 2016 with a second-hand drum roaster, a garage
              in Södermalm, and the conviction that most coffee is served too
              fast and thought about too little. We roast small — twelve kilos
              at a time — because flavors peak in days, not months.
            </p>
            <p className="rv">
              The bar runs slow on purpose. Every iced latte is built in order,
              the way you just scrolled it: ice, milk, shot. No pre-batched
              cold brew pretending to be espresso, no milk from a gun. If there
              is a queue, there is a queue — and there are buns.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="rv border-l-2 border-caramel/60 pl-4">
                <p className="font-display text-3xl md:text-4xl font-semibold text-latte">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-khaki">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* images column */}
        <div className="space-y-10 md:pt-16">
          <figure className="rv-r group relative overflow-hidden">
            <img
              src={IMG.barista}
              alt="Barista pouring latte art"
              loading="lazy"
              className="w-full aspect-[3/4] object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
            />
            <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-espresso/90 to-transparent px-5 pb-4 pt-12 text-xs tracking-wide text-foam">
              Maja, head barista — the hand behind the pour you just watched.
            </figcaption>
            <span className="absolute left-4 top-4 bg-amber px-2.5 py-1 text-[10px] font-extrabold tracking-[0.2em] uppercase text-espresso">
              The slow bar
            </span>
          </figure>
          <figure className="rv-l group relative overflow-hidden md:ml-12">
            <img
              src={IMG.roastery}
              alt="The roastery drum at night"
              loading="lazy"
              className="w-full aspect-[7/5] object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
            />
            <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-espresso/90 to-transparent px-5 pb-4 pt-12 text-xs tracking-wide text-foam">
              The 1974 Probat, retired from Oslo, roasting Tuesdays and Fridays.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ origins -------------------------------- */
function OriginRow({ o, i }: { o: (typeof ORIGINS)[number]; i: number }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const onAdd = () => {
    add(o.id);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1100);
  };

  return (
    <div
      className="rv group grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_0.8fr_1fr_0.6fr_0.5fr] items-center gap-x-6 gap-y-2 border-b border-latte/15 py-6 px-2 md:px-4 transition-all duration-500 hover:bg-bean/70 hover:px-6"
      style={{ transitionDelay: `${i * 40}ms` }}
    >
      <div>
        <h3 className="font-display text-xl md:text-2xl font-medium text-latte group-hover:text-crema transition-colors duration-300">
          {o.name}
        </h3>
        <p className="text-xs text-khaki mt-1">
          {o.process} process · {o.altitude}
        </p>
      </div>
      <div className="hidden md:flex items-center gap-1.5" title={`Roast level ${o.roast} of 5`}>
        {Array.from({ length: 5 }).map((_, d) => (
          <span
            key={d}
            className={`h-2.5 w-2.5 rounded-full ${
              d < o.roast ? "bg-caramel" : "bg-latte/15"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {o.notes.map((n) => (
          <span
            key={n}
            className="border border-latte/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foam"
          >
            {n}
          </span>
        ))}
      </div>
      <p className="hidden md:block text-sm font-bold text-crema">{o.price}</p>
      <button
        onClick={onAdd}
        className={`justify-self-end px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 active:scale-95 ${
          added
            ? "bg-crema text-espresso"
            : "border border-latte/20 text-latte group-hover:border-amber hover:bg-amber hover:text-espresso"
        }`}
      >
        {added ? "Added ✓" : "Add bag"}
      </button>
    </div>
  );
}

export function Origins() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: `url(${IMG.beans})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso via-transparent to-espresso" />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8 py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className="rv text-[11px] font-bold tracking-[0.32em] uppercase text-amber">
              In the hopper right now
            </p>
            <h2 className="rv font-display text-4xl md:text-6xl font-light text-latte mt-3">
              Four origins,
              <em className="font-medium text-crema"> zero blends hiding.</em>
            </h2>
          </div>
          <p className="rv max-w-xs text-sm text-foam leading-relaxed">
            Roasted every Tuesday and Friday. Bags stamped with the roast date
            — if it is older than three weeks, we brew it for the staff.
          </p>
        </div>

        <div className="border-t border-latte/15">
          {ORIGINS.map((o, i) => (
            <OriginRow key={o.id} o={o} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
