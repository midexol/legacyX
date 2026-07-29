"use client";

import React, { useState, useEffect } from "react";
import { Shield, Lock, Activity, Cpu, RefreshCw, CheckCircle2, ChevronRight, Play, Eye, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const steps = [
    {
      id: 1,
      title: "Non-Custodial Asset Lock",
      subtitle: "Deposit FXRP into immutable EVM smart vaults on Flare Coston2.",
      desc: "Vault assets are locked into smart contracts deployed directly on Flare Coston2 testnet. You retain 100% non-custodial ownership with emergency retrieval rights.",
      icon: Lock,
      badge: "ON-CHAIN VAULT",
      metric: "100% Non-Custodial",
      visualGraphic: "asset_lock",
    },
    {
      id: 2,
      title: "Automated Heartbeat Guard",
      subtitle: "Set custom inactivity timeouts requiring periodic cryptographic pings.",
      desc: "Configure an inactivity countdown timer (e.g., 90 or 360 days). Sending periodic cryptographic pings resets the timer, proving active wallet control.",
      icon: Activity,
      badge: "TIMED HEARTBEAT",
      metric: "Countdown Active",
      visualGraphic: "heartbeat_ping",
    },
    {
      id: 3,
      title: "Flare Enclave Attestation",
      subtitle: "Condition triggers validate release criteria on-chain without revealing private keys.",
      desc: "When a heartbeat expires, Flare State Connector and confidential enclave proofs validate condition criteria on-chain without exposing private key data or estate contents.",
      icon: Cpu,
      badge: "CONFIDENTIAL SHIELD",
      metric: "Enclave Validated",
      visualGraphic: "enclave_attestation",
    },
    {
      id: 4,
      title: "Confidential Liquidation",
      subtitle: "Beneficiaries claim assets directly or execute off-chain OTC swaps with zero slippage.",
      desc: "Beneficiaries claim allocated FXRP shares directly or convert inherited balances via private off-chain OTC order matching with zero market slippage.",
      icon: ShieldCheck,
      badge: "ZERO SLIPPAGE OTC",
      metric: "Settled Off-Chain",
      visualGraphic: "confidential_liquidation",
    },
  ];

  // Auto-advance step every 5 seconds unless user manually selects a step
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <section className="relative py-24 bg-[#08090C] text-white overflow-hidden">
      {/* Background Subtle Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF3A56]/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121620] border border-[#FF3A56]/30 text-[#FF3A56] text-xs font-mono font-bold shadow-md">
            <Zap className="w-3.5 h-3.5" />
            <span>FLARE COSTON2 ENCLAVE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            How LegacyX Privacy Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Automated condition-based inheritance vaults powered by Flare Coston2 enclaves & confidential OTC settlement.
          </p>
        </div>

        {/* 2-Column Interactive Walkthrough Grid */}
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* LEFT COLUMN: Interactive Step Breakdown */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <motion.div
                  key={step.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`cursor-pointer p-6 rounded-2xl transition-all duration-300 border ${
                    isActive
                      ? "bg-[#121620] border-[#FF3A56]/60 shadow-2xl shadow-[#FF3A56]/10"
                      : "bg-[#08090C]/80 hover:bg-[#121620]/60 border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon Indicator */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                        isActive
                          ? "bg-[#FF3A56] text-white shadow-lg shadow-[#FF3A56]/30"
                          : "bg-[#121620] border border-white/10 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#FF3A56] uppercase tracking-wider font-bold">
                          Step 0{step.id}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF3A56]/10 text-[#FF3A56] border border-[#FF3A56]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56] animate-ping" />
                            ACTIVE STAGE
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {step.subtitle}
                      </p>

                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-slate-400 pt-2 border-t border-white/5 leading-relaxed"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Dedicated Explainer Visual Stage */}
          <div className="lg:col-span-6 relative">
            <div className="relative bg-[#121620] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
              {/* Top Bar Status Indicator */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#FF3A56] animate-pulse" />
                  <span className="font-mono text-xs text-slate-300 uppercase tracking-wider font-semibold">
                    Flare Enclave Stage • Step 0{currentStep.id}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#08090C] border border-white/10 text-xs font-mono text-[#FF3A56] font-bold">
                  {currentStep.badge}
                </span>
              </div>

              {/* Center Animated Enclave Graphic Stage */}
              <div className="my-8 relative z-10 flex flex-col items-center justify-center min-h-[220px]">
                {/* Fallback Looping Video element if available, alongside interactive SVG canvas graphics */}
                <div className="relative w-full flex flex-col items-center justify-center py-6">
                  {/* Background Shield Pulse */}
                  <div className="absolute w-48 h-48 bg-[#FF3A56]/20 blur-[50px] rounded-full animate-pulse" />

                  {/* Video loop with canvas overlay */}
                  <video
                    src="/assets/how-it-works-loop.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-44 h-44 object-contain relative z-10 opacity-80 mix-blend-screen hidden group-hover:block"
                    onError={(e) => {
                      // Silently hide video element if asset file is missing in static directory
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  {/* Interactive SVG Enclave Shield Stage matching active step */}
                  <div className="relative z-10 flex flex-col items-center space-y-4">
                    <motion.div
                      key={currentStep.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1A2130] to-[#08090C] border border-[#FF3A56]/40 flex items-center justify-center shadow-xl shadow-[#FF3A56]/20 relative"
                    >
                      <StepIcon className="w-10 h-10 text-[#FF3A56]" />

                      {/* Rotating Ring Accent */}
                      <div className="absolute -inset-2 border border-[#FF3A56]/20 rounded-3xl animate-spin-slow pointer-events-none" />
                    </motion.div>

                    <div className="text-center space-y-1">
                      <span className="font-mono text-xs text-white font-bold block">
                        {currentStep.metric}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Encrypted Attestation #00892
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Visual Stage Telemetry Console */}
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/5 font-mono text-xs text-slate-300 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#FF3A56]" />
                  <span>Enclave State: <strong className="text-white">ACTIVE</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>FTSO Feed Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
