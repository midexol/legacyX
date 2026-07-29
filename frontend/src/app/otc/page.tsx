"use client";

import dynamic from "next/dynamic";

const OtcView = dynamic(() => import("@/components/otc").then((mod) => mod.OtcView), {
  ssr: false,
});

export default function OtcPage() {
  return <OtcView />;
}
