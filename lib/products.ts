export interface ProductVariant {
  label: string;
  weightGrams: number;
  price: number; // GST-inclusive price in ₹
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "CTC Tea" | "Coffee";
  image_url: string;
  badge?: string;
  variants: ProductVariant[];
  origin: string;
  flavourNotes: string[];
}

export const GST_RATE = 0.05; // Tea and coffee: 5% GST

export function gstAmount(inclusivePrice: number): number {
  return Math.round(inclusivePrice - inclusivePrice / (1 + GST_RATE));
}

export function basePrice(inclusivePrice: number): number {
  return Math.round(inclusivePrice / (1 + GST_RATE));
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const products: Product[] = [
  // ── CTC Tea ──────────────────────────────────────────────
  {
    id: "ctc-assam-bold",
    slug: "assam-ctc-bold",
    name: "Assam CTC Bold",
    tagline: "Strong, malty, full-bodied — the classic morning brew",
    description:
      "Sourced from the Brahmaputra valley's finest tea gardens, this bold CTC grade delivers a rich, malty liquor with a deep amber colour. Brews strong and pairs perfectly with milk and sugar. Ideal for chai lovers who want real intensity in every cup.",
    category: "CTC Tea",
    image_url:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop&auto=format",
    badge: "Bestseller",
    origin: "Assam, India",
    flavourNotes: ["Malty", "Bold", "Earthy", "Full-bodied"],
    variants: [
      { label: "250g", weightGrams: 250, price: 199 },
      { label: "500g", weightGrams: 500, price: 369 },
      { label: "1kg", weightGrams: 1000, price: 699 },
    ],
  },
  {
    id: "ctc-assam-premium",
    slug: "assam-ctc-premium",
    name: "Assam CTC Premium",
    tagline: "Estate-grade Assam — brisk, bright, aromatic",
    description:
      "Premium estate-grade Assam CTC, hand-sorted for uniform pellets that brew consistently bright and brisk. A cleaner, more aromatic profile than the bold grade — still strong enough for milk tea but also enjoyable black.",
    category: "CTC Tea",
    image_url:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop&auto=format",
    badge: "Top Rated",
    origin: "Upper Assam, India",
    flavourNotes: ["Brisk", "Bright", "Aromatic", "Clean"],
    variants: [
      { label: "250g", weightGrams: 250, price: 279 },
      { label: "500g", weightGrams: 500, price: 519 },
      { label: "1kg", weightGrams: 1000, price: 979 },
    ],
  },
  {
    id: "ctc-nilgiri",
    slug: "nilgiri-ctc",
    name: "Nilgiri CTC",
    tagline: "Fragrant hill tea — smooth with a floral lift",
    description:
      "Grown at 1,800m in the Blue Mountains of Tamil Nadu, Nilgiri CTC has a distinctively smooth and fragrant character. Less astringent than Assam, with a subtle floral finish — excellent for iced tea or a gentler milk brew.",
    category: "CTC Tea",
    image_url:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&h=600&fit=crop&auto=format",
    origin: "Nilgiris, Tamil Nadu, India",
    flavourNotes: ["Floral", "Smooth", "Fragrant", "Light"],
    variants: [
      { label: "250g", weightGrams: 250, price: 239 },
      { label: "500g", weightGrams: 500, price: 449 },
      { label: "1kg", weightGrams: 1000, price: 849 },
    ],
  },
  {
    id: "ctc-dooars",
    slug: "dooars-ctc",
    name: "Dooars CTC",
    tagline: "Light, refreshing, great value everyday tea",
    description:
      "From the foothills of the Eastern Himalayas, Dooars CTC produces a lighter, softer liquor that's easy-drinking and affordable. A great everyday tea — smooth enough to drink without milk, versatile enough to brew strong.",
    category: "CTC Tea",
    image_url:
      "https://images.unsplash.com/photo-1583845112203-29329902332e?w=600&h=600&fit=crop&auto=format",
    badge: "Value Pick",
    origin: "Dooars, West Bengal, India",
    flavourNotes: ["Light", "Soft", "Mild", "Smooth"],
    variants: [
      { label: "500g", weightGrams: 500, price: 299 },
      { label: "1kg", weightGrams: 1000, price: 549 },
      { label: "2kg", weightGrams: 2000, price: 999 },
    ],
  },

  // ── Coffee ────────────────────────────────────────────────
  {
    id: "coffee-arabica-chikmagalur",
    slug: "arabica-chikmagalur",
    name: "Arabica Chikmagalur",
    tagline: "Estate-grown, bright and complex — single origin",
    description:
      "Single-origin Arabica beans from the misty estates of Chikmagalur, Karnataka — India's coffee heartland. Medium roast reveals bright acidity with notes of dark chocolate, stone fruit, and a clean, lingering finish. Excellent as pour-over or espresso.",
    category: "Coffee",
    image_url:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=600&fit=crop&auto=format",
    badge: "Single Origin",
    origin: "Chikmagalur, Karnataka, India",
    flavourNotes: ["Dark Chocolate", "Stone Fruit", "Bright Acidity", "Clean Finish"],
    variants: [
      { label: "250g", weightGrams: 250, price: 449 },
      { label: "500g", weightGrams: 500, price: 849 },
      { label: "1kg", weightGrams: 1000, price: 1599 },
    ],
  },
  {
    id: "coffee-robusta-wayanad",
    slug: "robusta-wayanad",
    name: "Robusta Wayanad",
    tagline: "Bold, earthy, high-caffeine — for a serious kick",
    description:
      "Robust Robusta beans from Wayanad's high-altitude estates. Dark roasted to bring out deep, earthy flavours with a thick crema — this is the bean that powers South Indian filter coffee. Full body, low acidity, high caffeine.",
    category: "Coffee",
    image_url:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&h=600&fit=crop&auto=format",
    badge: "High Caffeine",
    origin: "Wayanad, Kerala, India",
    flavourNotes: ["Earthy", "Bold", "Smoky", "Rich Crema"],
    variants: [
      { label: "250g", weightGrams: 250, price: 349 },
      { label: "500g", weightGrams: 500, price: 649 },
      { label: "1kg", weightGrams: 1000, price: 1199 },
    ],
  },
  {
    id: "coffee-blend-filter",
    slug: "south-indian-filter-blend",
    name: "South Indian Filter Blend",
    tagline: "70:30 Arabica–Robusta — the classic filter decoction",
    description:
      "A carefully calibrated 70:30 blend of Arabica and Robusta, ground specifically for traditional South Indian filter coffee. The Arabica adds brightness and aroma; the Robusta gives body and crema. Brew it strong, mix with hot milk — perfection.",
    category: "Coffee",
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&auto=format",
    badge: "Bestseller",
    origin: "Karnataka & Kerala, India",
    flavourNotes: ["Balanced", "Aromatic", "Rich Body", "Classic"],
    variants: [
      { label: "200g", weightGrams: 200, price: 299 },
      { label: "500g", weightGrams: 500, price: 649 },
      { label: "1kg", weightGrams: 1000, price: 1199 },
    ],
  },
];
