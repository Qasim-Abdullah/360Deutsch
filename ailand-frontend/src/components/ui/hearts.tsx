"use client";

import { FaHeart } from "react-icons/fa";

type HeartsProps = {
  value: 0 | 1 | 2 | 3;
};

export default function Hearts({ value }: HeartsProps) {
  return (
    <div className="flex gap-1">
      {[3, 2, 1].map((i) => (
        <FaHeart
          key={i}
          className={`text-xl transition-colors ${
            i <= value ? "text-[#5f4ac4]" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
