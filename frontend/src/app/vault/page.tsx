"use client";

import React, { useState } from "react";
import { VaultCard } from "@/components/vault-card";
import { BeneficiaryForm } from "@/components/beneficiary-form";
import { Shield, Lock, Users, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState<"vaults" | "beneficiaries">("vaults");

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF3A56]/10 text-[#FF3A56]">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Vault Manager
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor locked FXRP balances, deposit assets, and configure beneficiary inheritance splits
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-[#161B26] border border-slate-200 dark:border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("vaults")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
              activeTab === "vaults"
                ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>My Vaults & Assets</span>
          </button>
          <button
            onClick={() => setActiveTab("beneficiaries")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
              activeTab === "beneficiaries"
                ? "bg-[#FF3A56] text-white shadow-md shadow-[#FF3A56]/25"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "vaults" ? <VaultCard /> : <BeneficiaryForm />}
      </motion.div>
    </div>
  );
}
