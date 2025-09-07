"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Download, Upload, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getPersonalInfo } from "../actions/personal-info"
import { getExperiences } from "../actions/experience"
import { getProjects } from "../actions/projects"
import { getSkills } from "../actions/skills"
import { getContentChunks } from "../actions/content-chunks"
import { bulkUpdatePortfolioData, validatePortfolioData, type BulkUpdateResult } from "../actions/bulk-operations"

interface PortfolioData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personal_info: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experiences: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skills: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content_chunks: any[]
  exported_at: string
}

export function JsonEditor() {
  const [jsonContent, setJsonContent] = useState("")
  const [isValid, setIsValid] = useState(true)
  const [validationError, setValidationError] = useState("")
  const [isSaving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [saveResult, setSaveResult] = useState<BulkUpdateResult | null>(null)

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true)
      
      // Load all portfolio data
      const [personalInfo, experiences, projects, skills, contentChunks] = await Promise.all([
        getPersonalInfo(),
        getExperiences(),
        getProjects(),
        getSkills(),
        getContentChunks()
      ])

      const portfolioData: PortfolioData = {
        personal_info: personalInfo,
        experiences: experiences,
        projects: projects,
        skills: skills,
        content_chunks: contentChunks,
        exported_at: new Date().toISOString()
      }

      const jsonString = JSON.stringify(portfolioData, null, 2)
      setJsonContent(jsonString)
      setIsValid(true)
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error("Error loading portfolio data:", error)
      setValidationError("Failed to load portfolio data from database")
      setIsValid(false)
    } finally {
      setIsLoading(false)
    }
  }

  const validateJson = async (content: string) => {
    try {
      const parsed = JSON.parse(content)
      
      // Use the comprehensive validation function
      const validation = await validatePortfolioData(parsed)
      
      if (!validation.valid) {
        setIsValid(false)
        setValidationError(validation.errors.join(', '))
        return false
      }

      setIsValid(true)
      setValidationError("")
      return true
    } catch (error) {
      setIsValid(false)
      setValidationError(error instanceof Error ? error.message : "Invalid JSON")
      return false
    }
  }

  const handleJsonChange = (content: string) => {
    setJsonContent(content)
    setSaveResult(null) // Clear save results when JSON is modified
    validateJson(content) // This is now async but we don't need to await it for real-time validation
  }

  const handleSave = async () => {
    if (!isValid) return

    setSaving(true)
    setSaveResult(null)
    
    try {
      // Parse the JSON content
      const portfolioData = JSON.parse(jsonContent)
      
      // Validate the data structure
      const validation = await validatePortfolioData(portfolioData)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }
      
      // Perform bulk update
      console.log("Starting bulk update of portfolio data...")
      const result = await bulkUpdatePortfolioData({
        personal_info: portfolioData.personal_info,
        experiences: portfolioData.experiences || [],
        projects: portfolioData.projects || [],
        skills: portfolioData.skills || [],
        content_chunks: portfolioData.content_chunks || []
      })
      
      setSaveResult(result)
      
      if (result.success) {
        setLastUpdated(new Date())
        console.log("Portfolio data saved successfully:", result)
        
        // Reload data to reflect changes
        await loadPortfolioData()
      } else {
        console.error("Save failed with errors:", result.errors)
      }
      
    } catch (error) {
      console.error("Error saving portfolio data:", error)
      setSaveResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        updated: {
          personalInfo: false,
          experiences: 0,
          projects: 0,
          skills: 0,
          contentChunks: 0
        },
        errors: [error instanceof Error ? error.message : "Unknown error occurred"]
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          handleJsonChange(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getDataStats = () => {
    try {
      const data = JSON.parse(jsonContent)
      return {
        experiences: Array.isArray(data.experiences) ? data.experiences.length : 0,
        projects: Array.isArray(data.projects) ? data.projects.length : 0,
        skills: Array.isArray(data.skills) ? data.skills.length : 0,
        contentChunks: Array.isArray(data.content_chunks) ? data.content_chunks.length : 0,
        hasPersonalInfo: !!data.personal_info
      }
    } catch {
      return {
        experiences: 0,
        projects: 0,
        skills: 0,
        contentChunks: 0,
        hasPersonalInfo: false
      }
    }
  }

  const stats = getDataStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading portfolio data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">JSON Data Editor</h2>
          <p className="text-muted-foreground">Complete portfolio data structure from database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPortfolioData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload from DB
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.hasPersonalInfo ? "✓" : "✗"}</div>
            <p className="text-xs text-muted-foreground">Personal Info</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.experiences}</div>
            <p className="text-xs text-muted-foreground">Experiences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.skills}</div>
            <p className="text-xs text-muted-foreground">Skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.contentChunks}</div>
            <p className="text-xs text-muted-foreground">Content Chunks</p>
          </CardContent>
        </Card>
      </div>

      {/* Save Result */}
      {saveResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              {saveResult.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Save Completed Successfully</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    All data updated
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Save Failed</span>
                  <Badge variant="destructive">Errors occurred</Badge>
                </>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{saveResult.message}</p>
            
            {/* Save details */}
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Personal Info:</span>
                <span className={saveResult.updated.personalInfo ? "text-green-600" : "text-muted-foreground"}>
                  {saveResult.updated.personalInfo ? "✓ Updated" : "No changes"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Experiences:</span>
                <span className="text-blue-600">{saveResult.updated.experiences} updated</span>
              </div>
              <div className="flex justify-between">
                <span>Projects:</span>
                <span className="text-blue-600">{saveResult.updated.projects} updated</span>
              </div>
              <div className="flex justify-between">
                <span>Skills:</span>
                <span className="text-blue-600">{saveResult.updated.skills} updated</span>
              </div>
              <div className="flex justify-between">
                <span>Content Chunks:</span>
                <span className="text-blue-600">{saveResult.updated.contentChunks} updated</span>
              </div>
            </div>
            
            {/* Show errors if any */}
            {saveResult.errors && saveResult.errors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errors encountered:</p>
                    {saveResult.errors.map((error, index) => (
                      <p key={index} className="text-xs">{error}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            {isValid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Valid JSON structure</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Ready to save
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">Invalid JSON</span>
                <Badge variant="destructive">Syntax error</Badge>
              </>
            )}
            {lastUpdated && (
              <span className="text-sm text-muted-foreground ml-4">
                Last updated: {lastUpdated.toLocaleString()}
              </span>
            )}
          </div>
          {!isValid && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* JSON Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Portfolio Data Structure</CardTitle>
          <CardDescription>
            Live data from the database. Export for backup or import to restore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jsonContent}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="font-mono text-sm min-h-[500px]"
            placeholder="Loading portfolio data..."
          />
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About JSON Editor</CardTitle>
          <CardDescription>How to use this interface effectively</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span><strong>Reload from DB:</strong> Fetches the latest data from the database, overwriting any unsaved changes</span>
            </div>
            <div className="flex items-start gap-3">
              <Download className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span><strong>Export:</strong> Download the current JSON as a backup file</span>
            </div>
            <div className="flex items-start gap-3">
              <Upload className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span><strong>Import:</strong> Load JSON data from a file (validates structure before allowing save)</span>
            </div>
            <div className="flex items-start gap-3">
              <Save className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span><strong>Save Changes:</strong> Write modified data back to the database (full implementation pending)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}