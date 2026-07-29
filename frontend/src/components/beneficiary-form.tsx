"use client";

import React, { useState } from "react";
import { Users, UserPlus, Trash2, ShieldCheck, AlertCircle, Percent, Wallet, Info } from "lucide-react";
import { motion } from "framer-motion";

export interface Beneficiary {
  id: string;
  name: string;
  address: string;
  allocation: number;
}

const initialBeneficiaries: Beneficiary[] = [
  {
    id: "b-1",
    name: "Sarah Jenkins (Spouse)",
    address: "0x8F92a019B8c3dE8B92e85F69A5C4E5E89F20211",
    allocation: 50,
  },
  {
    id: "b-2",
    name: "Alex Jenkins (Son)",
    address: "0x3B718104E9284192A0b0019245C4E5E89F2900A",
    allocation: 30,
  },
  {
    id: "b-3",
    name: "Elena Jenkins (Daughter)",
    address: "0x91F562019A82dE8B92e85F69A5C4E5E89F277B1",
    allocation: 20,
  },
];

export function BeneficiaryForm() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [allocation, setAllocation] = useState<number>(10);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const totalAllocation = beneficiaries.reduce((acc, b) => acc + b.allocation, 0);

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !address) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (!address.startsWith("0x") || address.length < 10) {
      setErrorMsg("Please enter a valid Flare EVM wallet address.");
      return;
    }

    if (totalAllocation + allocation > 100) {
      setErrorMsg(`Adding ${allocation}% exceeds the 100% total limit! (Current total: ${totalAllocation}%)`);
      return;
    }

    const newB: Beneficiary = {
      id: `b-${Date.now()}`,
      name,
      address,
      allocation,
    };

    setBeneficiaries([...beneficiaries, newB]);
    setName("");
    setAddress("");
    setAllocation(10);
    setSuccessMsg(`Beneficiary "${name}" successfully assigned!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: string) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Add Beneficiary Form Column */}
      <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#FF3A56]/10 text-[#FF3A56]">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Add Beneficiary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure inheritance rights & wallet allocation splits
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 text-xs font-semibold flex items-center gap-2 border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-[#10B981]/10 text-[#10B981] text-xs font-semibold flex items-center gap-2 border border-[#10B981]/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddBeneficiary} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Beneficiary Name / Alias
            </label>
            <input
              type="text"
              placeholder="e.g. Spouse / Child / Trust"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF3A56] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Flare Wallet Address
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF3A56] text-sm font-mono"
                required
              />
              <Wallet className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Allocation Split Percentage
              </label>
              <span className="text-xs font-mono font-bold text-[#FF3A56]">
                {allocation}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={allocation}
              onChange={(e) => setAllocation(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-[#0B0E14] rounded-lg appearance-none cursor-pointer accent-[#FF3A56]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>5%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#FF3A56] hover:bg-[#E02E47] text-white font-bold text-sm shadow-md shadow-[#FF3A56]/25 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Beneficiary Rule</span>
          </button>
        </form>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0E14] border border-slate-200/60 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-[#FF3A56] shrink-0 mt-0.5" />
          <span>
            Beneficiaries will automatically inherit their allocated share on Flare when vault conditions trigger.
          </span>
        </div>
      </div>

      {/* Active Beneficiaries List & Allocation Bar Column */}
      <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161B26] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF3A56]" />
              <span>Configured Beneficiaries</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vault Asset Distribution Matrix
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Total Allocated:</span>
            <span
              className={`font-bold px-2.5 py-1 rounded-full ${
                totalAllocation === 100
                  ? "bg-[#10B981]/15 text-[#10B981]"
                  : "bg-amber-500/15 text-amber-500"
              }`}
            >
              {totalAllocation}% / 100%
            </span>
          </div>
        </div>

        {/* Allocation Visual Split Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 dark:bg-[#0B0E14] rounded-full overflow-hidden flex border border-slate-200/60 dark:border-white/5">
            {beneficiaries.map((b, idx) => {
              const colors = [
                "bg-[#FF3A56]",
                "bg-rose-500",
                "bg-amber-500",
                "bg-purple-500",
                "bg-indigo-500",
              ];
              return (
                <div
                  key={b.id}
                  style={{ width: `${b.allocation}%` }}
                  className={`${colors[idx % colors.length]} h-full transition-all duration-300 relative group`}
                  title={`${b.name}: ${b.allocation}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Beneficiaries List Cards */}
        <div className="space-y-3">
          {beneficiaries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No beneficiaries assigned yet. Use the form to add one.
            </div>
          ) : (
            beneficiaries.map((b, idx) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B0E14] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-4 group hover:border-[#FF3A56]/30 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 font-mono text-sm shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {b.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      {b.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-[#FF3A56] font-mono">
                      {b.allocation}%
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Inheritance
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    title="Remove beneficiary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
