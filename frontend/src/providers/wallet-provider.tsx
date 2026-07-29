"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
  isConnected: boolean;
  address: string;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: "0x71C7240a1B8c3dE8B92e85F69A5C4E5E89F2",
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("0x71C7...8f9A");

  useEffect(() => {
    // Check localStorage for persisted connection session if available
    const savedState = localStorage.getItem("legacyx_wallet_connected");
    if (savedState === "true") {
      setIsConnected(true);
    }
  }, []);

  const connectWallet = () => {
    setIsConnected(true);
    localStorage.setItem("legacyx_wallet_connected", "true");
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    localStorage.removeItem("legacyx_wallet_connected");
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
