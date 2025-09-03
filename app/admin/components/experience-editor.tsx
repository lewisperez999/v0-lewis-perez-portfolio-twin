"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react"
import { getExperiences, createExperience, updateExperience, deleteExperience, type Experience } from "../actions/experience"

export function ExperienceEditor() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    duration: "",
    description: "",
    achievements: "",
    technologies: ""
  })

  // Load experiences from database
  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      setLoading(true)
      const experiencesData = await getExperiences()
      setExperiences(experiencesData)
    } catch (error) {
      console.error("Error loading experiences:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      duration: "",
      description: "",
      achievements: "",
      technologies: ""
    })
    setEditingId(null)
    setIsAdding(false)
  }

  const handleEdit = (experience: Experience) => {
    setFormData({
      company: experience.company,
      position: experience.position,
      start_date: experience.start_date,
      end_date: experience.end_date || "",
      duration: experience.duration || "",
      description: experience.description,
      achievements: experience.achievements.join("\n"),
      technologies: experience.technologies.join(", ")
    })
    setEditingId(experience.id)
    setIsAdding(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const experienceData = {
        company: formData.company,
        position: formData.position,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        duration: formData.duration || null,
        description: formData.description,
        achievements: formData.achievements.split("\n").map(a => a.trim()).filter(Boolean),
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean)
      }

      if (editingId) {
        await updateExperience(editingId, experienceData)
      } else {
        await createExperience(experienceData)
      }

      await loadExperiences()
      resetForm()
    } catch (error) {
      console.error("Error saving experience:", error)
      alert("Error saving experience. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (experienceId: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      try {
        await deleteExperience(experienceId)
        await loadExperiences()
      } catch (error) {
        console.error("Error deleting experience:", error)
        alert("Error deleting experience. Please try again.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Experience Management</h2>
          <p className="text-muted-foreground">Manage your work experience and career history</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={loading || isAdding || !!editingId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Experience" : "Add New Experience"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input 
                  placeholder="Company name" 
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({...prev, company: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Position *</Label>
                <Input 
                  placeholder="Job title" 
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({...prev, position: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input 
                placeholder="e.g., 2 years 6 months" 
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Job description and responsibilities" 
                rows={3} 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Technologies</Label>
              <Input 
                placeholder="Java, Spring Boot, AWS (comma separated)" 
                value={formData.technologies}
                onChange={(e) => setFormData(prev => ({...prev, technologies: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Key Achievements</Label>
              <Textarea 
                placeholder="List key achievements, one per line" 
                rows={4} 
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({...prev, achievements: e.target.value}))}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.company || !formData.position || !formData.description}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving..." : "Save Experience"}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experiences List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading experiences...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{experience.position}</CardTitle>
                    <CardDescription className="text-lg font-medium text-primary">{experience.company}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      {experience.duration || 
                        `${experience.start_date} - ${experience.end_date || 'Present'}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(experience)}
                      disabled={isAdding || !!editingId}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(experience.id)}
                      disabled={isAdding || !!editingId}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{experience.description}</p>
                </div>

                {experience.technologies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Technologies</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {experience.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {experience.achievements.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Key Achievements</Label>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      {experience.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {experiences.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No experiences found</p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Experience
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}