import ProgressBar from "@/components/ui/progress";
import Hearts from "@/components/ui/hearts";

import type { Status, Lives } from "@/components/levels/LevelContext";

type ProgLifesProps = {
  completed: number;
  total: number;
  status: Status;
  lives: Lives;
};

function Prog_Lifes({
  completed,
  total,
  status,
  lives,
}: ProgLifesProps) {
  return (
    <div className="h-3 w-full flex mb-7 gap-2 justify-between">
      <div className="w-[95%]">
        <ProgressBar
          completed={completed}
          total={total}
          status={status}
        />
      </div>

      <div className="mt-1">
        <Hearts value={lives} />
      </div>
    </div>
  );
}

export default Prog_Lifes;
