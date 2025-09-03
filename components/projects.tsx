import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import { getFeaturedProjects, initializeDefaultProjects } from "@/app/admin/actions/projects"

export async function Projects() {
  // Initialize default data if needed
  await initializeDefaultProjects()
  
  // Get featured projects from database
  const projects = await getFeaturedProjects()

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
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      {/* No status or featured badges since these columns don't exist */}
                    </div>
                  </div>
                  {(project.demo_url || project.repository_url) && (
                    <div className="flex gap-2">
                      {project.demo_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.repository_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
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

                {/* Extended description not available in current schema */}

                {project.technologies.length > 0 && (
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
