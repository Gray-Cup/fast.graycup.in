import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gray Cup Admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span className="text-lg font-black text-gray-900">Gray Cup <span className="text-amber-500">Admin</span></span>
          <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">View Store →</a>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}