"use client";

import React, { useState } from "react";
import { Hero } from "@/components/hero";
import { ChevronDown, X, Sliders, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { TestnetMetricsBar, ProtocolFlowchart } from "@/components/motion-graphics";

export default function OverviewPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVaultName, setSelectedVaultName] = useState("Add Vault");
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  // Interactive Beneficiary Percentage Allocator State
  const [spousePercent, setSpousePercent] = useState<number>(50);
  const [childPercent, setChildPercent] = useState<number>(30);
  const reservePercent = Math.max(0, 100 - spousePercent - childPercent);

  return (
    <div className="relative space-y-12 bg-[#0B0E14] min-h-screen text-white pb-20 overflow-hidden">
      {/* Background Layer: 21st.dev Dot Matrix Grid & Fixed Grain Noise Overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none z-0" />

      <div className="relative z-10 space-y-12">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Institutional Testnet Metrics Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TestnetMetricsBar />
        </section>

        {/* 3. Institutional Protocol Architecture Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          <ProtocolFlowchart />
        </section>

        {/* 4. Dashboard Bento Cards Container */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 relative">
          {/* Ambient Backdrop Radial Glow behind Bento Grid */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF3A56]/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="grid lg:grid-cols-12 gap-6 items-stretch relative z-10">
            {/* LEFT BENTO CARD ("My Vaults") */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 bg-[#131722]/90 backdrop-blur-md border border-white/10 hover:border-[#FF3A56]/40 rounded-2xl p-6 shadow-2xl transition-all duration-300 space-y-6 flex flex-col justify-between group"
            >
              <div className="space-y-5">
                {/* Header: Title + Glowing Icon Accent + [ Add Vault v ] Dropdown */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#FF3A56]/10 border border-[#FF3A56]/20 text-[#FF3A56]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span>My Vaults</span>
                  </h3>

                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors hover:border-[#FF3A56]/30"
                    >
                      <span>{selectedVaultName}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0B0E14] border border-white/10 p-1.5 shadow-2xl z-20 space-y-1">
                        {["Primary Vault #001", "Secondary OTC Vault", "Create New Vault +"].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              if (!item.includes("Create")) setSelectedVaultName(item);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Row Box: Icon | Vault 1 Vault | Status Active | Duration 6 Months | Balance 10,000 FXRP */}
                <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <X className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                        Vault
                      </span>
                      <span className="text-sm font-bold text-white block">1 Vault</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                      Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                      Active
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-white font-mono block">6 Months</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">
                      Balance
                    </span>
                    <span className="text-sm font-bold text-white font-mono block">10,000 FXRP</span>
                  </div>
                </div>
              </div>

              {/* Lower Section: Interactive Beneficiary Allocation Simulator */}
              <div className="p-5 rounded-xl bg-[#0B0E14] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#FF3A56]" />
                    Beneficiary Allocation Matrix
                  </span>
                  <span className="font-mono text-slate-400 text-xs">
                    100% Configured
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                      <span>Spouse Allocation</span>
                      <span className="font-bold text-white">{spousePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={spousePercent}
                      onChange={(e) => setSpousePercent(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#131722] rounded-lg appearance-none cursor-pointer accent-[#FF3A56] hover:scale-[1.01] transition-transform"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                      <span>Child Allocation</span>
                      <span className="font-bold text-white">{childPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={childPercent}
                      onChange={(e) => setChildPercent(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#131722] rounded-lg appearance-none cursor-pointer accent-[#FF7A56] hover:scale-[1.01] transition-transform"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
                    <span>Reserve Pool: {reservePercent}%</span>
                    <span>Total: {(spousePercent + childPercent + reservePercent)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT BENTO CARD ("Add Beneficiary") */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5 bg-[#131722]/90 backdrop-blur-md border border-white/10 hover:border-[#FF3A56]/40 rounded-2xl p-6 shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#FF3A56]/10 border border-[#FF3A56]/20 text-[#FF3A56]">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Add Beneficiary</span>
                </h3>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/10 text-white placeholder-slate-500 focus:border-[#FF3A56] focus:ring-1 focus:ring-[#FF3A56] outline-none transition text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Add Beneficiary"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/10 text-white placeholder-slate-500 focus:border-[#FF3A56] focus:ring-1 focus:ring-[#FF3A56] outline-none transition text-sm font-mono"
                  />
                </div>
              </div>

              {/* Dark slate full-width button "Add" */}
              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-[#1E2433] hover:bg-[#283044] border border-white/10 hover:border-[#FF3A56]/40 text-slate-200 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Add</span>
              </button>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
