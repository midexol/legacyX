"use client";

import React, { useState } from "react";
import { Shield, Lock, Activity, RefreshCcw, ArrowDownRight, ArrowUpRight, Plus, Sliders, CheckCircle2, AlertCircle, Clock, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VaultView() {
  const [activeTab, setActiveTab] = useState<"vaults" | "beneficiaries">("vaults");
  const [vaultBalance, setVaultBalance] = useState<number>(10000);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<string>("Just now");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);

  // Beneficiary allocation states
  const [spousePercent, setSpousePercent] = useState<number>(50);
  const [childPercent, setChildPercent] = useState<number>(30);
  const reservePercent = Math.max(0, 100 - spousePercent - childPercent);

  const handlePingHeartbeat = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setLastPingTime("Just now (Block #18,924,102)");
    }, 1500);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    setVaultBalance((prev) => prev + Number(depositAmount));
    setDepositAmount("");
    setShowDepositModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-16 bg-[#08090C] text-white min-h-screen">
      {/* SECTION 1: HERO VISUAL STAGE & COMMAND CENTER HEADER */}
      <div className="grid lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-12">
        {/* Left Hero Stage: Telemetry & Title */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold shadow-md">
            <Shield className="w-4 h-4" />
            <span>SECURITY COMMAND CENTER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Inheritance Vault Manager
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            Non-custodial smart vaults holding FXRP on Flare Coston2 Testnet. Automated inactivity guards, cryptographic heartbeats, and custom multi-sig allocation matrix.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handlePingHeartbeat}
              disabled={isPinging}
              className="px-5 py-3 rounded-xl bg-[#FF3A56] hover:bg-[#e02a43] text-white font-bold text-xs shadow-lg shadow-[#FF3A56]/30 transition-all flex items-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isPinging ? "animate-ping text-white" : ""}`} />
              <span>{isPinging ? "Ping Cryptographic Heartbeat..." : "Ping Heartbeat Guard"}</span>
            </button>

            <button
              onClick={() => setShowDepositModal(true)}
              className="px-5 py-3 rounded-xl bg-[#121620] border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#FF3A56]" />
              <span>Deposit FXRP Assets</span>
            </button>
          </div>
        </div>

        {/* Right Hero Stage: HD 3D Looping Core Video / Visual Stage */}
        <div className="lg:col-span-5 relative">
          <div className="relative bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
            {/* Ambient Coral Red Lighting */}
            <div className="absolute w-56 h-56 bg-[#FF3A56]/20 blur-[80px] rounded-full pointer-events-none" />

            {/* 3D Glass Vault Shield Icon Stage */}
            <div className="relative z-10 w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1A2130] to-[#08090C] border border-[#FF3A56]/40 flex items-center justify-center shadow-xl shadow-[#FF3A56]/20 mb-4">
              <Lock className="w-12 h-12 text-[#FF3A56]" />
              <div className="absolute -inset-2 border border-[#FF3A56]/20 rounded-3xl animate-spin-slow pointer-events-none" />
            </div>

            {/* Floating Live Telemetry Badges */}
            <div className="relative z-10 space-y-3 w-full max-w-xs mt-2">
              <div className="p-3 rounded-xl bg-[#08090C]/90 border border-emerald-500/30 flex items-center justify-between font-mono text-xs shadow-lg">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  STATUS
                </span>
                <span className="text-emerald-400 font-bold">HEARTBEAT OK</span>
              </div>

              <div className="p-3 rounded-xl bg-[#08090C]/90 border border-[#FF3A56]/30 flex items-center justify-between font-mono text-xs shadow-lg">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF3A56]" />
                  NEXT PING
                </span>
                <span className="text-white font-bold">345 DAYS REMAINING</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TOP METRICS RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: "TOTAL FXRP LOCKED",
            value: `${vaultBalance.toLocaleString()} FXRP`,
            sub: `≈ $${(vaultBalance * 0.55).toLocaleString()} USD`,
            color: "text-[#FF3A56]",
            icon: Lock,
          },
          {
            label: "ACTIVE INHERITANCE VAULTS",
            value: "1 Active Vault",
            sub: "180-Day Inactivity Timeout",
            color: "text-emerald-400",
            icon: Shield,
          },
          {
            label: "PROTOCOL HEALTH SCORE",
            value: "100% Secure",
            sub: "Flare Coston2 Enclave Verified",
            color: "text-blue-400",
            icon: Activity,
          },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#121620]/80 backdrop-blur-md border border-white/10 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                  {m.label}
                </span>
                <div className="p-2 rounded-xl bg-[#08090C] border border-white/10 text-slate-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className={`text-2xl font-extrabold font-mono tracking-tight ${m.color}`}>
                  {m.value}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{m.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 3: TAB NAVIGATION & MAIN CONTENT */}
      <div className="space-y-8">
        <div className="flex p-1.5 rounded-2xl bg-[#121620] border border-white/10 self-start w-fit">
          <button
            onClick={() => setActiveTab("vaults")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "vaults"
                ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>My Active Vault Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab("beneficiaries")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "beneficiaries"
                ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Beneficiary Allocation Matrix</span>
          </button>
        </div>

        {activeTab === "vaults" ? (
          <div className="p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-2xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Vault ID #001-FXRP
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Primary Inheritance Vault
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ● ACTIVE HEARTBEAT
              </span>
            </div>

            {/* Wide Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 uppercase">
                    <th className="pb-3 px-3">Asset</th>
                    <th className="pb-3 px-3">Locked Balance</th>
                    <th className="pb-3 px-3">USD Value</th>
                    <th className="pb-3 px-3">Timeout Period</th>
                    <th className="pb-3 px-3">Last Ping</th>
                    <th className="pb-3 px-3 text-right">Action Triggers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="py-4 px-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FF3A56]/20 text-[#FF3A56] font-extrabold flex items-center justify-center text-xs">
                        X
                      </div>
                      <span>FXRP (Flare XRP)</span>
                    </td>
                    <td className="py-4 px-3 font-bold text-white text-sm">
                      {vaultBalance.toLocaleString()} FXRP
                    </td>
                    <td className="py-4 px-3 text-slate-300">
                      ${(vaultBalance * 0.55).toLocaleString()} USD
                    </td>
                    <td className="py-4 px-3 text-slate-300">180 Days</td>
                    <td className="py-4 px-3 text-emerald-400">{lastPingTime}</td>
                    <td className="py-4 px-3 text-right space-x-2">
                      <button
                        onClick={handlePingHeartbeat}
                        disabled={isPinging}
                        className="px-3 py-1.5 rounded-lg bg-[#FF3A56] hover:bg-[#e02a43] text-white font-bold text-[11px] transition-colors"
                      >
                        Ping
                      </button>
                      <button
                        onClick={() => setShowDepositModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-colors"
                      >
                        Deposit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-2xl space-y-8">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FF3A56]" />
                <span>Multi-Beneficiary Allocation Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure exact percentage splits for estate distribution upon condition release.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-mono mb-2">
                    <span>Spouse Share (Primary Beneficiary)</span>
                    <span className="font-bold text-[#FF3A56]">{spousePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={spousePercent}
                    onChange={(e) => setSpousePercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#08090C] rounded-lg appearance-none cursor-pointer accent-[#FF3A56]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-mono mb-2">
                    <span>Child Share (Secondary Beneficiary)</span>
                    <span className="font-bold text-[#FF7A56]">{childPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={childPercent}
                    onChange={(e) => setChildPercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#08090C] rounded-lg appearance-none cursor-pointer accent-[#FF7A56]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 font-mono text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Reserve Buffer Pool:</span>
                    <span className="text-slate-200 font-bold">{reservePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Allocated Matrix:</span>
                    <span className="text-emerald-400 font-bold">100% Validated</span>
                  </div>
                </div>
              </div>

              {/* Allocation Preview Ring */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#08090C] border border-white/5 flex flex-col items-center justify-center space-y-4">
                <div className="w-32 h-32 rounded-full border-8 border-[#FF3A56] border-t-emerald-400 flex items-center justify-center font-mono font-bold text-sm text-white">
                  100%
                </div>
                <div className="text-center font-mono text-xs space-y-1">
                  <span className="text-white font-bold block">Spouse: {((vaultBalance * spousePercent) / 100).toLocaleString()} FXRP</span>
                  <span className="text-slate-400 block">Child: {((vaultBalance * childPercent) / 100).toLocaleString()} FXRP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="relative max-w-md w-full bg-[#121620] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">Deposit FXRP into Vault</h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-slate-400 hover:text-white font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount of FXRP to Deposit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#08090C] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF3A56]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#e02a43] text-white font-bold text-xs shadow-lg shadow-[#FF3A56]/30 transition-all"
                >
                  Confirm Deposit
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
