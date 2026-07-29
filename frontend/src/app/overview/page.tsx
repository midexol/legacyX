"use client";

import React, { useState } from "react";
import { Lock, Sliders, Users, ChevronDown, Activity, ShieldCheck, DollarSign, TrendingUp, Cpu, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@/providers/wallet-provider";

export default function OverviewPage() {
  const { isConnected, connectWallet } = useWallet();
  const [selectedVaultName, setSelectedVaultName] = useState("Primary Vault #001");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Beneficiary Percentage Allocator Simulator
  const [spousePercent, setSpousePercent] = useState<number>(50);
  const [childPercent, setChildPercent] = useState<number>(30);
  const reservePercent = Math.max(0, 100 - spousePercent - childPercent);

  return (
    <div className="space-y-16 py-6 bg-[#08090C] text-white min-h-screen pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>EXECUTIVE NETWORK DASHBOARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Protocol Overview & Analytics
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Real-time status of locked inheritance TVL, active enclave attestations, FTSO oracle feeds, and vault condition metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vault"
            className="px-5 py-2.5 rounded-xl bg-[#FF3A56] hover:bg-[#e02b45] text-white font-bold text-xs shadow-lg shadow-[#FF3A56]/25 transition-all flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Manage Vaults</span>
          </Link>
          <Link
            href="/otc"
            className="px-5 py-2.5 rounded-xl bg-[#121620] border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
          >
            <span>Private OTC</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "TOTAL PROTOCOL TVL",
            value: "12,450,000 FXRP",
            sub: "≈ $6,847,500 USD",
            change: "+14.2% this month",
            icon: Lock,
            color: "text-[#FF3A56]",
          },
          {
            title: "ACTIVE VAULTS",
            value: "1,482 Vaults",
            sub: "Average lock: 180 Days",
            change: "100% Non-Custodial",
            icon: ShieldCheck,
            color: "text-emerald-400",
          },
          {
            title: "FLARE FTSO ORACLE",
            value: "$0.5500 USD",
            sub: "FXRP/USD • Latency 1.8s",
            change: "FTSO v2 Synced",
            icon: Cpu,
            color: "text-blue-400",
          },
          {
            title: "CONFIDENTIAL OTC SETTLED",
            value: "$4,210,000 USD",
            sub: "78 Off-chain Swaps",
            change: "Zero Slippage",
            icon: DollarSign,
            color: "text-purple-400",
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="p-6 rounded-2xl bg-[#121620] border border-white/10 shadow-xl space-y-4 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-xl bg-[#08090C] border border-white/10 text-slate-300 group-hover:text-[#FF3A56] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold font-mono text-white tracking-tight">
                  {kpi.value}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{kpi.sub}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className={kpi.color}>{kpi.change}</span>
                <span>Coston2</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: My Vault Dashboard + Beneficiary Allocation Simulator */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT BENTO CARD: Active Vault Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 bg-[#121620] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF3A56]/10 border border-[#FF3A56]/20 text-[#FF3A56]">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Active Vault Portfolio</span>
              </h3>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#08090C] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2 hover:border-[#FF3A56]/40 transition-colors"
                >
                  <span>{selectedVaultName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#08090C] border border-white/10 p-1.5 shadow-2xl z-20 space-y-1">
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

            {/* Active Vault Details Box */}
            <div className="p-5 rounded-xl bg-[#08090C] border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                  Vault ID
                </span>
                <span className="text-sm font-bold text-white font-mono block mt-0.5">#001-FXRP</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Ping
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                  Inactivity Guard
                </span>
                <span className="text-sm font-bold text-white font-mono block mt-0.5">180 Days</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                  Balance
                </span>
                <span className="text-sm font-bold text-[#FF3A56] font-mono block mt-0.5">10,000 FXRP</span>
              </div>
            </div>
          </div>

          {/* Allocation Matrix Simulator */}
          <div className="p-6 rounded-xl bg-[#08090C] border border-white/5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF3A56]" />
                Beneficiary Allocation Simulator
              </span>
              <span className="font-mono text-slate-400 text-xs">
                100% Split Matrix
              </span>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
                  <span>Spouse Split (Primary Beneficiary)</span>
                  <span className="font-bold text-white font-mono">{spousePercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={spousePercent}
                  onChange={(e) => setSpousePercent(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#121620] rounded-lg appearance-none cursor-pointer accent-[#FF3A56]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1.5">
                  <span>Child Split (Secondary Beneficiary)</span>
                  <span className="font-bold text-white font-mono">{childPercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={childPercent}
                  onChange={(e) => setChildPercent(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#121620] rounded-lg appearance-none cursor-pointer accent-[#FF7A56]"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 font-mono pt-2 border-t border-white/5">
                <span>Reserve Pool: {reservePercent}%</span>
                <span>Total Matrix: {(spousePercent + childPercent + reservePercent)}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT BENTO CARD: Protocol Status & Recent Activity Stream */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5 bg-[#121620] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5 border-b border-white/5 pb-4">
              <div className="p-2 rounded-xl bg-[#FF3A56]/10 border border-[#FF3A56]/20 text-[#FF3A56]">
                <Activity className="w-4 h-4" />
              </div>
              <span>Network Enclave Activity</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {[
                { time: "2 mins ago", event: "Vault #042 Heartbeat Pinged", status: "VERIFIED", color: "text-emerald-400" },
                { time: "18 mins ago", event: "Private OTC Swap Executed (50k FXRP)", status: "SETTLED", color: "text-[#FF3A56]" },
                { time: "1 hour ago", event: "Flare FTSO Price Feed Updated", status: "SYNCED", color: "text-blue-400" },
                { time: "3 hours ago", event: "New Vault Deployed on Coston2", status: "CREATED", color: "text-purple-400" },
              ].map((act, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#08090C] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-semibold block">{act.event}</span>
                    <span className="text-[11px] text-slate-400">{act.time}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] bg-white/5 ${act.color}`}>
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Network: Flare Coston2 Testnet</span>
              <span>Block: #18924102</span>
            </div>
            <Link
              href="/vault"
              className="w-full py-3.5 rounded-xl bg-[#1E2433] hover:bg-[#283044] border border-white/10 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#FF3A56]" />
              <span>Go to Vault Manager</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
