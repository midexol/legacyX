import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LegacyX | On-Chain Digital Inheritance for Crypto on Flare",
  description:
    "Secure your digital legacy on Flare Coston2 Testnet. Automated condition-based inheritance vaults for FXRP and confidential OTC liquidation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#08090C] text-white antialiased min-h-screen`}>
        <ThemeProvider>
          <WalletProvider>
            <div className="flex flex-col min-h-screen bg-[#08090C] text-white selection:bg-[#FF3A56]/30 selection:text-[#FF3A56]">
              <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            {/* Platform Footer */}
            <footer className="border-t border-white/5 bg-[#08090C] py-10 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF3A56] flex items-center justify-center font-black text-white">
                    L
                  </div>
                  <span className="font-bold text-base tracking-tight text-white uppercase">
                    Legacy<span className="text-[#FF3A56]">X</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    © 2026 • Flare Coston2 Testnet
                  </span>
                </div>

                <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
                  <Link href="/" className="hover:text-white transition-colors">
                    Overview
                  </Link>
                  <Link href="/vault" className="hover:text-white transition-colors">
                    Vault Manager
                  </Link>
                  <Link href="/claim" className="hover:text-white transition-colors">
                    Beneficiary Claim
                  </Link>
                  <Link href="/otc" className="hover:text-[#FF3A56] transition-colors">
                    Private OTC Desk
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </WalletProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}
