"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProductBySlug, products, gstAmount, basePrice } from "@/lib/products";
import CheckoutModal from "@/components/CheckoutModal";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug);

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-6xl">{slug?.includes("coffee") ? "☕" : "🍵"}</p>
        <h1 className="text-3xl font-black text-gray-900">Product not found</h1>
        <p className="text-gray-500">This product doesn&apos;t exist or may have been removed.</p>
        <Link
          href="/"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
        >
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const isCoffee = product.category === "Coffee";
  const variant = product.variants[selectedVariant];
  const total = variant.price * quantity;
  const gst = gstAmount(total);
  const base = basePrice(total);

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <>
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 pb-32 lg:pb-14`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div
            className={`relative w-full aspect-square sm:aspect-square max-h-64 sm:max-h-none rounded-3xl overflow-hidden shadow-sm ${
              isCoffee ? "bg-stone-100" : "bg-amber-50"
            }`}
          >
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-xl text-gray-500 mb-5 leading-relaxed">
              {product.tagline}
            </p>

            <p className="text-base text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">
                Pack Size
              </p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={v.label}
                    onClick={() => setSelectedVariant(i)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm border-2 transition-all duration-150 ${
                      selectedVariant === i
                        ? isCoffee
                          ? "border-stone-900 bg-stone-50 text-stone-900"
                          : "border-amber-400 bg-amber-50 text-gray-900"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {v.label}
                    <span
                      className={`block text-xs font-semibold mt-0.5 ${
                        isCoffee ? "text-stone-600" : "text-amber-600"
                      }`}
                    >
                      ₹{v.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest">
                Quantity
              </p>
              <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="w-14 h-12 flex items-center justify-center text-xl font-black text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="border-t border-gray-100 pt-6">
              <div className="mb-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black text-gray-900">₹{total}</span>
                  {quantity > 1 && (
                    <span className="text-sm text-gray-500">
                      (₹{variant.price} × {quantity})
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Base ₹{base} + GST 5% ₹{gst} = ₹{total} (incl.)
                </p>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className={`w-full font-black text-xl py-5 rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 mb-3 ${
                  isCoffee
                    ? "bg-stone-900 hover:bg-stone-800 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl font-black text-gray-900 mb-8">
              More {product.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky CTA (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl lg:hidden z-40">
        <button
          onClick={() => setShowCheckout(true)}
          className={`w-full font-black text-lg py-4 rounded-2xl transition-all ${
            isCoffee
              ? "bg-stone-900 hover:bg-stone-800 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          }`}
        >
          Buy Now · ₹{total} →
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal
          product={product}
          selectedVariantIndex={selectedVariant}
          quantity={quantity}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
