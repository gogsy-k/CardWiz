import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalAIButton from "@/components/ConditionalAIButton";
import { LangProvider } from "@/contexts/LangContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cardwiz.in"),
  title: {
    default: "CardWiz — India ka smart credit & debit card reward finder",
    template: "%s · CardWiz",
  },
  description:
    "Checkout pe sabse zyada bachat dene wala credit/debit card batao. 195+ Indian cards compare karo, bank offers samjho, bill reminders pao. Privacy-first, free Chrome extension.",
  keywords: [
    "best credit card india",
    "credit card rewards",
    "cashback cards india",
    "card comparison",
    "amazon best card",
    "CardWiz",
  ],
  openGraph: {
    title: "CardWiz — India ka smart card reward finder",
    description:
      "195+ Indian credit & debit cards compare karo. Checkout pe best card batao. Free.",
    url: "https://cardwiz.in",
    siteName: "CardWiz",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CardWiz — India ka smart card reward finder",
    description:
      "195+ Indian credit & debit cards compare karo. Checkout pe best card batao. Free.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1554196751103834"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <LangProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ConditionalAIButton />
          </AuthProvider>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
