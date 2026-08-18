import { useEffect } from "react";
import Lenis from "lenis";
import Nav from "./components/Nav";
import CartDrawer from "./components/CartDrawer";
import PourSection from "./components/PourSection";
import { Marquee, Story, Origins } from "./components/Sections";
import MenuSection from "./components/MenuSection";
import { BrewLab, Testimonials, Visit, Footer } from "./components/Extras";
import { setLenis } from "./store";

const RV_SELECTOR = ".rv, .rv-l, .rv-r";

export default function App() {
  /* buttery smooth wheel scrolling */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: reduce ? 0.01 : 1.15,
      smoothWheel: true,
    });
    setLenis(
      lenis as unknown as {
        scrollTo: (t: string | number, opts?: object) => void;
      }
    );
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  /* scroll reveals — with MutationObserver for dynamically mounted nodes */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    );
    const observe = (root: ParentNode) =>
      root.querySelectorAll(`${RV_SELECTOR}:not(.on)`).forEach((el) => io.observe(el));
    observe(document);

    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches && n.matches(RV_SELECTOR)) io.observe(n);
            observe(n);
          }
        })
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div className="grain relative min-h-screen bg-espresso text-latte font-body">
      <Nav />
      <CartDrawer />

      {/* Act I — the scroll-poured iced latte */}
      <PourSection />

      {/* Act II — the café itself */}
      <main className="relative z-10 bg-espresso">
        <Marquee />
        <Story />
        <MenuSection />
        <Origins />
        <BrewLab />
        <Testimonials />
        <Visit />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
