"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Clock, CheckCircle2, RefreshCw, Wallet, Download, Terminal, ChevronRight, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RadarScanner } from "@/components/motion-graphics";

export default function ClaimPage() {
  const [lookupAddress, setLookupAddress] = useState("0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20211");
  const [isSearching, setIsSearching] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "ready" | "claiming" | "claimed">("ready");
  const [txHash, setTxHash] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);

  const mockVaultClaim = {
    vaultId: "vault-001",
    protocolStatus: "Heartbeat Expired • Condition Verified",
    totalVaultBalance: 50000,
    claimableAllocationPercent: 50,
    claimableFXRP: 25000,
    usdValue: 13750,
    enclaveSignature: "0x89a1f4b890a23b12ef89101039824c90e1f72621029e87d6a5c4e3b2a1",
    blockVerified: 18924102,
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setClaimStatus("ready");
    }, 1200);
  };

  const handleExecuteClaim = () => {
    setClaimStatus("claiming");
    setTimeout(() => {
      setClaimStatus("claimed");
      setTxHash("0x94f1c7d890a23b12ef89101039824c90e1f72621");
    }, 2000);
  };

  return (
    <div className="space-y-12 py-6 bg-[#08090C] min-h-screen text-white pb-24">
      {/* Header */}
      <div className="border-b border-white/5 pb-8 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CONFIDENTIAL ENCLAVE CLAIM TERMINAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Beneficiary Claim Portal
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Scan EVM wallet eligibility, verify Flare enclave cryptographic attestations, and execute zero-friction asset inheritance claims.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Wallet Lookup Column */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/5 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <span>Beneficiary Wallet Scan</span>
          </h3>

          <div className="py-2">
            <RadarScanner isScanning={isSearching} />
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                Enter Beneficiary EVM Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={lookupAddress}
                  onChange={(e) => setLookupAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-white/10 text-white focus:outline-none focus:border-white/30 font-mono text-xs"
                  placeholder="0x..."
                  required
                />
                <Wallet className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#E02E47] text-white font-bold text-sm shadow-md shadow-[#FF3A56]/25 transition-all flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Flare Enclaves...</span>
                </>
              ) : (
                <span>Scan Legacy Contracts</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block font-mono">
              Sample Beneficiary Address:
            </span>
            <button
              type="button"
              onClick={() => setLookupAddress("0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20211")}
              className="w-full text-left p-2.5 rounded-xl bg-[#0B0E14] border border-white/5 text-xs font-mono text-slate-300 hover:text-white truncate transition-colors"
            >
              0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20211
            </button>
          </div>
        </div>

        {/* Condition Attestation & Action Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-xl bg-[#121620] border border-white/5 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Vault #{mockVaultClaim.vaultId} Protocol Condition Status
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {mockVaultClaim.protocolStatus}
                </h3>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                UNLOCKED FOR CLAIM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 space-y-1">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Inactivity Condition
                </span>
                <span className="text-sm font-bold text-white font-mono block">
                  365 Days Expired
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ✓ Heartbeat timeout verified
                </span>
              </div>

              <div
                onClick={() => setShowLogModal(true)}
                className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 hover:border-white/20 cursor-pointer transition-colors space-y-1 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Flare Proof Verification
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-bold text-white font-mono block">
                  Enclave Attestation #18924
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Code className="w-3 h-3" /> View logs
                </span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0B0E14] border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs uppercase text-slate-400 font-mono">
                <span>Inheritance Rights</span>
                <span>Allocation Share: {mockVaultClaim.claimableAllocationPercent}%</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className="text-3xl font-extrabold font-mono text-white">
                  {mockVaultClaim.claimableFXRP.toLocaleString()}{" "}
                  <span className="text-[#FF3A56]">FXRP</span>
                </h2>
                <span className="text-sm text-slate-400 font-mono font-semibold">
                  ≈ ${mockVaultClaim.usdValue.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div>
              {claimStatus === "claimed" ? (
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-white space-y-2 font-mono">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#FF3A56]" />
                    <span>Assets Transferred</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tx Hash: <span className="underline">{txHash}</span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleExecuteClaim}
                  disabled={claimStatus === "claiming"}
                  className="w-full py-4 rounded-xl bg-[#FF3A56] hover:bg-[#E02E47] text-white font-extrabold text-base shadow-xl shadow-[#FF3A56]/25 transition-all flex items-center justify-center gap-2"
                >
                  {claimStatus === "claiming" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Executing On-Chain Claim...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Claim Inherited Assets (25,000 FXRP)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attestation Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[#121620] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#FF3A56]" />
                  <h3 className="text-lg font-bold text-white">Flare Enclave Proof Logs</h3>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-slate-400 hover:text-white font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0E14] border border-white/5 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto max-h-60">
                <div className="text-slate-400 font-bold">[FLARE_ATTESTATION_OK]</div>
                <div>Block: #{mockVaultClaim.blockVerified}</div>
                <div>Contract: 0x71C...89F2</div>
                <div>Enclave Signature:</div>
                <div className="text-[10px] text-slate-500 break-all bg-black/40 p-2 rounded">
                  {mockVaultClaim.enclaveSignature}
                </div>
                <div className="text-slate-300">State: Heartbeat Expired • Verified</div>
              </div>

              <button
                onClick={() => setShowLogModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
              >
                Close Attestation Inspector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
