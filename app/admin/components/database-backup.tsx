"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Database, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function DatabaseBackup() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const handleBackup = async () => {
    setIsBackingUp(true)
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsBackingUp(false)
  }

  const handleRestore = async () => {
    setIsRestoring(true)
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRestoring(false)
  }

  // Mock backup history
  const backupHistory = [
    {
      id: 1,
      name: "backup_2025_09_09_13_30.sql",
      size: "2.4 MB",
      date: "2025-09-09 13:30:00",
      status: "completed"
    },
    {
      id: 2,
      name: "backup_2025_09_08_13_30.sql",
      size: "2.3 MB",
      date: "2025-09-08 13:30:00",
      status: "completed"
    },
    {
      id: 3,
      name: "backup_2025_09_07_13_30.sql",
      size: "2.2 MB",
      date: "2025-09-07 13:30:00",
      status: "completed"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Backup & Restore Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Create Backup
            </CardTitle>
            <CardDescription>
              Create a full database backup including all tables and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleBackup} 
              disabled={isBackingUp}
              className="w-full"
            >
              {isBackingUp ? (
                <>
                  <Database className="h-4 w-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Backup will include all portfolio data, embeddings, and chat history
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Database
            </CardTitle>
            <CardDescription>
              Restore database from a previous backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRestore} 
              disabled={isRestoring}
              variant="outline"
              className="w-full"
            >
              {isRestoring ? (
                <>
                  <Database className="h-4 w-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Warning: This will overwrite all current data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Backup Schedule</CardTitle>
          <CardDescription>Current backup configuration and schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Frequency</p>
                <p className="text-xs text-muted-foreground">Daily at 1:30 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Retention</p>
                <p className="text-xs text-muted-foreground">30 days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>Recent database backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{backup.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {backup.date} • {backup.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {backup.status}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Always test backups in a development environment before 
          performing production restores. Backup files contain sensitive data and should be 
          stored securely.
        </AlertDescription>
      </Alert>
    </div>
  )
}