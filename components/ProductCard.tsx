import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative w-full aspect-square bg-amber-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow">
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">
            {product.category}
          </p>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Starting from</p>
              <p className="text-2xl font-black text-gray-900">
                ₹{product.startingPrice}
              </p>
            </div>
            <span className="bg-amber-400 group-hover:bg-amber-500 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors duration-200">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
