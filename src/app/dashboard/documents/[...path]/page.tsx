import { notFound } from "next/navigation";
import DocumentViewer from "./document-viewer";

interface DocumentViewerPageProps {
  params: Promise<{
    path: string[];
  }>;
}

export default async function DocumentViewerPage({
  params,
}: DocumentViewerPageProps) {
  const resolvedParams = await params;
  const documentPath = resolvedParams.path.join("/");

  if (!documentPath) {
    notFound();
  }

  return <DocumentViewer documentPath={documentPath} />;
}
