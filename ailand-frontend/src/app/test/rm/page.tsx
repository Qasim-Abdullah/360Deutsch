"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RoomProgressCard from "./RoomProgressCard";

gsap.registerPlugin(ScrollTrigger);

type Theme = "light" | "dark";

type Room = {
  id: number;
  name: string;
  image: string;
  x: number;
  y: number;
};

const rooms: Room[] = [
  {
    id: 1,
    name: "Wohnzimmer",
    image: "/images/rooms/wohnzimmer.png",
    x: -300,
    y: 220,
  },
  {
    id: 2,
    name: "Schlafzimmer",
    image: "/images/rooms/schlafzimmer.png",
    x: 260,
    y: 30,
  },
  {
    id: 3,
    name: "Arbeitszimmer",
    image: "/images/rooms/arbeitszimmer.png",
    x: -240,
    y: -120,
  },
  {
    id: 4,
    name: "Badezimmer",
    image: "/images/rooms/badezimmer.png",
    x: 280,
    y: -200,
  },
  {
    id: 5,
    name: "Küche",
    image: "/images/rooms/kuche.png",
    x: -250,
    y: -400,
  },
  {
    id: 6,
    name: "Küche",
    image: "/images/rooms/kinderzimmer.png",
    x: 290,
    y: -480,
  },
];

export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");

  const items = useRef<HTMLDivElement[]>([]);
  const roadPath = useRef<SVGPathElement>(null);
  const dashPath = useRef<SVGPathElement>(null); useEffect(() => {
    items.current.forEach((el) => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: "+=80",
          scale: 0.85,
        },
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

    if (dashPath.current) {
      const path = dashPath.current;
      const length = path.getTotalLength();

      // Start fully hidden
      gsap.set(path, {
        strokeDashoffset: length,
        opacity: 0,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        opacity: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: "#roadmap",
          start: "top 90%",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }
  }, []);

  return (
    <div
      id="roadmap"
      data-theme={theme}
      className={`
    relative min-h-[260vh] overflow-hidden transition-colors duration-300

    ${theme === "dark"
          ? "bg-gradient-to-b from-[#0b102f] via-[#1a1445] to-[#251a63]"
          : "bg-gradient-to-b from-[#f8fafc] via-[#eef2ff] to-[#e0e7ff]"
        }
  `}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.25),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(251,146,60,0.25),transparent_45%)]" />

      {/* Top HUD */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-4 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-xl border border-white/20">
        <span className="text-white font-bold text-lg">Roadmap</span>
        <span className="text-white/70 text-sm">★★★★☆ 4 / 20</span>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() =>
          setTheme(theme === "dark" ? "light" : "dark")
        }
        className={`
    fixed top-6 right-6 z-50
    px-4 py-2 rounded-xl text-sm font-medium
    backdrop-blur-xl border transition

    ${theme === "dark"
            ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
            : "bg-black/10 text-black border-black/20 hover:bg-black/20"
          }
  `}
      >
        {theme === "dark" ? "☀ Light" : "🌙 Dark"}
      </button>
      {/* Road */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 1500"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="roadGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        {/* Main Road */}
        {/* Static Road */}
        <path
          ref={roadPath}
          d="
    M200 170
    C30 340, 370 340, 200 480
    C30 610, 370 610, 200 750
    C30 880, 370 880, 200 1020
    C30 1150, 370 1150, 200 1290
  "
          fill="none"
          stroke="url(#roadGlow)"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Animated Dashed Line */}
        <path
          ref={dashPath}
          d="
    M200 170
    C30 340, 370 340, 200 480
    C30 610, 370 610, 200 750
    C30 880, 370 880, 200 1020
    C30 1150, 370 1150, 200 1290
  "
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="20 18"
          opacity="0.5"
        />
      </svg>

      {/* Rooms */}
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
            <RoomNode room={room} theme={theme} />          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex gap-6 rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-xl border border-white/20">
        <NavIcon icon="🏠" />
        <NavIcon icon="⭐" />
        <NavIcon icon="🏆" badge />
        <NavIcon icon="⚙️" badge />
      </div>
    </div>
  );
}

function RoomNode({
  room,
  theme,
}: {
  room: Room;
  theme: "light" | "dark";
}) {
  return (
    <div className="relative group">

      {/* Glow */}
      <div className="absolute inset-0 blur-2xl bg-violet-500/40 rounded-full opacity-60" />

      {/* Room Image */}
      <div className="relative flex items-center justify-center transition group-hover:scale-105">
        <img
          src={room.image}
          alt={room.name}
          className="w-[260px] h-[260px] object-contain drop-shadow-xl"
        />
      </div>

      {/* Hover Card */}
      <RoomProgressCard room={room} theme={theme} />
    </div>
  );
}




function NavIcon({
  icon,
  badge,
}: {
  icon: string;
  badge?: boolean;
}) {
  return (
    <div className="relative w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl text-white hover:bg-white/20 transition">
      {icon}

      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-orange-500 text-white rounded-full flex items-center justify-center">
          1
        </span>
      )}
    </div>
  );
}