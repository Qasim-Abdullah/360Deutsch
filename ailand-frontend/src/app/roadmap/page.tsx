"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { rooms } from "./room";
import Road from "./road"
import RoomNode from "./RoomNode";

gsap.registerPlugin(ScrollTrigger);

type Theme = "light" | "dark";

export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");
  const items = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    items.current.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: "+=80", scale: 0.85 },
        {
          opacity: 1,
          y: "-=80",
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            once: true,
          },
        }
      );
    });
  }, []);

  return (
    <div
      id="roadmap"
      data-theme={theme}
      className={`
        relative min-h-[260vh] overflow-hidden transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-[#0b102f] via-[#1a1445] to-[#251a63]"
            : "bg-gradient-to-b from-[#f8fafc] via-[#eef2ff] to-[#e0e7ff]"
        }
      `}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.25),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(251,146,60,0.25),transparent_45%)]" />

      <div className="fixed top-6 left-6 z-50 flex items-center gap-4 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-xl border border-white/20">
        <span className="text-white font-bold text-lg">Roadmap</span>
        <span className="text-white/70 text-sm">★★★★☆ 4 / 20</span>
      </div>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`
          fixed top-6 right-6 z-50
          px-4 py-2 rounded-xl text-sm font-medium
          backdrop-blur-xl border transition
          ${
            theme === "dark"
              ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
              : "bg-black/10 text-black border-black/20 hover:bg-black/20"
          }
        `}
      >
        {theme === "dark" ? "☀ Light" : "🌙 Dark"}
      </button>

      <Road />

      <div className="relative z-10 pt-[180px] flex flex-col items-center">
        {rooms.map((room, i) => (
          <div
            key={room.id}
            ref={(el) => {
              if (el) items.current[i] = el;
            }}
            className="relative mb-[180px]"
            style={{
              transform: `translate(${room.x}px, ${room.y}px)`,
            }}
          >
            <RoomNode room={room} theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
}