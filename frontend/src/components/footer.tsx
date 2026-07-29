"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#08090C] py-10 mt-16 pl-4 md:pl-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="LegacyX Logo"
              width={32}
              height={32}
              priority
              className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,58,86,0.3)]"
            />
          </div>
          <span className="font-bold text-base tracking-tight text-white uppercase">
            Legacy<span className="text-[#FF3A56]">X</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            © 2026 • Flare Coston2 Testnet
          </span>
        </Link>

        {/* Footer Navigation Links */}
        <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="/vault" className="hover:text-white transition-colors">
            Vault Manager
          </Link>
          <Link href="/claim" className="hover:text-white transition-colors">
            Beneficiary Claim
          </Link>
          <Link href="/otc" className="hover:text-[#FF3A56] transition-colors">
            Private OTC Desk
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors">
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}
