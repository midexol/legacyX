"use client";

import dynamic from "next/dynamic";

const ClaimView = dynamic(() => import("@/components/claim").then((mod) => mod.ClaimView), {
  ssr: false,
});

export default function ClaimPage() {
  return <ClaimView />;
}
