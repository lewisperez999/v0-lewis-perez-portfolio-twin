import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

export function Projects() {
  const projects = [
    {
      title: "Banking Microservices Platform",
      description:
        "Secure customer onboarding system with OAuth2 authentication and AES-256 encryption. Reduced API response times by 60% while maintaining strict compliance standards.",
      technologies: ["Java", "Spring Boot", "PostgreSQL", "AWS", "OAuth2", "Microservices"],
      achievements: [
        "Cut API response time from 500ms to 200ms",
        "Boosted onboarding throughput +30%",
        "Zero security incidents in production",
      ],
      type: "Enterprise",
      company: "ING Bank",
    },
    {
      title: "Telecom Data Migration System",
      description:
        "Large-scale data migration solution processing 16M+ records with ElasticSearch optimization. Improved query efficiency and reduced system incidents significantly.",
      technologies: ["Java", "ElasticSearch", "Oracle", "Docker", "Kubernetes"],
      achievements: [
        "Migrated 16M+ records successfully",
        "40% faster delivery timeline",
        "Improved query efficiency +30%",
      ],
      type: "Enterprise",
      company: "IBM",
    },
    {
      title: "E-commerce Optimization Suite",
      description:
        "Modern Shopify-based e-commerce solutions with React frontend. Focused on conversion optimization and responsive design for Australian market.",
      technologies: ["React", "Next.js", "Shopify", "Tailwind CSS", "Node.js"],
      achievements: [
        "Increased sales conversion +20%",
        "Mobile-first responsive design",
        "SEO optimization implementation",
      ],
      type: "Freelance",
      liveUrl: "#",
      githubUrl: "#",
    },
    {
      title: "Performance Monitoring Dashboard",
      description:
        "Real-time system monitoring and analytics dashboard for telecommunications infrastructure. Enhanced system reliability and incident response times.",
      technologies: ["Java", "Spring Boot", "ElasticSearch", "React", "PostgreSQL"],
      achievements: ["Reduced incidents -25%", "Real-time monitoring implementation", "Automated alert system"],
      type: "Enterprise",
      company: "Amdocs",
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
                      <Badge variant={project.type === "Enterprise" ? "default" : "secondary"}>{project.type}</Badge>
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
