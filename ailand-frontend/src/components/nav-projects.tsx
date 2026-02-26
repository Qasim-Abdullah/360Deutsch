"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar/sidebar"

type NavMainItem = {
  title: string
  url: string
}

type NavMainSection = {
  title: string
  url: string
  icon: LucideIcon
  items?: NavMainItem[]
}

export function NavProjects({
  navMain,
}: {
  navMain: NavMainSection[]
}) {
  const { isMobile } = useSidebar()

  const learningRooms =
    navMain.find(section => section.title === "Learning Rooms")?.items ?? []

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      
      <SidebarMenu>
       

      
      </SidebarMenu>
    </SidebarGroup>
  )
}
