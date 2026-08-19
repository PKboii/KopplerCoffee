export const IMG = {
  barista:
    "https://image.qwenlm.ai/generated-images/98f4fa40-e4d6-4d68-9eff-0d42b939ad17/_result.png",
  roastery:
    "https://image.qwenlm.ai/generated-images/8d437f2d-bdfa-4a51-815e-b4ec10be4913/_result.png",
  icedLatte:
    "https://image.qwenlm.ai/generated-images/9d0ef9ce-0ad8-4995-a542-342306840053/_result.png",
  pastry:
    "https://image.qwenlm.ai/generated-images/c670e868-9829-4691-9e60-5ce8e631c464/_result.png",
  beans:
    "https://image.qwenlm.ai/generated-images/9a8677b9-6d2a-48b2-b153-5071e80fc9e3/_result.png",
};

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  cat: "espresso" | "cold" | "filter" | "pastry" | "beans";
  tag?: "signature" | "new" | "vegan" | "seasonal";
};

export const MENU: MenuItem[] = [
  {
    id: "iced-latte",
    name: "The Scroll Latte",
    desc: "Our iced latte, built in order — ice, cold milk, double Guji shot. The one you just watched.",
    price: 5.8,
    cat: "cold",
    tag: "signature",
  },
  {
    id: "cortado",
    name: "Cortado",
    desc: "Equal parts espresso and silk-steamed milk in a Gibraltar glass. Short, honest, gone too fast.",
    price: 4.2,
    cat: "espresso",
  },
  {
    id: "flat-white",
    name: "Flat White",
    desc: "Ristretto double under micro-foam so thin a spoon barely dents it.",
    price: 4.8,
    cat: "espresso",
  },
  {
    id: "honey-cardamom",
    name: "Honey & Cardamom Latte",
    desc: "Nordic twist — wildflower honey, green cardamom, a turn of black pepper.",
    price: 5.6,
    cat: "espresso",
    tag: "seasonal",
  },
  {
    id: "cold-brew",
    name: "18-Hour Cold Brew",
    desc: "Kenya Nyeri steeped cold for 18 hours. Black as a winter night, sweet as its ending.",
    price: 4.6,
    cat: "cold",
  },
  {
    id: "espresso-tonic",
    name: "Espresso Tonic",
    desc: "Double shot over tonic, ice and a strip of burnt orange. Bitter, bright, electric.",
    price: 5.4,
    cat: "cold",
    tag: "new",
  },
  {
    id: "affogato",
    name: "Affogato al Koppar",
    desc: "Vanilla-bean gelato drowned in hot espresso, flaked sea salt on the foam.",
    price: 5.2,
    cat: "cold",
  },
  {
    id: "v60",
    name: "V60 Pour Over",
    desc: "Rotating single origin, 15g to 250g, bloomed 40 seconds. Ask what's in the hopper.",
    price: 5.0,
    cat: "filter",
  },
  {
    id: "chemex",
    name: "Chemex for Two",
    desc: "A slow 3-cup brew meant to be split across a long conversation.",
    price: 8.5,
    cat: "filter",
  },
  {
    id: "aeropress",
    name: "AeroPress Inverted",
    desc: "Concentrated and syrupy, our baristas' off-shift favorite.",
    price: 4.4,
    cat: "filter",
  },
  {
    id: "cardamom-bun",
    name: "Cardamom Bun",
    desc: "Laminated, twisted, pearl-sugar crusted. Baked at 6 a.m., rarely alive past noon.",
    price: 3.8,
    cat: "pastry",
    tag: "signature",
  },
  {
    id: "rye-croissant",
    name: "Rye & Malt Croissant",
    desc: "Dark rye flour, malt syrup, 27 layers of cultured butter.",
    price: 4.1,
    cat: "pastry",
    tag: "vegan",
  },
  {
    id: "banana-bread",
    name: "Burnt Banana Bread",
    desc: "Caramelized to the edge of too far, espresso glaze, walnut crunch.",
    price: 3.6,
    cat: "pastry",
  },
  {
    id: "choc-babka",
    name: "Morning Babka",
    desc: "70% dark chocolate babka, toasted and served warm with salted butter.",
    price: 4.4,
    cat: "pastry",
    tag: "new",
  },
  {
    id: "bag-guji",
    name: "Beans · Ethiopia Guji",
    desc: "250 g whole bean, washed process. Bergamot, apricot, jasmine.",
    price: 14,
    cat: "beans",
  },
  {
    id: "bag-huila",
    name: "Beans · Colombia Huila",
    desc: "250 g whole bean, honey process. Panela, red plum, cacao nib.",
    price: 12,
    cat: "beans",
  },
  {
    id: "bag-nyeri",
    name: "Beans · Kenya Nyeri AA",
    desc: "250 g whole bean, washed process. Blackcurrant, grapefruit, molasses.",
    price: 15,
    cat: "beans",
  },
  {
    id: "bag-mantiqueira",
    name: "Beans · Brazil Mantiqueira",
    desc: "250 g whole bean, natural process. Hazelnut, milk chocolate, fig.",
    price: 11,
    cat: "beans",
  },
];

