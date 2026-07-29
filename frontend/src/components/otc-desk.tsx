"use client";

import React, { useState } from "react";
import { Lock, EyeOff, Shield, RefreshCcw, CheckCircle, ArrowRightLeft, Cpu, FileKey, Zap, Activity, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function OtcDesk() {
  const [orderType, setOrderType] = useState<"Sell" | "Buy">("Sell");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("0.55");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchingStage, setMatchingStage] = useState<"idle" | "shielding" | "pairing" | "settled">("idle");
  const [activeTab, setActiveTab] = useState<"create" | "engine" | "settlement">("create");
  
  const [orders, setOrders] = useState([
    {
      id: "OTC-9014",
      type: "Sell",
      amount: "15,000 FXRP",
      price: "$0.5500 / FXRP",
      status: "Matched (Off-Chain)",
      hash: "0x89f...21a4",
      timestamp: "10 mins ago",
    },
    {
      id: "OTC-9015",
      type: "Buy",
      amount: "8,500 FXRP",
      price: "$0.5480 / FXRP",
      status: "Settling On-Chain",
      hash: "0x12c...99b2",
      timestamp: "32 mins ago",
    },
    {
      id: "OTC-9016",
      type: "Sell",
      amount: "25,000 FXRP",
      price: "$0.5520 / FXRP",
      status: "Verified (Flare)",
      hash: "0x77a...44f9",
      timestamp: "1 hour ago",
    },
  ]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    setMatchingStage("shielding");

    setTimeout(() => {
      setMatchingStage("pairing");
    }, 1000);

    setTimeout(() => {
      setMatchingStage("settled");
      const newOrder = {
        id: `OTC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: orderType,
        amount: `${parseFloat(amount).toLocaleString()} FXRP`,
        price: `$${price} / FXRP`,
        status: "Matched (Off-Chain)",
        hash: `0x${Math.random().toString(16).substring(2, 5)}...${Math.random().toString(16).substring(2, 6)}`,
        timestamp: "Just now",
      };
      setOrders([newOrder, ...orders]);
      setIsSubmitting(false);
      setAmount("");
    }, 2200);
  };

  return (
    <div className="space-y-8 bg-[#08090C] text-white min-h-screen pb-20">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#08090C] border border-white/10 text-[#FF3A56] text-xs font-mono font-bold">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Confidential OTC Liquidation Engine</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Private Inherited Asset Marketplace
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Beneficiaries can liquidate inherited FXRP directly without exposing order sizes, public wallet addresses, or price slippage to public exchange order books.
          </p>
        </div>
      </div>

      {/* View Mode Navigation Tabs */}
      <div className="flex border-b border-white/5 pb-3 gap-4">
        {[
          { id: "create", label: "Place Private Order", icon: FileKey },
          { id: "engine", label: "Off-Chain Orderbook Engine", icon: Cpu },
          { id: "settlement", label: "On-Chain Settlements Log", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Areas */}
      {activeTab === "create" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Order Placement Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-xl space-y-6">
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
                  Sell FXRP
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
                  Buy Liquidity
                </button>
              </div>
            </div>

            {/* Interactive Matching Simulation Animation Banner */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-[#08090C] border border-white/10 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#FF3A56]" />
                    {matchingStage === "shielding" && "Stage 1: Encrypting Order Shards..."}
                    {matchingStage === "pairing" && "Stage 2: Pairing Off-Chain Buyers..."}
                    {matchingStage === "settled" && "Stage 3: Verified on Flare!"}
                  </span>
                  <span className="text-[#FF3A56] font-bold">Matching...</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FF3A56]"
                    animate={{
                      width:
                        matchingStage === "shielding"
                          ? "35%"
                          : matchingStage === "pairing"
                          ? "75%"
                          : "100%",
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Order Quantity (FXRP)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08090C] border border-white/10 text-white focus:outline-none focus:border-[#FF3A56] font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Target Price per FXRP (USD)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08090C] border border-white/10 text-white focus:outline-none focus:border-[#FF3A56] font-mono text-sm"
                  required
                />
              </div>

              <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Privacy Protocol:</span>
                  <span className="text-[#FF3A56] font-bold">zk-SNARK Sharded</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Slippage Protection:</span>
                  <span className="text-emerald-400 font-bold">0.00% (Guaranteed)</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5">
                  <span>Estimated Total Value:</span>
                  <span className="text-white font-bold">
                    ${((parseFloat(amount) || 0) * (parseFloat(price) || 0)).toLocaleString()} USD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#FF3A56] hover:bg-[#E02E47] text-white font-bold text-sm shadow-lg shadow-[#FF3A56]/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    <span>Executing Matching Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Submit Confidential {orderType} Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Orderbook Preview & Recent Settlements Log */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF3A56]" />
                  <span>Live Orderbook & Settlements Log</span>
                </h4>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  LIVE FEED
                </span>
              </div>

              {/* Orderbook Shard Preview Table */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Encrypted Off-Chain Orderbook
                </span>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="p-3.5 rounded-xl bg-[#08090C] border border-white/5 flex items-center justify-between font-mono text-xs hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.type === "Sell"
                              ? "bg-[#FF3A56]/20 text-[#FF3A56] border border-[#FF3A56]/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {o.type}
                        </span>
                        <div>
                          <span className="text-white font-bold block">{o.amount}</span>
                          <span className="text-slate-500 text-[11px]">{o.hash}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-300 font-bold block">{o.price}</span>
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> Zero Slippage
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Settlements Summary Widget */}
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                  <span>Network Execution</span>
                  <span className="text-white font-bold">Flare Coston2 Testnet</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                  <span>Average Match Latency</span>
                  <span className="text-emerald-400 font-bold">1.4 Seconds</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Settled Volume</span>
                  <span className="text-[#FF3A56] font-bold">4,210,000 FXRP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "engine" && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#FF3A56]" />
                <span>Off-Chain Confidential Order Book</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time shielded matching status for LegacyX OTC trades
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Engine Status: <strong className="text-emerald-400">ACTIVE</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase font-mono">
                  <th className="pb-3 px-2">Order ID</th>
                  <th className="pb-3 px-2">Side</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Target Price</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Commitment Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-2 font-mono font-bold text-white text-sm">
                      {o.id}
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          o.type === "Sell"
                            ? "bg-[#FF3A56]/15 text-[#FF3A56]"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {o.type}
                      </span>
                    </td>
                    <td className="py-4 px-2 font-mono text-sm text-white font-semibold">
                      {o.amount}
                    </td>
                    <td className="py-4 px-2 font-mono text-sm text-slate-300">
                      {o.price}
                    </td>
                    <td className="py-4 px-2 text-xs font-mono text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right font-mono text-xs text-slate-500">
                      {o.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "settlement" && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FF3A56]" />
                <span>On-Chain Settlement Verification</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Atomic swap proofs verified on Flare Coston2 Testnet
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#08090C] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">Tx #0x77f1...902</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                25,000 FXRP Trade
              </div>
              <div className="text-xs text-slate-500 font-mono flex justify-between">
                <span>Network: Flare Coston2</span>
                <span>Block #18,924,102</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#08090C] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">Tx #0x12a8...44b</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                12,500 FXRP Trade
              </div>
              <div className="text-xs text-slate-500 font-mono flex justify-between">
                <span>Network: Flare Coston2</span>
                <span>Block #18,923,890</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
