import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AboutSkeleton() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* About Text Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <div className="pt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </div>

          {/* Highlights Grid Skeleton */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="group">
                <CardContent className="p-6 text-center">
                  <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-4" />
                  <Skeleton className="h-5 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ExperienceSkeleton() {
  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="space-y-8">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <Skeleton className="h-5 w-24 mt-2 sm:mt-0" />
                    </div>
                    
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((tech) => (
                        <Skeleton key={tech} className="h-6 w-16" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProjectsSkeleton() {
  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Card key={index} className="group overflow-hidden">
              <div className="aspect-video bg-muted">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {[1, 2, 3].map((tech) => (
                    <Skeleton key={tech} className="h-5 w-12" />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SkillsSkeleton() {
  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Skills Categories */}
          <div className="space-y-8">
            {[1, 2, 3, 4].map((category) => (
              <div key={category}>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((skill) => (
                    <Card key={skill} className="p-4 text-center">
                      <Skeleton className="w-8 h-8 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Proficiency Chart */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-40 mb-6" />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((skill) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function HeroSkeleton() {
  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-8" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 max-w-xl mx-auto mb-12" />
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-36" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3, 4].map((social) => (
              <Skeleton key={social} className="w-12 h-12 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ContactSkeleton() {
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}