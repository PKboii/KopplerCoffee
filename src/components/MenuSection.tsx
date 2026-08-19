import { useMemo, useRef, useState } from "react";
import { MENU, CATEGORIES, IMG, type MenuItem } from "../lib/data";
import { useCart } from "../store";

function TagBadge({ tag }: { tag: NonNullable<MenuItem["tag"]> }) {
  const styles: Record<string, string> = {
    signature: "bg-amber text-espresso",
    new: "bg-crema text-espresso",
    vegan: "border border-crema/50 text-crema",
    seasonal: "border border-amber/50 text-amber",
  };
  return (
    <span
      className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em] ${styles[tag]}`}
    >
      {tag}
    </span>
  );
}

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const onAdd = () => {
    add(item.id);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1100);
  };

  return (
    <div
      className="rv group relative flex flex-col border border-latte/12 bg-roast/60 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-amber/60 hover:bg-bean/60 hover:shadow-[0_18px_50px_-20px_rgba(229,155,60,0.25)]"
      style={{ transitionDelay: `${(index % 4) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[22px] leading-snug font-medium text-latte group-hover:text-crema transition-colors duration-300">
          {item.name}
        </h3>
        <p className="font-display text-xl font-semibold text-amber whitespace-nowrap">
          €{item.price.toFixed(2)}
        </p>
      </div>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-foam">
        {item.desc}
      </p>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.tag && <TagBadge tag={item.tag} />}
        </div>
        <button
          onClick={onAdd}
          className={`flex items-center gap-2 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] transition-all duration-300 active:scale-95 ${
            added
              ? "bg-crema text-espresso"
              : "border border-latte/25 text-latte hover:border-amber hover:bg-amber hover:text-espresso"
          }`}
        >
          {added ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5l5 5L20 6.5"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              On the tray
            </>
          ) : (
            <>
              Add
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function MenuSection() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["key"]>("all");
  const items = useMemo(
    () =>
      cat === "all"
        ? MENU.filter((m) => m.cat !== "beans")
        : MENU.filter((m) => m.cat === cat),
    [cat]
  );

  return (
    <section id="menu" className="relative mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-36">
      <div className="grid lg:grid-cols-[0.9fr_1.6fr] gap-12 lg:gap-16 items-start">
        {/* left intro, sticky */}
        <div className="lg:sticky lg:top-28">
          <p className="rv text-[11px] font-bold tracking-[0.32em] uppercase text-amber">
            The menu
          </p>
          <h2 className="rv font-display text-4xl md:text-6xl font-light leading-[1.04] text-latte mt-4">
            Short, seasonal,
            <br />
            <em className="font-medium text-crema">a little obsessive.</em>
          </h2>
          <p className="rv mt-6 text-foam text-[15px] leading-relaxed max-w-sm">
            Fourteen things, done properly. Everything is built to order at the
            copper counter — tap <span className="text-latte font-semibold">Add</span> and
            we will have it waiting when you arrive.
          </p>

          <figure className="rv-l group relative mt-10 hidden lg:block overflow-hidden max-w-sm">
            <img
              src={IMG.icedLatte}
              alt="The layered iced latte"
              loading="lazy"
              className="w-full aspect-[4/5] object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
            />
            <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-espresso/90 to-transparent px-5 pb-4 pt-12 text-xs text-foam">
              The Scroll Latte — best consumed while watching someone else's.
            </figcaption>
            <button
              onClick={() => {
                useCart.getState().add("iced-latte");
                useCart.getState().setOpen(true);
              }}
              className="absolute right-4 top-4 bg-amber px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] uppercase text-espresso transition-all hover:bg-crema active:scale-95"
            >
              €5.80 · add
            </button>
          </figure>
        </div>

        {/* right: tabs + cards */}
        <div>
          <div className="rv flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all duration-300 ${
                  cat === c.key
                    ? "bg-amber text-espresso"
                    : "border border-latte/20 text-foam hover:border-amber/60 hover:text-latte"
                }`}
              >
                {c.label}
                <span className={`ml-2 ${cat === c.key ? "text-espresso/60" : "text-khaki"}`}>
                  {c.key === "all" ? MENU.length : MENU.filter((m) => m.cat === c.key).length}
                </span>
              </button>
            ))}
          </div>

          <div key={cat} className="grid sm:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </div>

          <figure className="rv group relative mt-10 overflow-hidden lg:hidden">
            <img
              src={IMG.pastry}
              alt="Cardamom bun"
              loading="lazy"
              className="w-full aspect-[16/10] object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
            />
            <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-espresso/90 to-transparent px-5 pb-4 pt-12 text-xs text-foam">
              Cardamom buns at 6 a.m. — they do not last till noon.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
