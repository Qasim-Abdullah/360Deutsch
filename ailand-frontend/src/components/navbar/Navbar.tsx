"use client";

import { createPortal } from "react-dom";
import { Moon, Sun, Flame, Lightbulb, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { usePoints } from "@/components/levels/PointsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/alerts/popover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";

/** Use fixed/portaled navbar on phone and tablet (e.g. iPad) so page content with high z-index cannot cover it. */
const FIXED_NAVBAR_MAX_WIDTH = 1024;

const LEVEL_RULES: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Basics", subtitle: "Match objects with German words" },
  2: { title: "Listening", subtitle: "Listen and write the names of the objects" },
  3: { title: "Mission Mode", subtitle: "Complete the mission to unlock the next level" },
  4: { title: "Sentences", subtitle: "Build the sentence with the words" },
};

const LEVEL_HINTS: Record<number, string> = {
  1: "Select a word card on the left, then click the 3D object in the scene that matches it. Use the article (der, die, das) to help you remember the word.",
  2: "Listen to the word, look at the object in the room, then type the German word in the box. Include the article (der, die, das) before the noun — spelling counts.",
  3: "Match each word card to the correct object in the room before time runs out. Click a word card to see its translation. Then click the matching object in the room. Complete all missions before time runs out.",
  4: "Tap the words from the pool into the answer area in the correct order to build the German sentence. The English translation is your guide.",
};

const NAVBAR_BASE_CLASS =
  "isolate pointer-events-auto p-4 pt-7 bg-background flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between touch-manipulation [touch-action:manipulation]";

