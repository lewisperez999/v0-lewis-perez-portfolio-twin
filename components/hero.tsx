"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowDown, MessageCircle, Mic, Sparkles, Code2, Brain } from "lucide-react"
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

  const highlights = [
    { icon: Brain, text: "AI & Machine Learning Integration" },
    { icon: Code2, text: "Full Stack Development Expert" },
    { icon: Sparkles, text: "Modern UI/UX Design" },
  ]

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Animated Background with Diagonal Elements */}
      <div className="absolute inset-0 bg-background">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-shift"></div>
        
        {/* Diagonal split background element */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[80%] h-[150%] bg-gradient-to-bl from-purple-500/8 via-blue-500/5 to-transparent rotate-12 transform-gpu"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[100%] bg-gradient-to-tr from-cyan-500/8 via-blue-500/5 to-transparent -rotate-12 transform-gpu"></div>
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-400/15 to-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Specialty badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI-Powered Full Stack Developer</span>
            </div>
            
            {/* Main headline with enhanced typography */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-balance mb-4 text-foreground animate-fade-in-up leading-tight" style={{ animationDelay: '0.1s' }}>
              Hi, I&apos;m{' '}
              <span className="block sm:inline">
                <span className="gradient-text-animated relative">
                  Lewis Perez
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-2xl -z-10 animate-pulse"></span>
                </span>
              </span>
            </h1>
            
            {/* Subheadline with emphasis on unique value */}
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="text-muted-foreground">Building the future with</span>{' '}
              <span className="gradient-text font-bold">AI + Full Stack</span>
            </p>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Crafting innovative web solutions powered by artificial intelligence. 
              Passionate about creating exceptional user experiences and scalable applications 
              that push the boundaries of what&apos;s possible.
            </p>

            {/* Bullet highlights */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {highlights.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-white/5 to-white/10 dark:from-white/5 dark:to-white/10 border border-white/10 dark:border-white/20 backdrop-blur-sm hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 group"
                >
                  <item.icon className="w-4 h-4 text-blue-500 group-hover:text-purple-500 transition-colors duration-300" />
                  <span className="text-sm font-medium text-foreground/80">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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

          {/* Profile Image with Enhanced Glow Effects */}
          <div className="flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="relative w-80 h-80 lg:w-96 lg:h-96 xl:w-[450px] xl:h-[450px]">
              {/* Outer glow ring animation */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-cyan-500/40 rounded-full blur-3xl animate-glow-pulse-slow opacity-60"></div>
              
              {/* Secondary rotating glow */}
              <div className="absolute -inset-2 bg-gradient-conic from-blue-500/20 via-purple-500/20 via-cyan-500/20 to-blue-500/20 rounded-full animate-spin-slow opacity-50"></div>
              
              {/* Inner glow ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-cyan-500/30 rounded-full blur-2xl animate-glow-breathe"></div>
              
              {/* Image container with glowing border */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-transparent bg-gradient-to-br from-blue-500/50 via-purple-500/50 to-cyan-500/50 p-[3px] animate-border-glow">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-muted/50 backdrop-blur-sm">
                  <Image
                    src="/professional-developer-portrait.avif"
                    alt="Lewis Perez - Professional Developer"
                    fill
                    className="object-cover transition-all duration-700 hover:scale-110 hover:brightness-110"
                    priority
                    quality={90}
                  />
                  {/* Overlay gradient for depth */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 via-transparent to-white/5"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* Floating decorative elements around the image */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-bounce-slow shadow-lg shadow-blue-500/50"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-500 rounded-full animate-bounce-slow shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/2 -right-4 w-2 h-2 bg-cyan-500 rounded-full animate-bounce-slow shadow-lg shadow-cyan-500/50" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
