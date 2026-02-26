"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, BookOpen, Clock, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { getVocabularyAction, loadMoreWordsAction, getOverallProgressAction, type OverallProgress } from "@/app/actions/vocabulary";
import type { VocabularyUI, WordUI } from "@/types/vocabulary";

type ExtendedVocabularyUI = VocabularyUI & { totalWordsInLevel: number };

export function VocabularyDashboard() {
  const [data, setData] = useState<ExtendedVocabularyUI | null>(null);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setHasMore(true);
      try {
        const [vocabResult, progressResult] = await Promise.all([
          getVocabularyAction(selectedLevel),
          getOverallProgressAction(),
        ]);
        setData(vocabResult);
        setOverallProgress(progressResult);
        setHasMore(vocabResult.words.length < vocabResult.totalWordsInLevel);
      } catch (e) {
        console.error("Failed to load vocabulary:", e);
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        setError(`Failed to load vocabulary: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedLevel]);

  const handleLoadMore = async () => {
    if (!data || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const result = await loadMoreWordsAction(selectedLevel, data.words.length);
      
      // Merge new words with existing ones
      const newWords = [...data.words, ...result.words];
      const learnedCount = newWords.filter((w) => w.status === "learned").length;
      const inProgressCount = newWords.filter((w) => w.status === "in_progress").length;
      
      setData({
        ...data,
        words: newWords,
        totals: {
          totalWords: newWords.length,
          learned: learnedCount,
          inProgress: inProgressCount,
        },
      });
      setHasMore(result.hasMore);
    } catch (e) {
      console.error("Failed to load more words:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#5a47c7] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error || "Failed to load vocabulary"}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#5a47c7] text-white rounded-lg hover:bg-[#4a3ab7] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { words, totals, totalWordsInLevel } = data;
  const learnedWords = words.filter((w) => w.status === "learned");
  const inProgressWords = words.filter((w) => w.status === "in_progress");
  const newWords = words.filter((w) => w.status === "new");

  // Use overall progress for the main percentage
  const overallPercent = overallProgress?.overallPercent ?? 0;
  const totalLearnedAll = overallProgress?.totalLearnedAllLevels ?? 0;
  const totalInProgressAll = overallProgress?.totalInProgressAllLevels ?? 0;
  const totalWordsAll = overallProgress?.totalWordsAllLevels ?? 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-w-0">
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Overall Progress Card */}
        <div className="bg-gradient-to-br from-[#5a47c7] to-[#7c5ce0] rounded-2xl p-6 mb-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold opacity-90">Overall Vocabulary Progress</p>
              <p className="text-sm opacity-75">
                {totalLearnedAll} of {totalWordsAll} words learned across all levels
              </p>
            </div>
            <span className="text-4xl font-bold">{overallPercent}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              <Check className="h-4 w-4" />
              {totalLearnedAll} Learned
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              <Clock className="h-4 w-4" />
              {totalInProgressAll} In Progress
            </span>
          </div>
        </div>

        {/* Level selector */}
        <div className="flex gap-2 mb-6">
          {["A1", "A2", "B1"].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === level
                  ? "bg-[#5a47c7] text-white"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Current Level Info */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-semibold text-foreground">
              Level {selectedLevel}
            </p>
            <p className="text-sm text-muted-foreground">
              {words.length} of {totalWordsInLevel} words loaded
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              {totals.learned} Learned
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-600">
              <Clock className="h-4 w-4" />
              {totals.inProgress} In Progress
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {newWords.length} New
            </span>
          </div>
        </div>

        {/* In Progress Words */}
        {inProgressWords.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
              </span>
              <h2 className="text-xl font-bold text-foreground">In Progress ({inProgressWords.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {inProgressWords.map((w) => (
                <WordCard key={w.id} word={w} level={selectedLevel} />
              ))}
            </div>
          </>
        )}

        {/* Learned Words */}
        {learnedWords.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </span>
              <h2 className="text-xl font-bold text-foreground">Learned ({learnedWords.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {learnedWords.map((w) => (
                <WordCard key={w.id} word={w} level={selectedLevel} />
              ))}
            </div>
          </>
        )}

        {/* New Words */}
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5a47c7]/20">
            <BookOpen className="h-3.5 w-3.5 text-[#5a47c7]" />
          </span>
          <h2 className="text-xl font-bold text-foreground">New Words ({newWords.length})</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {newWords.map((w) => (
            <WordCard key={w.id} word={w} level={selectedLevel} />
          ))}
        </div>

        {words.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No words available for this level.</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && words.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-3 bg-[#5a47c7] text-white rounded-xl font-medium hover:bg-[#4a3ab7] transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="h-5 w-5" />
                  Load More Words ({totalWordsInLevel - words.length} remaining)
                </>
              )}
            </button>
          </div>
        )}

        {!hasMore && words.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">All {totalWordsInLevel} words loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WordCard({ word, level }: { word: WordUI; level: string }) {
  const statusConfig = {
    learned: {
      badge: <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />,
      badgeBg: "bg-emerald-500/20",
      borderClass: "border-emerald-500/30",
    },
    in_progress: {
      badge: <Clock className="h-4 w-4 text-amber-600 stroke-[2.5]" />,
      badgeBg: "bg-amber-500/20",
      borderClass: "border-amber-500/30",
    },
    new: {
      badge: null,
      badgeBg: "",
      borderClass: "border-border",
    },
  };

  const config = statusConfig[word.status];

  return (
    <Link
      href={`/dashboard/vocabulary/${encodeURIComponent(word.id)}?level=${level}`}
      className={`bg-card border ${config.borderClass} rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#5a47c7]/50 transition-all relative overflow-hidden cursor-pointer`}
    >
      {config.badge && (
        <div className={`absolute z-20 top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full ${config.badgeBg}`}>
          {config.badge}
        </div>
      )}

      <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ede6f2] to-[#ebc6ae]/50">
          <span className="text-2xl sm:text-3xl font-bold text-[#9160a8]/50">
            {word.german.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <p className="font-semibold text-foreground text-sm sm:text-base leading-tight">
        {word.german}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">{word.english}</p>
      {word.pos && (
        <span className="inline-block mt-2 text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {word.pos}
        </span>
      )}
    </Link>
  );
}
