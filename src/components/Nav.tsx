import { useEffect, useState } from "react";
import { useCart, cartCount, scrollToId } from "../store";

const LINKS = [
  { id: "pour", label: "The Pour" },
  { id: "story", label: "Story" },
  { id: "menu", label: "Menu" },
  { id: "lab", label: "Brew Lab" },
  { id: "visit", label: "Visit" },
];

export function CupMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M6 11h15v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7v-8z"
        fill="currentColor"
      />
      <path
        d="M21 12.5h2.4a3.3 3.3 0 0 1 0 6.6H21"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M11 4c-1.1 1.5-1.1 2.8 0 4.3M16 4c-1.1 1.5-1.1 2.8 0 4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="text-crema"
        opacity="0.85"
      />
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { lines, bump, setOpen } = useCart();
  const count = cartCount(lines);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (bump > 0) {
      setBumpKey((k) => k + 1);
    }
  }, [bump]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-espresso/85 backdrop-blur-md border-b border-latte/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex items-center justify-between gap-4">
        <button
          onClick={() => scrollToId("pour")}
          className="flex items-center gap-2.5 text-latte group"
          aria-label="Koppar — back to top"
        >
          <CupMark className="h-7 w-7 text-amber transition-transform duration-500 group-hover:-rotate-12" />
          <span className="font-display font-semibold text-xl tracking-wide">
            KOPPAR
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToId(l.id)}
              className="link-underline text-[13px] font-semibold tracking-[0.14em] uppercase text-foam hover:text-latte transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center gap-2.5 border border-latte/20 px-4 py-2 text-[12px] font-bold tracking-[0.18em] uppercase text-latte transition-all duration-300 hover:border-amber hover:text-amber"
          aria-label={`Open cart, ${count} items`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 8h14l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Tray
          {count > 0 && (
            <span
              key={bumpKey}
              className="badge-bump absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-extrabold text-espresso"
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
