import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWallet } from './WalletProvider';

const VaultDataCtx = createContext(null);
const KEY_PREFIX = 'lx_vault_';

function loadVault(address) {
  if (!address) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + address.toLowerCase());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveVault(address, data) {
  if (!address) return;
  try {
    localStorage.setItem(KEY_PREFIX + address.toLowerCase(), JSON.stringify(data));
  } catch {
    /* storage unavailable — fail silently, state still works in-memory for this session */
  }
}

export function VaultDataProvider({ children }) {
  const { account } = useWallet();
  const [vault, setVault] = useState(null);

  // Load whenever the connected address changes
  useEffect(() => {
    setVault(loadVault(account));
  }, [account]);

  const createVault = useCallback((data) => {
    const activity = [
      { icon: 'lock',  text: `Legacy Vault deployed on Coston2`,                      time: Date.now() },
      { icon: 'users', text: `${data.beneficiaries.length} beneficiar${data.beneficiaries.length === 1 ? 'y' : 'ies'} added`, time: Date.now() },
      { icon: data.conditionIcon || 'clock', text: data.conditionLabel || 'Unlock condition set', time: Date.now() },
    ];
    const newVault = { ...data, createdAt: Date.now(), activity };
    setVault(newVault);
    saveVault(account, newVault);
    return newVault;
  }, [account]);

  const addActivity = useCallback((entry) => {
    setVault(v => {
      if (!v) return v;
      const next = { ...v, activity: [{ ...entry, time: Date.now() }, ...v.activity] };
      saveVault(account, next);
      return next;
    });
  }, [account]);

  const clearVault = useCallback(() => {
    if (account) localStorage.removeItem(KEY_PREFIX + account.toLowerCase());
    setVault(null);
  }, [account]);

  return (
    <VaultDataCtx.Provider value={{ vault, hasVault: !!vault, createVault, addActivity, clearVault }}>
      {children}
    </VaultDataCtx.Provider>
  );
}

export function useVaultData() {
  const ctx = useContext(VaultDataCtx);
  if (!ctx) throw new Error('useVaultData must be used inside VaultDataProvider');
  return ctx;
}
