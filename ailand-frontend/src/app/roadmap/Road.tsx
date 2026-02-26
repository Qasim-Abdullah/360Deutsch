"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Road() {
  const roadPath = useRef<SVGPathElement>(null);
  const dashPath = useRef<SVGPathElement>(null);

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
  }, []);

  return (
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
  );
}