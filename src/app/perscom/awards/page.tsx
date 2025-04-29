import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAwards } from "@/lib/perscomApi"
import { Award } from "@/types/perscomApi"
import { UserRole } from "@/types/database"
import ServerRoleGuard from "@/components/auth/server-role-guard"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import Image from "next/image"
import { sanitizeHtmlServer } from "@/lib/sanitizeHtmlClient";

const AWARDS_PER_PAGE = 9

export default async function AwardsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1

  const allAwards: Award[] = await getAwards()

  const totalAwards = allAwards.length
  const totalPages = Math.ceil(totalAwards / AWARDS_PER_PAGE)

  const startIndex = (currentPage - 1) * AWARDS_PER_PAGE
  const paginatedAwards = allAwards.slice(startIndex, startIndex + AWARDS_PER_PAGE)

  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PERSCOM Awards</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Recognitions and decorations awarded to members of Naval Special Warfare Group One
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAwards.map((award) => (
            <Card key={award.id} className="overflow-hidden">
              <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center">
                <Image
                  src={award.image?.image_url || "/placeholder.png"}
                  alt={award.name}
                  className="h-28 w-28 object-contain"
                  width={112}
                  height={112}
                />
              </div>
              <CardHeader>
                <CardTitle>{award.name}</CardTitle>
                <CardDescription>{sanitizeHtmlServer(award.description)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`/perscom/awards?page=${currentPage - 1}`} />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={`/perscom/awards?page=${page}`}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`/perscom/awards?page=${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </ServerRoleGuard>
  )
}