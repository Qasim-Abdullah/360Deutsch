"use client";

import dynamic from "next/dynamic";

const Level4Client = dynamic(() => import("./Level4Client"), { ssr: false });

export default function Page() {
  return <Level4Client />;
}
