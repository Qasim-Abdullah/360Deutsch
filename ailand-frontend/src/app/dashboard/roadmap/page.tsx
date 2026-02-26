"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { rooms } from "./room";
import Road from "./Road";
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
        },
      );
    });
  }, []);

  return (
    <div
      id="roadmap"
      data-theme={theme}
      className={`
        relative  overflow-hidden transition-colors duration-300
   
      `}
    >
      <Road count={rooms.length} />
      <div className="relative z-10 flex flex-col items-center">
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
