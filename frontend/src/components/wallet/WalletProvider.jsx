import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const COSTON2 = {
  chainId: '0x72',
  chainName: 'Flare Testnet Coston2',
  nativeCurrency: { name: 'Coston2 FLR', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
  blockExplorerUrls: ['https://coston2.testnet.flarescan.com/'],
};

const DEMO_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

const WalletCtx = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount]   = useState(null);
  const [balance, setBalance]   = useState('0');
  const [chainId, setChainId]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const isConnected = !!account;
  const isCorrectChain = !chainId || parseInt(chainId, 16) === parseInt(COSTON2.chainId, 16);

  const shorten = addr => addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : '';

  const getBalance = useCallback(async (addr) => {
    if (!addr) return;
    if (sessionStorage.getItem('lx_demo_wallet') === 'true' || !window.ethereum) {
      setBalance('142.5000');
      return;
    }
    try {
      const hex = await window.ethereum.request({ method: 'eth_getBalance', params: [addr, 'latest'] });
      if (hex) {
        setBalance((Number(BigInt(hex)) / 1e18).toFixed(4));
      }
    } catch (e) {
      console.warn('Failed to fetch balance:', e);
    }
  }, []);

  const switchToCoston2 = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: COSTON2.chainId }] });
    } catch (e) {
      if (e && (e.code === 4902 || e.code === -32603)) {
        try {
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [COSTON2] });
        } catch (addErr) {
          console.warn('Failed to add Coston2 chain:', addErr);
        }
      } else {
        console.warn('Switch chain warning:', e);
      }
    }
  }, []);

  const connectDemo = useCallback(() => {
    setAccount(DEMO_ADDRESS);
    setBalance('142.5000');
    setChainId(COSTON2.chainId);
    sessionStorage.setItem('lx_wallet', DEMO_ADDRESS);
    sessionStorage.setItem('lx_demo_wallet', 'true');
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      connectDemo();
      return;
    }
    setLoading(true);
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accs || !accs.length) return;
      const addr = accs[0];
      
      // Save session BEFORE attempting network switch to prevent race condition on page reload
      setAccount(addr);
      sessionStorage.setItem('lx_wallet', addr);
      sessionStorage.removeItem('lx_demo_wallet');

      try {
        await switchToCoston2();
      } catch (err) {
        console.warn('Network switch step skipped:', err);
      }

      await getBalance(addr);
    } catch (e) {
      console.error('Wallet connect error:', e);
    } finally {
      setLoading(false);
    }
  }, [switchToCoston2, getBalance, connectDemo]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setBalance('0');
    sessionStorage.removeItem('lx_wallet');
    sessionStorage.removeItem('lx_demo_wallet');
  }, []);

  // Auto-reconnect
  useEffect(() => {
    const saved = sessionStorage.getItem('lx_wallet');
    if (!saved) return;

    const isDemo = sessionStorage.getItem('lx_demo_wallet') === 'true';
    if (isDemo || !window.ethereum) {
      setAccount(saved);
      setBalance('142.5000');
      setChainId(COSTON2.chainId);
      return;
    }

    window.ethereum.request({ method: 'eth_accounts' })
      .then(accs => {
        if (accs && accs.length > 0) {
          const active = accs.find(a => a.toLowerCase() === saved.toLowerCase()) || accs[0];
          setAccount(active);
          sessionStorage.setItem('lx_wallet', active);
          getBalance(active);
        } else {
          // Keep saved account if user refreshed page, or re-verify on click
          setAccount(saved);
          getBalance(saved);
        }
      })
      .catch(() => {
        setAccount(saved);
      });
  }, [getBalance]);

  // MetaMask events
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccounts = accs => {
      if (!accs || !accs.length) {
        disconnect();
      } else {
        const addr = accs[0];
        setAccount(addr);
        sessionStorage.setItem('lx_wallet', addr);
        getBalance(addr);
      }
    };

    const onChain = hexChainId => {
      setChainId(hexChainId);
      const activeAccount = account || sessionStorage.getItem('lx_wallet');
      if (activeAccount) {
        getBalance(activeAccount);
      }
    };

    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', onAccounts);
      window.ethereum.on('chainChanged', onChain);
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', onAccounts);
        window.ethereum.removeListener('chainChanged', onChain);
      }
    };
  }, [account, disconnect, getBalance]);

  return (
    <WalletCtx.Provider value={{ account, balance, chainId, isConnected, isCorrectChain, loading, connect, connectDemo, disconnect, shorten }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}

