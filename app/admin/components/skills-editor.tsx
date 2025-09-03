"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Save, Trash2, X, Loader2 } from "lucide-react"
import { getSkills, createSkill, updateSkill, deleteSkill, type Skill } from "../actions/skills"

export function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    skill_name: "",
    category: "",
    proficiency: "",
    experience_years: "",
    context: "",
    projects: "",
    skill_type: "Technical",
    professional_id: 1
  })

  // Load skills from database
  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      setLoading(true)
      const skillsData = await getSkills()
      setSkills(skillsData)
    } catch (error) {
      console.error("Error loading skills:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      skill_name: "",
      category: "",
      proficiency: "",
      experience_years: "",
      context: "",
      projects: "",
      skill_type: "Technical",
      professional_id: 1
    })
  }

  const handleCreate = () => {
    resetForm()
    setIsCreating(true)
    setEditingId(null)
  }

  const handleEdit = (skill: Skill) => {
    setFormData({
      skill_name: skill.skill_name,
      category: skill.category,
      proficiency: skill.proficiency,
      experience_years: skill.experience_years || "",
      context: skill.context || "",
      projects: skill.projects.join(", "),
      skill_type: skill.skill_type || "Technical",
      professional_id: skill.professional_id || 1
    })
    setEditingId(skill.id)
    setIsCreating(false)
  }

  const handleCancel = () => {
    resetForm()
    setEditingId(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!formData.skill_name || !formData.category || !formData.proficiency) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      
      const skillData = {
        skill_name: formData.skill_name,
        category: formData.category,
        proficiency: formData.proficiency,
        experience_years: formData.experience_years || null,
        context: formData.context || null,
        projects: formData.projects ? formData.projects.split(",").map(p => p.trim()).filter(Boolean) : [],
        skill_type: formData.skill_type || null,
        professional_id: formData.professional_id
      }

      if (editingId) {
        await updateSkill(editingId, skillData)
      } else {
        await createSkill(skillData)
      }

      await loadSkills()
      handleCancel()
    } catch (error) {
      console.error("Error saving skill:", error)
      alert("Error saving skill. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, skillName: string) => {
    if (!confirm(`Are you sure you want to delete "${skillName}"?`)) {
      return
    }

    try {
      await deleteSkill(id)
      await loadSkills()
    } catch (error) {
      console.error("Error deleting skill:", error)
      alert("Error deleting skill. Please try again.")
    }
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const proficiencyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"]
  const skillTypes = ["Technical", "Soft Skill", "Language", "Certification"]
  const categories = [
    "Programming Languages",
    "Frameworks & Libraries", 
    "Databases",
    "Cloud & DevOps",
    "Tools & Software",
    "Soft Skills",
    "Languages",
    "Certifications"
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading skills...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills Management</h2>
          <p className="text-muted-foreground">Manage your technical and professional skills</p>
        </div>
        <Button onClick={handleCreate} disabled={!!(isCreating || editingId)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Skill" : "Add New Skill"}</CardTitle>
            <CardDescription>
              {editingId ? "Update skill information" : "Add a new skill to your portfolio"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Skill Name *</Label>
                <Input
                  value={formData.skill_name}
                  onChange={(e) => setFormData(prev => ({...prev, skill_name: e.target.value}))}
                  placeholder="e.g., React, Python, Leadership"
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Input
                  list="categories"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                  placeholder="Select or type category"
                />
                <datalist id="categories">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Proficiency *</Label>
                <Input
                  list="proficiency-levels"
                  value={formData.proficiency}
                  onChange={(e) => setFormData(prev => ({...prev, proficiency: e.target.value}))}
                  placeholder="Select or type proficiency"
                />
                <datalist id="proficiency-levels">
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Experience Years</Label>
                <Input
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({...prev, experience_years: e.target.value}))}
                  placeholder="e.g., 3, 5+"
                />
              </div>

              <div className="space-y-2">
                <Label>Skill Type</Label>
                <Input
                  list="skill-types"
                  value={formData.skill_type}
                  onChange={(e) => setFormData(prev => ({...prev, skill_type: e.target.value}))}
                  placeholder="Select or type skill type"
                />
                <datalist id="skill-types">
                  {skillTypes.map(type => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Projects (comma-separated)</Label>
                <Input
                  value={formData.projects}
                  onChange={(e) => setFormData(prev => ({...prev, projects: e.target.value}))}
                  placeholder="Project A, Project B, Project C"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Context / Description</Label>
              <Textarea
                value={formData.context}
                onChange={(e) => setFormData(prev => ({...prev, context: e.target.value}))}
                placeholder="Describe your experience with this skill..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !formData.skill_name || !formData.category || !formData.proficiency}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Saving..." : editingId ? "Update Skill" : "Add Skill"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category}
                <Badge variant="secondary">{categorySkills.length} skills</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{skill.skill_name}</h4>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(skill)}
                          disabled={!!(editingId || isCreating)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(skill.id, skill.skill_name)}
                          disabled={!!(editingId || isCreating)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge variant="outline">{skill.proficiency}</Badge>
                      {skill.experience_years && (
                        <Badge variant="secondary">{skill.experience_years} years</Badge>
                      )}
                    </div>
                    
                    {skill.context && (
                      <p className="text-sm text-muted-foreground">{skill.context}</p>
                    )}
                    
                    {skill.projects && skill.projects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {skill.projects.slice(0, 3).map((project, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                        {skill.projects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{skill.projects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skills.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No skills found</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}