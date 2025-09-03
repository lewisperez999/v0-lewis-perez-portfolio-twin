import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Database, Clock, CheckCircle, AlertCircle, FileText, Brain } from "lucide-react"
import { checkAdminAuth } from "./actions/auth"
import { checkSystemHealth } from "./actions/system-health"
import { getDashboardStats, getRecentActivity } from "./actions/dashboard-stats"

export default async function AdminDashboard() {
  // Check authentication before rendering the page
  await checkAdminAuth()
  
  // Get real system health status and dashboard data
  const [systemHealth, dashboardStats, recentActivity] = await Promise.all([
    checkSystemHealth(),
    getDashboardStats(),
    getRecentActivity()
  ])

  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: "healthy" | "warning" | "error", message: string) => {
    switch (status) {
      case "healthy":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {message}
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {message}
          </Badge>
        )
      case "error":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {message}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your digital twin system and monitor performance</p>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {dashboardStats.systemStatus === "online" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : dashboardStats.systemStatus === "maintenance" ? (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              dashboardStats.systemStatus === "online" ? "text-green-500" : 
              dashboardStats.systemStatus === "maintenance" ? "text-yellow-500" : "text-red-500"
            }`}>
              {dashboardStats.systemStatus === "online" ? "Online" : 
               dashboardStats.systemStatus === "maintenance" ? "Maintenance" : "Offline"}
            </div>
            <p className="text-xs text-muted-foreground">{dashboardStats.systemMessage}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.conversationsGrowth} from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.databaseRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Content chunks indexed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.responseTimeChange} from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Chat Activity</CardTitle>
            <CardDescription>Latest user interactions with the AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium line-clamp-1">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      activity.status === "answered" ? "bg-green-100 text-green-800" :
                      activity.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    {activity.status === "answered" ? "Answered" : 
                     activity.status === "pending" ? "Pending" : "Failed"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.database.status)}
                <span className="text-sm">Database Connection</span>
              </div>
              {getStatusBadge(systemHealth.database.status, systemHealth.database.message)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.vectorSearch.status)}
                <span className="text-sm">Vector Search</span>
              </div>
              {getStatusBadge(systemHealth.vectorSearch.status, systemHealth.vectorSearch.message)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemHealth.aiModel.status)}
                <span className="text-sm">AI Model Response</span>
                {systemHealth.aiModel.model && (
                  <span className="text-xs text-muted-foreground">({systemHealth.aiModel.model})</span>
                )}
              </div>
              {getStatusBadge(systemHealth.aiModel.status, systemHealth.aiModel.message)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex items-center space-x-4 p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Update Content</h3>
                  <p className="text-sm text-muted-foreground">Edit professional data</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex items-center space-x-4 p-4">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Regenerate Embeddings</h3>
                  <p className="text-sm text-muted-foreground">Update vector database</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
