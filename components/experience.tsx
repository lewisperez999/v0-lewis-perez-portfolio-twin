import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
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
    <section id="experience" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            8+ years of enterprise software engineering with measurable impact
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card 
              key={exp.id} 
              className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2 gradient-text group-hover:gradient-text-animated">{exp.position}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-cyan-400">{exp.company}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{exp.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>

                {exp.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Achievements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {exp.technologies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground dark:text-white">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-xs bg-gradient-to-r from-blue-600/40 to-purple-600/40 dark:from-blue-600/20 dark:to-purple-600/20 border-blue-500/60 dark:border-blue-500/30 text-blue-800 dark:text-blue-200 hover:from-blue-500/50 hover:to-purple-500/50 dark:hover:from-blue-500/30 dark:hover:to-purple-500/30 transition-all duration-300"
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
