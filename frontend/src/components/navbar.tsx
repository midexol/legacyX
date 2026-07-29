"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, ChevronDown, CheckCircle2, Copy, LogOut, BookOpen, Menu, X, Shield, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/providers/wallet-provider";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authenticated vs Unauthenticated Navigation Links
  const navLinks = isConnected
    ? [
        { name: "Overview", href: "/overview" },
        { name: "Vault", href: "/vault" },
        { name: "Claim", href: "/claim" },
        { name: "Private OTC", href: "/otc" },
        { name: "Docs", href: "/docs" },
      ]
    : [{ name: "Docs", href: "/docs" }];

  const handleConnect = () => {
    connectWallet();
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsModalOpen(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText("0x71C7240a1B8c3dE8B92e85F69A5C4E5E89F2");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090C]/85 backdrop-blur-xl border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Red/White Stylized L logo + LEGACYX title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3A56] to-[#c91d39] flex items-center justify-center font-black text-base text-white shadow-lg shadow-[#FF3A56]/30 group-hover:scale-105 transition-transform duration-300">
            L
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white uppercase flex items-center gap-0.5">
            LEGACY<span className="text-[#FF3A56]">X</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#121620] border border-white/10 text-[10px] font-mono text-slate-400 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56] animate-pulse" />
            Coston2
          </span>
        </Link>

        {/* Center: Dynamic Wallet-Gated Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === "/overview" && pathname === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition-all ${
                  isActive ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.name === "Docs" && <BookOpen className="w-3.5 h-3.5 text-[#FF3A56]" />}
                  {link.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbarUnderbar"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3A56] rounded-full shadow-[0_0_10px_#FF3A56]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Connect Wallet Button / Address Pill */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="relative group px-5 py-2.5 rounded-xl bg-[#121620] border border-white/10 hover:border-[#FF3A56]/50 text-white font-semibold text-xs transition-all overflow-hidden shadow-lg shadow-black/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF3A56]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#FF3A56]" />
                <span>Connect Wallet</span>
              </span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#121620] border border-white/10 hover:border-[#FF3A56]/40 text-slate-100 text-xs font-mono transition-all shadow-md group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-white group-hover:text-[#FF3A56] transition-colors">
                  {address}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#121620] border border-white/10 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#08090C] px-4 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[#121620] border border-white/5 text-sm font-semibold text-slate-200 hover:text-white hover:border-[#FF3A56]/30 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <BookOpen className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect Wallet Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#121620] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              {!isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#FF3A56]" />
                        <span>Connect Web3 Wallet</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Connect to access Flare Coston2 inheritance dApp
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FF3A56]/20 text-[#FF3A56] border border-[#FF3A56]/30">
                      Coston2
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { name: "MetaMask", icon: "🦊", desc: "Popular EVM Wallet" },
                      { name: "Rainbow", icon: "🌈", desc: "Mobile & Web3 Extension" },
                      { name: "WalletConnect", icon: "🔗", desc: "Scan QR with mobile wallet" },
                    ].map((provider) => (
                      <button
                        key={provider.name}
                        onClick={handleConnect}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-[#08090C] hover:bg-[#1A202C] border border-white/5 hover:border-[#FF3A56]/40 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{provider.icon}</span>
                          <div>
                            <span className="font-semibold text-white group-hover:text-[#FF3A56] transition-colors block text-sm">
                              {provider.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{provider.desc}</span>
                          </div>
                        </div>
                        <span className="text-xs text-[#FF3A56] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Connect →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-mono uppercase tracking-wider">
                        Connected Account
                      </span>
                      <span className="font-mono text-sm font-bold text-white mt-1 block">
                        {address}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Flare Coston2 Testnet
                      </span>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="p-2 rounded-lg bg-[#08090C] border border-white/10 text-slate-400 hover:text-[#FF3A56] transition-colors"
                      title="Copy Address"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-3 rounded-xl bg-[#FF3A56]/10 hover:bg-[#FF3A56]/20 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
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
