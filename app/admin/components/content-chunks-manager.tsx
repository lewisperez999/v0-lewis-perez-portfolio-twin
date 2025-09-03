"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, RefreshCw } from "lucide-react"

interface ContentChunk {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  lastUpdated: string
  wordCount: number
}

export function ContentChunksManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [chunks] = useState<ContentChunk[]>([
    {
      id: "1",
      title: "Java Enterprise Experience",
      content:
        "Extensive experience with Java enterprise development including Spring Boot, microservices architecture, and cloud deployment on AWS...",
      category: "experience",
      tags: ["java", "spring-boot", "aws", "microservices"],
      lastUpdated: "2024-01-15",
      wordCount: 156,
    },
    {
      id: "2",
      title: "Banking Domain Expertise",
      content:
        "Deep understanding of banking systems, payment processing, and financial regulations. Experience with core banking platforms...",
      category: "expertise",
      tags: ["banking", "fintech", "payments", "compliance"],
      lastUpdated: "2024-01-14",
      wordCount: 203,
    },
    {
      id: "3",
      title: "Leadership and Mentoring",
      content:
        "Led development teams of 4-6 engineers, mentored junior developers, and established best practices for code review...",
      category: "skills",
      tags: ["leadership", "mentoring", "team-management"],
      lastUpdated: "2024-01-13",
      wordCount: 89,
    },
  ])

  const categories = ["all", "experience", "expertise", "skills", "projects", "education"]

  const filteredChunks = chunks.filter((chunk) => {
    const matchesSearch =
      chunk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || chunk.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Chunks</h2>
          <p className="text-muted-foreground">Manage individual content pieces for vector search</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Chunk
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Search Content</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, content, or tags..."
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
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChunks.map((chunk) => (
                <TableRow key={chunk.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{chunk.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{chunk.content}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{chunk.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {chunk.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {chunk.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{chunk.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{chunk.wordCount}</TableCell>
                  <TableCell>{chunk.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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
    </div>
  )
}
