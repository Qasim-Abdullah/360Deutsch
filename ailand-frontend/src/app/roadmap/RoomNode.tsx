"use client";

import RoomProgressCard from "./RoomProgressCard";
import type { Room } from "./room";

export default function RoomNode({
  room,
  theme,
}: {
  room: Room;
  theme: "light" | "dark";
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 blur-2xl bg-violet-500/40 rounded-full opacity-60" />

      <div className="relative flex items-center justify-center transition group-hover:scale-105">
        <img
          src={room.image}
          alt={room.name}
          className="w-[260px] h-[260px] object-contain drop-shadow-xl"
        />
      </div>

      <RoomProgressCard room={room} theme={theme} />
    </div>
  );
}