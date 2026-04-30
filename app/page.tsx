import Link from "next/link";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const nuts = products.filter((p) => p.category === "Nuts");
  const driedFruits = products.filter((p) => p.category === "Dried Fruits");

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-white py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="inline-block bg-amber-100 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            100% Natural · No Preservatives
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
            Premium Dry Fruits,{" "}
            <span className="text-amber-500">Delivered Fresh</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Sourced from the world's finest farms — Turkey, California, Iran,
            and Kashmir. Hand-picked, packed fresh, and shipped to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#products"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-lg px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              Shop All Products
            </Link>
            <Link
              href="#nuts"
              className="bg-white border-2 border-gray-200 hover:border-amber-400 text-gray-800 font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200"
            >
              Browse Nuts →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-y border-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: "🌿", label: "100% Natural" },
            { icon: "🚚", label: "Free Shipping ₹499+" },
            { icon: "📦", label: "Airtight Packaging" },
            { icon: "↩️", label: "Easy Returns" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-semibold text-gray-700">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section id="products" className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-2">
              Our Collection
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Shop All Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Nuts Section */}
      <section id="nuts" className="py-16 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-2">
              High Protein
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Premium Nuts
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {nuts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Dried Fruits Section */}
      <section id="dried-fruits" className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-2">
              Natural Sweetness
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Dried Fruits
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {driedFruits.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 sm:py-20 px-4 bg-amber-400">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Why NutriNest?
          </h2>
          <p className="text-gray-800 text-lg mb-14 max-w-xl mx-auto">
            We cut out the middlemen so you get fresher produce at better prices.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: "🌱",
                title: "Farm Direct",
                desc: "We source directly from certified farms — no brokers, no markups.",
              },
              {
                icon: "🔬",
                title: "Quality Tested",
                desc: "Every batch is tested for freshness, moisture, and purity before dispatch.",
              },
              {
                icon: "⚡",
                title: "Fast Delivery",
                desc: "Orders dispatched within 24 hours. Delivered in 3–5 business days.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/60 backdrop-blur rounded-2xl p-8 text-left"
              >
                <p className="text-4xl mb-4">{item.icon}</p>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
