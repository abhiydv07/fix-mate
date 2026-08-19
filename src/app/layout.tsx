import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fix Mate — On-Demand Home Services Marketplace",
  description: "Book trusted local service professionals for plumbing, electrical, cleaning, appliance repair, and home maintenance.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0f17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <div className="mx-auto max-w-md md:max-w-7xl min-h-screen flex flex-col shadow-2xl bg-slate-950 border-x border-slate-900/50">
          {children}
        </div>
      </body>
    </html>
  );
}
