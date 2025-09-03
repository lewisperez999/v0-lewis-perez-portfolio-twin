import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download } from "lucide-react"
import { PersonalInfoEditor } from "../components/personal-info-editor"
import { ExperienceEditor } from "../components/experience-editor"
import { ProjectsEditor } from "../components/projects-editor"
import { ContentChunksManager } from "../components/content-chunks-manager"
import { JsonEditor } from "../components/json-editor"

export default function ContentManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Manage professional data, content chunks, and JSON structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="chunks">Content Chunks</TabsTrigger>
          <TabsTrigger value="json">JSON Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoEditor />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceEditor />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsEditor />
        </TabsContent>

        <TabsContent value="chunks">
          <ContentChunksManager />
        </TabsContent>

        <TabsContent value="json">
          <JsonEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
