"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, Upload } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  imageUrl?: string
  status: "completed" | "in-progress" | "planned"
  category: "enterprise" | "freelance" | "personal"
}

export function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "E-commerce Platform Optimization",
      description: "Optimized Shopify-based e-commerce platform with custom integrations and performance improvements.",
      technologies: ["Shopify", "JavaScript", "Liquid", "CSS", "API Integration"],
      liveUrl: "https://example-store.com",
      status: "completed",
      category: "freelance",
    },
    {
      id: "2",
      name: "Banking Microservices Architecture",
      description: "Designed and implemented scalable microservices architecture for core banking operations.",
      technologies: ["Java", "Spring Boot", "AWS", "PostgreSQL", "Docker"],
      status: "completed",
      category: "enterprise",
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects Portfolio</h2>
          <p className="text-muted-foreground">Manage project showcase and technical achievements</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {isAdding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Add New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input placeholder="Project title" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="enterprise">Enterprise</option>
                  <option value="freelance">Freelance</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Project description and key achievements" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <Input placeholder="React, Node.js, PostgreSQL (comma separated)" />
            </div>
            <div className="space-y-2">
              <Label>Project Image</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <span className="text-sm text-muted-foreground">Recommended: 800x600px, JPG or PNG</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button>Save Project</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {project.name}
                    <Badge variant={project.category === "enterprise" ? "default" : "secondary"}>
                      {project.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{project.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(project.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Technologies:</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {(project.liveUrl || project.githubUrl) && (
                <div className="flex gap-2">
                  {project.liveUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              )}

              <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Project Screenshot</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
