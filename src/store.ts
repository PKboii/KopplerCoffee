import { create } from "zustand";
import { MENU } from "./lib/data";

export type CartLine = { id: string; qty: number };

type CartStore = {
  lines: CartLine[];
  open: boolean;
  bump: number;
  placed: boolean;
  add: (id: string) => void;
  sub: (id: string) => void;
  remove: (id: string) => void;
  setOpen: (v: boolean) => void;
  checkout: () => void;
  closeAndReset: () => void;
};

export const useCart = create<CartStore>((set) => ({
  lines: [],
  open: false,
  bump: 0,
  placed: false,
  add: (id) =>
    set((s) => {
      const found = s.lines.find((l) => l.id === id);
      return {
        lines: found
          ? s.lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
          : [...s.lines, { id, qty: 1 }],
        bump: s.bump + 1,
        placed: false,
      };
    }),
  sub: (id) =>
    set((s) => ({
      lines: s.lines
        .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    })),
  remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
  setOpen: (v) => set((s) => ({ open: v, placed: v ? false : s.placed })),
  checkout: () => set((s) => ({ placed: true, lines: [] })),
  closeAndReset: () => set({ open: false, placed: false }),
}));

export const cartCount = (lines: CartLine[]) =>
  lines.reduce((a, l) => a + l.qty, 0);

export const cartTotal = (lines: CartLine[]) =>
  lines.reduce((a, l) => {
    const item = MENU.find((m) => m.id === l.id);
    return a + (item ? item.price * l.qty : 0);
  }, 0);

/* ---- transient scroll bus (read by the 3D scene every frame, no re-renders) ---- */
export const scrollBus = { p: 0 };

/* ---- lenis singleton for smooth anchor seeks ---- */
let lenisRef: { scrollTo: (t: string | number, opts?: object) => void } | null =
  null;
export const setLenis = (l: typeof lenisRef) => {
  lenisRef = l;
};
export const scrollToId = (id: string) => {
  if (lenisRef) lenisRef.scrollTo(`#${id}`, { offset: 0, duration: 1.3 });
  else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
export const seekPour = (p: number) => {
  const el = document.getElementById("pour");
  if (!el) return;
  const max = el.offsetHeight - window.innerHeight;
  if (lenisRef) lenisRef.scrollTo(p * max, { duration: 1.5 });
  else window.scrollTo({ top: p * max, behavior: "smooth" });
};
