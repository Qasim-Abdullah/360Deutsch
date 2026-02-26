 import {
  Home,
  BookOpen,
  BarChart3,
  User,
  HelpCircle,
  LogOut,
  Lock,
  LockOpen,
} from "lucide-react"

export const sideBarData = {
  user: {
    name: "Anna",
    level: "A1 Level",
    avatar: "/assets/avatars/anna.jpg", 
  },
  company: {
    name: "360°Deutsch",
  },
  navMain: [
    {
      title: "Rooms",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Vocabulary",
      url: "/dashboard/vocabulary",
      icon: BookOpen,
    },
    {
      title: "Progress",
      url: "/dashboard/progress",
      icon: BarChart3,
    },
    {
      title: "Profile",
      url: "/dashboard/userprofile",
      icon: User,
    },
  ],
  progress: {
    roomsCompleted: 1,
    totalRooms: 8,
    currentRoom: {
      number: 1,
      title: "Objects Around You",
      url: "/rooms/1",
    },
  },
  bottomActions: [
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
    {
      title: "Logout",
      url: "/logout",
      icon: LogOut,
    },
  ],
}
