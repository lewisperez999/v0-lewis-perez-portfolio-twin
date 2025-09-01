import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

export function Experience() {
  const experiences = [
    {
      title: "Freelance Full Stack Developer",
      company: "Self-Employed",
      location: "Melbourne, Australia",
      period: "2025 - Present",
      description:
        "Building and deploying modern web solutions with focus on e-commerce optimization and conversion improvement. Complementing enterprise background with full-stack capabilities while pursuing advanced IT studies.",
      technologies: ["React", "Next.js", "Tailwind CSS", "Shopify", "Node.js", "PostgreSQL"],
      achievements: [
        "Built and deployed Shopify e-commerce site with custom themes and secure integrations",
        "Increased client conversion rates by 20% in 3 months through optimization",
        "Delivered responsive, modern web applications for Australian market",
      ],
    },
    {
      title: "Java Engineer",
      company: "ING Bank",
      location: "Philippines",
      period: "2021 - 2022",
      description:
        "Developed secure banking microservices and customer onboarding APIs in highly regulated environment. Focused on performance optimization and mentoring junior engineers in Agile delivery practices.",
      technologies: ["Java 8+", "Spring Boot", "REST APIs", "PostgreSQL", "AWS", "Microservices"],
      achievements: [
        "Optimized onboarding APIs: response time reduced from 500ms → 200ms, throughput up 30%",
        "Mentored 3 junior engineers; sprint velocity improved 15%",
        "Delivered secure, compliant banking solutions with 97%+ uptime",
      ],
    },
    {
      title: "Software Engineer",
      company: "Amdocs",
      location: "Philippines",
      period: "2019 - 2021",
      description:
        "Built telecommunications software solutions focusing on database optimization and system reliability. Worked on large-scale systems serving millions of users with critical uptime requirements.",
      technologies: ["Java", "Spring Boot", "Oracle DB", "ElasticSearch", "Hibernate", "Jenkins"],
      achievements: [
        "Improved query efficiency by 30% and reduced recurring incidents 25%",
        "Ensured 97%+ system availability across critical telecom services",
        "Optimized database performance for high-volume transaction processing",
      ],
    },
    {
      title: "Advanced Programming Specialist",
      company: "IBM",
      location: "Philippines",
      period: "2014 - 2018",
      description:
        "Developed enterprise-grade backend systems and data migration solutions in global environment. Gained experience in large-scale data processing and cross-timezone collaboration with international teams.",
      technologies: ["Java", "Spring", "ElasticSearch", "Docker", "Kubernetes", "CI/CD"],
      achievements: [
        "Developed multithreaded migration utility transferring 16M+ records into ElasticSearch",
        "Cut migration speed by 40%; reduced post-release bugs by 15%",
        "Streamlined cross-timezone collaboration, reducing issue resolution time by 20%",
      ],
    },
  ]

  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Experience</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            8+ years of enterprise software engineering with measurable impact
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">{exp.title}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-primary">{exp.company}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{exp.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{exp.period}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>

                <div>
                  <h4 className="font-semibold mb-2">Key Achievements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
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
