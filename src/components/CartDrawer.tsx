import { useEffect } from "react";
import { useCart, cartCount, cartTotal, scrollToId } from "../store";
import { MENU } from "../lib/data";
import { CupMark } from "./Nav";

export default function CartDrawer() {
  const { lines, open, placed, setOpen, add, sub, remove, checkout, closeAndReset } =
    useCart();
  const total = cartTotal(lines);
  const count = cartCount(lines);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const bunTarget = 15;
  const bunProgress = Math.min(total / bunTarget, 1);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-espresso/70 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-roast border-l border-latte/10 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-latte/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <CupMark className="h-6 w-6 text-amber" />
            <h2 className="font-display text-2xl font-medium text-latte">
              Your tray
            </h2>
            {count > 0 && (
              <span className="rounded-full bg-amber px-2.5 py-0.5 text-xs font-extrabold text-espresso">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-foam hover:text-latte transition-colors p-1"
            aria-label="Close cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {placed ? (
          <div className="fade-swap flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber/15 text-amber">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5l5 5L20 6.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="font-display text-3xl font-medium text-latte">
              Order in the queue
            </h3>
            <p className="text-sm text-foam leading-relaxed">
              The baristas already heard the ticket print. Come to the copper
              counter in about six minutes — your cardamom bun is on us.
            </p>
            <button
              onClick={closeAndReset}
              className="mt-2 border border-latte/25 px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase text-latte transition-all duration-300 hover:border-amber hover:bg-amber hover:text-espresso"
            >
              Keep browsing
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <CupMark className="h-12 w-12 text-bark" />
            <h3 className="font-display text-2xl font-medium text-latte">
              Nothing on the tray yet
            </h3>
            <p className="text-sm text-foam">
              The scroll latte builds itself. Your order needs a little help.
            </p>
            <button
              onClick={() => {
                setOpen(false);
                scrollToId("menu");
              }}
              className="mt-2 bg-amber px-6 py-2.5 text-xs font-bold tracking-[0.2em] uppercase text-espresso transition-all duration-300 hover:bg-crema"
            >
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.map((l) => {
                const item = MENU.find((m) => m.id === l.id);
                if (!item) return null;
                return (
                  <div
                    key={l.id}
                    className="fade-swap flex items-center gap-4 border-b border-latte/8 py-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg text-latte truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-foam">
                        €{item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => sub(l.id)}
                        className="flex h-7 w-7 items-center justify-center border border-latte/25 text-latte transition-colors hover:border-amber hover:text-amber"
                        aria-label={`One less ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-latte">
                        {l.qty}
                      </span>
                      <button
                        onClick={() => add(l.id)}
                        className="flex h-7 w-7 items-center justify-center border border-latte/25 text-latte transition-colors hover:border-amber hover:text-amber"
                        aria-label={`One more ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <p className="w-16 text-right text-sm font-bold text-crema">
                      €{(item.price * l.qty).toFixed(2)}
                    </p>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-khaki hover:text-amber transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-latte/10 px-6 py-5 space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-foam mb-2">
                  <span>
                    {bunProgress >= 1
                      ? "Free cardamom bun unlocked"
                      : `€${(bunTarget - total).toFixed(2)} from a free cardamom bun`}
                  </span>
                  <span>{Math.round(bunProgress * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-bean overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-caramel to-amber transition-[width] duration-500 ease-out"
                    style={{ width: `${bunProgress * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-foam">
                  Subtotal
                </span>
                <span className="font-display text-3xl font-semibold text-latte">
                  €{total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={checkout}
                className="w-full bg-amber py-3.5 text-sm font-extrabold tracking-[0.22em] uppercase text-espresso transition-all duration-300 hover:bg-crema active:scale-[0.985]"
              >
                Send to the bar
              </button>
              <p className="text-center text-[11px] text-khaki">
                Pay at the counter · oat & lactose-free at no extra cost
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
