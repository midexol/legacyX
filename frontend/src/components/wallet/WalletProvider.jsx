import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const COSTON2 = {
  chainId: '0x72',
  chainName: 'Flare Testnet Coston2',
  nativeCurrency: { name: 'Coston2 FLR', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
  blockExplorerUrls: ['https://coston2.testnet.flarescan.com/'],
};

const WalletCtx = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount]   = useState(null);
  const [balance, setBalance]   = useState('0');
  const [chainId, setChainId]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const isConnected = !!account;
  const isCorrectChain = chainId === COSTON2.chainId;

  const shorten = addr => addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : '';

  const getBalance = useCallback(async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const hex = await window.ethereum.request({ method: 'eth_getBalance', params: [addr, 'latest'] });
      setBalance((Number(BigInt(hex)) / 1e18).toFixed(4));
    } catch {}
  }, []);

  const switchToCoston2 = useCallback(async () => {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: COSTON2.chainId }] });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [COSTON2] });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) { window.open('https://metamask.io/', '_blank'); return; }
    setLoading(true);
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accs.length) return;
      setAccount(accs[0]);
      await switchToCoston2();
      await getBalance(accs[0]);
      sessionStorage.setItem('lx_wallet', accs[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [switchToCoston2, getBalance]);

  const disconnect = useCallback(() => {
    setAccount(null); setBalance('0');
    sessionStorage.removeItem('lx_wallet');
  }, []);

  // Auto-reconnect
  useEffect(() => {
    const saved = sessionStorage.getItem('lx_wallet');
    if (!saved || !window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(accs => {
      if (accs.includes(saved)) { setAccount(saved); getBalance(saved); }
    }).catch(() => {});
  }, [getBalance]);

  // MetaMask events
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = accs => {
      if (!accs.length) disconnect();
      else { setAccount(accs[0]); getBalance(accs[0]); }
    };
    const onChain = id => { setChainId(id); if (id !== COSTON2.chainId) window.location.reload(); };
    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts);
      window.ethereum.removeListener('chainChanged', onChain);
    };
  }, [disconnect, getBalance]);

  return (
    <WalletCtx.Provider value={{ account, balance, chainId, isConnected, isCorrectChain, loading, connect, disconnect, shorten }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}
