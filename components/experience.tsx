import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Briefcase } from "lucide-react"
import { getExperiences, initializeDefaultExperiences } from "@/app/admin/actions/experience"
import { safeDbOperation } from "@/lib/safe-db-operation"

export async function Experience() {
  // Initialize default data if needed (with error handling)
  await safeDbOperation(
    () => initializeDefaultExperiences(),
    undefined,
    'initializeDefaultExperiences'
  )
  
  // Get experiences from database (with fallback to empty array)
  const experiences = await safeDbOperation(
    () => getExperiences(),
    [],
    'getExperiences'
  )

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
        {/* Diagonal elements */}
        <div className="absolute -top-1/3 -right-1/4 w-[70%] h-[120%] bg-gradient-to-bl from-blue-500/8 via-cyan-500/5 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/3 -left-1/4 w-[50%] h-[100%] bg-gradient-to-tr from-purple-500/6 via-blue-500/4 to-transparent -rotate-12 transform-gpu"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-32 left-20 w-56 h-56 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-32 right-20 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Decorative dots */}
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-2/3 right-1/2 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6 animate-fade-in-up">
            <Briefcase className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Career Journey</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-animated">Experience</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            8+ years of enterprise software engineering with measurable impact
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card 
              key={exp.id} 
              className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-1 animate-fade-in-up" 
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl mb-2 gradient-text group-hover:gradient-text-animated">{exp.position}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">{exp.company}</span>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{exp.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-lg">{exp.description}</p>

                {exp.achievements.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3 text-foreground">Key Achievements:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-2 flex-shrink-0"></span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exp.technologies.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3 text-foreground">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-xs bg-gradient-to-r from-blue-600/40 to-purple-600/40 dark:from-blue-600/20 dark:to-purple-600/20 border-blue-500/60 dark:border-blue-500/30 text-blue-800 dark:text-blue-200 hover:from-blue-500/50 hover:to-purple-500/50 dark:hover:from-blue-500/30 dark:hover:to-purple-500/30 transition-all duration-300 hover:scale-105"
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
