import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import { getFeaturedProjects, initializeDefaultProjects } from "@/app/admin/actions/projects"
import { safeDbOperation } from "@/lib/safe-db-operation"

export async function Projects() {
  // Initialize default data if needed (with error handling)
  await safeDbOperation(
    () => initializeDefaultProjects(),
    undefined,
    'initializeDefaultProjects'
  )
  
  // Get featured projects from database (with fallback to empty array)
  const projects = await safeDbOperation(
    () => getFeaturedProjects(),
    [],
    'getFeaturedProjects'
  )

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise solutions and freelance work showcasing measurable impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in" 
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 gradient-text group-hover:gradient-text-animated">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      {/* No status or featured badges since these columns don't exist */}
                    </div>
                  </div>
                  {(project.demo_url || project.repository_url) && (
                    <div className="flex gap-2">
                      {project.demo_url && (
                        <Button size="sm" variant="outline" asChild className="glass dark:glass border-border dark:border-white/20 text-foreground dark:text-white hover:bg-muted/50 dark:hover:bg-white/10 hover-glow">
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.repository_url && (
                        <Button size="sm" variant="outline" asChild className="glass dark:glass border-border dark:border-white/20 text-foreground dark:text-white hover:bg-muted/50 dark:hover:bg-white/10 hover-glow">
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
                    <h4 className="font-semibold mb-2 text-foreground dark:text-white">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs bg-gradient-to-r from-cyan-600/40 to-blue-600/40 dark:from-cyan-600/20 dark:to-blue-600/20 border-cyan-500/60 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-200 hover:from-cyan-500/50 hover:to-blue-500/50 dark:hover:from-cyan-500/30 dark:hover:to-blue-500/30 transition-all duration-300"
                        >
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
