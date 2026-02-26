"use client";

import dynamic from "next/dynamic";

const Level1Client = dynamic(() => import("./Level1Client"), { ssr: false });

export default function LevelOnePage() {
  return <Level1Client />;
}
