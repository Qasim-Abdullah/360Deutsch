"use client";

import { useLevel } from "@/components/levels/LevelContext";
import Prog_Lifes from "@/components/levels/prog_lifes";

export default function ProgLifesClient() {
  const { completed, total, status, lives } = useLevel();

  return (
    <Prog_Lifes
      completed={completed}
      total={total}
      status={status}
      lives={lives}
    />
  );
}
