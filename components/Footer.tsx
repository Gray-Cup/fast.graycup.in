import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-14 pb-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-2xl font-black text-white mb-3">
              Nutri<span className="text-amber-400">Nest</span>
            </p>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Premium dry fruits sourced from the world's finest farms. Delivered fresh to your door.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white font-semibold text-base mb-4 uppercase tracking-widest text-xs">
              Shop
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/#nuts" className="text-sm hover:text-amber-400 transition-colors">
                  Nuts
                </Link>
              </li>
              <li>
                <Link href="/#dried-fruits" className="text-sm hover:text-amber-400 transition-colors">
                  Dried Fruits
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-white font-semibold text-base mb-4 uppercase tracking-widest text-xs">
              Help
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm hover:text-amber-400 transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-amber-400 transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-amber-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-amber-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold text-base mb-4 uppercase tracking-widest text-xs">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li className="text-sm">
                📞{" "}
                <a href="tel:+918527914317" className="hover:text-amber-400 transition-colors">
                  +91 8527914317
                </a>
              </li>
              <li className="text-sm">
                ✉️{" "}
                <a
                  href="mailto:arjun@graycup.in"
                  className="hover:text-amber-400 transition-colors"
                >
                  arjun@graycup.in
                </a>
              </li>
              <li className="text-sm text-gray-500 mt-1">Mon–Sat, 10am–6pm IST</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} NutriNest. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Payments secured by{" "}
            <span className="text-amber-500 font-semibold">Cashfree</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
