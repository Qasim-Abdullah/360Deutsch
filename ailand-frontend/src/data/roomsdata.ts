import type { Room } from "@/types/rooms";

export const ROOMS: Room[] = [
  {
    id: 1,
    title: "Room 1",
    subtitle: "Objects Around You",
    bgGradient: "from-[#ede6f2] via-[#9160a8]/20 to-[#ebc6ae]/30",
    emoji: "🛋️",
    secondaryEmojis: ["💡", "🪴"],
  },
  {
    id: 2,
    title: "Room 2",
    subtitle: "At the Café",
    bgGradient: "from-[#ebc6ae]/40 via-[#ede6f2] to-[#dc9b6c]/20",
    emoji: "☕",
    secondaryEmojis: ["🥐", "🍰"],
  },
  {
    id: 3,
    title: "Room 3",
    subtitle: "At the Market",
    bgGradient: "from-[#ede6f2] via-[#5a47c7]/15 to-[#ebc6ae]/30",
    emoji: "🏪",
    secondaryEmojis: ["🍎", "🥬"],
  },
  {
    id: 4,
    title: "Room 4",
    subtitle: "Shopping Cart",
    bgGradient: "from-[#dc9b6c]/20 via-[#ede6f2] to-[#9160a8]/20",
    emoji: "🛒",
    secondaryEmojis: ["🥕", "🍊"],
  },
  {
    id: 5,
    title: "Room 5",
    subtitle: "Travel & Transport",
    bgGradient: "from-[#9160a8]/25 via-[#ede6f2] to-[#5a47c7]/15",
    emoji: "✈️",
    secondaryEmojis: ["🧳", "🎫"],
  },
];
