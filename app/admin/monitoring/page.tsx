import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Download } from "lucide-react"
import { SystemLogs } from "../components/system-logs"
import { PerformanceMetrics } from "../components/performance-metrics"
import { UserAnalytics } from "../components/user-analytics"

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system performance and user analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            View Alerts
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <SystemLogs />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="analytics">
          <UserAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
