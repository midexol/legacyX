"use client";

import React, { useState } from "react";
import { Lock, EyeOff, Shield, RefreshCcw, ArrowRightLeft, Cpu, ShieldCheck, DollarSign, CheckCircle2, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function OtcView() {
  const [orderType, setOrderType] = useState<"Sell" | "Buy">("Sell");
  const [amount, setAmount] = useState<string>("");
  const [price, setPrice] = useState<string>("0.55");
  const [isZkObfuscated, setIsZkObfuscated] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [settlementLogs, setSettlementLogs] = useState([
    {
      id: "OTC-9014",
      side: "Sell",
      amount: "15,000 FXRP",
      price: "$0.5500 / FXRP",
      slippage: "0.00%",
      status: "Verified (Flare)",
      hash: "0x89f...21a4",
      time: "10 mins ago",
    },
    {
      id: "OTC-9015",
      side: "Buy",
      amount: "8,500 FXRP",
      price: "$0.5480 / FXRP",
      slippage: "0.00%",
      status: "Settling On-Chain",
      hash: "0x12c...99b2",
      time: "32 mins ago",
    },
    {
      id: "OTC-9016",
      side: "Sell",
      amount: "25,000 FXRP",
      price: "$0.5520 / FXRP",
      slippage: "0.00%",
      status: "Verified (Flare)",
      hash: "0x77a...44f9",
      time: "1 hour ago",
    },
  ]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newLog = {
        id: `OTC-${Math.floor(1000 + Math.random() * 9000)}`,
        side: orderType,
        amount: `${parseFloat(amount).toLocaleString()} FXRP`,
        price: `$${price} / FXRP`,
        slippage: "0.00%",
        status: "Verified (Flare)",
        hash: `0x${Math.random().toString(16).substring(2, 5)}...${Math.random().toString(16).substring(2, 6)}`,
        time: "Just now",
      };
      setSettlementLogs([newLog, ...settlementLogs]);
      setIsSubmitting(false);
      setAmount("");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-16 bg-[#08090C] text-white min-h-screen">
      {/* SECTION 1: HEADER & SHROUDED ORDER STAGE */}
      <div className="grid lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-12">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold shadow-md">
            <DollarSign className="w-4 h-4" />
            <span>CONFIDENTIAL TRADING DESK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Private OTC Liquidation Desk
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            Liquidate inherited FXRP directly off-chain without exposing public wallet balances or incurring exchange order book slippage.
          </p>

          <div className="flex items-center gap-6 pt-2 font-mono text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Slippage: 0.00% Guaranteed
            </span>
            <span className="flex items-center gap-1.5 text-[#FF3A56]">
              <Lock className="w-3.5 h-3.5" /> zk-SNARK Sharded
            </span>
          </div>
        </div>

        {/* Right Stage: Shrouded Privacy Shield Loop Video / Stage */}
        <div className="lg:col-span-5 relative">
          <div className="relative bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
            <div className="absolute w-56 h-56 bg-[#FF3A56]/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1A2130] to-[#08090C] border border-[#FF3A56]/40 flex items-center justify-center shadow-xl shadow-[#FF3A56]/20 mb-3">
              <EyeOff className="w-10 h-10 text-[#FF3A56]" />
              <div className="absolute -inset-2 border border-[#FF3A56]/20 rounded-3xl animate-spin-slow pointer-events-none" />
            </div>

            <div className="relative z-10 text-center space-y-1 mt-2">
              <span className="font-mono text-xs text-white font-bold block">
                OFF-CHAIN SHIELD MATCHING ENGINE
              </span>
              <span className="font-mono text-[11px] text-slate-400 block">
                Network: Flare Coston2 Testnet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRADING DESK SPLIT LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Order Creator Form */}
        <div className="lg:col-span-6 p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#FF3A56]" />
              <span>Create Confidential Order</span>
            </h3>

            <div className="flex p-1 rounded-xl bg-[#08090C] border border-white/5">
              <button
                type="button"
                onClick={() => setOrderType("Sell")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderType === "Sell"
                    ? "bg-[#FF3A56] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sell Inherited FXRP
              </button>
              <button
                type="button"
                onClick={() => setOrderType("Buy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  orderType === "Buy"
                    ? "bg-white/20 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Buy OTC Liquidity
              </button>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5">
                Order Quantity (FXRP)
              </label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#08090C] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF3A56]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5">
                Target Price per FXRP (USD)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#08090C] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#FF3A56]"
                required
              />
            </div>

            {/* Privacy Protocol Toggle */}
            <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF3A56]" />
                zk-SNARK Obfuscation
              </span>
              <button
                type="button"
                onClick={() => setIsZkObfuscated(!isZkObfuscated)}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition-colors ${
                  isZkObfuscated
                    ? "bg-[#FF3A56]/20 text-[#FF3A56] border border-[#FF3A56]/40"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {isZkObfuscated ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#FF3A56] hover:bg-[#e02a43] text-white font-bold text-sm shadow-xl shadow-[#FF3A56]/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Matching Off-Chain Shards...</span>
                </>
              ) : (
                <span>Submit Confidential {orderType} Order</span>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Settlement Feed */}
        <div className="lg:col-span-6 p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF3A56]" />
              <span>Live Off-Chain Settlement Feed</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              0.00% SLIPPAGE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {settlementLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-[#08090C] border border-white/5 flex items-center justify-between hover:border-white/15 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.side === "Sell"
                          ? "bg-[#FF3A56]/20 text-[#FF3A56]"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {log.side}
                    </span>
                    <span className="text-white font-bold">{log.amount}</span>
                  </div>
                  <span className="text-slate-500 text-[11px] block mt-0.5">{log.hash} • {log.time}</span>
                </div>

                <div className="text-right">
                  <span className="text-white font-bold block">{log.price}</span>
                  <span className="text-emerald-400 text-[11px] font-bold">
                    {log.slippage} Slippage
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
