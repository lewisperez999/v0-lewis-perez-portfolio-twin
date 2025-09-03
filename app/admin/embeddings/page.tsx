import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Zap } from "lucide-react"
import { EmbeddingOperations } from "../components/embedding-operations"
import { VectorAnalytics } from "../components/vector-analytics"
import { EmbeddingMonitor } from "../components/embedding-monitor"

export default function EmbeddingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Embedding Management</h1>
          <p className="text-muted-foreground">Manage vector embeddings and search functionality</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Regenerate All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <EmbeddingOperations />
        </TabsContent>

        <TabsContent value="analytics">
          <VectorAnalytics />
        </TabsContent>

        <TabsContent value="monitoring">
          <EmbeddingMonitor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
