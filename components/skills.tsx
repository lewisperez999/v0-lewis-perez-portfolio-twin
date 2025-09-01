import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function Skills() {
  const skillCategories = [
    {
      title: "Backend Development",
      skills: [
        { name: "Java 8+", level: 95 },
        { name: "Spring Boot", level: 92 },
        { name: "REST APIs", level: 90 },
        { name: "Microservices", level: 88 },
      ],
    },
    {
      title: "Frontend Development",
      skills: [
        { name: "React/Next.js", level: 85 },
        { name: "Tailwind CSS", level: 82 },
        { name: "Shopify (Liquid)", level: 80 },
        { name: "Node.js", level: 78 },
      ],
    },
    {
      title: "Cloud & DevOps",
      skills: [
        { name: "AWS", level: 85 },
        { name: "Docker", level: 80 },
        { name: "Kubernetes", level: 75 },
        { name: "CI/CD", level: 82 },
      ],
    },
  ]

  const additionalSkills = [
    "PostgreSQL",
    "MySQL",
    "Oracle",
    "ElasticSearch",
    "Hibernate",
    "Python",
    "Jenkins",
    "OAuth2",
    "JWT",
    "AES-256",
    "TDD",
    "JUnit",
    "Agile/Scrum",
    "Team Leadership",
    "Mentoring",
    "Performance Optimization",
  ]

  return (
    <section id="skills" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Skills & Expertise</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade technologies with proven results
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {skillCategories.map((category, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.skills.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Additional Skills & Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {additionalSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
