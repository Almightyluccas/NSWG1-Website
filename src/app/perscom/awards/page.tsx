
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

const awards = [
  {
    id: 1,
    name: "Navy Cross",
    description:
      "The Navy Cross is the second highest military decoration that may be awarded to a member of the United States Navy, Marine Corps, or Coast Guard for extraordinary heroism.",
    image: "/placeholder.svg?height=120&width=120",
    criteria: "Awarded for extraordinary heroism in combat operations against an opposing armed force.",
    recipients: 5,
  },
  {
    id: 2,
    name: "Silver Star",
    description:
      "The Silver Star is the third-highest military combat decoration that can be awarded to a member of the United States Armed Forces.",
    image: "/placeholder.svg?height=120&width=120",
    criteria: "Awarded for gallantry in action against an enemy of the United States.",
    recipients: 12,
  },
  {
    id: 3,
    name: "Bronze Star",
    description:
      "The Bronze Star Medal is a United States decoration awarded to members of the United States Armed Forces for either heroic achievement, heroic service, meritorious achievement, or meritorious service in a combat zone.",
    image: "/placeholder.svg?height=120&width=120",
    criteria: "Awarded for heroic or meritorious achievement or service in a combat zone.",
    recipients: 24,
  },
  {
    id: 4,
    name: "Purple Heart",
    description:
      "The Purple Heart is a United States military decoration awarded in the name of the President to those wounded or killed while serving with the U.S. military.",
    image: "/placeholder.svg?height=120&width=120",
    criteria: "Awarded to members of the armed forces who are wounded or killed in action.",
    recipients: 18,
  },
  {
    id: 5,
    name: "Navy Achievement Medal",
    description:
      "The Navy and Marine Corps Achievement Medal is a decoration of the United States Navy and U.S. Marine Corps that was first created in 1961.",
    image: "/placeholder.svg?height=120&width=120",
    criteria: "Awarded for professional achievement that exceeds that which is normally required or expected.",
    recipients: 36,
  },
]

export default function AwardsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">You need to be logged in to view the PERSCOM awards.</p>
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
        <h1 className="text-3xl font-bold mb-2">PERSCOM Awards</h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Recognitions and decorations awarded to members of Naval Special Warfare Group One
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awards.map((award) => (
          <Card key={award.id} className="overflow-hidden">
            <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center">
              <img src={award.image || "/placeholder.svg"} alt={award.name} className="h-28 w-28 object-contain" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{award.name}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {award.recipients} Recipients
                </Badge>
              </div>
              <CardDescription>{award.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium mb-1">Criteria:</p>
                <p className="text-gray-500 dark:text-zinc-400">{award.criteria}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
