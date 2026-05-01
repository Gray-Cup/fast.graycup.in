import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Gray Cup Admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 antialiased">
        <nav className="fixed top-0 left-0 right-0 z-30 h-12 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">Gray Cup Fast</span>
          <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">View Store →</a>
        </nav>
        <div className="flex pt-12 h-screen">
          <Sidebar />
          <main className="flex-1 overflow-hidden p-6 ml-56">{children}</main>
        </div>
      </body>
    </html>
  );
}