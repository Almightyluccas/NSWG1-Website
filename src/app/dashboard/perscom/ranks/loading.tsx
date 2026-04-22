import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Skeleton className="h-10 w-full mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="flex flex-col md:flex-row overflow-hidden">
            <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center items-center md:w-1/4">
              <Skeleton className="h-20 w-20" />
            </div>
            <div className="flex-1">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex items-center mt-2 md:mt-0">
                    <Skeleton className="h-6 w-12 rounded mr-2" />
                    <Skeleton className="h-6 w-12 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
