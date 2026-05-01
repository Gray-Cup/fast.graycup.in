import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import ProductPageClient from "./ProductPageClient";

const OG_IMAGES: Record<string, string> = {
  "tea-sample": "/og-tea-samples.png",
  "ctc-blend": "/500gm-og.png",
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found — Gray Cup Fast" };
  }

  const ogImage = OG_IMAGES[slug] ?? "/og.png";
  const price = product.variants[0].price;

  return {
    title: `${product.name} — Gray Cup Fast`,
    description: `${product.description} ₹${price} incl. GST. Shipped fast across India.`,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.tagline,
      images: [ogImage],
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
