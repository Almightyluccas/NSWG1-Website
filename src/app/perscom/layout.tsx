import type React from "react"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "PERSCOM - Naval Special Warfare Group One",
  description: "Personnel Command system for Naval Special Warfare Group One",
}

export default function PerscomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
