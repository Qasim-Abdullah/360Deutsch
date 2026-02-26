"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Volume2, BookOpen, Languages, CheckCircle, Loader2 } from "lucide-react";
import { Main } from "@/components/layout/main";
import { usePoints } from "@/components/levels/PointsContext";
import { 
  getWordDetailsAction, 
  startWordAction, 
  completeWordAction,
  type WordDetails 
} from "@/app/actions/vocabulary";

type WordStatus = "in_progress" | "learned";

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshPoints } = usePoints();
  const wordId = params.wordId as string;
  const level = searchParams.get("level") || "A1";

  const [word, setWord] = useState<WordDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<WordStatus>("in_progress");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    async function fetchWordAndStart() {
      setLoading(true);
      setError(null);
      try {
        // Try with the original ID first
        let data = await getWordDetailsAction(wordId);
        
        // If not found, try with capitalized first letter (fallback for old lowercase IDs)
        if (!data && wordId) {
          const capitalizedId = wordId.charAt(0).toUpperCase() + wordId.slice(1);
          if (capitalizedId !== wordId) {
            data = await getWordDetailsAction(capitalizedId);
          }
        }
        
        if (!data) {
          setError("Word not found");
          setLoading(false);
          return;
        }
        
        setWord(data);
        
        // Automatically start learning this word (only once)
        if (!startedRef.current) {
          startedRef.current = true;
          const result = await startWordAction(data.id, level);
          if (result.success) {
            // Check if word was already learned
            if (result.message.includes("already learned")) {
              setStatus("learned");
            } else {
              setStatus("in_progress");
            }
            setActionMessage(result.message);
          }
        }
      } catch (e) {
        setError("Failed to load word details");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (wordId) {
      fetchWordAndStart();
    }
  }, [wordId, level]);

  const getArticle = (gender: string | null): string => {
    if (!gender) return "";
    switch (gender.toLowerCase()) {
      case "masculine":
        return "der";
      case "feminine":
        return "die";
      case "neuter":
        return "das";
      default:
        return "";
    }
  };

  const handleCompleteWord = async () => {
    if (!word) return;
    setActionLoading(true);
    setActionMessage(null);
    
    const result = await completeWordAction(word.id);
    
    if (result.success) {
      setStatus("learned");
      setActionMessage(result.message);
      // Refresh points in navbar (adds 5 points for word learned)
      await refreshPoints();
    } else {
      setActionMessage(result.message);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <Main fixed className="pt-2">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#5a47c7] border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Loading word details...</p>
          </div>
        </div>
      </Main>
    );
  }

  if (error || !word) {
    return (
      <Main fixed className="pt-2">
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <p className="text-destructive font-medium">{error || "Word not found"}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#5a47c7] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </Main>
    );
  }

  const article = getArticle(word.gender);
  const fullWord = article ? `${article} ${word.german}` : word.german;

  return (
    <Main fixed className="pt-2">
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to vocabulary
          </button>

          {/* Main word card with action button */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{fullWord}</h1>
                {word.ipa && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <span className="font-mono">[{word.ipa}]</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-[#5a47c7]/15 px-3 py-1 text-sm font-medium text-[#5a47c7]">
                    {word.pos}
                  </span>
                  {word.gender && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-600">
                      {word.gender}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-600">
                    Level {word.level}
                  </span>
                </div>
              </div>

              {/* Action button - only Mark as Learned */}
              <div className="flex flex-col gap-2 sm:items-end">
                {status === "in_progress" && (
                  <button
                    onClick={handleCompleteWord}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-5 w-5" />
                    )}
                    Mark as Learned
                  </button>
                )}
                {status === "learned" && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/15 text-emerald-600 rounded-xl font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Learned
                  </div>
                )}
                {actionMessage && (
                  <p className="text-sm text-muted-foreground mt-1">{actionMessage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Translations */}
          {word.translations.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="h-5 w-5 text-[#5a47c7]" />
                <h2 className="text-xl font-bold text-foreground">Translations</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {[...new Set(word.translations)].map((trans, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 rounded-xl px-4 py-3 border border-border"
                  >
                    <p className="font-medium text-foreground">{trans}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {word.examples.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-[#5a47c7]" />
                <h2 className="text-xl font-bold text-foreground">Example Sentences</h2>
              </div>
              <div className="grid gap-4">
                {word.examples.map((example, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-[#ede6f2] to-[#ebc6ae]/30 dark:from-[#2d2640] dark:to-[#3d2d20] rounded-xl px-5 py-4 border border-border"
                  >
                    <p className="text-foreground leading-relaxed">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meanings in German */}
          {word.meanings_de.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Bedeutungen (DE)</h2>
              <ul className="space-y-2">
                {word.meanings_de.map((meaning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#5a47c7] font-bold">{i + 1}.</span>
                    <span className="text-foreground">{meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meanings in English */}
          {word.meanings_en.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Meanings (EN)</h2>
              <ul className="space-y-2">
                {word.meanings_en.map((meaning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#5a47c7] font-bold">{i + 1}.</span>
                    <span className="text-foreground">{meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Main>
  );
}
