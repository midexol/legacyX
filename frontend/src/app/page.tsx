"use client";

import React from "react";
import { Hero } from "@/components/hero";
import { HowItWorksSection } from "@/components/how-it-works";
import { TestnetMetricsBar, ProtocolFlowchart } from "@/components/motion-graphics";
import Link from "next/link";
import { ArrowRight, Shield, BookOpen, Lock, Users, Zap } from "lucide-react";
import { useWallet } from "@/providers/wallet-provider";

export default function LandingPage() {
  const { isConnected, connectWallet } = useWallet();

  return (
    <div className="relative space-y-24 bg-[#08090C] min-h-screen text-white pb-24 overflow-hidden">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 space-y-24">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Institutional Testnet Metrics Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TestnetMetricsBar />
        </section>

        {/* 3. Detailed Explainer Section: "How LegacyX Privacy Works" */}
        <HowItWorksSection />

        {/* 4. Protocol Architecture & Flowchart */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProtocolFlowchart />
        </section>

        {/* 5. Breathable Call-To-Action Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-[#121620] via-[#171D2A] to-[#121620] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#FF3A56]/15 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>FLARE COSTON2 TESTNET DEPLOYED</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Ready to Secure Your Digital Legacy?
              </h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Deploy non-custodial condition vaults for FXRP with automated heartbeat guards and zero-slippage OTC liquidation.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
              {isConnected ? (
                <Link
                  href="/vault"
                  className="px-6 py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#e02b45] text-white font-bold text-sm shadow-xl shadow-[#FF3A56]/30 transition-all flex items-center gap-2 group"
                >
                  <span>Launch Vault Manager</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-6 py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#e02b45] text-white font-bold text-sm shadow-xl shadow-[#FF3A56]/30 transition-all flex items-center gap-2 group"
                >
                  <span>Connect Wallet to Launch</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <Link
                href="/docs"
                className="px-6 py-3.5 rounded-xl bg-[#08090C] hover:bg-[#121620] border border-white/10 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#FF3A56]" />
                <span>Read Technical Specs</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
