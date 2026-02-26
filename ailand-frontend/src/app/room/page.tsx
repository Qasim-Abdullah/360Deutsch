"use client";

import dynamic from "next/dynamic";

const RoomView = dynamic(() => import("./RoomView"), { ssr: false });

export default function RoomPage() {
  return <RoomView />;
}
