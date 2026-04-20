import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pb-12 pt-24">
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Skeleton className="mb-4 h-32 w-32 rounded-full" />
                  <Skeleton className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-8 w-48" />
                <Skeleton className="mb-2 h-5 w-36" />
                <Skeleton className="mb-4 h-6 w-24 rounded-full" />
                <div className="mt-2 w-full border-t border-gray-200 pt-4 dark:border-zinc-700">
                  <div className="mb-2 flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="mb-2 flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div className="mb-2 flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-20 w-20 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Skeleton className="mb-4 h-10 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="mb-2 h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="last:border-0 flex gap-4 border-b border-gray-200 pb-4 dark:border-zinc-700"
                  >
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-5 w-40" />
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
