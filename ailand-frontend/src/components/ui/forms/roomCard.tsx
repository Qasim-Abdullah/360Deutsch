"use client";

import { Lock, CheckCircle } from "lucide-react";
import type { Room } from "@/types/rooms";

type Props = {
  room: Room;
  locked: boolean;
  onStart: () => void;
};

export function RoomCard({ room, locked, onStart }: Props) {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-border transition-all duration-300
        bg-gradient-to-br ${room.bgGradient}
        dark:[background-image:none] dark:bg-card dark:shadow-sm
        shadow-lg dark:shadow-none
        ${locked ? "opacity-90" : "hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-md hover:border-[#9160a8]/30 dark:hover:border-border"}`}
    >
      <div className="p-6 space-y-4">

        <div className="relative bg-card/70 dark:bg-muted/40 backdrop-blur-sm rounded-2xl h-44 overflow-hidden shadow-sm dark:shadow-none flex items-center justify-center border border-border">
          <div className="text-center space-y-2">
            <div className="text-6xl">{room.emoji}</div>
            <div className="flex gap-2 justify-center">
              {room.secondaryEmojis.map((emoji, idx) => (
                <span key={idx} className="text-3xl">
                  {emoji}
                </span>
              ))}
            </div>
          </div>

   
          {locked && (
            <div className="absolute inset-0 bg-background/50 dark:bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-card dark:bg-muted/80 rounded-full p-4 shadow-lg dark:shadow-none border border-border">
                <Lock size={32} className="text-muted-foreground" />
              </div>
            </div>
          )}

          
          {!locked && (
            <>
              <div className="absolute top-3 left-3 text-2xl animate-pulse">✨</div>
              <div className="absolute bottom-3 right-3 text-2xl animate-pulse delay-500">✨</div>
              <div className="absolute top-3 right-3 text-xl animate-pulse delay-1000">⭐</div>
            </>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {room.title}:
          </h3>
          <p className="text-base text-muted-foreground">{room.subtitle}</p>
        </div>

        {/* Button */}
        {locked ? (
          <div className="bg-card/80 dark:bg-muted/50 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center justify-center gap-2 text-muted-foreground shadow-sm dark:shadow-none border border-border">
            <Lock size={18} />
            <span className="font-semibold">Locked</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#5a47c7] dark:text-[#a78bfa] text-sm font-medium">
              <CheckCircle size={18} className="shrink-0" />
              <span>Unlocked</span>
            </div>

            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-[#5a47c7] to-[#9160a8] hover:from-[#9160a8] hover:to-[#5a47c7] dark:from-[#7c5fd4] dark:to-[#a86bc4] dark:hover:from-[#a86bc4] dark:hover:to-[#7c5fd4] text-white font-semibold text-lg py-3.5 rounded-xl shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-none transition-all duration-300 active:scale-[0.98]"
            >
              Start
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}
