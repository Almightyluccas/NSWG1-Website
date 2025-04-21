"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react";

// Mock data for demonstration
const rankCategories = [
  {
    id: "navy",
    name: "Navy Ranks",
    ranks: [
      {
        id: 1,
        name: "Admiral",
        abbreviation: "ADM",
        payGrade: "O-10",
        image: "/placeholder.svg?height=80&width=80",
        description: "The highest rank in the Navy, typically the Chief of Naval Operations.",
      },
      {
        id: 2,
        name: "Vice Admiral",
        abbreviation: "VADM",
        payGrade: "O-9",
        image: "/placeholder.svg?height=80&width=80",
        description: "The second-highest rank in the Navy, typically commands a fleet.",
      },
      {
        id: 3,
        name: "Rear Admiral",
        abbreviation: "RADM",
        payGrade: "O-8",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a group of ships or a naval base.",
      },
      {
        id: 4,
        name: "Captain",
        abbreviation: "CAPT",
        payGrade: "O-6",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a major ship or installation.",
      },
      {
        id: 5,
        name: "Commander",
        abbreviation: "CDR",
        payGrade: "O-5",
        image: "/placeholder.svg?height=80&width=80",
        description: "May command a smaller ship or serve as executive officer on a larger vessel.",
      },
    ],
  },
  {
    id: "army",
    name: "Army Ranks",
    ranks: [
      {
        id: 6,
        name: "General",
        abbreviation: "GEN",
        payGrade: "O-10",
        image: "/placeholder.svg?height=80&width=80",
        description: "The highest rank in the Army, typically the Chief of Staff of the Army.",
      },
      {
        id: 7,
        name: "Lieutenant General",
        abbreviation: "LTG",
        payGrade: "O-9",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands an army corps or serves as a senior staff officer.",
      },
      {
        id: 8,
        name: "Major General",
        abbreviation: "MG",
        payGrade: "O-8",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a division or serves as a senior staff officer.",
      },
      {
        id: 9,
        name: "Colonel",
        abbreviation: "COL",
        payGrade: "O-6",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a brigade or regiment.",
      },
      {
        id: 10,
        name: "Lieutenant Colonel",
        abbreviation: "LTC",
        payGrade: "O-5",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a battalion or serves as executive officer of a regiment.",
      },
    ],
  },
  {
    id: "airforce",
    name: "Air Force Ranks",
    ranks: [
      {
        id: 11,
        name: "General",
        abbreviation: "Gen",
        payGrade: "O-10",
        image: "/placeholder.svg?height=80&width=80",
        description: "The highest rank in the Air Force, typically the Chief of Staff of the Air Force.",
      },
      {
        id: 12,
        name: "Lieutenant General",
        abbreviation: "Lt Gen",
        payGrade: "O-9",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a major command or serves as a senior staff officer.",
      },
      {
        id: 13,
        name: "Major General",
        abbreviation: "Maj Gen",
        payGrade: "O-8",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a numbered air force or serves as a senior staff officer.",
      },
      {
        id: 14,
        name: "Colonel",
        abbreviation: "Col",
        payGrade: "O-6",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a wing or serves as a senior staff officer.",
      },
      {
        id: 15,
        name: "Lieutenant Colonel",
        abbreviation: "Lt Col",
        payGrade: "O-5",
        image: "/placeholder.svg?height=80&width=80",
        description: "Typically commands a squadron or serves as a senior staff officer.",
      },
    ],
  },
]

export default function RanksPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">You need to be logged in to view the PERSCOM ranks.</p>
          <Link
            href="/login"
            className="bg-accent hover:bg-accent-darker text-black px-6 py-2 rounded-md transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PERSCOM Ranks</h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Military rank structure and insignia for Naval Special Warfare Group One
        </p>
      </div>

      <Tabs defaultValue="navy">
        <TabsList className="mb-6">
          {rankCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {rankCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.ranks.map((rank) => (
                <Card key={rank.id} className="flex flex-col md:flex-row overflow-hidden">
                  <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center items-center md:w-1/4">
                    <img src={rank.image || "/placeholder.svg"} alt={rank.name} className="h-20 w-20 object-contain" />
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
                            {rank.payGrade}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-500 dark:text-zinc-400">{rank.description}</CardDescription>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

