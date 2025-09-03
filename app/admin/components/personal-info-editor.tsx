"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Edit, Loader2, X } from "lucide-react"
import { getPersonalInfo, updatePersonalInfo, type PersonalInfo } from "../actions/personal-info"

export function PersonalInfoEditor() {
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    summary: "",
    bio: "",
    tagline: "",
    highlights: "",
    website: "",
    linkedin: "",
    github: "",
    twitter: ""
  })

  // Load personal info from database
  useEffect(() => {
    loadPersonalInfo()
  }, [])

  const loadPersonalInfo = async () => {
    try {
      setLoading(true)
      const info = await getPersonalInfo()
      setPersonalInfo(info)
      if (info) {
        setFormData({
          name: info.name,
          title: info.title,
          location: info.location,
          email: info.email,
          phone: info.phone,
          summary: info.summary,
          bio: info.bio,
          tagline: info.tagline || "",
          highlights: info.highlights.join("\n"),
          website: info.website || "",
          linkedin: info.linkedin || "",
          github: info.github || "",
          twitter: info.twitter || ""
        })
      }
    } catch (error) {
      console.error("Error loading personal info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (personalInfo) {
      setFormData({
        name: personalInfo.name,
        title: personalInfo.title,
        location: personalInfo.location,
        email: personalInfo.email,
        phone: personalInfo.phone,
        summary: personalInfo.summary,
        bio: personalInfo.bio,
        tagline: personalInfo.tagline || "",
        highlights: personalInfo.highlights.join("\n"),
        website: personalInfo.website || "",
        linkedin: personalInfo.linkedin || "",
        github: personalInfo.github || "",
        twitter: personalInfo.twitter || ""
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const personalData = {
        name: formData.name,
        title: formData.title,
        location: formData.location,
        email: formData.email,
        phone: formData.phone,
        summary: formData.summary,
        bio: formData.bio,
        tagline: formData.tagline || null,
        highlights: formData.highlights.split("\n").map(h => h.trim()).filter(Boolean),
        website: formData.website || undefined,
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        twitter: formData.twitter || undefined
      }

      if (personalInfo) {
        await updatePersonalInfo(personalData)
      } else {
        // Personal info will be created automatically by getPersonalInfo if it doesn't exist
        await updatePersonalInfo(personalData)
      }

      await loadPersonalInfo()
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving personal info:", error)
      alert("Error saving personal information. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading personal information...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <p className="text-muted-foreground">Manage your basic profile information and contact details</p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core profile details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Your full name"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.name || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Professional Title</Label>
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g., Senior Software Engineer"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.title || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              {isEditing ? (
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  placeholder="e.g., Melbourne, Australia"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.location || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="your.email@example.com"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.email || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  placeholder="+61 XXX XXX XXX"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.phone || "Not set"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Professional networking and portfolio links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Website</Label>
              {isEditing ? (
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                  placeholder="https://yourwebsite.com"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.website || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>LinkedIn</Label>
              {isEditing ? (
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({...prev, linkedin: e.target.value}))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.linkedin || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>GitHub</Label>
              {isEditing ? (
                <Input
                  value={formData.github}
                  onChange={(e) => setFormData(prev => ({...prev, github: e.target.value}))}
                  placeholder="https://github.com/yourusername"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.github || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Twitter</Label>
              {isEditing ? (
                <Input
                  value={formData.twitter}
                  onChange={(e) => setFormData(prev => ({...prev, twitter: e.target.value}))}
                  placeholder="https://twitter.com/yourusername"
                />
              ) : (
                <p className="text-sm font-medium">{personalInfo?.twitter || "Not set"}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>Bio and key highlights for your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tagline</Label>
            {isEditing ? (
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({...prev, tagline: e.target.value}))}
                placeholder="A brief professional tagline"
              />
            ) : (
              <p className="text-sm font-medium">{personalInfo?.tagline || "Not set"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Summary</Label>
            {isEditing ? (
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({...prev, summary: e.target.value}))}
                placeholder="Professional summary highlighting your experience and expertise"
                rows={4}
              />
            ) : (
              <p className="text-sm">{personalInfo?.summary || "Not set"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            {isEditing ? (
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                placeholder="Longer bio describing your background and interests"
                rows={4}
              />
            ) : (
              <p className="text-sm">{personalInfo?.bio || "Not set"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Key Highlights</Label>
            {isEditing ? (
              <Textarea
                value={formData.highlights}
                onChange={(e) => setFormData(prev => ({...prev, highlights: e.target.value}))}
                placeholder="List key achievements, one per line"
                rows={4}
              />
            ) : (
              <div className="space-y-1">
                {personalInfo?.highlights && personalInfo.highlights.length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {personalInfo.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No highlights set</p>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !formData.name || !formData.title || !formData.email}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!personalInfo && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No personal information found</p>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Add Personal Information
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}