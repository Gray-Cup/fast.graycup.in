import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gray Cup (Fast) — Estate Tea & Coffee",
  description:
    "Premium CTC tea from Assam, Nilgiri & Dooars. Single-origin Arabica & Robusta coffee from Chikmagalur & Wayanad. Estate direct, shipped fast via Delhivery.",
  keywords: "CTC tea, Assam tea, Nilgiri tea, Arabica coffee, Robusta coffee, Chikmagalur, Wayanad, buy tea online India",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    images: [{ url: "/og.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
        className="bg-white text-gray-900 min-h-screen flex flex-col"
      >
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
