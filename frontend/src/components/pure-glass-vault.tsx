"use client";

import React from "react";
import { motion } from "framer-motion";

export function PureGlassVault() {
  return (
    <div className="relative flex items-center justify-center w-full h-[400px] bg-transparent">
      {/* 1. Pure Red Radial Glow Backdrop - Blends 100% seamlessly into hero background with NO square box */}
      <div className="absolute w-[340px] h-[340px] bg-[#FF3A56] opacity-35 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. Isolated Levitating Glass Vault Object - Pure Vector & Image Transparency */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-[320px] h-[320px] flex items-center justify-center bg-transparent"
      >
        {/* Crystal Glass Safe Visual Container */}
        <div className="relative w-72 h-72 rounded-3xl bg-white/[0.07] backdrop-blur-md border-2 border-white/30 shadow-[0_0_50px_rgba(255,58,86,0.3)] flex flex-col items-center justify-center p-6 group">
          {/* Glass Bevel Highlights */}
          <div className="absolute inset-1 rounded-[22px] border border-white/20 pointer-events-none" />
          <div className="absolute top-2 left-4 right-4 h-12 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />

          {/* Corner Chrome Bolts */}
          <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-slate-300 border border-white shadow-sm" />
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-slate-300 border border-white shadow-sm" />
          <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-slate-300 border border-white shadow-sm" />
          <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-slate-300 border border-white shadow-sm" />

          {/* Center Chrome Combination Safe Dial Lock */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-slate-700 via-slate-400 to-slate-100 p-1 shadow-2xl flex items-center justify-center">
            {/* Outer Dial Teeth Ring */}
            <div className="w-full h-full rounded-full bg-slate-900 border-2 border-slate-400 flex items-center justify-center relative overflow-hidden">
              {/* Dial Tick Marks */}
              <div className="absolute inset-0 border-4 border-dashed border-slate-500/40 rounded-full" />

              {/* Inner Handle Hub */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 border-2 border-white shadow-inner flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#FF3A56] shadow-[0_0_8px_#FF3A56]" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Metallic FXRP Token Badges */}
          <div className="absolute -top-3 right-2 px-3 py-1 rounded-full bg-[#0B0E14]/90 border border-[#FF3A56]/50 text-white font-mono text-[10px] font-bold shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF3A56] animate-pulse" />
            <span>10,000 FXRP</span>
          </div>

          <div className="absolute -bottom-3 left-2 px-3 py-1 rounded-full bg-[#0B0E14]/90 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] font-bold shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ACTIVE PROTECTION</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
