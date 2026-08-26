import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "next-themes";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-slate-950 dark:bg-slate-950 bg-[#f8fafc] text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white flex flex-col justify-between">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ServiceWorkerRegistration />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <I18nProvider>
        <div className="mx-auto max-w-md md:max-w-7xl w-full min-h-screen flex flex-col shadow-2xl bg-[#f8fafc] dark:bg-slate-950 border-x border-slate-200 dark:border-slate-900/50">
          <Header />
          <div id="main-content" className="flex-1" role="main">{children}</div>
          <Footer />
          <MobileNav />
          <WhatsAppCTA />
        </div>
        </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
