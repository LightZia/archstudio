"use client"

import { Award, Ruler, Compass, PenTool, Layers, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Spline from '@splinetool/react-spline'

interface LandingPageProps {
  onStudentLogin: () => void
  onAdminLogin: () => void
}

const achievements = [
  {
    icon: Award,
    title: "15+ Years Experience",
    description: "Teaching architectural design and AutoCAD mastery to thousands of students worldwide.",
  },
  {
    icon: Ruler,
    title: "Industry Certified",
    description: "Autodesk Certified Professional with extensive real-world project experience.",
  },
  {
    icon: Compass,
    title: "Award-Winning Projects",
    description: "Led design teams on internationally recognized architectural developments.",
  },
  {
    icon: PenTool,
    title: "Published Author",
    description: "Written comprehensive guides on modern CAD techniques and sustainable design.",
  },
  {
    icon: Layers,
    title: "500+ Students Certified",
    description: "Successfully trained and certified students now working at top firms globally.",
  },
  {
    icon: Building2,
    title: "Research Fellow",
    description: "Contributing to cutting-edge research in parametric and generative design.",
  },
]

export function LandingPage({ onStudentLogin, onAdminLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-medium tracking-widest text-primary uppercase">
                  Premium Education
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight text-balance">
                  Master
                  <br />
                  Architectural
                  <br />
                  Design
                </h1>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Elevate your expertise with world-class AutoCAD training and earn premium certificates recognized by industry leaders.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onStudentLogin}
                  className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                >
                  Student Login (Google)
                </Button>
                <Button
                  onClick={onAdminLogin}
                  variant="outline"
                  className="h-12 px-8 border-border text-foreground hover:bg-secondary font-medium"
                >
                  Admin Access
                </Button>
              </div>
            </div>

            {/* Right: 3D Canvas with Spline Model */}
            <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
              <div className="aspect-square w-full max-w-[600px] rounded-lg border border-border bg-card overflow-hidden relative flex items-center justify-center">
                {/* Spline can lose its camera center on responsive boxes. We force its design size and scale it down to fit */}
                <div className="absolute w-[1200px] h-[1200px] scale-[0.55] origin-center -translate-y-[0%] -translate-x-[0%] pointer-events-auto">
                  <Spline scene="https://prod.spline.design/xT6cvvtM0P9Pr-qK/scene.splinecode" />
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-lg bg-primary/20 -z-10" />
              <div className="absolute -top-4 -left-4 h-16 w-16 rounded-lg border border-primary/30 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center space-y-4">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">
              Credentials
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Excellence in Architecture Education
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A distinguished career dedicated to shaping the next generation of architectural visionaries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <achievement.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 h-8 w-8 border-t border-r border-primary/20 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            2024 ArchStudio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
