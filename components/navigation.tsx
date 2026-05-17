"use client"

import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type View = "home" | "admin" | "admin-login" | "student"

interface NavigationProps {
  currentView: View
  onViewChange: (view: View) => void
  isAdminAuthenticated?: boolean
  onAdminLogout?: () => void
}

export function Navigation({ 
  currentView, 
  onViewChange, 
  isAdminAuthenticated,
  onAdminLogout 
}: NavigationProps) {
  const navItems: { id: View; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "admin", label: "Admin" },
    { id: "student", label: "Student Portal" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ArchStudio
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                currentView === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {item.label}
            </button>
          ))}

          {/* Logout button for authenticated admin */}
          {isAdminAuthenticated && onAdminLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAdminLogout}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
