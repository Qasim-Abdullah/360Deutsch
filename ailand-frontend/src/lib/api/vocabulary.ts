import { apiFetch, getAuthToken } from "@/lib/api/client";
import { vocabularyMock } from "@/lib/vocabularyMoc";
import type {
  RoomsListResponseBE,
  RoomSubjectsResponseBE,
  LearnedWordsResponseBE,
  InProgressWordsResponseBE,
  VocabularyUI,
  WordStatusUI,
  WordUI,
} from "@/types/vocabulary";


const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Vocabulary screen data builder:
 * - rooms (public)
 * - words in selected level (public)
 * - statuses from user progress (requires token)
 */
export async function getVocabulary(level: string, selectedRoomId?: string | null): Promise<VocabularyUI> {
  if (USE_MOCK) return vocabularyMock;

  // 1) Rooms (categories)
  const roomsRes = await apiFetch<RoomsListResponseBE>("/kg/rooms");
  const rooms = roomsRes.rooms;

  const roomId = selectedRoomId ?? (rooms[0]?.room_id ?? null);

  // 2) Subjects for level (A1/A2/B1...) - public endpoint
  const subjectsRes = await apiFetch<RoomSubjectsResponseBE>(`/kg/rooms/${level}/subjects?limit=100&offset=0`);
  const subjects = subjectsRes.subjects;

  // 3) Status mapping (only if logged in)
  const token = getAuthToken();
  let learnedSet = new Set<string>();
  let inProgSet = new Set<string>();

  if (token) {
    // IMPORTANT: your backend uses room_id as "Filter by room/level"
    // In your WordProgress model room_id is like A1/A2... so pass `level` here.
    const [learned, inProg] = await Promise.all([
      apiFetch<LearnedWordsResponseBE>(`/learning/words/learned?room_id=${encodeURIComponent(level)}&limit=200&offset=0`),
      apiFetch<InProgressWordsResponseBE>(`/learning/words/in-progress?room_id=${encodeURIComponent(level)}&limit=200&offset=0`),
    ]);

    learnedSet = new Set(learned.words.map(w => w.word_id));
    inProgSet = new Set(inProg.words.map(w => w.word_id));
  }

  const words: WordUI[] = subjects.map((s) => {
    let status: WordStatusUI = "not_started";
    // NOTE: subject.id must match word_id saved in WordProgress.
    if (learnedSet.has(s.id)) status = "learned";
    else if (inProgSet.has(s.id)) status = "in_progress";

    return {
      id: s.id,
      german: s.german,
      english: s.english,
      pos: s.pos,
      status,
    };
  });

  const learnedCount = words.filter(w => w.status === "learned").length;
  const inProgressCount = words.filter(w => w.status === "in_progress").length;

  return {
    level,
    rooms,
    selectedRoomId: roomId,
    totals: {
      totalWords: words.length,
      learned: learnedCount,
      inProgress: inProgressCount,
    },
    words,
  };
}
