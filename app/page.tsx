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
      <AIChatWrapper />
      <Contact />
    </main>
  )
}
