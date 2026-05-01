export interface ProductVariant {
  label: string;
  weightGrams: number;
  price: number; // GST-inclusive price in ₹
  deliveryCharge?: number; // flat delivery charge if applicable
  batchId?: string; // production batch identifier
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
  {
    id: "tea-sample",
    slug: "tea-sample",
    name: "Tea Sample",
    tagline: "Try before you commit",
    description:
      "A 150g introductory pack of our house CTC blend. Grade includes BOPSM, BP, OF, DJ and GFOP from Dooars and Assam with no Artificial Additives.",
    category: "CTC Tea",
    image_url:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop&auto=format",
    badge: "Try First",
    origin: "Assam, India",
    flavourNotes: ["Malty", "Bold", "Earthy", "Full-bodied"],
    variants: [
      { label: "150g", weightGrams: 150, price: 100, batchId: "GRAYB1" },
    ],
  },
  {
    id: "ctc-blend-500",
    slug: "ctc-blend",
    name: "CTC Blend",
    tagline: "Our house blend — early access, limited stock",
    description:
      "500g of our signature CTC blend, sourced from the Brahmaputra valley. Strong, malty, full-bodied — built for daily chai. Early access pricing while stock lasts.",
    category: "CTC Tea",
    image_url:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop&auto=format",
    badge: "Early Access",
    origin: "Assam, India",
    flavourNotes: ["Malty", "Bold", "Earthy", "Full-bodied"],
    variants: [
      { label: "500g", weightGrams: 500, price: 350, deliveryCharge: 30, batchId: "GRAYB1" },
    ],
  },
];
