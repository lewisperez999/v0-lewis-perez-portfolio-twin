"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "glass dark:glass-dark border-b border-border dark:border-white/10 glow-secondary" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="font-bold text-xl gradient-text">Lewis Perez</div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("about")}
              className={`text-foreground/80 hover:text-foreground ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground/90 dark:hover:text-white'} transition-all duration-300 hover:glow-secondary font-medium`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("experience")}
              className={`text-foreground/80 hover:text-foreground ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground/90 dark:hover:text-white'} transition-all duration-300 hover:glow-secondary font-medium`}
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className={`text-foreground/80 hover:text-foreground ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground/90 dark:hover:text-white'} transition-all duration-300 hover:glow-secondary font-medium`}
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection("ai-chat")}
              className={`text-foreground/80 hover:text-foreground ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground/90 dark:hover:text-white'} transition-all duration-300 hover:glow-secondary font-medium`}
            >
              AI Chat
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`text-foreground/80 hover:text-foreground ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground/90 dark:hover:text-white'} transition-all duration-300 hover:glow-secondary font-medium`}
            >
              Contact
            </button>

            {/* Clerk Authentication */}
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton 
                  mode="modal"
                  fallbackRedirectUrl="/"
                  forceRedirectUrl="/"
                >
                  <Button variant="outline" size="sm" className="glass dark:glass border-border dark:border-white/20 text-foreground dark:text-white hover:bg-muted/50 dark:hover:bg-white/10 hover-glow">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:bg-muted/50 dark:hover:bg-white/10 hover-glow">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Clerk Authentication - Mobile */}
            <SignedOut>
              <SignInButton 
                mode="modal"
                fallbackRedirectUrl="/"
                forceRedirectUrl="/"
              >
                <Button variant="outline" size="sm" className="glass border-white/20 text-white hover:bg-white/10 hover-glow">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:bg-white/10 hover-glow">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hover:bg-white/10 hover-glow">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass dark:glass-dark border-t border-border dark:border-white/10">
            <nav className="flex flex-col space-y-4 p-4">
              <button
                onClick={() => scrollToSection("about")}
                className={`text-left text-foreground hover:text-primary ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground dark:hover:text-primary'} transition-colors`}
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("experience")}
                className={`text-left text-foreground hover:text-primary ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground dark:hover:text-primary'} transition-colors`}
              >
                Experience
              </button>
              <button
                onClick={() => scrollToSection("skills")}
                className={`text-left text-foreground hover:text-primary ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground dark:hover:text-primary'} transition-colors`}
              >
                Skills
              </button>
              <button
                onClick={() => scrollToSection("ai-chat")}
                className={`text-left text-foreground hover:text-primary ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground dark:hover:text-primary'} transition-colors`}
              >
                AI Chat
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`text-left text-foreground hover:text-primary ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground dark:hover:text-primary'} transition-colors`}
              >
                Contact
              </button>

              {/* Admin Link - Mobile - Only for signed-in users */}
              <SignedIn>
                <a
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left text-foreground hover:text-primary ${isScrolled ? 'dark:text-black dark:hover:text-black/80' : 'dark:text-foreground dark:hover:text-primary'} transition-colors block`}
                >
                  Admin
                </a>
              </SignedIn>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
