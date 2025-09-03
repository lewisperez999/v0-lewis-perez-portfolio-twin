"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export function JsonEditor() {
  const [jsonContent, setJsonContent] = useState(`{
  "personal_info": {
    "name": "Lewis Perez",
    "title": "Senior Software Engineer",
    "location": "Melbourne, Australia",
    "email": "lewis@lewisperez.dev"
  },
  "experience": [
    {
      "company": "ING Bank",
      "position": "Senior Software Engineer",
      "duration": "Jan 2023 - Aug 2024",
      "achievements": [
        "Optimized API response times from 500ms to 200ms",
        "Led team of 4 developers on core banking features"
      ]
    }
  ]
}`)

  const [isValid, setIsValid] = useState(true)
  const [validationError, setValidationError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const validateJson = (content: string) => {
    try {
      JSON.parse(content)
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
    validateJson(content)
  }

  const handleSave = async () => {
    if (!isValid) return

    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleExport = () => {
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mytwin-data.json"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">JSON Data Editor</h2>
          <p className="text-muted-foreground">Direct editing of the complete data structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

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
          <CardTitle>Data Structure</CardTitle>
          <CardDescription>
            Edit the complete JSON structure. Changes will regenerate content chunks and embeddings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jsonContent}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="font-mono text-sm min-h-[500px]"
            placeholder="Enter valid JSON data..."
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Post-Save Actions</CardTitle>
          <CardDescription>Actions that will be performed after saving JSON changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Regenerate content chunks from updated data</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Update vector embeddings for improved search</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Validate data integrity and relationships</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
