import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ServerRoleGuard from "@/components/auth/server-role-guard"
import { Rank } from "@/types/api/perscomApi"
import { UserRole } from "@/types/database"
import Image from "next/image"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { perscom } from "@/lib/perscom/api";

const RANKS_PER_PAGE = 12

export default async function RanksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const ranks: Rank[] = await perscom.get.ranks()
  const currentPage = Number((await searchParams).page) || 1

  const totalRanks = ranks.length
  const totalPages = Math.ceil(totalRanks / RANKS_PER_PAGE)
  const startIndex = (currentPage - 1) * RANKS_PER_PAGE
  const paginatedRanks = ranks.slice(startIndex, startIndex + RANKS_PER_PAGE)

  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PERSCOM Ranks</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Military rank structure and insignia for Naval Special Warfare Group One
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedRanks.map((rank) => (
            <Card key={rank.id} className="flex flex-col md:flex-row overflow-hidden">
              <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center items-center md:w-1/4">
                <Image
                  src={rank.image?.image_url || "/placeholder.svg"}
                  alt={rank.name}
                  className="h-20 w-20 object-contain"
                  width={80}
                  height={80}
                />
              </div>
              <div className="flex-1">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <CardTitle>{rank.name}</CardTitle>
                    <div className="flex items-center mt-2 md:mt-0">
                      <span className="text-sm font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded mr-2">
                        {rank.abbreviation}
                      </span>
                      <span className="text-sm font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {rank.paygrade}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/*<CardDescription className="text-gray-500 dark:text-zinc-400">{rank.description}</CardDescription>*/}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`/perscom/ranks?page=${currentPage - 1}`} />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={`/perscom/ranks?page=${page}`}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`/perscom/ranks?page=${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </ServerRoleGuard>
  )
}