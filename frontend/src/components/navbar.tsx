"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, ChevronDown, CheckCircle2, Copy, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("0x71C...89F2");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/" },
    { name: "Vault", href: "/vault" },
    { name: "Claim", href: "/claim" },
    { name: "Private OTC", href: "/otc" },
  ];

  const handleConnect = () => {
    setIsConnected(true);
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsModalOpen(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText("0x71C7240a1B8c3dE8B92e85F69A5C4E5E89F2");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090C]/80 backdrop-blur-md border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Red/White Stylized L logo + LEGACYX title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF3A56] to-[#d9233f] flex items-center justify-center font-black text-sm text-white shadow-lg shadow-[#FF3A56]/25 group-hover:scale-105 transition-transform duration-300">
            L
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white uppercase flex items-center gap-0.5">
            LEGACY<span className="text-[#FF3A56]">X</span>
          </span>
        </Link>

        {/* Center: Nav links with smooth sliding underbar indicators */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbarUnderbar"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3A56] rounded-full shadow-[0_0_8px_#FF3A56]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Shimmer Connect Wallet Button */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="relative group px-5 py-2 rounded-xl bg-[#10141D] border border-white/10 hover:border-[#FF3A56]/50 text-white font-medium text-xs transition-all overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF3A56]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#FF3A56]" />
                <span>Connect Wallet</span>
              </span>
            </motion.button>
          ) : (
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#10141D] border border-white/10 text-slate-100 text-xs font-mono transition-all hover:border-white/20"
            >
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>{address}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Connect Wallet Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#10141D] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              {!isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
                      <p className="text-xs text-slate-400">Flare Coston2 Testnet</p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#FF3A56]/20 text-[#FF3A56] border border-[#FF3A56]/30">
                      Coston2
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "MetaMask", icon: "🦊" },
                      { name: "Rainbow", icon: "🌈" },
                      { name: "WalletConnect", icon: "🔗" },
                    ].map((provider) => (
                      <button
                        key={provider.name}
                        onClick={handleConnect}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#08090C] hover:bg-[#1A202C] border border-white/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{provider.icon}</span>
                          <span className="font-semibold text-white group-hover:text-[#FF3A56] transition-colors">
                            {provider.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="font-mono text-sm font-bold text-white">{address}</span>
                      <span className="block text-xs text-[#10B981] font-semibold mt-0.5">
                        Connected to Flare Coston2
                      </span>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="p-1 text-slate-400 hover:text-[#FF3A56]"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
