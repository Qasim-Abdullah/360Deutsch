type ProgressBarProps = {
  completed: number;
  total: number;
  status: "idle" | "correct" | "wrong";
};

export default function ProgressBar({
  completed,
  total,
  status,
}: ProgressBarProps) {
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const color = "from-[#7c6cff] to-[#ff9f5a]";

  return (
    <div className="flex items-center gap-4 mb-7 text-sm w-full text-gray-900 dark:text-slate-100 px-2">
      <div className="text-[17px]">
        {completed} of {total} completed
      </div>

      <div className="flex-1 h-2 mt-1 bg-gray-200 dark:bg-slate-800 rounded-md overflow-hidden">
        <div
          className={`h-full rounded-md bg-linear-to-r ${color} transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-[17px]">{progress}%</span>
    </div>
  );
}
