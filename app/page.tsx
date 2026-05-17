"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { LandingPage } from "@/components/landing-page"
import { AdminDashboard } from "@/components/admin-dashboard"
import { StudentPortal } from "@/components/student-portal"
import { AdminLogin } from "@/components/admin-login"

type View = "home" | "admin" | "admin-login" | "student"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  const handleStudentLogin = () => {
    setCurrentView("student")
  }

  const handleAdminLogin = () => {
    // Show login form instead of directly going to admin
    setCurrentView("admin-login")
  }

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true)
    setCurrentView("admin")
  }

  const handleViewChange = (view: View) => {
    // If trying to access admin and not authenticated, show login
    if (view === "admin" && !isAdminAuthenticated) {
      setCurrentView("admin-login")
    } else {
      setCurrentView(view)
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    setCurrentView("home")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentView={currentView === "admin-login" ? "admin" : currentView} 
        onViewChange={handleViewChange}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={handleAdminLogout}
      />

      <main className="pt-16">
        {currentView === "home" && (
          <LandingPage
            onStudentLogin={handleStudentLogin}
            onAdminLogin={handleAdminLogin}
          />
        )}

        {currentView === "admin-login" && (
          <AdminLogin
            onLogin={handleAdminAuthenticated}
            onBack={() => setCurrentView("home")}
          />
        )}

        {currentView === "admin" && isAdminAuthenticated && <AdminDashboard />}

        {currentView === "student" && <StudentPortal />}
      </main>
    </div>
  )
}
