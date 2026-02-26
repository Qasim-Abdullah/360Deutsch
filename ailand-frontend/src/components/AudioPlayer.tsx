"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2 } from "lucide-react";

const OUTER_SIZE = 100;
const INNER_R = 36;
const DE_LANG = "de-DE";

type AudioPlayerProps = {
  word?: { article?: string; word?: string } | null;
};

function getGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === DE_LANG || v.lang.startsWith("de")) ?? null;
}

export default function AudioPlayer({ word }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const lastPlayedAt = useRef(0);
  const voicesReady = useRef(false);

 
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const ensureVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) voicesReady.current = true;
    };
    ensureVoices();
    window.speechSynthesis.onvoiceschanged = ensureVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const playAudio = (e?: React.PointerEvent | React.MouseEvent) => {
    if (!word?.article || !word?.word) return;
    const now = Date.now();
    if (now - lastPlayedAt.current < 500) return;
    lastPlayedAt.current = now;

    const synth = window.speechSynthesis;
    synth.cancel(); 

    const text = `${word.article} ${word.word}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = DE_LANG;
    utterance.rate = 0.8;
    utterance.volume = 1;
    utterance.pitch = 1;
    const voice = getGermanVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    synth.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[200px]">
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes glow-rotate {
          to { transform: rotate(360deg); }
        }
        .audio-glow-ring {
          background: conic-gradient(
            from 0deg,
            var(--palette-royal) 0deg,
            var(--palette-purple) 90deg,
            var(--palette-terracotta) 180deg,
            var(--palette-peach) 270deg,
            var(--palette-royal) 360deg
          );
          /* Narrow the color to a ring near the edge */
          mask: radial-gradient(
            circle,
            transparent 52%,
            black 68%,
            transparent 72%
          );
          -webkit-mask: radial-gradient(
            circle,
            transparent 52%,
            black 68%,
            transparent 72%
          );
          filter: blur(8px);
          opacity: 0.85;
          transition: opacity 0.15s ease, filter 0.15s ease;
        }
        .dark .audio-glow-ring {
          opacity: 0.9;
        }
        .audio-glow-ring.playing {
          animation: glow-pulse 1.5s ease-in-out infinite, glow-rotate 8s linear infinite;
        }
        /* When button is pressed, glow appears more */
        .audio-btn:active .audio-glow-ring {
          opacity: 1;
          filter: blur(10px);
        }
      `}</style>

      <button
        type="button"
        onClick={() => playAudio()}
        onPointerDown={(e) => {
         
          if (e.pointerType !== "mouse") playAudio(e);
        }}
        disabled={isPlaying}
        className="audio-btn relative flex items-center justify-center rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--palette-royal)] focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-none"
        style={{ width: OUTER_SIZE, height: OUTER_SIZE }}
        aria-label="Play audio"
      >
        
        <div
          className={`audio-glow-ring absolute rounded-full pointer-events-none ${isPlaying ? 'playing' : ''}`}
          style={{
            width: OUTER_SIZE + 32,
            height: OUTER_SIZE + 32,
            left: '50%',
            top: '50%',
            marginLeft: -(OUTER_SIZE + 32) / 2,
            marginTop: -(OUTER_SIZE + 32) / 2,
          }}
        />

        <div
          className="absolute rounded-full flex items-center justify-center shadow-lg bg-[var(--palette-lavender)] border border-[var(--palette-purple)]/30 dark:bg-[var(--palette-royal)]/90 dark:border-[var(--palette-purple)]/50"
          style={{ width: INNER_R * 2, height: INNER_R * 2 }}
        >
          <Volume2
            size={24}
            className="text-[var(--palette-royal)] dark:text-white"
            strokeWidth={2}
          />
        </div>
      </button>

      <p className="mt-4 text-center text-sm font-medium text-[var(--palette-purple)] dark:text-[var(--palette-peach)]">
        {isPlaying ? 'Playing…' : 'Click to hear the word'}
      </p>
    </div>
  );
}
