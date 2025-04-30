import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ServerRoleGuard from "@/components/auth/server-role-guard"
import { UserRole } from "@/types/database"
import { Qualification } from "@/types/perscomApi"
import { getQualifications } from "@/lib/perscomApi"
import Image from "next/image"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { sanitizeHtmlServer } from "@/lib/sanitizeHtmlClient"

const QUALIFICATIONS_PER_PAGE = 18

export default async function QualificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const currentPage = Number((await searchParams).page) || 1

  const qualifications: Qualification[] = await getQualifications()

  const totalQualifications = qualifications.length
  const totalPages = Math.ceil(totalQualifications / QUALIFICATIONS_PER_PAGE)

  const startIndex = (currentPage - 1) * QUALIFICATIONS_PER_PAGE
  const paginatedQualifications = qualifications.slice(startIndex, startIndex + QUALIFICATIONS_PER_PAGE)

  return (
    <ServerRoleGuard allowedRoles={[UserRole.member]}>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PERSCOM Qualifications</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Specialized training and certifications for Naval Special Warfare Group One personnel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedQualifications.map((qualification) => (
            <Card key={qualification.id} className="overflow-hidden">
              {qualification.image && (
                <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center">
                  <Image
                    src={qualification.image?.image_url || "/placeholder.svg"}
                    alt={qualification.name}
                    className="h-24 w-24 object-contain"
                    width={96}
                    height={96}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{qualification.name}</CardTitle>
                {qualification.description && (
                  <CardDescription>
                    {sanitizeHtmlServer(qualification.description)}
                  </CardDescription>
                )}
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
                  <PaginationPrevious href={`/perscom/qualifications?page=${currentPage - 1}`} />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={`/perscom/qualifications?page=${page}`}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`/perscom/qualifications?page=${currentPage + 1}`} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </ServerRoleGuard>
  )
}