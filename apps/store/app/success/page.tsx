"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type VerifyState = "checking" | "confirmed" | "pending" | "failed";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const product = params.get("product");
  const variant = params.get("variant");
  const qty = params.get("qty");
  const amount = params.get("amount");

  const [state, setState] = useState<VerifyState>("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) { setState("failed"); return; }

    let cancelled = false;
    const MAX_ATTEMPTS = 8;
    const INTERVAL = 2500;

    async function check() {
      try {
        const res = await fetch(`/api/order-status?order_id=${orderId}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.status === "PAID") {
          setState("confirmed");
        } else if (data.status === "NOT_FOUND" || data.status === "PENDING") {
          setAttempts((n) => {
            const next = n + 1;
            if (next >= MAX_ATTEMPTS) {
              setState("failed");
            } else {
              setTimeout(check, INTERVAL);
            }
            return next;
          });
        } else {
          setState("failed");
        }
      } catch {
        if (!cancelled) setState("failed");
      }
    }

    check();
    return () => { cancelled = true; };
  }, [orderId]);

  if (state === "checking") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-bold text-gray-700">Verifying your payment…</p>
        <p className="text-sm text-gray-400">This usually takes a few seconds</p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Payment Not Confirmed</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            We couldn&apos;t verify your payment. If money was deducted, it will be refunded within 5–7 business days.
          </p>
          {orderId && (
            <p className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-2 rounded-lg mb-6">
              Order ref: {orderId}
            </p>
          )}
          <Link
            href="/"
            className="inline-block bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-base px-8 py-3 rounded-2xl transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
          Order Confirmed
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Thank you for your purchase. We&apos;ll pack it fresh and ship it within 24 hours.
        </p>

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
          {amount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Amount Paid</span>
              <span className="font-bold text-gray-900">₹{amount}</span>
            </div>
          )}
          {orderId && (
            <div className="pt-3 border-t border-amber-200">
              <a
                href={`/api/invoice/${orderId}`}
                download={`Invoice-${orderId}.pdf`}
                className="flex items-center justify-center w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Download Invoice
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
          Continue Shopping
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
