import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Rocket } from "lucide-react"
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
    <section id="projects" className="py-24 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5"></div>
        {/* Diagonal elements */}
        <div className="absolute -top-1/4 -left-1/4 w-[60%] h-[100%] bg-gradient-to-br from-pink-500/6 via-purple-500/4 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[120%] bg-gradient-to-tl from-cyan-500/6 via-blue-500/4 to-transparent -rotate-12 transform-gpu"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-56 h-56 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.5s' }}></div>
      
      {/* Decorative dots */}
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-cyan-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-pink-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6 animate-fade-in-up">
            <Rocket className="w-4 h-4 text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Portfolio</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-animated">Featured Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Enterprise solutions and freelance work showcasing measurable impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-3 animate-fade-in-up" 
              style={{ animationDelay: `${0.3 + index * 0.15}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl mb-2 gradient-text group-hover:gradient-text-animated">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      {/* No status or featured badges since these columns don't exist */}
                    </div>
                  </div>
                  {(project.demo_url || project.repository_url) && (
                    <div className="flex gap-2">
                      {project.demo_url && (
                        <Button size="sm" variant="outline" asChild className="glass dark:glass border-border dark:border-white/20 text-foreground dark:text-white hover:bg-blue-500/10 dark:hover:bg-white/10 hover-glow transition-all duration-300 hover:scale-105">
                          <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.repository_url && (
                        <Button size="sm" variant="outline" asChild className="glass dark:glass border-border dark:border-white/20 text-foreground dark:text-white hover:bg-purple-500/10 dark:hover:bg-white/10 hover-glow transition-all duration-300 hover:scale-105">
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
                <p className="text-muted-foreground leading-relaxed text-lg">{project.description}</p>

                {/* Extended description not available in current schema */}

                {project.technologies.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3 text-foreground">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-xs bg-gradient-to-r from-cyan-600/40 to-blue-600/40 dark:from-cyan-600/20 dark:to-blue-600/20 border-cyan-500/60 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-200 hover:from-cyan-500/50 hover:to-blue-500/50 dark:hover:from-cyan-500/30 dark:hover:to-blue-500/30 transition-all duration-300 hover:scale-105"
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
