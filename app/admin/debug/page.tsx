import { checkDatabaseRecords } from "../actions/database-info"

export default async function DebugPage() {
  const dbInfo = await checkDatabaseRecords()
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Debug Information</h1>
      
      <div className="grid gap-6">
        {/* Summary Stats */}
        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{dbInfo.totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dbInfo.contentChunksCount}</div>
              <div className="text-sm text-muted-foreground">Content Chunks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{dbInfo.conversationsCount}</div>
              <div className="text-sm text-muted-foreground">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{dbInfo.tableCount}</div>
              <div className="text-sm text-muted-foreground">Tables</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {dbInfo.error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <h3 className="font-semibold text-destructive mb-2">Error</h3>
            <p className="text-sm">{dbInfo.error}</p>
          </div>
        )}

        {/* Tables List */}
        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
          <div className="grid gap-2">
            {dbInfo.tables.length > 0 ? (
              dbInfo.tables.map(table => (
                <div key={table} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="font-mono text-sm">{table}</span>
                  <span className="text-sm text-muted-foreground">
                    {dbInfo.recordCounts[table] || 0} records
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No tables found</p>
            )}
          </div>
        </div>

        {/* Sample Content Chunks */}
        {dbInfo.sampleChunks && dbInfo.sampleChunks.length > 0 && (
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Sample Content Chunks</h2>
            <div className="grid gap-3">
              {dbInfo.sampleChunks.map(chunk => (
                <div key={chunk.chunk_id} className="p-3 bg-muted/30 rounded border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-muted-foreground">{chunk.chunk_id}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{chunk.chunk_type}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{chunk.title}</h4>
                  <p className="text-xs text-muted-foreground">{chunk.content_length} characters</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Check */}
        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Dashboard Record Count</h2>
          <p className="text-sm text-muted-foreground mb-2">
            The dashboard currently shows the count from:
          </p>
          <div className="p-3 bg-muted/50 rounded">
            {dbInfo.contentChunksCount > 0 ? (
              <p><strong>Content Chunks:</strong> {dbInfo.contentChunksCount} (primary source)</p>
            ) : (
              <p><strong>Total Records:</strong> {dbInfo.totalRecords} (fallback)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}