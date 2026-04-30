"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              Nutri
              <span className="text-amber-500">Nest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-base font-medium text-gray-600 hover:text-amber-500 transition-colors"
            >
              Shop All
            </Link>
            <Link
              href="/#nuts"
              className="text-base font-medium text-gray-600 hover:text-amber-500 transition-colors"
            >
              Nuts
            </Link>
            <Link
              href="/#dried-fruits"
              className="text-base font-medium text-gray-600 hover:text-amber-500 transition-colors"
            >
              Dried Fruits
            </Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Link
              href="/#products"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-md"
            >
              Shop Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-4">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-lg font-semibold text-gray-700"
          >
            Shop All
          </Link>
          <Link
            href="/#nuts"
            onClick={() => setMenuOpen(false)}
            className="text-lg font-semibold text-gray-700"
          >
            Nuts
          </Link>
          <Link
            href="/#dried-fruits"
            onClick={() => setMenuOpen(false)}
            className="text-lg font-semibold text-gray-700"
          >
            Dried Fruits
          </Link>
          <Link
            href="/#products"
            onClick={() => setMenuOpen(false)}
            className="bg-amber-400 text-center text-gray-900 font-bold py-3 rounded-xl"
          >
            Shop Now
          </Link>
        </div>
      )}
    </header>
  );
}
