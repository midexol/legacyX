"use client";

import React from "react";
import { OtcDesk } from "@/components/otc-desk";
import { DollarSign, ShieldCheck } from "lucide-react";

export default function OtcPage() {
  return (
    <div className="space-y-12 py-6 bg-[#08090C] min-h-screen text-white pb-24">
      {/* Header */}
      <div className="border-b border-white/5 pb-8 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold">
          <DollarSign className="w-3.5 h-3.5" />
          <span>ZERO-SLIPPAGE CONFIDENTIAL DESK</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Private OTC Liquidation Desk
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Privately swap inherited FXRP balances off-chain without impacting public order books or triggering price slippage.
        </p>
      </div>

      <OtcDesk />
    </div>
  );
}
