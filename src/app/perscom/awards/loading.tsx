import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading() {{
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-4">
              <div className="flex items-center flex-1">
                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4 ml-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-5 w-5 ml-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}}