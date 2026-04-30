"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const product = params.get("product");
  const variant = params.get("variant");
  const qty = params.get("qty");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Animated checkmark */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <span className="text-5xl">✅</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
          Order Confirmed!
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Thank you for your purchase. We&apos;ll pack it fresh and ship it
          within 24 hours.
        </p>

        {/* Order details */}
        <div className="bg-amber-50 rounded-2xl p-6 mb-8 text-left space-y-3">
          {orderId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Order ID</span>
              <span className="font-bold text-gray-900 font-mono">{orderId}</span>
            </div>
          )}
          {product && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Product</span>
              <span className="font-bold text-gray-900">{product}</span>
            </div>
          )}
          {variant && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Pack Size</span>
              <span className="font-bold text-gray-900">{variant}</span>
            </div>
          )}
          {qty && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Quantity</span>
              <span className="font-bold text-gray-900">{qty}</span>
            </div>
          )}
          {orderId && (
            <div className="pt-3 border-t border-amber-200">
              <a
                href={`/api/invoice/${orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors"
              >
                📄 Download Invoice
              </a>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-8">
          A confirmation will be sent to your phone. Expected delivery:{" "}
          <span className="font-semibold text-gray-700">3–5 business days</span>
        </p>

        <Link
          href="/"
          className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-lg px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
