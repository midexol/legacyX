"use client";

import dynamic from "next/dynamic";

const VaultView = dynamic(() => import("@/components/vault").then((mod) => mod.VaultView), {
  ssr: false,
});

export default function VaultPage() {
  return <VaultView />;
}
