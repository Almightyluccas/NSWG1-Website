import { getFormWithQuestions } from "@/app/forms/action" // Updated import
import FormViewer from "../[id]/form-viewer"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface FormPageProps {
  params: {
    id: string
  }
}

export default async function FormPage({ params }: FormPageProps) {
  const formId = Number.parseInt(params.id)
  if (isNaN(formId)) {
    notFound()
  }

  const form = await getFormWithQuestions(formId)

  if (!form) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-8">
        <FormViewer form={form} />
      </main>
      <Footer />
    </div>
  )
}
