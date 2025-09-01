import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

export function Experience() {
  const experiences = [
    {
      title: "Freelance Full Stack Developer",
      company: "Self-Employed",
      location: "Australia",
      period: "2023 - Present",
      description:
        "Delivering modern web solutions using React, Next.js, and Shopify while completing advanced IT studies in Cybersecurity and Telecommunications. Building local Australian experience and client relationships.",
      technologies: ["React", "Next.js", "Shopify", "Tailwind CSS", "Node.js", "PostgreSQL"],
      achievements: [
        "Increased client sales conversion +20% in 3 months with Shopify optimization",
        "Completed IT studies in Cybersecurity and Telecommunications",
        "Built responsive, modern web applications for Australian market",
      ],
    },
    {
      title: "Software Engineer",
      company: "ING Bank",
      location: "Philippines",
      period: "2021 - 2023",
      description:
        "Developed secure banking microservices and APIs in an Agile environment. Focused on performance optimization and customer onboarding systems with strict security and compliance requirements.",
      technologies: ["Java 8+", "Spring Boot", "REST APIs", "PostgreSQL", "AWS", "Microservices"],
      achievements: [
        "Cut API response time from 500ms to 200ms, boosting onboarding throughput +30%",
        "Delivered secure, compliant banking solutions",
        "Collaborated in Agile squads with cross-functional teams",
      ],
    },
    {
      title: "Software Engineer",
      company: "Amdocs",
      location: "Philippines",
      period: "2019 - 2021",
      description:
        "Built telecommunications software solutions focusing on database optimization and system reliability. Worked on large-scale systems serving millions of users with high availability requirements.",
      technologies: ["Java", "Spring Boot", "Oracle", "ElasticSearch", "Hibernate", "Jenkins"],
      achievements: [
        "Improved query efficiency +30%, reduced incidents -25%",
        "Optimized database performance for telecom systems",
        "Maintained high availability for mission-critical applications",
      ],
    },
    {
      title: "Backend Developer",
      company: "IBM",
      location: "Philippines",
      period: "2016 - 2019",
      description:
        "Started career developing enterprise-grade backend systems and data migration solutions. Gained experience in large-scale data processing and cross-team collaboration in global environment.",
      technologies: ["Java", "Spring", "ElasticSearch", "Docker", "Kubernetes", "CI/CD"],
      achievements: [
        "Migrated 16M+ records to ElasticSearch with 40% faster delivery",
        "Mentored junior developers, boosting team sprint velocity +15%",
        "Collaborated with global IBM teams across multiple time zones",
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
