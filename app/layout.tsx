import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NutriNest — Premium Dry Fruits",
  description:
    "Shop premium quality dry fruits — almonds, pistachios, anjeer, walnuts & more. Fresh, hand-picked, delivered to your door.",
  keywords: "dry fruits, almonds, pistachios, anjeer, walnuts, cashews online",
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