export const CATEGORIES: { key: MenuItem["cat"] | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "espresso", label: "Espresso" },
  { key: "cold", label: "Cold Bar" },
  { key: "filter", label: "Slow Filter" },
  { key: "pastry", label: "Bakery" },
];

export const ORIGINS = [
  {
    id: "bag-guji",
    name: "Ethiopia · Guji Highlands",
    process: "Washed",
    roast: 2,
    notes: ["bergamot", "apricot", "jasmine"],
    altitude: "2,100 m",
    price: "€14 / 250 g",
  },
  {
    id: "bag-huila",
    name: "Colombia · Huila",
    process: "Honey",
    roast: 3,
    notes: ["panela", "red plum", "cacao nib"],
    altitude: "1,750 m",
    price: "€12 / 250 g",
  },
  {
    id: "bag-nyeri",
    name: "Kenya · Nyeri AA",
    process: "Washed",
    roast: 2,
    notes: ["blackcurrant", "grapefruit", "molasses"],
    altitude: "1,900 m",
    price: "€15 / 250 g",
  },
  {
    id: "bag-mantiqueira",
    name: "Brazil · Mantiqueira",
    process: "Natural",
    roast: 4,
    notes: ["hazelnut", "milk chocolate", "dried fig"],
    altitude: "1,200 m",
    price: "€11 / 250 g",
  },
];

export const QUOTES = [
  {
    text: "I've stopped ordering coffee anywhere else. Watching them build my latte over ice like a small ceremony — it resets my whole afternoon.",
    name: "Maja Lindqvist",
    role: "Regular since 2019",
  },
  {
    text: "The Guji pour over ruined all other coffee for me, and I'm not even angry about it. Floral, clean, and somehow still tastes like dessert.",
    name: "Tomás Rivera",
    role: "Coffee nerd, self-diagnosed",
  },
  {
    text: "Best cardamom bun outside of Stockholm. I said what I said. Pair it with the espresso tonic and thank me later.",
    name: "Priya Nair",
    role: "Weekend pilgrim",
  },
  {
    text: "Brought my laptop to 'work for an hour'. Stayed four. The light, the records, the cortados arriving like clockwork — dangerous place.",
    name: "Elias Berg",
    role: "Freelance designer",
  },
];

export const HOURS: { day: string; hours: string }[] = [
  { day: "Monday", hours: "07:30 — 17:00" },
  { day: "Tuesday", hours: "07:30 — 17:00" },
  { day: "Wednesday", hours: "07:30 — 17:00" },
  { day: "Thursday", hours: "07:30 — 19:00" },
  { day: "Friday", hours: "07:30 — 19:00" },
  { day: "Saturday", hours: "09:00 — 18:00" },
  { day: "Sunday", hours: "09:00 — 16:00" },
];

export const MARQUEE_WORDS = [
  "Single origin",
  "Slow bar",
  "Roasted in-house",
  "Cardamom buns at 6 a.m.",
  "Cold brew, 18 hours",
  "No laptops on weekends",
  "Ethiopia · Colombia · Kenya",
  "Poured, not pushed",
];
