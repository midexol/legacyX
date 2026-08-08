import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/* ─── Flare Coston2 chain config ───────────────────────────────────────── */
const COSTON2 = {
  chainId: '0x72',
  chainName: 'Flare Testnet Coston2',
  nativeCurrency: { name: 'Coston2 FLR', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
  blockExplorerUrls: ['https://coston2.testnet.flarescan.com/'],
};

const CHAIN_ID_DEC = parseInt(COSTON2.chainId, 16); // 114

const DEMO_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

const WalletCtx = createContext(null);

/* ─── Detect which injected wallets are available ─────────────────────── */
function detectInjectedWallet() {
  const eth = window.ethereum;
  if (!eth) return null;
  if (eth.isRabby)            return 'rabby';
  if (eth.isBraveWallet)      return 'brave';
  if (eth.isCoinbaseWallet)   return 'coinbase-ext';
  if (eth.isMetaMask)         return 'metamask';
  return 'injected';
}

/* ─── Get a specific provider from window.ethereum.providers list ─────── */
function getProvider(preferType) {
  const eth = window.ethereum;
  if (!eth) return null;

  // Multi-wallet scenario: MetaMask injects an array of providers
  if (Array.isArray(eth.providers)) {
    if (preferType === 'metamask')   return eth.providers.find(p => p.isMetaMask && !p.isRabby) || eth;
    if (preferType === 'rabby')      return eth.providers.find(p => p.isRabby) || eth;
    if (preferType === 'coinbase-ext') return eth.providers.find(p => p.isCoinbaseWallet) || eth;
  }
  return eth;
}

export function WalletProvider({ children }) {
  const [account, setAccount]       = useState(null);
  const [balance, setBalance]       = useState('0');
  const [chainId, setChainId]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [error, setError]           = useState(null);

  // Available injected wallets detected at runtime
  const [detectedWallets, setDetectedWallets] = useState([]);

  const activeProviderRef = useRef(null);

  const isConnected    = !!account;
  const isCorrectChain = !chainId || parseInt(chainId, 16) === CHAIN_ID_DEC;

  const shorten = addr => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';

  /* ── Detect installed wallets on mount ────────────────────────────────── */
  useEffect(() => {
    const detected = [];
    const eth = window.ethereum;
    if (eth) {
      if (Array.isArray(eth.providers)) {
        eth.providers.forEach(p => {
          if (p.isRabby)          detected.push('rabby');
          else if (p.isMetaMask)  detected.push('metamask');
          else if (p.isCoinbaseWallet) detected.push('coinbase-ext');
          else if (p.isBraveWallet)   detected.push('brave');
        });
      } else {
        const t = detectInjectedWallet();
        if (t) detected.push(t);
      }
    }
    setDetectedWallets(detected.length ? detected : []);
  }, []);

  /* ── Balance fetch ────────────────────────────────────────────────────── */
  const fetchBalance = useCallback(async (addr, provider) => {
    if (!addr || !provider) { setBalance('0'); return; }
    try {
      const hex = await provider.request({ method: 'eth_getBalance', params: [addr, 'latest'] });
      setBalance(hex ? (Number(BigInt(hex)) / 1e18).toFixed(4) : '0');
    } catch {
      setBalance('0');
    }
  }, []);

  /* ── Switch/add Coston2 ───────────────────────────────────────────────── */
  const switchToCoston2 = useCallback(async (provider) => {
    if (!provider) return;
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: COSTON2.chainId }] });
    } catch (e) {
      if (e?.code === 4902 || e?.code === -32603) {
        try {
          await provider.request({ method: 'wallet_addEthereumChain', params: [COSTON2] });
        } catch (addErr) {
          console.warn('Could not add Coston2 network:', addErr);
        }
      }
    }
  }, []);

  /* ── Finalise connection ──────────────────────────────────────────────── */
  const finalise = useCallback((addr, type, provider) => {
    activeProviderRef.current = provider;
    setAccount(addr);
    setWalletType(type);
    setChainId(COSTON2.chainId);
    setError(null);
    sessionStorage.setItem('lx_wallet', addr);
    sessionStorage.setItem('lx_wallet_type', type);
    fetchBalance(addr, provider);
  }, [fetchBalance]);

  /* ── Generic injected connect (MetaMask, Rabby, Brave, Coinbase ext) ──── */
  const connectInjected = useCallback(async (type) => {
    const provider = getProvider(type);
    if (!provider) {
      const names = {
        metamask: 'MetaMask', rabby: 'Rabby Wallet',
        brave: 'Brave Wallet', 'coinbase-ext': 'Coinbase Wallet',
      };
      throw new Error(`${names[type] || 'Wallet'} is not installed.`);
    }
    setLoading(true);
    setError(null);
    try {
      const accs = await provider.request({ method: 'eth_requestAccounts' });
      if (!accs?.length) throw new Error('No accounts returned');
      await switchToCoston2(provider);
      finalise(accs[0], type, provider);
    } catch (e) {
      if (e?.code === 4001) throw new Error('User rejected the connection request.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [switchToCoston2, finalise]);

  const connectMetaMask    = useCallback(() => connectInjected('metamask'),     [connectInjected]);
  const connectRabby       = useCallback(() => connectInjected('rabby'),        [connectInjected]);
  const connectBrave       = useCallback(() => connectInjected('brave'),        [connectInjected]);
  const connectCoinbaseExt = useCallback(() => connectInjected('coinbase-ext'), [connectInjected]);

  /* ── WalletConnect — opens deep link / QR on mobile ──────────────────── */
  const connectWalletConnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to use the injected provider if available (for mobile browsers that
      // inject WalletConnect-compatible providers)
      if (window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isRabby) {
        return await connectInjected('injected');
      }

      // Deep-link fallback: open WalletConnect universal link
      // Users on desktop will be prompted to scan QR in their mobile wallet.
      // This uses the WalletConnect web app as a relay.
      const wcUri = `https://walletconnect.com/wc?uri=wc:`;
      window.open(
        'https://metamask.app.link/dapp/' + window.location.host,
        '_blank',
        'noopener,noreferrer'
      );
      setLoading(false);
      setError('Scan the QR code in your mobile wallet app, or use a browser extension wallet above.');
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }, [connectInjected]);

  /* ── Demo wallet ──────────────────────────────────────────────────────── */
  const connectDemo = useCallback(() => {
    activeProviderRef.current = null;
    setAccount(DEMO_ADDRESS);
    setBalance('142.5000');
    setChainId(COSTON2.chainId);
    setWalletType('demo');
    setError(null);
    sessionStorage.setItem('lx_wallet', DEMO_ADDRESS);
    sessionStorage.setItem('lx_wallet_type', 'demo');
  }, []);

  /* ── Disconnect ───────────────────────────────────────────────────────── */
  const disconnect = useCallback(() => {
    activeProviderRef.current = null;
    setAccount(null);
    setBalance('0');
    setChainId(null);
    setWalletType(null);
    setError(null);
    sessionStorage.removeItem('lx_wallet');
    sessionStorage.removeItem('lx_wallet_type');
  }, []);

  /* ── Auto-reconnect from session ──────────────────────────────────────── */
  useEffect(() => {
    const saved     = sessionStorage.getItem('lx_wallet');
    const savedType = sessionStorage.getItem('lx_wallet_type');
    if (!saved || !savedType) return;

    if (savedType === 'demo') {
      setAccount(saved); setBalance('142.5000');
      setChainId(COSTON2.chainId); setWalletType('demo');
      return;
    }

    const provider = getProvider(savedType) || window.ethereum;
    if (!provider) return;

    provider.request({ method: 'eth_accounts' })
      .then(accs => {
        if (accs?.length) {
          const addr = accs.find(a => a.toLowerCase() === saved.toLowerCase()) || accs[0];
          activeProviderRef.current = provider;
          setAccount(addr);
          setWalletType(savedType);
          setChainId(COSTON2.chainId);
          fetchBalance(addr, provider);
        }
      })
      .catch(() => {});
  }, [fetchBalance]);

  /* ── Listen to injected provider events ──────────────────────────────── */
  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;

    const onAccounts = accs => {
      if (!accs?.length) { disconnect(); }
      else {
        const addr = accs[0];
        setAccount(addr);
        sessionStorage.setItem('lx_wallet', addr);
        fetchBalance(addr, activeProviderRef.current || provider);
      }
    };
    const onChain = hex => {
      setChainId(hex);
      const addr = account || sessionStorage.getItem('lx_wallet');
      if (addr) fetchBalance(addr, activeProviderRef.current || provider);
    };

    provider.on?.('accountsChanged', onAccounts);
    provider.on?.('chainChanged', onChain);
    return () => {
      provider.removeListener?.('accountsChanged', onAccounts);
      provider.removeListener?.('chainChanged', onChain);
    };
  }, [account, disconnect, fetchBalance]);

  /* ── Legacy shim ──────────────────────────────────────────────────────── */
  const connect = connectMetaMask;

  return (
    <WalletCtx.Provider value={{
      account, balance, chainId, walletType, detectedWallets,
      isConnected, isCorrectChain, loading, error,
      connect, connectDemo,
      connectMetaMask, connectRabby, connectBrave,
      connectCoinbaseExt, connectWalletConnect,
      disconnect, shorten,
    }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}
