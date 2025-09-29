import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Sparkles } from "lucide-react"

export function AIChatSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat with Lewis
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto px-6">
            <div className="space-y-4 py-4">
              {/* Loading message */}
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                    <Skeleton className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-muted min-w-[200px]">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Suggested questions skeleton */}
        <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
          <div className="text-sm text-muted-foreground mb-3 font-medium">
            Suggested questions:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        </div>
        
        {/* Input skeleton */}
        <div className="p-6 border-t shrink-0">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="w-10 h-10" />
          </div>
          <Skeleton className="h-3 w-64 mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}