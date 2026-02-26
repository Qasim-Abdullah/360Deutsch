"use client";

import Image from "next/image";
import Room from "@/components/room";

export default function Page() {
  const items = Array.from({ length: 10 });
  const lastIndex = items.length - 1;

  return (
    <div className="mx-[15rem] flex flex-col">
      {items.map((_, i) => (
        <div
          key={i}
          className={`relative flex ${
            i === lastIndex
              ? i % 2 === 0
                ? "justify-end"
                : "justify-start"
              : i % 2 === 0
              ? "justify-end -mb-[11rem]"
              : "justify-start -mb-[11rem]"
          }`}
        >
          {i !== 0 && i % 2 !== 0 && (
            <div className="absolute left-[10rem] bottom-[7rem]">
              <Image
                src="/images/stones.webp"
                alt="example"
                width={500}
                height={300}
                priority
              />
            </div>
          )}

          {i !== 0 && i % 2 === 0 && (
            <div className="absolute left-[11rem] bottom-[7rem]">
              <Image
                src="/images/stones_flip.webp"
                alt="example"
                width={500}
                height={300}
                priority
              />
            </div>
          )}

          {i === lastIndex ? (
            <Room locked={false} blur={false} />
          ) : (
            <Room />
          )}
        </div>
      ))}
    </div>
  );
}
