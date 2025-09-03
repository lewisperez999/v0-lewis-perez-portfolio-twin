import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Database, Clock, CheckCircle, AlertCircle, FileText, Brain, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
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
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,678</div>
            <p className="text-xs text-muted-foreground">Content chunks indexed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground">-15ms from yesterday</p>
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
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Question about Java experience</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <Badge variant="secondary">Answered</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">AWS architecture inquiry</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
              <Badge variant="secondary">Answered</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Project portfolio request</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
              <Badge variant="secondary">Answered</Badge>
            </div>
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
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Database Connection</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Vector Search</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">AI Model Response</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Fallback Mode
              </Badge>
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

            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="flex items-center space-x-4 p-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Detailed performance data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