const NAVBAR_SPACER_HEIGHT = "10rem";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { points, streak } = usePoints();
  const userPoints = user?.points ?? points;
  const userStreak = user?.daily_streak ?? streak;
  const isMobile = useIsMobile();
  const { openMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [useFixedNavbar, setUseFixedNavbar] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user, setTheme]);


  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setUseFixedNavbar(window.innerWidth <= FIXED_NAVBAR_MAX_WIDTH);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const box =
    "flex items-center justify-center min-h-[44px] min-w-[44px] sm:h-9 sm:min-h-0 sm:min-w-[36px] px-2 rounded-md border shadow-sm touch-manipulation cursor-pointer select-none active:opacity-90";

  const match = pathname.match(/level(\d+)/);
  const levelNumber = match ? Number(match[1]) : null;

  const isLevelPage = levelNumber !== null;
  const isRoadmapPage = pathname.includes("/dashboard/roadmap");
  const isProgressPage = pathname.includes("/dashboard/progress");
  const isVocabularyPage = pathname.includes("/dashboard/vocabulary");

  const rule = levelNumber ? LEVEL_RULES[levelNumber] : null;

  const navContent = (
    <>
      <div className="flex gap-2 min-w-0">
        {!openMobile && (
          <div className="shrink-0 flex items-center min-[1025px]:hidden">
            <SidebarTrigger className="size-11 min-w-[44px] min-h-[44px] touch-manipulation" />
          </div>
        )}

        {isLevelPage && rule && (
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              onTouchEnd={useFixedNavbar ? (e) => { e.preventDefault(); router.back(); } : undefined}
              className="w-[42px] h-[42px] cursor-pointer rounded-xl border shadow-sm flex items-center justify-center hover:bg-gray-50 transition shrink-0 [touch-action:manipulation]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1
                className="
                  text-[18px] sm:text-[25px] font-normal
                  leading-tight pb-[2px]
                  truncate
                "
              >
                Level {levelNumber}: {rule.title}
              </h1>

              <p className="hidden sm:block text-[14px] text-gray-500 mt-1 truncate">
                {rule.subtitle}
              </p>
            </div>
          </div>
        )}




        {isRoadmapPage && (
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              onTouchEnd={useFixedNavbar ? (e) => { e.preventDefault(); router.back(); } : undefined}
              className="w-[42px] h-[42px] cursor-pointer rounded-xl border shadow-sm flex items-center justify-center hover:bg-gray-50 transition shrink-0 [touch-action:manipulation]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1
                className="
                  text-[18px] sm:text-[25px] font-normal
                  leading-tight pb-[2px]
                  truncate
                "
              >
                Roadmap
              </h1>
              <p className="hidden sm:block text-[14px] text-gray-500 mt-1 truncate">
                Your learning path
              </p>
            </div>
          </div>
        )}

        {isProgressPage && (
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              onTouchEnd={
                useFixedNavbar
                  ? (e) => {
                    e.preventDefault();
                    router.back();
                  }
                  : undefined
              }
              className="w-[42px] h-[42px] cursor-pointer rounded-xl border shadow-sm flex items-center justify-center hover:bg-gray-50 transition shrink-0 [touch-action:manipulation]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-[18px] sm:text-[25px] font-normal leading-tight pb-[2px] truncate">
                Progress
              </h1>
              <p className="hidden sm:block text-[14px] text-gray-500 mt-1 truncate">
                Your learning statistics
              </p>
            </div>
          </div>
        )}



        {isVocabularyPage && (
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              onTouchEnd={
                useFixedNavbar
                  ? (e) => {
                    e.preventDefault();
                    router.back();
                  }
                  : undefined
              }
              className="w-[42px] h-[42px] cursor-pointer rounded-xl border shadow-sm flex items-center justify-center hover:bg-gray-50 transition shrink-0 [touch-action:manipulation]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-[18px] sm:text-[25px] font-normal leading-tight pb-[2px] truncate">
                Vocabulary
              </h1>
              <p className="hidden sm:block text-[14px] text-gray-500 mt-1 truncate">
                Review and manage your learned words
              </p>
            </div>
          </div>
        )}

      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-4 justify-end shrink-0 pointer-events-auto [touch-action:manipulation]">
        <div className={`${box} gap-1 pointer-events-auto`} role="presentation">
          <Star className="h-5 w-5 text-[#5f4ac4] fill-[#5f4ac4]" />
          <span className="text-sm font-medium">{userPoints}</span>
        </div>

        <div
          className={`${box} gap-1 pointer-events-auto`}
          title={userStreak === 1 ? "Daily streak: 1 day" : `Daily streak: ${userStreak} days`}
          aria-label={userStreak === 1 ? "Daily streak: 1 day" : `Daily streak: ${userStreak} days`}
          role="img"
        >
          <Flame
            className="h-5 w-5"
            style={{
              stroke: "url(#flame-gradient)",
              fill: "url(#flame-gradient)",
            }}
            aria-hidden
          />

          <svg width="0" height="0" aria-hidden>
            <defs>
              <linearGradient id="flame-gradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#7c6cff" />
                <stop offset="100%" stopColor="#ff9f5a" />
              </linearGradient>
            </defs>
          </svg>

          <span className="text-sm font-medium">{userStreak}</span>
        </div>

        <Popover modal={false} open={hintOpen} onOpenChange={setHintOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`${box} pointer-events-auto [touch-action:manipulation]`}
              title="Hint"
              aria-label="Show level hint"
              onClick={() => setHintOpen((o) => !o)}
              onTouchEnd={(e) => {
                if (useFixedNavbar) {
                  e.preventDefault();
                  setHintOpen((o) => !o);
                }
              }}
            >
              <Lightbulb className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="max-w-sm z-[100000]">
            <p className="text-sm font-medium text-foreground mb-1">Hint</p>
            <p className="text-sm text-muted-foreground">
              {levelNumber && LEVEL_HINTS[levelNumber]
                ? LEVEL_HINTS[levelNumber]
                : "Go to a level (1–4) to see guidance for that level."}
            </p>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          className={`${box} relative pointer-events-auto [touch-action:manipulation]`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          onTouchEnd={(e) => {
            if (useFixedNavbar) {
              e.preventDefault();
              setTheme(theme === "dark" ? "light" : "dark");
            }
          }}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 text-[#5f4ac4] scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 text-[#5f4ac4] scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </>
  );

  if (useFixedNavbar && mounted && typeof document !== "undefined") {
    return (
      <>
        <div className="shrink-0 w-full" style={{ height: NAVBAR_SPACER_HEIGHT }} aria-hidden />
        {createPortal(
          <nav
            data-mobile-navbar
            className={`${NAVBAR_BASE_CLASS} fixed top-0 left-0 right-0 shadow-sm border-b border-border [transform:translateZ(0)] transition-[z-index] duration-0`}
            style={{ zIndex: openMobile ? 40 : 2147483647 }}
          >
            {navContent}
          </nav>,
          document.body
        )}
      </>
    );
  }

  return (
    <nav className={`${NAVBAR_BASE_CLASS} sticky top-0 z-30`}>
      {navContent}
    </nav>
  );
};

export default Navbar;