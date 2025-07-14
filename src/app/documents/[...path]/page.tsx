import { notFound } from "next/navigation"
import DocumentViewer from "./document-viewer"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface DocumentViewerPageProps {
  params: Promise<{
    path: string[]
  }>
}

export default async function DocumentViewerPage({ params }: DocumentViewerPageProps) {
  const resolvedParams = await params
  const documentPath = resolvedParams.path.join("/")

  if (!documentPath) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <DocumentViewer documentPath={documentPath} />
      </main>
      <Footer />
    </div>
  )
}
