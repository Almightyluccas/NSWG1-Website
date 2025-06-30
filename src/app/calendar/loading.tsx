import { Navbar } from "@/components/navbar";
import { FadeIn } from "@/components/fade-in";
import { Footer } from "@/components/footer";


export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Navbar />

      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-5 w-96 bg-gray-200 dark:bg-zinc-700 rounded mt-2 animate-pulse" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 mb-8 p-6">
              <div className="grid w-full grid-cols-4 gap-4 mb-6">
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded-md animate-pulse" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
                  <div className="grid grid-cols-7 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="py-2 text-center text-sm font-medium text-gray-400 dark:text-zinc-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 auto-rows-fr bg-white dark:bg-zinc-900">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className="border-b border-r border-gray-200 dark:border-zinc-700 p-2 min-h-[120px] flex flex-col space-y-2"
                      >
                        <div className="h-5 w-5 bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                        {Math.random() > 0.6 && (
                          <div className="h-4 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                        )}
                        {Math.random() > 0.7 && (
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                        )}
                        {Math.random() > 0.8 && (
                          <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}