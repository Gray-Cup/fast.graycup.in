export default function Footer() {
  return (
    <footer className="bg-blue-50 border-t border-blue-100 py-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-blue-400">
        <span className="font-black text-blue-500">Gray Cup <span className="text-amber-500">(Fast)</span></span>
        <span>© {new Date().getFullYear()} Gray Cup. All rights reserved.</span>
        <span>
          <a href="mailto:arjun@graycup.in" className="hover:text-blue-600 transition-colors">arjun@graycup.in</a>
        </span>
      </div>
    </footer>
  );
}
