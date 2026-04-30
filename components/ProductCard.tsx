"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/products";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/lib/cart";

export default function ProductCard({ product }: { product: Product }) {
  const v0 = product.variants[0];
  const isCoffee = product.category === "Coffee";
  const [showCheckout, setShowCheckout] = useState(false);
  const { addToCart } = useCart();

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
          <Link
            href={`/product/${product.slug}`}
            className="text-base font-black text-gray-900 mb-1 leading-snug hover:underline"
          >
            {product.name}
          </Link>

          <div className="mt-auto">
            <p className="text-xs text-gray-400 mb-0.5">From</p>
            <p className="text-xl font-black text-gray-900 mb-0.5">₹{v0.price}</p>
            <p className="text-xs text-gray-400 mb-4">All prices inclusive of GST</p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckout(true)}
                className="flex-1 font-bold text-sm py-2.5 rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              >
                Buy Now
              </button>
              <button
                onClick={() => addToCart(product, 0)}
                className="flex-1 font-bold text-sm py-2.5 rounded-lg transition-colors duration-200 bg-amber-400 hover:bg-amber-500 text-gray-900 cursor-pointer"
              >
                Add to Cart
              </button>
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
