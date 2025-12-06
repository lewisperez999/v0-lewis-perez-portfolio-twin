import { Card, CardContent } from "@/components/ui/card"
import { Code, Globe, Users, Zap, Sparkles } from "lucide-react"
import { getPersonalInfo } from "@/app/admin/actions/personal-info"
import { safeDbOperation } from "@/lib/safe-db-operation"

export async function About() {
  const personalInfo = await safeDbOperation(
    () => getPersonalInfo(),
    null,
    'getPersonalInfo'
  )

  const highlights = [
    {
      icon: Code,
      title: "Enterprise Experience",
      description: personalInfo?.highlights?.[0] || "8+ years in banking & telecom with secure, scalable systems",
    },
    {
      icon: Globe,
      title: "Global Perspective", 
      description: personalInfo?.highlights?.[1] || "Cross-cultural experience from Philippines to Australia",
    },
    {
      icon: Users,
      title: "Team Leadership",
      description: personalInfo?.highlights?.[2] || "Mentored juniors, boosted team velocity +15%",
    },
    {
      icon: Zap,
      title: "Performance Expert",
      description: personalInfo?.highlights?.[3] || "Proven track record of optimization and measurable impact",
    },
  ]

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        {/* Diagonal background elements */}
        <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[100%] bg-gradient-to-br from-cyan-500/5 via-blue-500/3 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-[50%] h-[80%] bg-gradient-to-tl from-purple-500/5 via-pink-500/3 to-transparent -rotate-12 transform-gpu"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Decorative dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-purple-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.7s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Who I Am</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-animated">About Me</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {personalInfo?.tagline || "Enterprise-grade reliability with adaptability and measurable impact"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* About Text */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {personalInfo?.bio ? (
              personalInfo.bio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Senior Software Engineer with 8+ years&apos; experience building secure, scalable microservices and APIs across
                  banking and telecom, complemented by full‑stack freelancing (React/Next.js/Shopify) in Australia. My
                  strengths lie in Java, Spring Boot, PostgreSQL, and AWS, with proven results including 500ms→200ms latency
                  reductions, +30% throughput gains, and 40% faster data migrations.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  I combine enterprise rigor with product speed—optimizing APIs, data flows, and cloud services while
                  coaching teams to deliver. My career journey spans from IBM&apos;s global enterprise systems to ING&apos;s secure
                  banking microservices, and now includes e-commerce optimization for Australian businesses while pursuing
                  advanced studies in cybersecurity and telecommunications.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Focused on cloud‑native architecture, performance optimization, and mentoring, I&apos;m building toward
                  Solutions Architect or Engineering Lead roles. I thrive in feedback-driven environments where I can
                  deliver measurable business impact while fostering team growth and technical excellence.
                </p>
              </>
            )}
          </div>

          {/* Highlights Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <Card 
                key={index} 
                className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 group-hover:scale-110 animate-border-glow">
                    <highlight.icon className="h-7 w-7 text-blue-500 dark:text-blue-400 group-hover:text-purple-500 transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:gradient-text transition-all duration-300">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
