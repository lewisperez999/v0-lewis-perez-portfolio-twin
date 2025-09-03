"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Edit, Upload } from "lucide-react"

export function PersonalInfoEditor() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [personalData, setPersonalData] = useState({
    name: "Lewis Perez",
    title: "Senior Software Engineer",
    location: "Melbourne, Australia",
    email: "lewis@lewisperez.dev",
    phone: "+61 XXX XXX XXX",
    summary:
      "Experienced software engineer with 8+ years in enterprise development, specializing in Java, Spring Boot, and AWS cloud solutions. Currently freelancing and pursuing advanced studies in Melbourne.",
    bio: "Passionate about building scalable enterprise solutions and mentoring development teams. Experienced in full-stack development with a focus on backend architecture and cloud infrastructure.",
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic profile information and contact details</CardDescription>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={personalData.name}
                onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={personalData.title}
                onChange={(e) => setPersonalData({ ...personalData, title: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={personalData.location}
                onChange={(e) => setPersonalData({ ...personalData, location: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalData.email}
                onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={personalData.summary}
              onChange={(e) => setPersonalData({ ...personalData, summary: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Detailed Bio</Label>
            <Textarea
              id="bio"
              value={personalData.bio}
              onChange={(e) => setPersonalData({ ...personalData, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload and manage profile images</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold">LP</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Photo
              </Button>
              <p className="text-xs text-muted-foreground">Recommended: 400x400px, JPG or PNG, max 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
