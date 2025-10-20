import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Experience } from "@/components/experience"
import { Projects } from "@/components/projects"
import { Skills } from "@/components/skills"
import { Contact } from "@/components/contact"
import { AIChatWrapper } from "@/components/ai-chat-wrapper"
import { 
  AboutSkeleton, 
  ExperienceSkeleton, 
  ProjectsSkeleton, 
  SkillsSkeleton 
} from "@/components/ui/section-skeletons"

// Enable ISR (Incremental Static Regeneration) - revalidate every hour
export const revalidate = 3600;

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Suspense fallback={<AboutSkeleton />}>
        <About />
      </Suspense>
      <Suspense fallback={<ExperienceSkeleton />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<ProjectsSkeleton />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<SkillsSkeleton />}>
        <Skills />
      </Suspense>
      <section id="ai-chat" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Chat with my AI</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Have questions about my experience, skills, or projects? Chat with my AI assistant 
            to get detailed answers about my professional background.
          </p>
          <AIChatWrapper />
        </div>
      </section>
      <Contact />
    </main>
  )
}
