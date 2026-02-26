"use client";

import dynamic from "next/dynamic";

const XRScene = dynamic(() => import("./WebXRClient"), { ssr: false });

export default function Page() {
  return <XRScene />;
}
