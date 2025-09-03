"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, Loader2, Save, X } from "lucide-react"
import { getProjects, createProject, updateProject, deleteProject, type Project } from "../actions/projects"

export function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    role: "",
    technologies: "",
    outcomes: "",
    challenges: "",
    demo_url: "",
    repository_url: "",
    documentation_url: ""
  })

  // Load projects from database
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const projectsData = await getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      role: "",
      technologies: "",
      outcomes: "",
      challenges: "",
      demo_url: "",
      repository_url: "",
      documentation_url: ""
    })
    setEditingId(null)
    setIsAdding(false)
  }

  const handleEdit = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description,
      role: project.role || "",
      technologies: project.technologies.join(", "),
      outcomes: project.outcomes.join("\n"),
      challenges: project.challenges.join("\n"),
      demo_url: project.demo_url || "",
      repository_url: project.repository_url || "",
      documentation_url: project.documentation_url || ""
    })
    setEditingId(project.id)
    setIsAdding(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const projectData = {
        name: formData.name,
        description: formData.description,
        role: formData.role || null,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
        outcomes: formData.outcomes.split("\n").map(o => o.trim()).filter(Boolean),
        challenges: formData.challenges.split("\n").map(c => c.trim()).filter(Boolean),
        demo_url: formData.demo_url || null,
        repository_url: formData.repository_url || null,
        documentation_url: formData.documentation_url || null,
        professional_id: 1 // Default professional ID
      }

      if (editingId) {
        await updateProject(editingId, projectData)
      } else {
        await createProject(projectData)
      }

      await loadProjects()
      resetForm()
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Error saving project. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId)
        await loadProjects()
      } catch (error) {
        console.error("Error deleting project:", error)
        alert("Error deleting project. Please try again.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects Management</h2>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={loading || isAdding || !!editingId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Project" : "Add New Project"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input 
                  placeholder="Project title" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input 
                  placeholder="Your role in the project" 
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Demo URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={formData.demo_url}
                  onChange={(e) => setFormData(prev => ({...prev, demo_url: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Repository URL</Label>
                <Input 
                  placeholder="https://github.com/..." 
                  value={formData.repository_url}
                  onChange={(e) => setFormData(prev => ({...prev, repository_url: e.target.value}))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Documentation URL</Label>
              <Input 
                placeholder="https://docs..." 
                value={formData.documentation_url}
                onChange={(e) => setFormData(prev => ({...prev, documentation_url: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Project description and overview" 
                rows={3} 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <Input 
                placeholder="React, Node.js, PostgreSQL (comma separated)" 
                value={formData.technologies}
                onChange={(e) => setFormData(prev => ({...prev, technologies: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Key Outcomes</Label>
              <Textarea 
                placeholder="List key outcomes, one per line" 
                rows={3} 
                value={formData.outcomes}
                onChange={(e) => setFormData(prev => ({...prev, outcomes: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Challenges</Label>
              <Textarea 
                placeholder="List challenges overcome, one per line" 
                rows={3} 
                value={formData.challenges}
                onChange={(e) => setFormData(prev => ({...prev, challenges: e.target.value}))}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.name || !formData.description}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving..." : "Save Project"}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="mt-2">{project.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(project)}
                      disabled={isAdding || !!editingId}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      disabled={isAdding || !!editingId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.role && (
                  <div>
                    <Label className="text-sm font-medium">Role</Label>
                    <p className="text-sm text-muted-foreground">{project.role}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Technologies</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {project.outcomes.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Key Outcomes</Label>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {project.outcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.challenges.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Challenges</Label>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {project.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(project.demo_url || project.repository_url || project.documentation_url) && (
                  <div className="flex gap-2">
                    {project.demo_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                    )}
                    {project.repository_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Repository
                        </a>
                      </Button>
                    )}
                    {project.documentation_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.documentation_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Documentation
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {projects.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No projects found</p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}