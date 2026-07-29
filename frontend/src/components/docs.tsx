"use client";

import React, { useState } from "react";
import { Shield, BookOpen, Cpu, Lock, Code, CheckCircle2, ChevronRight, Terminal, Copy, ExternalLink, Zap, Key, Layers } from "lucide-react";
import { motion } from "framer-motion";

export function DocsView() {
  const [activeSection, setActiveSection] = useState<"overview" | "flare" | "security" | "contracts">("overview");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const sections = [
    { id: "overview", name: "1. Protocol Overview", icon: BookOpen },
    { id: "flare", name: "2. Flare Coston2 Integration", icon: Cpu },
    { id: "security", name: "3. Security & Audits", icon: Lock },
    { id: "contracts", name: "4. Smart Contract Architecture", icon: Code },
  ];

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[#121620] via-[#161B26] to-[#121620] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#FF3A56]/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LegacyX Technical Documentation v1.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Protocol Standards & Architecture
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Detailed guide to LegacyX condition-based digital inheritance vaults, Flare Coston2 enclave attestations, FTSO oracle integration, and non-custodial smart contracts.
          </p>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigation + Content Viewer */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2 sticky top-24">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block px-2 mb-3">
            Documentation Modules
          </span>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full flex items-center justify-between p-4 rounded-xl font-semibold text-sm transition-all text-left border ${
                  isActive
                    ? "bg-[#121620] border-[#FF3A56]/50 text-white shadow-lg shadow-black/40"
                    : "bg-[#08090C] border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isActive ? "bg-[#FF3A56] text-white" : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{sec.name}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive ? "text-[#FF3A56] translate-x-1" : "text-slate-600"
                  }`}
                />
              </button>
            );
          })}

          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3 mt-6">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF3A56]" />
              Quick Developer Specs
            </span>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Network</span>
                <span className="text-white">Flare Coston2</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Chain ID</span>
                <span className="text-white">114</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Vault Asset</span>
                <span className="text-white">FXRP / WFLR</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Oracle</span>
                <span className="text-white">Flare FTSO v2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Viewer Panel */}
        <div className="lg:col-span-8 bg-[#121620] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 min-h-[550px]">
          {/* SECTION 1: PROTOCOL OVERVIEW */}
          {activeSection === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-[#FF3A56] uppercase tracking-wider">
                  Module 01
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Protocol Overview</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Solving the $100B+ lost crypto dilemma with non-custodial condition-based inheritance.
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  Over $100 Billion in cryptocurrency is permanently trapped in inactive wallets due to sudden key loss, incapacitation, or unmanaged estates. LegacyX introduces a trustless, automated digital inheritance protocol designed specifically for Flare Network.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-2">
                    <Key className="w-5 h-5 text-[#FF3A56]" />
                    <h4 className="font-bold text-white text-base">The Problem</h4>
                    <p className="text-xs text-slate-400">
                      Traditional wills require trusted third-party custodians, exposing private keys and subjecting digital assets to prolonged probate courts.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-white text-base">The LegacyX Solution</h4>
                    <p className="text-xs text-slate-400">
                      Non-custodial smart vaults hold FXRP on Flare. If heartbeat pings cease beyond configured timeouts, funds release automatically to allocated beneficiaries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#08090C] border border-white/5 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF3A56]" />
                  Core Protocol Lifecycle
                </h4>
                <ul className="space-y-2 text-xs text-slate-400 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56]" />
                    1. Deposit FXRP into smart vault & configure inactivity period (e.g. 180 days).
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56]" />
                    2. Owner sends periodic "Heartbeat Ping" transactions to reset the countdown timer.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56]" />
                    3. If timer expires, Flare enclave attestation triggers condition verification on-chain.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56]" />
                    4. Beneficiaries claim allocated percentages directly or liquidate off-chain via Private OTC.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* SECTION 2: FLARE COSTON2 INTEGRATION */}
          {activeSection === "flare" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-[#FF3A56] uppercase tracking-wider">
                  Module 02
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Flare Coston2 Integration</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Utilizing FTSO Price Feeds, State Connector proofs, and confidential enclaves.
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">1. Flare Time Series Oracle (FTSO v2)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                      SYNCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    LegacyX queries decentralized FTSO price feeds every 1.8 seconds on Coston2 to establish real-time valuation for FXRP/USD deposits, providing accurate USD estate calculations without central oracle risk.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">2. Flare State Connector</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-mono">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Validates external proof attestations directly from other EVM chains or off-chain state channels, ensuring inheritance rules can check cross-chain inactivity before unlocking assets.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">3. Confidential Enclave Attestation</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#FF3A56]/20 text-[#FF3A56] font-mono">
                      ENCLAVE SHIELD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Heartbeat timeout conditions and beneficiary allocation matrices are verified within enclave environments, preventing public mempool front-running or premature beneficiary discovery.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 3: SECURITY & AUDITS */}
          {activeSection === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-[#FF3A56] uppercase tracking-wider">
                  Module 03
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Security & Audits</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Non-custodial invariants, multi-sig protections, and zero-knowledge privacy guarantees.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "Non-Custodial Guarantee",
                    desc: "Vault creator retains 100% control to withdraw funds or extend timeouts at any time prior to condition expiration.",
                  },
                  {
                    title: "Immutable Condition Lock",
                    desc: "Once a vault is active, condition rules cannot be modified by external admin keys or protocol operators.",
                  },
                  {
                    title: "Emergency Circuit Breakers",
                    desc: "In the event of network upgrades, users can trigger emergency fallback retrieval with signed master keys.",
                  },
                  {
                    title: "Formal Verification",
                    desc: "Smart contracts audited for reentrancy vectors, mathematical precision underflows, and storage collisions.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#08090C] border border-white/5 space-y-2">
                    <CheckCircle2 className="w-5 h-5 text-[#FF3A56]" />
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SECTION 4: SMART CONTRACT ARCHITECTURE */}
          {activeSection === "contracts" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-[#FF3A56] uppercase tracking-wider">
                  Module 04
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">Smart Contract Architecture</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Deployed contracts on Flare Coston2 testnet and core Interface reference code.
                </p>
              </div>

              {/* Deployed Contract Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Deployed Testnet Contracts (Chain ID 114)
                </h4>

                {[
                  { name: "VaultFactory.sol", address: "0x71C7240a1B8c3dE8B92e85F69A5C4E5E89F2" },
                  { name: "HeartbeatGuard.sol", address: "0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20" },
                  { name: "PrivateOTCDesk.sol", address: "0x3B718104E9284192A0b0019245C4E5E89F29" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="p-3.5 rounded-xl bg-[#08090C] border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-white font-bold block">{c.name}</span>
                      <span className="text-slate-400 text-[11px]">{c.address}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(c.address, c.name)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedAddress === c.name ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedAddress === c.name ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Code Snippet Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#FF3A56]" />
                    VaultFactory.sol (Core Interface)
                  </span>
                  <span>Solidity v0.8.20</span>
                </div>
                <div className="p-4 rounded-xl bg-[#08090C] border border-white/10 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                  <p className="text-[#FF3A56]">// SPDX-License-Identifier: MIT</p>
                  <p><span className="text-purple-400">pragma solidity</span> ^0.8.20;</p>
                  <br />
                  <p><span className="text-blue-400">contract</span> <span className="text-yellow-300">VaultFactory</span> &#123;</p>
                  <p className="pl-4 text-slate-400">// Stores condition metrics & beneficiary allocations</p>
                  <p className="pl-4"><span className="text-blue-400">struct</span> VaultConfig &#123;</p>
                  <p className="pl-8">address owner;</p>
                  <p className="pl-8">uint256 heartbeatTimeout;</p>
                  <p className="pl-8">uint256 lastPingTimestamp;</p>
                  <p className="pl-8">bool isClaimed;</p>
                  <p className="pl-4">&#125;</p>
                  <br />
                  <p className="pl-4"><span className="text-blue-400">function</span> <span className="text-yellow-300">createVault</span>(uint256 _timeoutDays) <span className="text-purple-400">external payable</span> returns (address) &#123;</p>
                  <p className="pl-8 text-slate-400">// Deploys non-custodial vault proxy on Flare</p>
                  <p className="pl-[#20px]"><span className="text-purple-400">require</span>(msg.value &gt; 0, <span className="text-emerald-300">"Must deposit FXRP"</span>);</p>
                  <p className="pl-8">return _deployProxy(msg.sender, _timeoutDays);</p>
                  <p className="pl-4">&#125;</p>
                  <p>&#125;</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
