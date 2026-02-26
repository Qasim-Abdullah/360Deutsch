"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Size = "sm" | "md" | "lg" | "xl" | "2xl";

export default function Road({ count }: { count: number }) {
  const dashPath = useRef<SVGPathElement>(null);
  const [size, setSize] = useState<Size>("lg");

  const BASE_HEIGHT = 1500;
  const STEP = 280;

  const height = BASE_HEIGHT + Math.max(0, count - 5) * STEP;

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;

      if (w < 640) setSize("sm");
      else if (w < 768) setSize("md");
      else if (w < 1024) setSize("lg");
      else if (w < 1280) setSize("xl");
      else setSize("2xl");
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!dashPath.current) return;

    const path = dashPath.current;
    const length = path.getTotalLength();

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
  }, [size, count]);

  const buildPath = () => {
    let y = 170;
    let d = `M200 ${y}`;

    for (let i = 0; i < count; i++) {
      const c1 = size === "sm" || size === "md" ? -120 : 30;
      const c2 = size === "sm" || size === "md" ? 520 : 370;

      y += 150;

      d += `
        C${c1} ${y}, ${c2} ${y}, 200 ${y + 140}
      `;

      y += 140;
    }

    return d;
  };

  const widths: Record<Size, number> = {
    sm: 32,
    md: 28,
    lg: 23,
    xl: 23,
    "2xl": 23,
  };

  const preserve =
    size === "lg" || size === "xl" || size === "2xl" ? "none" : "xMidYMin meet";

  const path = buildPath();

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none -translate-y-[80px] md:-translate-y-[180px]"
      viewBox={`0 0 400 ${height}`}
      preserveAspectRatio={preserve}
    >
      <defs>
        <linearGradient id="roadGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      <path
        d={path}
        fill="none"
        stroke="url(#roadGlow)"
        strokeWidth={widths[size]}
        strokeLinecap="round"
        opacity="0.9"
      />

      <path
        ref={dashPath}
        d={path}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="20 18"
        opacity="0.5"
      />
    </svg>
  );
}