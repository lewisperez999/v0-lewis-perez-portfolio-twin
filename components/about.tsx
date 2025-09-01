import { Card, CardContent } from "@/components/ui/card"
import { Code, Globe, Users, Zap } from "lucide-react"

export function About() {
  const highlights = [
    {
      icon: Code,
      title: "Enterprise Experience",
      description: "8+ years in banking & telecom with secure, scalable systems",
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description: "Cross-cultural experience from Philippines to Australia",
    },
    {
      icon: Users,
      title: "Team Leadership",
      description: "Mentored juniors, boosted team velocity +15%",
    },
    {
      icon: Zap,
      title: "Performance Expert",
      description: "Proven track record of optimization and measurable impact",
    },
  ]

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">About Me</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade reliability with adaptability and measurable impact
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* About Text */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              I'm a seasoned Software Engineer with 8+ years of experience delivering secure, scalable solutions in
              banking and telecommunications. My expertise spans Java, Spring Boot, AWS, and modern full-stack
              technologies, with a proven track record of performance optimization and team leadership.
            </p>
            <p className="text-lg leading-relaxed">
              My journey took me from enterprise roles at IBM, Amdocs, and ING in the Philippines to pursuing advanced
              IT studies in Australia. I've successfully migrated 16M+ records, cut API response times by 60%, and
              mentored teams to achieve higher velocity and fewer incidents.
            </p>
            <p className="text-lg leading-relaxed">
              Currently freelancing in full-stack development while building local Australian experience, I'm passionate
              about solving real-world problems with measurable outcomes. My goal is to contribute to innovative teams
              as a solutions architect or team lead, bringing enterprise reliability with startup agility.
            </p>
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
