type WordCardProps = {
  id: string;
  de: string;
  en: string;
  done: boolean;
  active: boolean;
  status: "idle" | "correct" | "wrong";
  onSelect: (id: string) => void;
};

export default function WordCard({
  id,
  de,
  en,
  done,
  active,
  status,
  onSelect,
}: WordCardProps) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative flex items-center justify-between p-4 py-6 rounded-xl border cursor-pointer transition-all duration-200 overflow-hidden

      ${
        done
          ? " border-emerald-400 dark:bg-transparent dark:border-emerald-500"
          : active && status === "idle"
          ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 dark:bg-transparent dark:border-indigo-400 dark:ring-indigo-400/30"
          : active && status === "wrong"
          ? "bg-red-50 border-red-400 animate-shake dark:bg-transparent dark:border-red-400"
          : active && status === "correct"
          ? " border-emerald-400 dark:bg-transparent dark:border-emerald-500"
          : " border-gray-200 hover:border-gray-300 hover:shadow-sm dark:bg-transparent dark:border-slate-700 dark:hover:border-slate-500"
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 transition
        ${
          active
            ? "bg-indigo-500"
            : done
            ? "bg-emerald-500"
            : "bg-gray-200 group-hover:bg-indigo-400 dark:bg-slate-600 dark:group-hover:bg-slate-400"
        }`}
      />

      <div className="pl-3">
        <div className="text-base font-semibold text-gray-900 dark:text-slate-100">
          {de}
        </div>
      </div>

      {done && (
        <span className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">
          ✓
        </span>
      )}
    </div>
  );
}
