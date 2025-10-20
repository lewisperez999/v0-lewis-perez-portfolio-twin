/**
 * Page Loading Skeleton
 * Week 2 Priority 2.1: Enhanced Loading States
 * Provides a better perceived performance while content loads
 */

export function PageSkeleton() {
  return (
    <div className="animate-pulse min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-muted/50 to-muted/30 h-16 w-full" />
      
      {/* Hero Section Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-muted to-muted/50" />
          <div className="flex-1 space-y-4">
            <div className="h-12 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-3/4" />
            <div className="h-6 bg-gradient-to-r from-muted/70 to-muted/40 rounded w-1/2" />
            <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-2/3" />
          </div>
        </div>
      </div>
      
      {/* Content Sections Skeleton */}
      <div className="container mx-auto px-4 space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-6 space-y-3"
                >
                  <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded w-3/4" />
                  <div className="h-4 bg-gradient-to-r from-muted/70 to-muted/40 rounded w-full" />
                  <div className="h-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
