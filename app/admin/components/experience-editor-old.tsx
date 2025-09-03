"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  location: string
  description: string
  achievements: string[]
  technologies: string[]
}

export function ExperienceEditor() {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      company: "ING Bank",
      position: "Senior Software Engineer",
      startDate: "2023-01",
      endDate: "2024-08",
      location: "Melbourne, Australia",
      description: "Led development of critical banking microservices and API optimization initiatives.",
      achievements: [
        "Optimized API response times from 500ms to 200ms",
        "Led team of 4 developers on core banking features",
        "Implemented comprehensive monitoring and alerting",
      ],
      technologies: ["Java", "Spring Boot", "AWS", "PostgreSQL", "Docker"],
    },
    {
      id: "2",
      company: "Amdocs",
      position: "Software Engineer",
      startDate: "2021-03",
      endDate: "2022-12",
      location: "Melbourne, Australia",
      description: "Developed telecom billing and customer management systems.",
      achievements: [
        "Built scalable billing microservices",
        "Improved system performance by 40%",
        "Mentored junior developers",
      ],
      technologies: ["Java", "Spring", "Oracle", "Kubernetes", "Jenkins"],
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleEdit = (id: string) => {
    setEditingId(id)
    setIsAdding(false)
  }

  const handleSave = () => {
    setEditingId(null)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  const addNewExperience = () => {
    setIsAdding(true)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <p className="text-muted-foreground">Manage professional work history and achievements</p>
        </div>
        <Button onClick={addNewExperience}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {isAdding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Add New Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Company name" />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input placeholder="Job title" />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" placeholder="Leave empty if current" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Role description and responsibilities" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{experience.position}</CardTitle>
                <CardDescription>
                  {experience.company} • {experience.location} • {experience.startDate} - {experience.endDate}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(experience.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(experience.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingId === experience.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input defaultValue={experience.company} placeholder="Company" />
                    <Input defaultValue={experience.position} placeholder="Position" />
                  </div>
                  <Textarea defaultValue={experience.description} placeholder="Description" />
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm">{experience.description}</p>
                  <div>
                    <h4 className="font-medium mb-2">Key Achievements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {experience.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
