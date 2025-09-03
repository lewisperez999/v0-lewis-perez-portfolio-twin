import { Card, CardContent } from "@/components/ui/card"
import { Code, Globe, Users, Zap } from "lucide-react"
import { getPersonalInfo } from "@/app/admin/actions/personal-info"

export async function About() {
  const personalInfo = await getPersonalInfo()

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
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">About Me</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {personalInfo?.tagline || "Enterprise-grade reliability with adaptability and measurable impact"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* About Text */}
          <div className="space-y-6">
            {personalInfo?.bio ? (
              personalInfo.bio.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  Senior Software Engineer with 8+ years&apos; experience building secure, scalable microservices and APIs across
                  banking and telecom, complemented by full‑stack freelancing (React/Next.js/Shopify) in Australia. My
                  strengths lie in Java, Spring Boot, PostgreSQL, and AWS, with proven results including 500ms→200ms latency
                  reductions, +30% throughput gains, and 40% faster data migrations.
                </p>
                <p className="text-lg leading-relaxed">
                  I combine enterprise rigor with product speed—optimizing APIs, data flows, and cloud services while
                  coaching teams to deliver. My career journey spans from IBM&apos;s global enterprise systems to ING&apos;s secure
                  banking microservices, and now includes e-commerce optimization for Australian businesses while pursuing
                  advanced studies in cybersecurity and telecommunications.
                </p>
                <p className="text-lg leading-relaxed">
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
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <highlight.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{highlight.title}</h3>
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
