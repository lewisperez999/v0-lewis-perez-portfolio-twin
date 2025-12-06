import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Wrench } from "lucide-react"
import { getSkillsByCategory, initializeDefaultSkills } from "@/app/admin/actions/skills"
import { safeDbOperation } from "@/lib/safe-db-operation"

export async function Skills() {
  // Initialize default data if needed (with error handling)
  await safeDbOperation(
    () => initializeDefaultSkills(),
    undefined,
    'initializeDefaultSkills'
  )
  
  // Get skills grouped by category from database (with fallback to empty object)
  const skillsByCategory = await safeDbOperation(
    () => getSkillsByCategory(),
    {} as Record<string, any[]>,
    'getSkillsByCategory'
  )

  // Define main skill categories for the grid layout with progress bars
  const mainCategories = [
    "Programming Languages",
    "Frameworks & Libraries", 
    "Cloud & DevOps",
    "Databases",
    "Backend Frameworks",
    "Frontend", 
    "Frameworks",
    "Databases & Search"
  ]

  // Get additional categories (those not in main categories) for the grouped additional skills
  const additionalCategories = Object.keys(skillsByCategory)
    .filter(category => !mainCategories.includes(category))
    .sort()

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        {/* Diagonal elements */}
        <div className="absolute -top-1/3 -right-1/4 w-[60%] h-[120%] bg-gradient-to-bl from-blue-500/6 via-purple-500/4 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/3 -left-1/4 w-[50%] h-[100%] bg-gradient-to-tr from-cyan-500/6 via-blue-500/4 to-transparent -rotate-12 transform-gpu"></div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-20 right-20 w-56 h-56 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Decorative dots */}
      <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-purple-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '0.7s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse-glow" style={{ animationDelay: '1.2s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6 animate-fade-in-up">
            <Wrench className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Technical Stack</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-animated">Skills & Expertise</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Enterprise-grade technologies with proven results
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {mainCategories.map((category, categoryIndex) => {
            const categorySkills = skillsByCategory[category] || []
            
            if (categorySkills.length === 0) return null

            return (
              <Card 
                key={category} 
                className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-2 animate-fade-in-up h-full"
                style={{ animationDelay: `${0.3 + categoryIndex * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base gradient-text group-hover:gradient-text-animated">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {categorySkills
                    .sort((a, b) => {
                      // Sort by proficiency level (Expert > Advanced > Intermediate > Beginner)
                      const levels = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
                      return (levels[b.proficiency as keyof typeof levels] || 0) - (levels[a.proficiency as keyof typeof levels] || 0);
                    })
                    .slice(0, 5) // Show top 5 skills per category for better balance
                    .map((skill) => (
                      <div key={skill.id} className="space-y-1.5 group/skill">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm font-medium group-hover/skill:text-blue-500 transition-colors truncate">{skill.skill_name}</span>
                          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50 whitespace-nowrap flex-shrink-0">{skill.proficiency}</span>
                        </div>
                        <Progress 
                          value={
                            skill.proficiency === 'Expert' ? 100 :
                            skill.proficiency === 'Advanced' ? 75 :
                            skill.proficiency === 'Intermediate' ? 50 :
                            25
                          } 
                          className="h-1.5" 
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {additionalCategories.length > 0 && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-center">
              <span className="gradient-text">Additional Skills & Technologies</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {additionalCategories.map((category, index) => {
                const categorySkills = skillsByCategory[category] || []
                
                if (categorySkills.length === 0) return null

                return (
                  <Card 
                    key={category}
                    className="group glass dark:glass-dark border-border dark:border-white/10 hover-glow transition-all duration-500 hover:-translate-y-1 animate-fade-in-up h-full"
                    style={{ animationDelay: `${0.7 + index * 0.05}s` }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base group-hover:gradient-text transition-all duration-300">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {categorySkills.map((skill) => (
                          <Badge 
                            key={skill.id} 
                            variant="outline" 
                            className="text-xs py-0.5 px-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105"
                          >
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
