import type { VocabularyUI } from "@/types/vocabulary";

export const vocabularyMock: VocabularyUI = {
  level: "A1",
  rooms: [
    { room_id: "living_room", name: "Living Room", description: "", word_count: 26 },
    { room_id: "bathroom", name: "Bathroom", description: "", word_count: 26 },
    { room_id: "kitchen", name: "Kitchen", description: "", word_count: 26 },
    { room_id: "bedroom", name: "Bedroom", description: "", word_count: 26 },
  ],
  selectedRoomId: "living_room",
  totals: { totalWords: 104, learned: 52, inProgress: 52 },
  words: [
    { id: "tisch", german: "der Tisch", english: "table", pos: "noun", status: "learned" },
    { id: "pflanze", german: "die Pflanze", english: "plant", pos: "noun", status: "learned" },
    { id: "lampe", german: "die Lampe", english: "lamp", pos: "noun", status: "learned" },
    { id: "uhr", german: "die Uhr", english: "clock", pos: "noun", status: "learned" },
    { id: "sofa", german: "das Sofa", english: "sofa", pos: "noun", status: "in_progress" },
  ],
};
