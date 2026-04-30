"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/lib/products";

interface CheckoutModalProps {
  product: Product;
  selectedVariantIndex: number;
  quantity: number;
  onClose: () => void;
}

const DELHIVERY_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
}

type Step = "form" | "loading" | "error";

export default function CheckoutModal({
  product,
  selectedVariantIndex,
  quantity,
  onClose,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const isCoffee = product.category === "Coffee";
  const variant = product.variants[selectedVariantIndex];
  const total = variant.price * quantity;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          variantLabel: variant.label,
          weightGrams: variant.weightGrams * quantity,
          quantity,
          amount: total,
          customer: {
            ...form,
            address: `${form.address}, ${form.city}, ${form.state}`,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const { load } = await import("@cashfreepayments/cashfree-js");
      const cashfree = await load({
        mode: (process.env.NEXT_PUBLIC_CASHFREE_MODE as "sandbox" | "production") || "sandbox",
      });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const inputClass =
    "w-full px-4 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all placeholder-gray-400 bg-gray-50";

  const btnClass = isCoffee
    ? "w-full bg-stone-900 hover:bg-stone-800 text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 mt-2"
    : "w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 mt-2";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95dvh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900">Complete Order</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {product.name} · {variant.label} × {quantity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Order summary */}
        <div className="mx-6 mt-4 mb-2 bg-stone-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-sm text-gray-600">Order Total</p>
              <p className="text-3xl font-black text-gray-900">₹{total}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{variant.label} · Qty {quantity}</p>
              <p className="text-xs text-gray-400">{product.origin}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">All prices inclusive of GST</p>
        </div>

        {/* Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="px-6 pb-8 pt-2 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                required placeholder="Rahul Sharma" className={inputClass} autoComplete="name" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                required pattern="[0-9]{10}" placeholder="10-digit mobile number"
                className={inputClass} inputMode="numeric" maxLength={10} autoComplete="tel" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className={inputClass} autoComplete="email" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery Address</label>
              <textarea name="address" value={form.address} onChange={handleChange}
                required rows={3} placeholder="House no., street, area"
                className={`${inputClass} resize-none`} autoComplete="street-address" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
              <input name="city" type="text" value={form.city} onChange={handleChange}
                required placeholder="e.g. Panchkula"
                className={inputClass} autoComplete="address-level2" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
              <select name="state" value={form.state} onChange={handleChange} required
                className={inputClass}
              >
                <option value="">Select state</option>
                {DELHIVERY_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Pincode</label>
              <input name="pincode" type="text" value={form.pincode} onChange={handleChange}
                required pattern="[0-9]{6}" placeholder="6-digit pincode"
                className={inputClass} inputMode="numeric" maxLength={6} />
            </div>

            <button type="submit" className={btnClass}>
              Pay ₹{total} Securely →
            </button>

            <p className="text-center text-xs text-gray-400">
              Secured by Cashfree · Shipped via Delhivery
            </p>
          </form>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="px-6 py-16 flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-bold text-gray-800">Creating your order…</p>
            <p className="text-sm text-gray-500 text-center">
              Redirecting to Cashfree. Do not close this window.
            </p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="text-5xl">⚠️</div>
            <p className="text-xl font-bold text-gray-800">Something went wrong</p>
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{errorMsg}</p>
            <button
              onClick={() => setStep("form")}
              className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
