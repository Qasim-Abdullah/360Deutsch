"use client";

import { useRouter } from "next/navigation";
import { ROOMS } from "@/data/roomsdata";
import { RoomCard } from "./roomCard";

type Props = {
  roomsCompleted: number;
};

export function RoomsGrid({ roomsCompleted }: Props) {
  const router = useRouter();

  // Room 1 is always unlocked; subsequent rooms unlock when the previous room is completed
  const unlockedUpTo = roomsCompleted + 1;

  function handleStart(roomId: number) {
    if (roomId === 1) {
      router.push("/dashboard/level-roadmap");
    } else if (roomId === 2) {
      router.push("/dashboard/side_room/room2");
    } else {
      router.push(`/dashboard/side_room/level${roomId}`);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0 lg:min-w-[72rem]">
      {ROOMS.map((room) => {
        const locked = room.id > unlockedUpTo;

        return (
          <RoomCard
            key={room.id}
            room={room}
            locked={locked}
            onStart={() => handleStart(room.id)}
          />
        );
      })}
    </div>
  );
}
