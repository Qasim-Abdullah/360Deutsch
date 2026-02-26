"use client";

import { useRef } from "react";

type CardPageProps = {
  color: string;
  text: string; // <-- ONLY ADDITION
};

export default function Card({ color, text }: CardPageProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  let lastX = 50;
  let lastY = 50;

  const handleMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateY = (x - midX) / 18;
    const rotateX = -(y - midY) / 18;

    const shine = card.querySelector(".shine") as HTMLElement;

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    lastX = px;
    lastY = py;

    if (shine) {
      shine.style.background = `
        radial-gradient(
          ellipse at ${px}% ${py}%,
          rgba(255,255,255,0.28),
          rgba(255,255,255,0.12) 35%,
          transparent 70%
        )
      `;
    }

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.04)
    `;
  };

  const reset = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  };

  return (
    <div
      style={{
 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* CARD */}
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onClick={() => console.log("Hola")}
        style={{
          width: "250px",
          height: "70px",
          borderRadius: "22px",
          position: "relative",
          cursor: "pointer",
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",

          background: color,

          boxShadow: `
            0 35px 70px rgba(0,0,0,0.22),
            inset 0 1px 1px rgba(255,255,255,0.2)
          `,
          overflow: "hidden",
        }}
      >
        {/* SOFT BORDER */}
        <div
          style={{
            position: "absolute",
            inset: "1px",
            borderRadius: "21px",
            border: "1px solid rgba(255,255,255,0.18)",
            pointerEvents: "none",
          }}
        />

        {/* IRREGULAR SHINE */}
        <div
          className="shine"
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(
                ellipse at 45% 55%,
                rgba(255,255,255,0.22),
                rgba(255,255,255,0.1) 35%,
                transparent 70%
              )
            `,
            mixBlendMode: "screen",
            pointerEvents: "none",
            transition: "background 0.12s ease-out",
          }}
        />

        {/* CONTENT DEPTH */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transform: "translateZ(35px)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* NUMBER */}
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "30px",
              fontFamily: "monospace",
              letterSpacing: "3px",
              transform: "translateZ(30px)",
            }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
