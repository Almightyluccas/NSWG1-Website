"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSession } from "next-auth/react"



const rosterData = {
  groups: [
    {
      id: 1,
      name: "Naval Special Warfare Command",
      units: [
        {
          id: 1,
          name: "TACDEVRON 2 A Troop Command",
          personnel: [
            {
              id: "1",
              name: "J. Rola",
              rank: "Lieutenant Commander",
              rankImage: "/placeholder.svg?height=24&width=24&text=LCDR",
              position: "Troop Commander",
              status: "Active Duty",
            },
          ],
        },
        {
          id: 2,
          name: "TACDEVRON 2 A Troop, Enabler Team",
          personnel: [
            {
              id: "38",
              name: "G. Luccas",
              rank: "Special Warfare Operator Second Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO2",
              position: "Medic",
              status: "Active Duty",
            },
          ],
        },
        {
          id: 3,
          name: "TACDEVRON 2 A Troop, Alpha Team",
          personnel: [
            {
              id: "16",
              name: "J. Adams",
              rank: "Master Chief Special Warfare Operator",
              rankImage: "/placeholder.svg?height=24&width=24&text=MCPO",
              position: "Team Leader",
              status: "Active Duty",
            },
            {
              id: "10",
              name: "J. Garcia",
              rank: "Special Warfare Operator First Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO1",
              position: "2IC",
              status: "Active Duty",
            },
            {
              id: "77",
              name: "A. Joanos",
              rank: "Special Warfare Operator Second Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO2",
              position: "Operator",
              status: "Active Duty",
            },
            {
              id: "30",
              name: "K. Moss",
              rank: "Special Warfare Operator Second Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO2",
              position: "Operator",
              status: "Active Duty",
            },
          ],
        },
        {
          id: 4,
          name: "TACDEVRON 2 A Troop, Bravo Team",
          personnel: [
            {
              id: "15",
              name: "M. Pinky",
              rank: "Chief Special Warfare Operator",
              rankImage: "/placeholder.svg?height=24&width=24&text=CSWO",
              position: "Team Leader",
              status: "Active Duty",
            },
            {
              id: "12",
              name: "U. Nicolas",
              rank: "Special Warfare Operator First Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO1",
              position: "2IC",
              status: "Active Duty",
            },
            {
              id: "24",
              name: "M. Tubikanec",
              rank: "Special Warfare Operator Second Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO2",
              position: "Operator",
              status: "Active Duty",
            },
            {
              id: "19",
              name: "T. Jance",
              rank: "Special Warfare Operator Second Class",
              rankImage: "/placeholder.svg?height=24&width=24&text=SO2",
              position: "Operator",
              status: "Active Duty",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "United States Army Special Operations Aviation Command",
      units: [
        {
          id: 5,
          name: "160th SOAR Command",
          personnel: [
            {
              id: "45",
              name: "R. Mitchell",
              rank: "Colonel",
              rankImage: "/placeholder.svg?height=24&width=24&text=COL",
              position: "Commander",
              status: "Active Duty",
            },
          ],
        },
        {
          id: 6,
          name: "160th SOAR Alpha Company",
          personnel: [
            {
              id: "46",
              name: "S. Thompson",
              rank: "Captain",
              rankImage: "/placeholder.svg?height=24&width=24&text=CPT",
              position: "Company Commander",
              status: "Active Duty",
            },
            {
              id: "47",
              name: "D. Walker",
              rank: "Chief Warrant Officer 4",
              rankImage: "/placeholder.svg?height=24&width=24&text=CW4",
              position: "Senior Pilot",
              status: "Active Duty",
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Airforce Special Warfare Command",
      units: [
        {
          id: 7,
          name: "24th Special Tactics Squadron",
          personnel: [
            {
              id: "50",
              name: "A. Richards",
              rank: "Major",
              rankImage: "/placeholder.svg?height=24&width=24&text=MAJ",
              position: "Squadron Commander",
              status: "Active Duty",
            },
            {
              id: "51",
              name: "J. Peterson",
              rank: "Technical Sergeant",
              rankImage: "/placeholder.svg?height=24&width=24&text=TSgt",
              position: "Combat Controller",
              status: "Active Duty",
            },
          ],
        },
      ],
    },
  ],
}

export default function RosterPage() {
  const [selectedGroup, setSelectedGroup] = useState(1)
  const { data: session } = useSession()


  if (!session) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">You need to be logged in to view the roster.</p>
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

  const currentGroup = rosterData.groups.find((group) => group.id === selectedGroup)

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Personnel Roster</h1>
        <p className="text-gray-500 dark:text-zinc-400">
          View the complete roster of personnel organized by command structure
        </p>
      </div>

      <Tabs
        defaultValue={selectedGroup.toString()}
        onValueChange={(value) => setSelectedGroup(Number.parseInt(value))}
        className="mb-6"
      >
        <TabsList className="w-full flex flex-wrap">
          {rosterData.groups.map((group) => (
            <TabsTrigger key={group.id} value={group.id.toString()} className="flex-grow">
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
        <div className="space-y-6">
          {currentGroup?.units.map((unit) => (
            <Card key={unit.id} className="overflow-hidden">
              <CardTitle className="p-4 bg-accent/10 border-b border-border">{unit.name}</CardTitle>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {unit.personnel.map((person) => (
                    <li key={person.id} className="hover:bg-accent/5 transition-colors">
                      <Link href={`/perscom/user/${person.id}`} className="block p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <img src={person.rankImage || "/placeholder.svg"} alt={person.rank} className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="font-medium mr-2">{person.name}</span>
                              <span className="text-sm text-gray-500 dark:text-zinc-400 hidden md:inline">
                                {person.rank}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 dark:text-zinc-300 mr-4 hidden md:block">
                              {person.position}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">
                              {person.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
    </div>
  )
}
