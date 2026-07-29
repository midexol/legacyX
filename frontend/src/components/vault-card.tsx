"use client";

import React, { useState } from "react";
import { Lock, Users, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, ChevronDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartbeatVisualizer, ProgressRing } from "./motion-graphics";

export interface VaultData {
  id: string;
  name: string;
  balance: number;
  currency: string;
  usdValue: number;
  inactivityDays: number;
  daysRemaining: number;
  lastHeartbeat: string;
  status: "Active" | "Pending Verification" | "Unlocked";
  beneficiariesCount: number;
}

const initialVaults: VaultData[] = [
  {
    id: "vault-001",
    name: "Primary Family Heritage Vault",
    balance: 50000,
    currency: "FXRP",
    usdValue: 27500,
    inactivityDays: 365,
    daysRemaining: 345,
    lastHeartbeat: "2 hours ago",
    status: "Active",
    beneficiariesCount: 3,
  },
  {
    id: "vault-002",
    name: "Secondary OTC Collateral Vault",
    balance: 18500,
    currency: "FXRP",
    usdValue: 10175,
    inactivityDays: 180,
    daysRemaining: 162,
    lastHeartbeat: "1 day ago",
    status: "Active",
    beneficiariesCount: 1,
  },
];

export function VaultCard() {
  const [vaults, setVaults] = useState<VaultData[]>(initialVaults);
  const [activeModal, setActiveModal] = useState<"deposit" | "withdraw" | null>(null);
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null);
  const [expandedVaultId, setExpandedVaultId] = useState<string | null>("vault-001");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const totalFXRP = vaults.reduce((acc, v) => acc + v.balance, 0);
  const totalUSD = vaults.reduce((acc, v) => acc + v.usdValue, 0);

  const openActionModal = (vault: VaultData, type: "deposit" | "withdraw") => {
    setSelectedVault(vault);
    setActiveModal(type);
    setAmount("");
    setSuccessMessage("");
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault || !amount) return;

    setIsProcessing(true);
    setTimeout(() => {
      const added = parseFloat(amount);
      setVaults((prev) =>
        prev.map((v) =>
          v.id === selectedVault.id
            ? {
                ...v,
                balance: v.balance + added,
                usdValue: (v.balance + added) * 0.55,
              }
            : v
        )
      );
      setIsProcessing(false);
      setSuccessMessage(`Deposited ${amount} FXRP into ${selectedVault.name}!`);
      setTimeout(() => setActiveModal(null), 1500);
    }, 1000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault || !amount) return;

    setIsProcessing(true);
    setTimeout(() => {
      const subbed = parseFloat(amount);
      setVaults((prev) =>
        prev.map((v) =>
          v.id === selectedVault.id
            ? {
                ...v,
                balance: Math.max(0, v.balance - subbed),
                usdValue: Math.max(0, v.balance - subbed) * 0.55,
              }
            : v
        )
      );
      setIsProcessing(false);
      setSuccessMessage(`Withdrawn ${amount} FXRP from ${selectedVault.name}!`);
      setTimeout(() => setActiveModal(null), 1500);
    }, 1000);
  };

  const handlePingHeartbeat = (vaultId: string) => {
    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId
          ? { ...v, lastHeartbeat: "Just now", daysRemaining: v.inactivityDays }
          : v
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-xl bg-[#121620] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">
              TOTAL FXRP LOCKED
            </span>
            <h3 className="text-2xl font-extrabold font-mono text-white mt-2">
              {totalFXRP.toLocaleString()} <span className="text-[#FF3A56] text-sm">FXRP</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono mt-1 block">
              ≈ ${totalUSD.toLocaleString()} USD
            </span>
          </div>
          <ProgressRing percent={85} />
        </div>

        <div className="p-6 rounded-xl bg-[#121620] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">
              ON-CHAIN HEARTBEAT
            </span>
            <h3 className="text-xl font-bold text-white mt-2">
              Active Protection
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              Live Monitoring
            </span>
          </div>
          <HeartbeatVisualizer />
        </div>

        <div className="p-6 rounded-xl bg-[#121620] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wider block">
              ASSIGNED BENEFICIARIES
            </span>
            <h3 className="text-2xl font-bold text-white mt-2 font-mono">
              4 Accounts
            </h3>
            <span className="text-xs text-slate-500 font-mono mt-1 block">
              100% Split Allocation
            </span>
          </div>
          <Users className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* "My Vaults" Table Section */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF3A56]" />
              <span>My Legacy Vaults</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage locked FXRP balances, ping live heartbeats, and inspect time-decay curves
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {vaults.length} Active Vaults
          </span>
        </div>

        {/* Vault List */}
        <div className="space-y-4">
          {vaults.map((vault) => {
            const isExpanded = expandedVaultId === vault.id;
            const percentageRemaining = Math.round(
              (vault.daysRemaining / vault.inactivityDays) * 100
            );

            return (
              <div
                key={vault.id}
                className="rounded-xl bg-[#0B0E14] border border-white/5 overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{vault.name}</h4>
                      <span className="text-xs text-slate-500 font-mono">
                        {vault.id} • {vault.inactivityDays}d Window
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">
                        STATUS
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                        {vault.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">
                        BALANCE
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        {vault.balance.toLocaleString()} FXRP
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openActionModal(vault, "deposit")}
                        className="px-3 py-1.5 rounded-lg bg-[#FF3A56] hover:bg-[#E02E47] text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Deposit
                      </button>
                      <button
                        onClick={() => openActionModal(vault, "withdraw")}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Withdraw
                      </button>

                      <button
                        onClick={() =>
                          setExpandedVaultId(isExpanded ? null : vault.id)
                        }
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5 p-4 bg-[#121620] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-300 font-mono">
                          <Activity className="w-4 h-4 text-slate-400" />
                          <span>
                            Countdown:{" "}
                            <strong className="text-white">
                              {vault.daysRemaining} days remaining
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-mono">
                            Last Ping: {vault.lastHeartbeat}
                          </span>
                          <button
                            onClick={() => handlePingHeartbeat(vault.id)}
                            className="px-3 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 hover:bg-white/20 text-xs font-mono transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Ping Heartbeat</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden flex border border-white/5">
                          <div
                            style={{ width: `${percentageRemaining}%` }}
                            className="h-full bg-slate-300 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && selectedVault && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#121620] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">
                    {activeModal} FXRP Assets
                  </h3>
                  <p className="text-xs text-slate-400">{selectedVault.name}</p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-white text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              {successMessage ? (
                <div className="p-4 rounded-xl bg-white/10 text-white text-sm font-mono flex items-center gap-2 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-[#FF3A56]" />
                  <span>{successMessage}</span>
                </div>
              ) : (
                <form
                  onSubmit={
                    activeModal === "deposit" ? handleDepositSubmit : handleWithdrawSubmit
                  }
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Amount (FXRP)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 5000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/10 text-white focus:outline-none focus:border-white/30 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAmount(
                            activeModal === "withdraw"
                              ? selectedVault.balance.toString()
                              : "10000"
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FF3A56] hover:underline"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B0E14] text-xs text-slate-400 flex items-center justify-between font-mono border border-white/5">
                    <span>Available Balance:</span>
                    <span className="font-bold text-white">
                      {selectedVault.balance.toLocaleString()} FXRP
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#E02E47] text-white font-bold text-sm shadow-md shadow-[#FF3A56]/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Contract...</span>
                      </>
                    ) : (
                      <span>
                        Confirm {activeModal === "deposit" ? "Deposit" : "Withdrawal"}
                      </span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
