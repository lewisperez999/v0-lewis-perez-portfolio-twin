import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getSkillsByCategory, initializeDefaultSkills } from "@/app/admin/actions/skills"

export async function Skills() {
  // Initialize default data if needed
  await initializeDefaultSkills()
  
  // Get skills grouped by category from database
  const skillsByCategory = await getSkillsByCategory()

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
    <section id="skills" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Skills & Expertise</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade technologies with proven results
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {mainCategories.map((category) => {
            const categorySkills = skillsByCategory[category] || []
            
            if (categorySkills.length === 0) return null

            return (
              <Card key={category} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categorySkills
                    .sort((a, b) => {
                      // Sort by proficiency level (Expert > Advanced > Intermediate > Beginner)
                      const levels = { 'Expert': 4, 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
                      return (levels[b.proficiency as keyof typeof levels] || 0) - (levels[a.proficiency as keyof typeof levels] || 0);
                    })
                    .slice(0, 6) // Show top 6 skills per category
                    .map((skill) => (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{skill.skill_name}</span>
                          <span className="text-xs text-muted-foreground">{skill.proficiency}</span>
                        </div>
                        <Progress 
                          value={
                            skill.proficiency === 'Expert' ? 100 :
                            skill.proficiency === 'Advanced' ? 75 :
                            skill.proficiency === 'Intermediate' ? 50 :
                            25
                          } 
                          className="h-2" 
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {additionalCategories.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center">Additional Skills & Technologies</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalCategories.map((category) => {
                const categorySkills = skillsByCategory[category] || []
                
                if (categorySkills.length === 0) return null

                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill) => (
                          <Badge key={skill.id} variant="outline" className="text-sm py-1 px-3">
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
