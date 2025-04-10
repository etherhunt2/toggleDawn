"use client";

import dynamic from "next/dynamic";

// Load CursorDot dynamically with SSR disabled
const CursorDot = dynamic(() => import("@/components/ui/CursorDot"), { 
  ssr: false 
});

export default function ClientCursorDot() {
  return <CursorDot />;
} 