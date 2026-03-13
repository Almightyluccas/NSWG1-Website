"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-4 w-4" />
      Go Back
    </Button>
  );
}
