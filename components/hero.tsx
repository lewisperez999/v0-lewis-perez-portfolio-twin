"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowDown, MessageCircle, Mic } from "lucide-react"
import Image from "next/image"
import { VoiceChat } from "@/components/voice-chat"
import { SignedIn } from "@clerk/nextjs"

export function Hero() {
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-shift"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-balance mb-6 text-foreground">
              Hi, I&apos;m <span className="gradient-text-animated">Lewis Perez</span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground mb-4 font-medium">
              Full Stack Developer & <span className="gradient-text">AI Specialist</span>
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Crafting innovative web solutions with modern technologies. Passionate about creating exceptional user
              experiences and scalable applications that push the boundaries of what&apos;s possible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={() => scrollToSection("contact")} 
                className="group glow-primary hover-glow bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 dark:from-blue-600 dark:to-purple-600 border-0 text-white font-semibold px-8 py-3 text-lg"
              >
                Get In Touch
                <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => scrollToSection("ai-chat")} 
                className="group glow-secondary hover-glow bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 dark:from-cyan-600/90 dark:to-blue-600/90 dark:hover:from-cyan-500 dark:hover:to-blue-500 border-0 text-white font-semibold px-8 py-3 text-lg shadow-lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with My AI
              </Button>
              {/* Voice Chat - Only for signed-in users */}
              <SignedIn>
                <Dialog open={voiceDialogOpen} onOpenChange={setVoiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="group glow-accent hover-glow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 dark:from-purple-600/90 dark:to-pink-600/90 dark:hover:from-purple-500 dark:hover:to-pink-500 border-0 text-white font-semibold px-8 py-3 text-lg shadow-lg"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Speak with My AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl w-[95vw] h-[85vh] bg-background/95 backdrop-blur-md border border-border dark:border-white/20 shadow-2xl p-0 flex flex-col">
                    <div className="p-6 pb-4 border-b border-border/50 shrink-0">
                      <DialogHeader>
                        <DialogTitle className="gradient-text text-2xl font-bold">Voice Chat with Lewis&apos;s AI Assistant</DialogTitle>
                        <p className="text-sm text-white/80 mt-2">Have a natural conversation about my experience, skills, and projects</p>
                      </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <VoiceChat voice="alloy" className="h-full" />
                    </div>
                  </DialogContent>
                </Dialog>
              </SignedIn>
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[420px] xl:h-[420px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-500/30 rounded-full blur-3xl animate-glow-pulse"></div>
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-muted/50 backdrop-blur-sm hover-glow">
                <Image
                  src="/professional-developer-portrait.avif"
                  alt="Lewis Perez - Professional Developer"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
