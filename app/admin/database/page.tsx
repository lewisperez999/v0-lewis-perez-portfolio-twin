import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload } from "lucide-react"
import { DatabaseOperations } from "../components/database-operations"
import { DatabaseSchema } from "../components/database-schema"
import { DatabaseBackup } from "../components/database-backup"

export default function DatabasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Database Operations</h1>
          <p className="text-muted-foreground">Manage PostgreSQL database and data operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <DatabaseOperations />
        </TabsContent>

        <TabsContent value="schema">
          <DatabaseSchema />
        </TabsContent>

        <TabsContent value="backup">
          <DatabaseBackup />
        </TabsContent>
      </Tabs>
    </div>
  )
}
