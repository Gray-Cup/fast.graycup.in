"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product, gstAmount } from "@/lib/products";
import CheckoutModal from "@/components/CheckoutModal";

export default function ProductCard({ product }: { product: Product }) {
  const v0 = product.variants[0];
  const gst = gstAmount(v0.price);
  const isCoffee = product.category === "Coffee";
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col">
        {/* Image */}
        <Link href={`/product/${product.slug}`} className="block">
          <div className={`relative w-full aspect-square overflow-hidden ${isCoffee ? "bg-stone-100" : "bg-amber-50"}`}>
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isCoffee ? "text-stone-500" : "text-amber-600"}`}>
            {product.origin.split(",")[0]}
          </p>
          <h3 className="text-base font-black text-gray-900 mb-1 leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-1">
            {product.tagline}
          </p>

          <div className="mt-auto">
            <p className="text-xs text-gray-400 mb-0.5">From</p>
            <p className="text-xl font-black text-gray-900 mb-0.5">₹{v0.price}</p>
            <p className="text-xs text-gray-400 mb-4">incl. GST ₹{gst}</p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckout(true)}
                className={`flex-1 font-bold text-sm py-2.5 rounded-lg transition-colors duration-200 ${isCoffee ? "bg-stone-900 hover:bg-stone-700 text-white" : "bg-amber-400 hover:bg-amber-500 text-gray-900"}`}
              >
                Buy Now
              </button>
              <Link
                href={`/product/${product.slug}`}
                className="flex-1 text-center font-bold text-sm py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 transition-colors duration-200"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          product={product}
          selectedVariantIndex={0}
          quantity={1}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
