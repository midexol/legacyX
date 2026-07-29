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
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
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
    setIsConnectModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsAccountModalOpen(false);
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

        {/* Right: Connect Wallet Button / Connected Pill Button */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsConnectModalOpen(true)}
              className="relative group px-5 py-2.5 rounded-xl bg-[#121620] border border-white/10 hover:border-[#FF3A56]/50 text-white font-semibold text-xs transition-all shadow-lg shadow-black/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-[#FF3A56]" />
                <span>Connect Wallet</span>
              </span>
            </motion.button>
          ) : (
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#121620] border border-white/10 hover:border-[#FF3A56]/40 text-slate-100 text-xs font-mono transition-all shadow-md group"
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

      {/* 1. CENTERED CONNECT WALLET MODAL DIALOG */}
      <AnimatePresence>
        {isConnectModalOpen && !isConnected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConnectModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-md w-full bg-[#121620] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 z-[110]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Connect a Wallet</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your preferred Web3 provider for Flare Coston2 Testnet.
                  </p>
                </div>
                <button
                  onClick={() => setIsConnectModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wallet Options List */}
              <div className="space-y-2.5">
                {[
                  { name: "MetaMask", icon: "🦊", desc: "Browser Extension / Mobile" },
                  { name: "Rainbow", icon: "🌈", desc: "Mobile & Web3 Extension" },
                  { name: "WalletConnect", icon: "🔗", desc: "Scan QR Code" },
                  { name: "Coinbase Wallet", icon: "🛡️", desc: "Self-Custodial" },
                ].map((provider) => (
                  <button
                    key={provider.name}
                    onClick={handleConnect}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#FF3A56]/40 transition-all cursor-pointer w-full group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <span className="font-bold text-sm text-white group-hover:text-[#FF3A56] transition-colors block">
                          {provider.name}
                        </span>
                        <span className="text-xs text-slate-400 block">{provider.desc}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#FF3A56] opacity-0 group-hover:opacity-100 transition-opacity">
                      Connect →
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CENTERED CONNECTED ACCOUNT MODAL DIALOG */}
      <AnimatePresence>
        {isAccountModalOpen && isConnected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAccountModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-md w-full bg-[#121620] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 z-[110]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Connected Account</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Flare Coston2 Testnet Session
                  </p>
                </div>
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">EVM Address</span>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center gap-1 text-xs"
                  >
                    {isCopied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <span className="text-xs font-bold text-white block break-all">
                  0x71C7240a1B8c3dE8B92e85F69A5C4E5E89F2
                </span>

                <div className="pt-2 border-t border-white/5 flex justify-between text-xs">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-emerald-400 font-bold">Flare Coston2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Locked Vault Balance:</span>
                  <span className="text-white font-bold">10,000 FXRP</span>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full py-3 rounded-xl bg-[#FF3A56]/10 hover:bg-[#FF3A56]/20 border border-[#FF3A56]/30 text-[#FF3A56] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Wallet</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
