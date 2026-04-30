"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              Gray Cup<span className="text-amber-500"> (Fast)</span>
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Toggle menu">
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 flex flex-col gap-4">
          <Link href="/#tea" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-gray-800">CTC Tea</Link>
          <Link href="/#coffee" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-gray-800">Coffee Beans</Link>
          <div className="flex gap-3 pt-1">
            <Link href="/#tea" onClick={() => setMenuOpen(false)} className="flex-1 bg-amber-500 text-center text-white font-bold py-3 rounded-lg">Shop Tea</Link>
            <Link href="/#coffee" onClick={() => setMenuOpen(false)} className="flex-1 bg-stone-900 text-center text-white font-bold py-3 rounded-lg">Shop Coffee</Link>
          </div>
        </div>
      )}
    </header>
  );
}
