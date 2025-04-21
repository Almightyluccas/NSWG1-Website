import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Skeleton className="h-10 w-full mb-6" />

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardTitle className="p-4 bg-accent/10 border-b border-border">
              <Skeleton className="h-6 w-64" />
            </CardTitle>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {[1, 2, 3, 4].map((j) => (
                  <li key={j} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-48 hidden md:block" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-24 mr-4 hidden md:block" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}