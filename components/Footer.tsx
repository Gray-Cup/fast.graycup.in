import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 pt-14 pb-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-2xl font-black text-white mb-3">
              Gray Cup <span className="text-amber-400">(Fast)</span>
            </p>
            <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
              Estate CTC teas and single-origin coffee beans. Sourced direct, shipped fast across India via Delhivery.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white font-semibold mb-4 uppercase tracking-widest text-xs">
              Shop
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#tea" className="text-sm hover:text-amber-400 transition-colors">
                  CTC Tea
                </Link>
              </li>
              <li>
                <Link href="/#coffee" className="text-sm hover:text-amber-400 transition-colors">
                  Coffee Beans
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-white font-semibold mb-4 uppercase tracking-widest text-xs">
              Help
            </p>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-amber-400 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-sm hover:text-amber-400 transition-colors">Refund Policy</a></li>
              <li><a href="#" className="text-sm hover:text-amber-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-amber-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold mb-4 uppercase tracking-widest text-xs">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li className="text-sm">
                <a href="tel:+918527914317" className="hover:text-amber-400 transition-colors">
                  +91 85279 14317
                </a>
              </li>
              <li className="text-sm">
                <a href="mailto:arjun@graycup.in" className="hover:text-amber-400 transition-colors">
                  arjun@graycup.in
                </a>
              </li>
              <li className="text-sm text-stone-500 mt-1">Mon–Sat, 10am–6pm IST</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-600">
            © {new Date().getFullYear()} Gray Cup (Fast). All rights reserved.
          </p>
          <p className="text-xs text-stone-600">
            Payments by{" "}
            <span className="text-amber-500 font-semibold">Cashfree</span> · Shipping by{" "}
            <span className="text-amber-500 font-semibold">Delhivery</span> · Orders: GCF-XXXX
          </p>
        </div>
      </div>
    </footer>
  );
}
