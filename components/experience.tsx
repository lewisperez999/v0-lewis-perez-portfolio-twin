import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

export function Experience() {
  const experiences = [
    {
      title: "Full Stack Developer",
      company: "Freelance",
      location: "Melbourne, Australia",
      period: "Mar 2025 - Present",
      description:
        "Deliver end‑to‑end e‑commerce builds and optimizations using Shopify, Liquid, React/Next.js, and secure payment integrations. Gather requirements, design, implement, and monitor performance/uptime.",
      technologies: ["Shopify", "Liquid", "React", "Next.js", "TypeScript", "Tailwind CSS", "Stripe", "PayPal"],
      achievements: [
        "Launched Shopify store with custom theme and checkout optimizations; conversion +20% in 3 months",
        "Integrated Stripe/PayPal and shipping APIs with PCI‑compliant flows; maintained 99.9% uptime",
        "Reduced support tickets ~30% by improving docs and self‑serve admin workflows",
        "Troubleshot platform incidents to <2 hours downtime per issue",
      ],
    },
    {
      title: "Java Engineer",
      company: "ING Business Shared Services",
      location: "Philippines",
      period: "Nov 2021 - Oct 2022",
      description:
        "Designed and optimized Spring Boot microservices for customer onboarding; implemented secure, reusable API layers with validation, exception handling, and AES‑256 encryption. Mentored junior engineers and led Agile ceremonies.",
      technologies: ["Java", "Spring Boot", "PostgreSQL", "AWS (Lambda, API Gateway, S3, IAM)", "Docker", "Jenkins"],
      achievements: [
        "Reduced API response time from ~500ms to ~200ms; onboarding throughput +30%",
        "Standardized exception handling and validation layers, lowering recurring defects",
        "Mentored 3 junior engineers; sprint velocity +15%",
      ],
    },
    {
      title: "Software Engineer",
      company: "Amdocs Philippines Inc.",
      location: "Philippines",
      period: "Jan 2019 - Oct 2021",
      description:
        "Developed and maintained Java‑based telecom applications; resolved defects, optimized data flows, and improved system availability in a high‑reliability environment.",
      technologies: ["Java", "Spring", "Oracle DB", "MySQL", "PostgreSQL", "ElasticSearch", "Jenkins"],
      achievements: [
        "Improved database query efficiency ~30% via execution‑plan analysis and refactoring",
        "Reduced recurring incidents ~25% by fixing memory/resource issues and adding monitoring",
        "Maintained 97%+ system availability while supporting priority incidents",
      ],
    },
    {
      title: "Advanced Programming Specialist",
      company: "IBM Solutions Delivery Inc.",
      location: "Philippines",
      period: "Mar 2014 - Dec 2018",
      description:
        "Delivered enterprise Java features and large‑scale data migrations; collaborated across global teams to meet delivery timelines under strict quality controls.",
      technologies: ["Java", "ElasticSearch", "Oracle DB", "Jenkins", "Git"],
      achievements: [
        "Built multithreaded migration utility to move 16M+ records into ElasticSearch; migration speed +40%",
        "Reduced post‑release bugs ~15% by instituting stronger test cases and regression checks",
        "Improved cross‑timezone collaboration, cutting resolution time ~20%",
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
