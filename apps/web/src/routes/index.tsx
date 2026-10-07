
import "../styles/landing.css"

import { Navbar } from "../ui/Navbar"
import { Hero } from "../ui/landing/hero"
import { AlphaStatus } from "../ui/landing/stats"
import { Features } from "../ui/landing/features"
import { Markets } from "../ui/landing/markets"
import { HowItWorks } from "../ui/landing/how-it-works"
import { Risks } from "../ui/landing/infrastructure"
import { FinalCTA } from "../ui/landing/final-cta"
import { Footer } from "../ui/landing/footer"

export default function LandingPage() {
  return (
    <div className="font-trading min-h-svh bg-background text-foreground antialiased">
      <Navbar variant="landing" />
      <Hero />
      <AlphaStatus />
      <HowItWorks />
      <Markets />
      <Features />
      <Risks />
      <FinalCTA />
      <Footer />
    </div>
  )
}
