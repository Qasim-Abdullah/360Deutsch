"use client";

import {
    CheckIcon,
    BookOpenIcon,
    ChatBubbleLeftRightIcon,
    PencilSquareIcon,
    LockClosedIcon,
    SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

type Room = {
    id: number;
    name: string;
    image: string;
    x: number;
    y: number;
};

const GRADIENT =
    "from-[#5a47c7] via-[#9160a8] via-[#c084fc] to-[#fb923c]";

type NodeState = "done" | "active" | "locked";

/* Border colors by position */
const NODE_COLORS = [
    "#5a47c7",
    "#9e7ee3",
    "#cb98e2",
    "#e8a090",
];

export default function RoomProgressCard({
    room,
    theme,
}: {
    room: Room;
    theme: "light" | "dark";
}) {
    const isRight = room.x > 0;

    /* ---------- STATE ---------- */

    const states: NodeState[] =
        room.id === 1
            ? ["done", "done", "active", "locked"]
            : ["locked", "locked", "locked", "locked"];

    const progress = room.id === 1 ? 75 : 0;

    /* --------------------------- */

    return (
        <div
            className={`
    absolute top-1/2 -translate-y-1/2
    ${isRight ? "left-[280px]" : "right-[280px]"}

    w-[440px]
    rounded-3xl
    backdrop-blur-2xl
    p-7

    opacity-0 scale-95 pointer-events-none
    transition-all duration-300

    group-hover:opacity-100
    group-hover:scale-100
    group-hover:pointer-events-auto

    ${theme === "dark"
                    ? `
        bg-[#0f172a]/95
        border border-white/10
        shadow-[0_40px_90px_rgba(0,0,0,0.6)]
      `
                    : `
        bg-white/90
        border border-white/40
        shadow-[0_40px_90px_rgba(0,0,0,0.18)]
      `
                }
  `}
        >
            {/* Header */}

            <div className="mb-7">
                <h3
                    className={`
    text-xl font-semibold
    ${theme === "dark" ? "text-white" : "text-gray-900"}
  `}
                >                    {room.name}
                </h3>

                <p
                    className={`
    text-sm mt-1
    ${theme === "dark" ? "text-white/60" : "text-gray-500"}
  `}
                >
                    {room.id === 1 ? "3 / 4 Levels Completed" : "Locked"}
                </p>
            </div>

            {/* Timeline */}

            <div className="relative mb-7">

                {/* Track */}
                <div
                    className={`
            absolute top-1/2 left-0 right-0
            h-[12px] -translate-y-1/2 rounded-full
            bg-gradient-to-r ${GRADIENT}
            ${room.id === 1 ? "opacity-80" : "opacity-30"}
          `}
                />

                {/* Nodes */}
                <div className="relative z-10 flex justify-between">

                    <LevelNode
                        index={0}
                        state={states[0]}
                        icon={<BookOpenIcon />}
                    />

                    <LevelNode
                        index={1}
                        state={states[1]}
                        icon={<ChatBubbleLeftRightIcon />}
                    />

                    <LevelNode
                        index={2}
                        state={states[2]}
                        icon={<PencilSquareIcon />}
                    />

                    <LevelNode
                        index={3}
                        state={states[3]}
                        icon={<SpeakerWaveIcon />}
                    />
                </div>
            </div>

            {/* Labels */}

            <div
                className={`
    flex justify-between text-sm mb-7 px-1
    ${theme === "dark" ? "text-white/70" : "text-gray-600"}
  `}
            >
                <span>Vocabulary</span>
                <span>Phrases</span>
                <span>Grammar</span>
                <span>Listening</span>
            </div>

            {/* Progress */}

            <div className="flex items-center gap-4">

                <div
                    className={`
    flex-1 h-3 rounded-full overflow-hidden
    ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}
  `}
                >
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${GRADIENT}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <span
  className={`
    text-sm font-medium
    ${theme === "dark"
      ? "text-violet-300"
      : "text-[#4f0b80]"
    }
  `}
>
                    {progress}% Complete
                </span>
            </div>
        </div>
    );
}

/* ---------------- NODE ---------------- */

function LevelNode({
    index,
    state,
    icon,
}: {
    index: number;
    state: NodeState;
    icon: React.ReactNode;
}) {
    const color = NODE_COLORS[index];

    const borderColor =
        state === "locked" ? "#d1d5db" : color;

    const iconColor =
        state === "locked" ? "#9ca3af" : color;

    return (
        <div
            className="
          w-11 h-11 rounded-full
          flex items-center justify-center
          border-[3.5px]
          bg-white
          transition
        "
            style={{ borderColor }}
        >
            {state === "done" && (
                <CheckIcon
                    className="w-5 h-5"
                    style={{
                        color: iconColor,
                        strokeWidth: 3
                    }}
                />
            )}

            {state === "active" && (
                <div className="relative flex items-center justify-center">

                    {/* Pulse Ring */}
                    <span
                        className="
        absolute inset-0
        rounded-full
        animate-ping
        opacity-40
      "
                        style={{ backgroundColor: iconColor }}
                    />

                    {/* Glow Ring */}
                    <span
                        className="
        absolute inset-0
        rounded-full
        blur-md
        opacity-60
      "
                        style={{ backgroundColor: iconColor }}
                    />

                    {/* Main Icon */}
                    <div
                        className="relative w-5 h-5"
                        style={{
                            color: iconColor,
                            strokeWidth: 3
                        }}
                    >
                        {icon}
                    </div>

                </div>
            )}

            {state === "locked" && (
                <LockClosedIcon
                    className="w-5 h-5"
                    style={{
                        color: iconColor,
                        strokeWidth: 3
                    }}
                />
            )}
        </div>
    );
}