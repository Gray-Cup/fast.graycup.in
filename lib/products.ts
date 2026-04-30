export interface ProductVariant {
  label: string;
  weight: string;
  price: number; // GST-inclusive price in ₹
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  image_url: string;
  badge?: string | null;
  variants: ProductVariant[];
  active: boolean;
  created_at?: string;
}

export const GST_RATE = 0.18;

/** Returns GST amount from a GST-inclusive price */
export function gstAmount(inclusivePrice: number): number {
  return Math.round(inclusivePrice - inclusivePrice / (1 + GST_RATE));
}

/** Returns base price (excl. GST) from a GST-inclusive price */
export function basePrice(inclusivePrice: number): number {
  return Math.round(inclusivePrice / (1 + GST_RATE));
}

/** Seed data — used only to populate DB on first run via /api/db-setup */
export const seedProducts: Omit<Product, "id" | "active" | "created_at">[] = [
  {
    slug: "anjeer",
    name: "Premium Anjeer",
    tagline: "Soft, sun-dried Turkish figs",
    description:
      "Hand-selected sun-dried figs sourced directly from premium Turkish farms. Rich in fibre, calcium, and natural sweetness — perfect as a snack or in desserts.",
    image_url:
      "https://images.unsplash.com/photo-1601055283742-8b27e81b5553?w=600&h=600&fit=crop&auto=format",
    badge: "Bestseller",
    category: "Dried Fruits",
    variants: [
      { label: "250g", weight: "250", price: 299 },
      { label: "500g", weight: "500", price: 549 },
      { label: "1kg", weight: "1000", price: 999 },
    ],
  },
  {
    slug: "pistachio",
    name: "Roasted Pistachios",
    tagline: "Lightly salted, perfectly roasted",
    description:
      "Premium Iranian pistachios, lightly roasted and salted to enhance their natural buttery flavour. High in protein and healthy fats.",
    image_url:
      "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&h=600&fit=crop&auto=format",
    badge: "Top Rated",
    category: "Nuts",
    variants: [
      { label: "250g", weight: "250", price: 499 },
      { label: "500g", weight: "500", price: 949 },
      { label: "1kg", weight: "1000", price: 1799 },
    ],
  },
  {
    slug: "almond",
    name: "California Almonds",
    tagline: "Crunchy, nutrient-dense whole almonds",
    description:
      "Premium California almonds — raw, unprocessed, and loaded with Vitamin E, magnesium, and healthy fats.",
    image_url:
      "https://images.unsplash.com/photo-1508061185800-de6db3bb29c3?w=600&h=600&fit=crop&auto=format",
    badge: null,
    category: "Nuts",
    variants: [
      { label: "250g", weight: "250", price: 349 },
      { label: "500g", weight: "500", price: 649 },
      { label: "1kg", weight: "1000", price: 1199 },
    ],
  },
  {
    slug: "prunes",
    name: "Seedless Prunes",
    tagline: "Sweet, soft, and digestive",
    description:
      "Naturally sun-dried seedless prunes with a deep, sweet flavour. No added sugar or preservatives.",
    image_url:
      "https://images.unsplash.com/photo-1612197527762-8cfb4b5b7fb8?w=600&h=600&fit=crop&auto=format",
    badge: null,
    category: "Dried Fruits",
    variants: [
      { label: "250g", weight: "250", price: 279 },
      { label: "500g", weight: "500", price: 529 },
      { label: "1kg", weight: "1000", price: 979 },
    ],
  },
  {
    slug: "hazelnut",
    name: "Turkish Hazelnuts",
    tagline: "Fresh, crisp, and creamy",
    description:
      "Whole hazelnuts from the fertile Black Sea coast of Turkey — the world's premier hazelnut region.",
    image_url:
      "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=600&fit=crop&auto=format",
    badge: null,
    category: "Nuts",
    variants: [
      { label: "250g", weight: "250", price: 399 },
      { label: "500g", weight: "500", price: 749 },
      { label: "1kg", weight: "1000", price: 1399 },
    ],
  },
  {
    slug: "dates",
    name: "Medjool Dates",
    tagline: "The king of dates — large and caramel-sweet",
    description:
      "Juicy, soft Medjool dates with a rich caramel sweetness. A natural energy booster packed with potassium, magnesium, and fibre.",
    image_url:
      "https://images.unsplash.com/photo-1542838686-937e65b32d6b?w=600&h=600&fit=crop&auto=format",
    badge: "New",
    category: "Dried Fruits",
    variants: [
      { label: "250g", weight: "250", price: 449 },
      { label: "500g", weight: "500", price: 849 },
      { label: "1kg", weight: "1000", price: 1599 },
    ],
  },
  {
    slug: "cashew",
    name: "W320 Cashews",
    tagline: "Creamy whole cashews, premium grade",
    description:
      "Grade W320 whole cashews — creamy, buttery texture with a mild sweetness. Ideal for snacking, cooking, or cashew milk.",
    image_url:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop&auto=format",
    badge: null,
    category: "Nuts",
    variants: [
      { label: "250g", weight: "250", price: 549 },
      { label: "500g", weight: "500", price: 1049 },
      { label: "1kg", weight: "1000", price: 1999 },
    ],
  },
  {
    slug: "walnut",
    name: "Kashmiri Walnuts",
    tagline: "Paper-shell, omega-rich whole walnuts",
    description:
      "Hand-picked paper-shell walnuts from the valleys of Kashmir. High in Omega-3 fatty acids and brain-boosting nutrients.",
    image_url:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=600&fit=crop&auto=format",
    badge: "Premium",
    category: "Nuts",
    variants: [
      { label: "250g", weight: "250", price: 429 },
      { label: "500g", weight: "500", price: 819 },
      { label: "1kg", weight: "1000", price: 1549 },
    ],
  },
  {
    slug: "raisins",
    name: "Golden Raisins",
    tagline: "Plump, sweet, naturally dried grapes",
    description:
      "Plump golden raisins dried from premium green seedless grapes. No added sugar — great in trail mix, oatmeal, or baking.",
    image_url:
      "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&h=600&fit=crop&auto=format",
    badge: null,
    category: "Dried Fruits",
    variants: [
      { label: "250g", weight: "250", price: 199 },
      { label: "500g", weight: "500", price: 369 },
      { label: "1kg", weight: "1000", price: 699 },
    ],
  },
];
