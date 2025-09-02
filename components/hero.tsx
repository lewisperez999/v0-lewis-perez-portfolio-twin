"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, MessageCircle } from "lucide-react"
import Image from "next/image"

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Hi, I'm <span className="text-primary">Lewis Perez</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-4">Full Stack Developer & AI Specialist</p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Crafting innovative web solutions with modern technologies. Passionate about creating exceptional user
              experiences and scalable applications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={() => scrollToSection("contact")} className="group">
                Get In Touch
                <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => scrollToSection("ai-chat")} className="group bg-transparent">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with My AI
              </Button>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                <Image
                  src="/professional-developer-portrait.png"
                  alt="Lewis Perez - Professional Developer"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
