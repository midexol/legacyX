"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Clock, CheckCircle2, RefreshCw, Download, Terminal, Code, Cpu, Key, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ClaimView() {
  const [lookupAddress, setLookupAddress] = useState<string>("0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20211");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<number>(3); // 1 = Address, 2 = Inactivity, 3 = Verified
  const [claimState, setClaimState] = useState<"ready" | "claiming" | "claimed">("ready");
  const [txHash, setTxHash] = useState<string>("");

  const mockClaimData = {
    vaultId: "#001-FXRP",
    totalFXRP: 25000,
    usdValue: 13750,
    allocationPercent: 50,
    blockHeight: 18924102,
    enclaveSig: "0x89a1f4b890a23b12ef89101039824c90e1f72621029e87d6a5c4e3b2a1",
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setVerificationStep(1);

    setTimeout(() => setVerificationStep(2), 800);
    setTimeout(() => setVerificationStep(3), 1600);
    setTimeout(() => {
      setIsScanning(false);
      setClaimState("ready");
    }, 2000);
  };

  const handleClaim = () => {
    setClaimState("claiming");
    setTimeout(() => {
      setClaimState("claimed");
      setTxHash("0x94f1c7d890a23b12ef89101039824c90e1f72621");
    }, 2200);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-16 bg-[#08090C] text-white min-h-screen">
      {/* SECTION 1: HEADER & ENCLAVE HERO VISUAL STAGE */}
      <div className="grid lg:grid-cols-12 gap-8 items-center border-b border-white/5 pb-12">
        {/* Left Stage: Scanner Intro */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold shadow-md">
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIDENTIAL ENCLAVE TERMINAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Beneficiary Claim Portal
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            Scan EVM wallet eligibility, verify Flare enclave cryptographic attestations, and execute zero-friction asset inheritance claims.
          </p>

          {/* Centralized Search Terminal Form */}
          <form onSubmit={handleScan} className="space-y-3 pt-2 max-w-xl">
            <label className="block text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
              Enter Beneficiary EVM Address
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lookupAddress}
                  onChange={(e) => setLookupAddress(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#121620] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#FF3A56] shadow-xl"
                  placeholder="0x..."
                  required
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="px-6 py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#e02a43] text-white font-bold text-xs shadow-lg shadow-[#FF3A56]/30 transition-all shrink-0 flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Enclave...</span>
                  </>
                ) : (
                  <span>Scan Enclave</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Stage: Floating 3D Enclave Loop Stage */}
        <div className="lg:col-span-5 relative">
          <div className={`relative bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[300px] transition-all ${
            isScanning ? "border-[#FF3A56]/60 shadow-[#FF3A56]/20" : ""
          }`}>
            <div className={`absolute w-56 h-56 bg-[#FF3A56]/20 blur-[80px] rounded-full pointer-events-none ${
              isScanning ? "animate-ping opacity-75" : ""
            }`} />

            <div className="relative z-10 w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1A2130] to-[#08090C] border border-[#FF3A56]/40 flex items-center justify-center shadow-xl shadow-[#FF3A56]/20 mb-4">
              <ShieldCheck className="w-12 h-12 text-[#FF3A56]" />
              <div className="absolute -inset-2 border border-[#FF3A56]/20 rounded-3xl animate-spin-slow pointer-events-none" />
            </div>

            <div className="relative z-10 text-center space-y-1 mt-2">
              <span className="font-mono text-xs text-white font-bold block">
                {isScanning ? "CRYPTOGRAPHIC SCAN RUNNING..." : "FLARE ENCLAVE SHIELD ACTIVE"}
              </span>
              <span className="font-mono text-[11px] text-slate-400 block">
                Block Height: #18924102
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VERIFICATION STEPPER */}
      <div className="p-8 rounded-2xl bg-[#121620] border border-white/10 shadow-2xl space-y-6">
        <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#FF3A56]" />
          <span>3-Step Cryptographic Attestation Verification</span>
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: "1. EVM Address Check",
              desc: "Beneficiary EVM key matched against smart vault allocation rules.",
              status: verificationStep >= 1 ? "VERIFIED" : "PENDING",
            },
            {
              step: 2,
              title: "2. Inactivity Timeout Proof",
              desc: "180-Day heartbeat countdown verified expired on-chain.",
              status: verificationStep >= 2 ? "VERIFIED" : "PENDING",
            },
            {
              step: 3,
              title: "3. Enclave Signature Proof",
              desc: "Flare enclave attestation signature validated zero-knowledge.",
              status: verificationStep >= 3 ? "VERIFIED" : "PENDING",
            },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-5 rounded-xl border font-mono text-xs space-y-2 transition-all ${
                s.status === "VERIFIED"
                  ? "bg-[#08090C] border-emerald-500/40 text-slate-200 shadow-md"
                  : "bg-[#08090C]/50 border-white/5 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{s.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  s.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
                }`}>
                  {s.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: UNLOCKED ASSET CLAIM CARD */}
      <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#121620] via-[#171E2D] to-[#121620] border border-[#FF3A56]/40 shadow-2xl shadow-[#FF3A56]/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-[#FF3A56] uppercase tracking-wider font-bold">
              UNLOCKED INHERITANCE RIGHTS
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              Vault {mockClaimData.vaultId} Unlocked Balance
            </h3>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" /> READY FOR IMMEDIATE CLAIM
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <div className="p-6 rounded-xl bg-[#08090C] border border-white/5 space-y-2 font-mono">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">
              Claimable Allocation ({mockClaimData.allocationPercent}%)
            </span>
            <div className="text-3xl font-extrabold text-white">
              {mockClaimData.totalFXRP.toLocaleString()}{" "}
              <span className="text-[#FF3A56]">FXRP</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold block">
              ≈ ${mockClaimData.usdValue.toLocaleString()} USD
            </span>
          </div>

          <div className="space-y-3">
            {claimState === "claimed" ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs space-y-2">
                <div className="font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>25,000 FXRP Transferred to Wallet</span>
                </div>
                <p className="text-[11px] text-slate-300 break-all">
                  Tx Hash: {txHash}
                </p>
              </div>
            ) : (
              <button
                onClick={handleClaim}
                disabled={claimState === "claiming"}
                className="w-full py-4 rounded-xl bg-[#FF3A56] hover:bg-[#e02a43] text-white font-extrabold text-base shadow-xl shadow-[#FF3A56]/30 transition-all flex items-center justify-center gap-2"
              >
                {claimState === "claiming" ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Executing On-Chain Claim...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Execute On-Chain Claim (25,000 FXRP)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
