"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import AIPanel from "./AIPanel";
import { getARDataAction } from "@/app/actions/arApi";
import type { ARNode } from "@/lib/api/ar";

type Message = {
  role: "user" | "ai";
  text: string;
  processing?: boolean;
};

type Props = {
  onARData?: (root: ARNode) => void;
};

export default function AIButton({ onARData }: Props) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [input, setInput] = useState("");
  const [spinOnce, setSpinOnce] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const processingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 140);
    return () => clearTimeout(t);
  }, [open]);

  function startDots() {
    let step = 1;

    processingTimer.current = window.setInterval(() => {
      step = (step % 3) + 1;
      const dots = ".".repeat(step);

      setMessages((m) =>
        m.map((msg) => (msg.processing ? { ...msg, text: dots } : msg)),
      );
    }, 400);
  }

  function stopDots() {
    if (processingTimer.current) {
      clearInterval(processingTimer.current);
      processingTimer.current = null;
    }
  }

  async function runTask() {
    if (!input.trim() || working) return;

    const current = input;

    setWorking(true);
    setInput("");

    setMessages((m) => [...m, { role: "user", text: current }]);

    setMessages((m) => [...m, { role: "ai", text: ".", processing: true }]);

    startDots();

    const res = await getARDataAction(current);

    stopDots();

    if (res) {
      if (res.ok) {
        // ✅ SEND KG TO XR
        onARData?.(res.data);

        setMessages((m) =>
          m.map((msg) =>
            msg.processing
              ? {
                  role: "ai",
                  text: res.message,
                }
              : msg,
          ),
        );

        setSpinOnce(true);
        setTimeout(() => setSpinOnce(false), 900);

        setTimeout(() => {
          setOpen(false);
        }, 2000);
      } else {
        setMessages((m) =>
          m.map((msg) =>
            msg.processing
              ? {
                  role: "ai",
                  text: res.reason,
                }
              : msg,
          ),
        );

        setOpen(true);
      }
    }
    setWorking(false);
  }

  return (
    <>
      <div className="fixed bottom-6 z-[9999] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 flex flex-col items-end gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div
          className={`origin-bottom-right transition-all duration-300 ${
            open
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          }`}
        >
          <AIPanel
            open={open}
            input={input}
            working={working}
            textareaRef={textareaRef}
            onChange={setInput}
            onSubmit={runTask}
            messages={messages}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!working) setOpen((v) => !v);
          }}
          className={`h-15 w-15 rounded-full overflow-hidden shadow-[0_20px_40px_rgba(90,71,199,0.35)] transition-all duration-500 ease-out hover:scale-110 ${
            working ? "animate-breathe-strong" : ""
          }`}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-[-40%] animate-spin-slow bg-[conic-gradient(from_0deg,#5a47c7,#9160a8,#dc9b6c,#5a47c7)]" />
            <div className="absolute inset-[3px] rounded-full bg-white/10 backdrop-blur-md" />
            <div className="absolute inset-0 rounded-full blur-xl opacity-50 bg-gradient-to-br from-[#5a47c7] via-[#9160a8] to-[#dc9b6c]" />

            <div
              className={`relative z-10 flex h-full w-full items-center justify-center text-white ${
                spinOnce ? "animate-orb-rotate-once" : ""
              }`}
            >
              <Sparkles size={26} strokeWidth={1.5} />
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
