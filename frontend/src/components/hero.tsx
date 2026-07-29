"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-16 lg:pb-20 bg-[#08090C]">
      {/* 21st.dev Background Layers */}

      {/* Layer 1: Retro Dot Matrix Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-60" />

      {/* Layer 2: Ambient Glowing Orbs */}
      {/* Flare Coral Orb behind 3D Vault */}
      <div className="absolute top-1/4 right-10 w-[450px] h-[450px] bg-[#FF3A56] rounded-full blur-[140px] opacity-25 animate-pulse pointer-events-none" />

      {/* Deep Violet/Slate Orb Bottom Left */}
      <div className="absolute -bottom-10 left-0 w-[400px] h-[400px] bg-indigo-900/30 rounded-full blur-[130px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* LEFT COLUMN: Clean High-Contrast Typography & Dual CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10141D] border border-white/10 text-[#FF3A56] text-xs font-semibold tracking-wider uppercase shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Flare Coston2 Digital Will</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-1.5"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Pass down your crypto.
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Not your private keys.
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 font-normal max-w-xl leading-relaxed"
            >
              Secure on-chain inheritance and private <br />
              OTC liquidation on Flare.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              {/* Primary Coral Red Button with Glow Shadow */}
              <Link
                href="/vault"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#E02E47] text-white font-semibold text-sm hover:shadow-[0_0_25px_rgba(255,58,86,0.4)] transition-all duration-300 group"
              >
                <span>Create Legacy Vault</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Glassmorphism CTA Button */}
              <Link
                href="/otc"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all duration-200"
              >
                <span>Explore OTC</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Realistic Floating 3D Glass Vault Asset */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
            <div className="relative flex items-center justify-center w-full h-[420px] bg-transparent">
              {/* Seamless Red Ambient Spotlight (Behind Asset) */}
              <div className="absolute w-[300px] h-[300px] bg-[#FF3A56] opacity-30 rounded-full blur-[110px] pointer-events-none" />

              {/* Realistic Floating 3D Glass Vault Asset */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-[320px] h-[320px] flex items-center justify-center bg-transparent"
              >
                <img
                  src="/assets/glass-vault-3d.png"
                  alt="Legacy 3D Glass Vault"
                  className="w-full h-full object-contain bg-transparent drop-shadow-[0_10px_30px_rgba(255,58,86,0.25)]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
