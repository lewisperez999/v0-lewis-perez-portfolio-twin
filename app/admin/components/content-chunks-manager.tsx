"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, RefreshCw, Save, X, Loader2, AlertCircle } from "lucide-react"
import { getContentChunks, createContentChunk, updateContentChunk, deleteContentChunk, getContentChunkStats, type ContentChunk } from "../actions/content-chunks"

export function ContentChunksManager() {
  const [chunks, setChunks] = useState<ContentChunk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState({
    totalChunks: 0,
    chunksByType: {} as Record<string, number>,
    totalWords: 0,
    averageWordsPerChunk: 0
  })

  const [formData, setFormData] = useState({
    chunk_id: "",
    title: "",
    content: "",
    chunk_type: "",
    source_file: ""
  })

  const loadChunks = async () => {
    try {
      setLoading(true)
      setError(null)
      const chunksData = await getContentChunks()
      setChunks(chunksData)
    } catch (error) {
      console.error('Failed to load content chunks:', error)
      setError('Failed to load content chunks')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getContentChunkStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Don't set error for stats failure since chunks might still work
    }
  }

  // Load chunks and stats from database
  useEffect(() => {
    loadChunks()
    // Load stats independently so if stats fail, chunks can still load
    loadStats()
  }, [])

  const resetForm = () => {
    setFormData({
      chunk_id: "",
      title: "",
      content: "",
      chunk_type: "",
      source_file: ""
    })
  }

  const handleCreate = () => {
    resetForm()
    setIsCreating(true)
    setEditingId(null)
  }

  const handleEdit = (chunk: ContentChunk) => {
    setFormData({
      chunk_id: chunk.chunk_id,
      title: chunk.title || "",
      content: chunk.content,
      chunk_type: chunk.chunk_type || "",
      source_file: chunk.source_file || ""
    })
    setEditingId(chunk.chunk_id)
    setIsCreating(false)
  }

  const handleCancel = () => {
    resetForm()
    setEditingId(null)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!formData.chunk_id || !formData.content) {
      alert("Please fill in chunk ID and content")
      return
    }

    try {
      setIsSaving(true)
      
      const chunkData = {
        chunk_id: formData.chunk_id,
        title: formData.title || null,
        content: formData.content,
        chunk_type: formData.chunk_type || null,
        source_file: formData.source_file || null,
        word_count: formData.content.split(/\s+/).length
      }

      if (editingId) {
        await updateContentChunk(editingId, chunkData)
      } else {
        await createContentChunk(chunkData)
      }

      await loadChunks()
      await loadStats()
      handleCancel()
    } catch (error) {
      console.error("Error saving content chunk:", error)
      alert("Error saving content chunk. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (chunkId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title || chunkId}"?`)) {
      return
    }

    try {
      await deleteContentChunk(chunkId)
      await loadChunks()
      // Don't break if stats loading fails
      loadStats()
    } catch (error) {
      console.error("Error deleting content chunk:", error)
      alert("Error deleting content chunk. Please try again.")
    }
  }

  const categories = ["all", ...Object.keys(stats.chunksByType)]

  const filteredChunks = chunks.filter((chunk) => {
    const matchesSearch =
      chunk.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.chunk_type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || chunk.chunk_type === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading content chunks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Content Chunks</h2>
            <p className="text-muted-foreground">Manage individual content pieces for vector search</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Content Chunks</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadChunks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Chunks</h2>
          <p className="text-muted-foreground">Manage individual content pieces for vector search</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { loadChunks(); loadStats(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} disabled={!!(isCreating || editingId)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chunk
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalChunks}</div>
            <p className="text-xs text-muted-foreground">Total Chunks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Object.keys(stats.chunksByType).length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Words</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.averageWordsPerChunk}</div>
            <p className="text-xs text-muted-foreground">Avg Words/Chunk</p>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Content Chunk" : "Add New Content Chunk"}</CardTitle>
            <CardDescription>
              {editingId ? "Update content chunk information" : "Create a new content chunk for vector search"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Chunk ID *</Label>
                <Input
                  value={formData.chunk_id}
                  onChange={(e) => setFormData(prev => ({...prev, chunk_id: e.target.value}))}
                  placeholder="e.g., exp_ing_001, skills_java_001"
                  disabled={!!editingId}
                />
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Brief descriptive title"
                />
              </div>

              <div className="space-y-2">
                <Label>Category/Type</Label>
                <Input
                  list="chunk-types"
                  value={formData.chunk_type}
                  onChange={(e) => setFormData(prev => ({...prev, chunk_type: e.target.value}))}
                  placeholder="experience, skills, projects, etc."
                />
                <datalist id="chunk-types">
                  {Object.keys(stats.chunksByType).map(type => (
                    <option key={type} value={type} />
                  ))}
                  <option value="experience" />
                  <option value="skills" />
                  <option value="projects" />
                  <option value="education" />
                  <option value="expertise" />
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Source File</Label>
                <Input
                  value={formData.source_file}
                  onChange={(e) => setFormData(prev => ({...prev, source_file: e.target.value}))}
                  placeholder="source.md, resume.pdf, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                placeholder="The actual content for this chunk..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Word count: {formData.content.split(/\s+/).filter(Boolean).length}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !formData.chunk_id || !formData.content}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? "Saving..." : editingId ? "Update Chunk" : "Add Chunk"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Search Content</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, content, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Chunks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Chunks ({filteredChunks.length})</CardTitle>
          <CardDescription>Individual content pieces indexed for AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChunks.map((chunk) => (
                <TableRow key={chunk.chunk_id}>
                  <TableCell>
                    <code className="text-xs">{chunk.chunk_id}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{chunk.title || "Untitled"}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{chunk.content}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{chunk.chunk_type || "uncategorized"}</Badge>
                  </TableCell>
                  <TableCell>{chunk.word_count}</TableCell>
                  <TableCell>{chunk.updated_at.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(chunk)}
                        disabled={!!(editingId || isCreating)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(chunk.chunk_id, chunk.title || "")}
                        disabled={!!(editingId || isCreating)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {chunks.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No content chunks found</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Content Chunk
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}