"use client";

import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <div className="dark bg-[#08090C] min-h-screen text-white">{children}</div>;
}
