"use client";

import React, { useState } from "react";
import { VaultCard } from "@/components/vault-card";
import { BeneficiaryForm } from "@/components/beneficiary-form";
import { Shield, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState<"vaults" | "beneficiaries">("vaults");

  return (
    <div className="space-y-12 py-6 bg-[#08090C] text-white min-h-screen pb-24">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>NON-CUSTODIAL INHERITANCE VAULT MANAGER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Vault Manager & Allocations
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Monitor locked FXRP balances, ping heartbeat timers, deposit assets, and configure multi-beneficiary inheritance splits on Flare.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1.5 rounded-2xl bg-[#121620] border border-white/10 self-start md:self-auto shadow-lg">
          <button
            onClick={() => setActiveTab("vaults")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "vaults"
                ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>My Vaults & Assets</span>
          </button>
          <button
            onClick={() => setActiveTab("beneficiaries")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "beneficiaries"
                ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Beneficiary Allocations</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "vaults" ? <VaultCard /> : <BeneficiaryForm />}
      </motion.div>
    </div>
  );
}
