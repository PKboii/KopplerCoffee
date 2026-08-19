import { useEffect, useRef, useState } from "react";
import LatteScene from "../scene/LatteScene";
import { scrollBus, seekPour, scrollToId } from "../store";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

type Phase = {
  n: string;
  title: string;
  note: string;
  in: [number, number];
  out: [number, number];
  side: "left" | "right";
  rail: number;
};

const PHASES: Phase[] = [
  {
    n: "01",
    title: "Ice, first.",
    note: "Eight hand-cut cubes at −18 °C. Clear ice, never crushed — it melts slower, so nothing gets watered down.",
    in: [0.13, 0.19],
    out: [0.36, 0.42],
    side: "left",
    rail: 0.25,
  },
  {
    n: "02",
    title: "Cold milk, slow.",
    note: "Local dairy at 4 °C, poured down the side so the ice barely gives. This is the sweet, silky layer.",
    in: [0.42, 0.48],
    out: [0.6, 0.66],
    side: "right",
    rail: 0.51,
  },
  {
    n: "03",
    title: "The double shot.",
    note: "Ethiopia Guji — 18 g in, 36 g out, 27 seconds. It rides on top of the milk like a late sunset.",
    in: [0.65, 0.71],
    out: [0.82, 0.88],
    side: "left",
    rail: 0.74,
  },
  {
    n: "04",
    title: "Stir — or don't.",
    note: "Three turns of the copper straw marries the layers. Or sip straight through them, one stratum at a time.",
    in: [0.87, 0.93],
    out: [1.2, 1.4],
    side: "right",
    rail: 0.93,
  },
];

export default function PourSection() {
  const ref = useRef<HTMLElement>(null);
  const [ui, setUi] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const max = el.offsetHeight - window.innerHeight;
        const p = max > 0 ? clamp01(window.scrollY / max) : 0;
        scrollBus.p = p;
        setUi(Math.round(p * 400) / 400);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const fade = ui < 0.96 ? 1 : Math.max(0, 1 - (ui - 0.96) / 0.035);
  const active = ui < 0.998;
  const introOp = 1 - ss(0.02, 0.09, ui);

  return (
    <section
      id="pour"
      ref={ref}
      className="relative"
      style={{ height: "480vh" }}
      aria-label="The pour — a scroll-driven iced latte"
    >
      {/* 3D stage */}
      <div
        className="fixed inset-0 z-[5]"
        style={{ opacity: fade, pointerEvents: "none" }}
      >
        <LatteScene active={active} />
      </div>

      {/* overlay copy */}
      <div className="pointer-events-none fixed inset-0 z-[6]">
        {/* intro */}
        <div
          className="absolute bottom-[13vh] left-5 md:left-16 max-w-2xl"
          style={{ opacity: introOp, transform: `translateY(${(1 - introOp) * -30}px)` }}
        >
          <p className="font-body text-[11px] md:text-xs font-bold tracking-[0.32em] uppercase text-amber mb-4">
            Koppar Roastery · small-batch since 2016
          </p>
          <h1 className="font-display font-light text-latte text-[13vw] leading-[0.95] sm:text-6xl md:text-8xl">
            The iced latte,
            <br />
            <em className="font-medium text-crema not-italic md:italic">
              poured while you scroll.
            </em>
          </h1>
          <p className="mt-5 text-foam text-sm md:text-base max-w-md leading-relaxed">
            Ice first. Then cold milk. Then a double shot of Guji. Take the bar
            for a spin — the scroll wheel is your barista.
          </p>
          <button
            onClick={() => scrollToId("menu")}
            className="pointer-events-auto mt-7 group inline-flex items-center gap-3 border border-latte/25 px-5 py-2.5 text-xs font-bold tracking-[0.22em] uppercase text-latte transition-all duration-300 hover:border-amber hover:bg-amber hover:text-espresso"
          >
            Skip to the menu
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            >
              <path
                d="M12 4v16m0 0l-6-6m6 6l6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* phase captions */}
        {PHASES.map((ph) => {
          const op = ss(ph.in[0], ph.in[1], ui) * (1 - ss(ph.out[0], ph.out[1], ui));
          if (op <= 0.001) return null;
          const isLeft = ph.side === "left";
          return (
            <div
              key={ph.n}
              className={`absolute ${
                isLeft
                  ? "left-5 md:left-16 bottom-[14vh] text-left"
                  : "right-5 md:right-16 top-[26vh] text-right"
              } max-w-md`}
              style={{
                opacity: op,
                transform: `translateY(${(1 - op) * 34}px)`,
              }}
            >
              <div
                className={`font-display text-7xl md:text-9xl font-light text-outline leading-none ${
                  isLeft ? "" : "ml-auto"}`}
              >
                {ph.n}
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-medium text-latte mt-2 md:mt-3">
                {ph.title}
              </h2>
              <p
                className={`text-foam text-sm md:text-[15px] leading-relaxed mt-3 max-w-sm ${
                  isLeft ? "" : "ml-auto"
                }`}
              >
                {ph.note}
              </p>
            </div>
          );
        })}

        {/* seek rail */}
        <div className="pointer-events-auto absolute right-4 md:right-7 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-0">
          <div className="relative h-64 w-px bg-latte/15">
            <div
              className="absolute left-0 top-0 w-px bg-amber transition-[height] duration-200 ease-out"
              style={{ height: `${ui * 100}%` }}
            />
            {PHASES.map((ph) => {
              const isOn = ui >= ph.in[0] - 0.06 && ui < ph.out[0];
              return (
                <button
                  key={ph.n}
                  onClick={() => seekPour(ph.rail - 0.06)}
                  aria-label={`Jump to step ${ph.n}: ${ph.title}`}
                  className="absolute -left-[5px] group"
                  style={{ top: `${ph.rail * 100}%` }}
                >
                  <span
                    className={`block h-[11px] w-[11px] rounded-full border transition-all duration-300 ${
                      isOn
                        ? "border-amber bg-amber shadow-[0_0_12px_rgba(229,155,60,0.7)]"
                        : "border-latte/40 bg-espresso group-hover:border-amber"
                    }`}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-bold tracking-[0.22em] uppercase text-foam opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {ph.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* scroll hint */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5"
          style={{ opacity: 1 - ss(0.01, 0.055, ui) }}
        >
          <div className="h-9 w-[22px] rounded-full border border-latte/40 flex justify-center pt-1.5 overflow-hidden">
            <span className="wheel-line block h-2.5 w-[2.5px] rounded-full bg-amber" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-foam">
            scroll to brew
          </span>
        </div>
      </div>
    </section>
  );
}
