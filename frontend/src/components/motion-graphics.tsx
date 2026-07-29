"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Heart, Shield, Cpu } from "lucide-react";

/* 1. Motion Heartbeat Visualizer */
export function HeartbeatVisualizer() {
  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-[#FF3A56]/20"
      />
      <div className="relative z-10 p-2 rounded-full bg-[#FF3A56]/10 border border-[#FF3A56]/30 text-[#FF3A56]">
        <Heart className="w-4 h-4" />
      </div>
    </div>
  );
}

/* 2. Interactive SVG Circular Progress Ring */
export function ProgressRing({ percent = 75, size = 56, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FF3A56"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-xs font-bold text-white">
        {percent}%
      </span>
    </div>
  );
}

/* 3. Animated Radar Scanner Beam */
export function RadarScanner({ isScanning = false }) {
  return (
    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02]" />
      <div className="absolute inset-4 rounded-full border border-white/5" />

      {isScanning && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full origin-center"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(255, 58, 86, 0.3) 360deg)",
          }}
        />
      )}

      <div className="relative z-10 w-7 h-7 rounded-full bg-[#131722] border border-white/10 flex items-center justify-center text-[#FF3A56]">
        <Shield className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

/* 4. Animated Privacy Shield Visual */
export function PrivacyShieldVisual() {
  return (
    <div className="relative w-full h-40 rounded-xl bg-[#0B0E14] border border-white/10 flex items-center justify-center overflow-hidden">
      <div className="relative z-10 w-20 h-20 rounded-full border border-[#FF3A56]/30 flex items-center justify-center bg-[#131722] shadow-[0_0_20px_rgba(255,58,86,0.15)]">
        <Lock className="w-7 h-7 text-[#FF3A56]" />
      </div>

      <span className="absolute top-3 left-4 text-[10px] font-mono font-semibold text-[#FF3A56] px-2 py-0.5 rounded bg-[#FF3A56]/10 border border-[#FF3A56]/20">
        zk-SNARK Shield
      </span>
      <span className="absolute bottom-3 right-4 text-[10px] font-mono font-semibold text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
        Flare Enclave
      </span>
    </div>
  );
}

/* 5. Live Testnet Metrics Bar with Animated Pulsing Dots */
export function TestnetMetricsBar() {
  const metrics = [
    { label: "TOTAL PROTECTED VALUE", value: "$1.2M USD" },
    { label: "ACTIVE VAULTS", value: "142" },
    { label: "BLOCK TIME", value: "~1.2s" },
    { label: "ENCLAVE STATUS", value: "100% Operational" },
  ];

  return (
    <div className="w-full py-4 px-6 rounded-2xl bg-[#131722]/80 backdrop-blur-md border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-xl">
      {metrics.map((m) => (
        <div key={m.label} className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3A56] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3A56]" />
            </span>
            <span className="text-[10px] font-semibold font-mono text-slate-400 uppercase tracking-wider block">
              {m.label}
            </span>
          </div>
          <span className="text-sm font-extrabold text-white font-mono block pl-3.5">
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* 6. Architecture Bento Grid with Staggered Entrance & Glowing Gradient Hover Borders */
export function ProtocolFlowchart() {
  const steps = [
    {
      num: "01",
      title: "Asset Lock",
      subtitle: "Smart Vault Deposit",
      desc: "Lock FXRP into non-custodial EVM smart contracts on Flare Coston2.",
      icon: Lock,
    },
    {
      num: "02",
      title: "Heartbeat Guard",
      subtitle: "Automated Inactivity Monitor",
      desc: "Continuous countdown monitoring requiring owner heartbeat ping.",
      icon: Heart,
    },
    {
      num: "03",
      title: "Flare Verification",
      subtitle: "Attestation Enclave",
      desc: "Attestation proof validates vault release criteria on-chain.",
      icon: Cpu,
    },
    {
      num: "04",
      title: "Private OTC Payout",
      subtitle: "Confidential Liquidation",
      desc: "Beneficiary inherits assets or sells privately off-chain with zero slippage.",
      icon: Shield,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <span className="text-xs font-mono font-bold text-[#FF3A56] uppercase tracking-wider block">
          ARCHITECTURE PROTOCOL
        </span>
        <h3 className="text-2xl font-extrabold text-white">How LegacyX Executes On-Chain</h3>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-4 gap-4"
      >
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.num}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="p-5 rounded-2xl bg-[#131722]/80 backdrop-blur-md border border-white/10 hover:border-[#FF3A56]/50 hover:shadow-[0_0_25px_rgba(255,58,86,0.15)] transition-all duration-300 space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FF3A56]/10 border border-[#FF3A56]/20 text-[#FF3A56] font-mono text-xs font-bold">
                  {s.num}
                </span>
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#FF3A56] transition-colors" />
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">{s.title}</h4>
                <span className="bg-white/5 px-2 py-1 rounded text-slate-300 text-xs inline-block font-mono my-1.5 border border-white/5">
                  {s.subtitle}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
