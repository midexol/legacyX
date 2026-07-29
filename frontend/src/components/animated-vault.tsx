"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Key, Sparkles } from "lucide-react";

export function AnimatedVault() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasVideo, setHasVideo] = React.useState(false);

  useEffect(() => {
    // Check if video file exists & can play
    if (videoRef.current) {
      videoRef.current.play().then(() => setHasVideo(true)).catch(() => setHasVideo(false));
    }
  }, []);

  // HTML5 Canvas 3D Procedural Rotating Safe Vault & Floating FXRP Coins Fallback/Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. Outer Ambient Red Spotlight Glow
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        180
      );
      glowGradient.addColorStop(0, "rgba(255, 58, 86, 0.25)");
      glowGradient.addColorStop(0.5, "rgba(255, 58, 86, 0.08)");
      glowGradient.addColorStop(1, "rgba(11, 14, 20, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rotating Metallic Ring Gears
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * 0.4);

      // Outer Ring
      ctx.strokeStyle = "rgba(255, 58, 86, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Gear Teeth
      for (let i = 0; i < 12; i++) {
        const rad = (i * Math.PI) / 6;
        const x1 = Math.cos(rad) * 110;
        const y1 = Math.sin(rad) * 110;
        const x2 = Math.cos(rad) * 122;
        const y2 = Math.sin(rad) * 122;
        ctx.strokeStyle = "rgba(255, 58, 86, 0.6)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Counter-rotating Inner Crystal Gear
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 0.7);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Central Vault Hexagonal Core & Floating FXRP Coins
      ctx.save();
      ctx.translate(centerX, centerY);

      // Vault Core Shield Body
      const coreGrad = ctx.createLinearGradient(-60, -60, 60, 60);
      coreGrad.addColorStop(0, "#161B26");
      coreGrad.addColorStop(0.5, "#222938");
      coreGrad.addColorStop(1, "#0B0E14");

      ctx.fillStyle = coreGrad;
      ctx.strokeStyle = "#FF3A56";
      ctx.lineWidth = 2;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3 + angle * 0.2;
        const x = Math.cos(rad) * 65;
        const y = Math.sin(rad) * 65;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      // 5. Floating FXRP Coins Orbiting
      for (let i = 0; i < 4; i++) {
        const coinAngle = angle + (i * Math.PI) / 2;
        const coinX = centerX + Math.cos(coinAngle) * 140;
        const coinY = centerY + Math.sin(coinAngle) * 50;

        ctx.save();
        ctx.translate(coinX, coinY);
        ctx.fillStyle = "#FF3A56";
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("FXRP", 0, 0);
        ctx.restore();
      }

      angle += 0.015;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-lg aspect-square flex items-center justify-center"
    >
      {/* Background Red Ambient Spotlight */}
      <div className="absolute inset-0 bg-[#FF3A56]/20 blur-[100px] pointer-events-none rounded-full" />

      {/* Glass Card Container */}
      <div className="relative w-full h-full rounded-2xl bg-[#161B26]/90 border border-white/10 p-6 shadow-2xl flex flex-col items-center justify-between overflow-hidden group">
        {/* Top Status Header */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
              3D Vault Core • Flare Coston2
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF3A56]/20 text-[#FF3A56] border border-[#FF3A56]/30">
            ENCRYPTION ACTIVE
          </span>
        </div>

        {/* Video or Canvas 3D Animated Safe */}
        <div className="relative w-full h-64 flex items-center justify-center my-auto">
          {/* Looping HTML5 Video Element */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-500 ${
              hasVideo ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <source src="/assets/vault-loop.mp4" type="video/mp4" />
            <source src="/assets/vault-loop.webm" type="video/webm" />
          </video>

          {/* Interactive Procedural Canvas 3D Render (Active Fallback + Seamless Overlay) */}
          <canvas
            ref={canvasRef}
            width={400}
            height={320}
            className="w-full h-full object-contain"
          />

          {/* Center Lock Badge */}
          <div className="absolute z-20 w-16 h-16 rounded-2xl bg-[#0B0E14]/90 border border-[#FF3A56]/50 flex items-center justify-center shadow-lg shadow-[#FF3A56]/30">
            <Lock className="w-7 h-7 text-[#FF3A56]" />
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="w-full z-10 p-3.5 rounded-xl bg-[#0B0E14]/80 border border-white/10 flex items-center justify-between font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#10B981]" />
            <span>Smart Vault Protection</span>
          </div>
          <span className="text-[#FF3A56] font-bold">10,000 FXRP</span>
        </div>
      </div>
    </motion.div>
  );
}
