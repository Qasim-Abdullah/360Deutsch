"use client";

import dynamic from "next/dynamic";

const TestARPage = dynamic(() => import("./TestARClient"), { ssr: false });

export default function Page() {
  return <TestARPage />;
}
