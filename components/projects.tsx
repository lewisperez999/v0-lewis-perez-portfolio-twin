import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

export function Projects() {
  const projects = [
    {
      title: "Shopify E‑commerce Build (Gintuan atbp)",
      description:
        "Custom Shopify store with theme development, secure Stripe/PayPal integrations, and checkout optimizations; analytics‑driven iteration to lift conversions.",
      technologies: ["Shopify", "Liquid", "React", "Next.js", "Stripe", "PayPal", "Tailwind CSS"],
      achievements: [
        "Conversion rate +20% in 3 months",
        "Support tickets −30% after documentation improvements",
        "99.9% uptime maintained",
      ],
      type: "Freelance",
      liveUrl: "https://gintuanatbp.com/",
    },
    {
      title: "Portfolio Website (Next.js + Payload CMS)",
      description:
        "Personal portfolio integrated with a headless CMS for projects, blog, and case studies. Focus on performance, SEO, and modern UI.",
      technologies: ["Next.js", "React", "Payload CMS", "Tailwind CSS"],
      achievements: [
        "Faster authoring & content updates",
        "Improved Lighthouse and SEO scores",
        "Type safety across CMS and frontend",
      ],
      type: "Personal",
      liveUrl: "https://www.lewisperez.dev/",
      githubUrl: "https://github.com/lewisperez999/portfolio-cms-payload",
    },
    {
      title: "ING Onboarding Microservices",
      description:
        "Performance and reliability improvements for customer onboarding APIs; standardized validation and exception handling with security best practices.",
      technologies: ["Java", "Spring Boot", "PostgreSQL", "AWS", "Docker", "Jenkins"],
      achievements: ["Response time ~500ms→~200ms", "Throughput +30%", "Defects reduced via standardization"],
      type: "Enterprise",
      company: "ING Business Shared Services",
    },
    {
      title: "IBM ElasticSearch Data Migration Utility",
      description:
        "Multithreaded Java tool to migrate 16M+ records into ElasticSearch with integrity checks and logging for traceability.",
      technologies: ["Java", "ElasticSearch", "Oracle DB", "Jenkins"],
      achievements: ["Migration speed +40%", "Reduced post‑release bugs ~15%", "16M+ records migrated successfully"],
      type: "Enterprise",
      company: "IBM Solutions Delivery Inc.",
    },
    {
      title: "Amdocs Telecom Reliability Improvements",
      description: "Stability and performance program focused on SQL optimization, memory management, and monitoring.",
      technologies: ["Java", "Spring", "Oracle DB", "ElasticSearch", "Jenkins"],
      achievements: ["Query efficiency +30%", "Recurring incidents −25%", "97%+ availability maintained"],
      type: "Enterprise",
      company: "Amdocs Philippines Inc.",
    },
  ]

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise solutions and freelance work showcasing measurable impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant={
                          project.type === "Enterprise"
                            ? "default"
                            : project.type === "Freelance"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.type}
                      </Badge>
                      {project.company && <span className="text-sm text-muted-foreground">@ {project.company}</span>}
                    </div>
                  </div>
                  {(project.liveUrl || project.githubUrl) && (
                    <div className="flex gap-2">
                      {project.liveUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.githubUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>

                <div>
                  <h4 className="font-semibold mb-2">Key Results:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {project.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
