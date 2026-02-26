"use client";

import dynamic from "next/dynamic";

const RoomARPage = dynamic(() => import("./RoomARClient"), { ssr: false });

export default function Page() {
  return <RoomARPage />;
}
