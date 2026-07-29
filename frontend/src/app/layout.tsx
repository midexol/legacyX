import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";

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
              <Sidebar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-4 md:pl-20">
                {children}
              </main>
              <Footer />
            </div>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
