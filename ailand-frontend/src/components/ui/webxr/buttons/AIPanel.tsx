"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Message = {
  role: "user" | "ai";
  text: string;
  processing?: boolean;
};

type Props = {
  open: boolean;
  input: string;
  working: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  messages: Message[];
};

function IconSparkle(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className}>
      <defs>
        <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(90,71,199,.8)" />
          <stop offset="50%" stopColor="rgba(145,96,168,.7)" />
          <stop offset="100%" stopColor="rgba(220,155,108,.7)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12.8 10.8 8.6 6.6 7.4l4.2-1.2L12 2Zm7 8l.7 2.4 2.3.6-2.3.6L19 16l-.7-2.4-2.3-.6 2.3-.6L19 10ZM5 12l.9 3.1 3.1.9-3.1.9L5 20l-.9-3.2L1 15.9l3.1-.9L5 12Z"
        stroke="url(#sparkleGradient)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={props.className}>
      <path
        d="M5 12l14-7-7 14-2-6-5-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AIPanel({
  open,
  input,
  working,
  textareaRef,
  onChange,
  onSubmit,
  messages,
}: Props) {
  const PHONE_MQ = "(max-width: 640px)";
  const MIN_H = 24;
  const DESKTOP_MAX = 150;
  const PHONE_MAX = 120;

  const [isPhone, setIsPhone] = useState(false);

  // ✅ Scroll container ref
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(PHONE_MQ);
    const apply = () => setIsPhone(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ✅ Auto-scroll on new message
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const current = el.offsetHeight;
    el.style.height = "auto";
    const natural = el.scrollHeight;

    const maxH = isPhone ? PHONE_MAX : DESKTOP_MAX;
    const target = Math.min(Math.max(natural, MIN_H), maxH);

    el.style.height = `${current}px`;
    void el.offsetHeight;
    el.style.height = `${target}px`;
    el.style.overflowY = natural > maxH ? "auto" : "hidden";
  }, [input, isPhone, textareaRef]);

  return (
    <div
      className={`relative transition-all duration-300 ${
        open
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative w-[min(92vw,420px)] sm:w-[480px]">
        <div className="relative">
          {/* Glow */}
          <div
            className="pointer-events-none absolute -inset-4 rounded-[36px] blur-[70px] opacity-60"
            style={{
              background:
                "conic-gradient(from 200deg at 50% 55%, rgba(90,71,199,.6), rgba(145,96,168,.5), rgba(220,155,108,.5), rgba(90,71,199,.6))",
            }}
          />

          <div
            className="pointer-events-none absolute -inset-6 rounded-[56px] blur-[22px] opacity-45"
            style={{
              background:
                "linear-gradient(135deg, rgba(90,71,199,.5), rgba(145,96,168,.4), rgba(220,155,108,.4))",
            }}
          />

          <div
            className="relative rounded-[40px] p-[4px]"
            style={{
              background:
                "linear-gradient(120deg, rgba(120,98,255,.85) 0%, rgba(167,104,204,.65) 20%, rgba(255,173,92,.8) 100%)",
            }}
          >
            <div className="relative rounded-[36px] bg-white/90 backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.18)]">
              <div className="relative px-3 pt-5 pb-4">

                {/* Messages */}
                <div
                  ref={messagesRef}
                  className="mb-3 max-h-[160px] px-2 overflow-y-auto space-y-3 text-sm "
                >
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        m.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 leading-relaxed whitespace-pre-wrap break-words ${
                          m.role === "user"
                            ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-br-md"
                            : "bg-gray-300  text-gray-900 rounded-bl-md"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Provide complex widgets to improve"
                  rows={1}
                  className="w-full resize-none bg-transparent text-black/85 placeholder:text-black/45
                  text-[18px] sm:text-[26px] mt-1  leading-tight
                  outline-none overflow-hidden transition-[height] duration-300"
                />

                {/* Buttons */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full
                    bg-black/[0.05] px-3 py-2 text-black/80
                    ring-1 ring-black/[0.08] hover:bg-black/[0.06] transition"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] ring-1 ring-black/[0.08]">
                      <IconSparkle className="h-4 w-4 text-black/70" />
                    </span>

                    <span className="text-[14px] font-semibold">
                      Prompts
                    </span>
                  </button>

                  <div className="ml-auto" />

                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={working || !input.trim()}
                    className="inline-flex h-11 w-11 items-center justify-center
                    rounded-full bg-black/[0.05]
                    ring-2 ring-black/[0.08]
                    hover:bg-black/[0.06] transition
                    disabled:opacity-40"
                  >
                    <IconSend className="h-6 w-6 text-black/70" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}