"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Spline from '@splinetool/react-spline'
import { Award, ShieldCheck, Download } from "lucide-react"

interface LandingPageProps {
  onStudentLogin: () => void
  onAdminLogin: () => void
}

export function LandingPage({ onStudentLogin, onAdminLogin }: LandingPageProps) {
  useEffect(() => {
    const bg = document.getElementById("spline-bg")
    const handleScroll = () => {
      if (bg) {
        bg.style.transform = `rotate(${window.scrollY * 0.05}deg)`
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* 3D Canvas Background */}
      <div 
        id="spline-bg"
        className="fixed inset-0 z-0 pointer-events-none transition-transform duration-75 ease-linear flex items-center justify-center overflow-hidden mix-blend-screen opacity-60 w-screen h-screen"
        style={{ transform: "rotate(0deg)" }}
      >
        <div className="absolute w-full h-full scale-[1.2] origin-center translate-x-[8%] md:translate-x-[12%]">
          <Spline scene="https://prod.spline.design/xT6cvvtM0P9Pr-qK/scene.splinecode" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-20 min-h-[90vh] flex items-center pt-20 pb-16">
        <div className="mx-auto w-full max-w-4xl px-6 text-center">
          <div className="space-y-8 flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium tracking-wide uppercase">Offline Course Completion</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight text-balance">
              ArchStudio
              <br />
              <span className="text-primary">Certificate Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Access and download your premium certificates for offline architectural design courses. Log in with the credentials provided by your instructor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
              <Button
                onClick={onStudentLogin}
                className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium w-full sm:w-auto shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                Student Login
              </Button>
              <Button
                onClick={onAdminLogin}
                variant="outline"
                className="h-14 px-8 text-lg border-border text-foreground hover:bg-secondary font-medium w-full sm:w-auto backdrop-blur-md bg-background/50 transition-all hover:scale-105"
              >
                Admin Access
              </Button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 py-24 border-t border-border/50 bg-background/60 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4 flex flex-col items-center p-6 rounded-2xl bg-card/30 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Verified Certificates</h3>
              <p className="text-muted-foreground">Authentic, digitally verifiable certificates for your professional portfolio.</p>
            </div>
            <div className="space-y-4 flex flex-col items-center p-6 rounded-2xl bg-card/30 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Industry Recognized</h3>
              <p className="text-muted-foreground">Premium completion certificates validating your architectural design skills.</p>
            </div>
            <div className="space-y-4 flex flex-col items-center p-6 rounded-2xl bg-card/30 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Instant Download</h3>
              <p className="text-muted-foreground">Access and download your certificates anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-8 border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ArchStudio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
