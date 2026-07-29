"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lock, ShieldCheck, ArrowLeftRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = [
    { name: "Landing Page", href: "/", icon: Home, tooltip: "Return to Landing Page" },
    { name: "Vault Manager", href: "/vault", icon: Lock, tooltip: "Vault Manager & Assets" },
    { name: "Beneficiary Claim", href: "/claim", icon: ShieldCheck, tooltip: "Beneficiary Claim Portal" },
    { name: "Private OTC Desk", href: "/otc", icon: ArrowLeftRight, tooltip: "Private OTC Desk" },
    { name: "Documentation", href: "/docs", icon: BookOpen, tooltip: "Protocol Documentation" },
  ];

  return (
    <aside className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2 p-1.5 bg-[#121620]/90 backdrop-blur-md border border-white/10 rounded-xl shadow-lg">
      <div className="flex flex-col gap-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/overview");

          return (
            <div
              key={item.href}
              className="relative flex items-center"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link
                href={item.href}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-[#FF3A56] text-white shadow-[0_0_12px_rgba(255,58,86,0.5)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </Link>

              {/* Sleek Hover Tooltip */}
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, x: -6, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -6, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-11 whitespace-nowrap px-3 py-1 rounded-lg bg-[#08090C] border border-white/10 text-white font-mono text-[11px] shadow-2xl pointer-events-none z-50 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3A56]" />
                    <span>{item.tooltip}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
