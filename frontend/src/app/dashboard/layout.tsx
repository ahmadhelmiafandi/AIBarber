"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import {
  LayoutDashboard,
  BrainCircuit,
  CalendarCheck,
  Users,
  Clock,
  Heart,
  Crown,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Scissors,
  Loader2,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/ai-consultant", label: "AI Consultant", icon: BrainCircuit },
  { href: "/dashboard/booking", label: "Booking", icon: CalendarCheck },
  { href: "/dashboard/queue", label: "Antrian", icon: Users },
  { href: "/dashboard/history", label: "Riwayat", icon: Clock },
  { href: "/dashboard/favorites", label: "Favorit", icon: Heart },
  { href: "/dashboard/membership", label: "Membership", icon: Crown },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
]

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/ai-consultant": "AI Consultant",
  "/dashboard/booking": "Booking",
  "/dashboard/queue": "Antrian",
  "/dashboard/history": "Riwayat Potong Rambut",
  "/dashboard/favorites": "Gaya Rambut Favorit",
  "/dashboard/membership": "Membership",
  "/dashboard/settings": "Pengaturan",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, token, isLoading, logout } = useAuth()

  const pageTitle = pageTitles[pathname] || "Dashboard"

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/auth/login")
    }
  }, [isLoading, token, router])

  const handleLogout = async () => {
    await logout()
    router.push("/auth/login")
  }

  if (isLoading || !token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat sesi pengguna...</p>
        </div>
      </div>
    )
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US"

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary">
            <Scissors className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">MyBarber</span>
          <button
            type="button"
            className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Separator />

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator />

        <div className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user?.name || "Pengguna"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || "user@mybarber.my.id"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <button
            type="button"
            className="lg:hidden flex items-center justify-center p-2 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted text-foreground cursor-pointer shrink-0 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
