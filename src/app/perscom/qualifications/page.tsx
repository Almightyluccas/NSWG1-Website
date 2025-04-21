
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react";

const qualifications = [
  {
    id: 1,
    name: "Combat Diver",
    description:
      "Specialized training in underwater operations, including underwater navigation, infiltration, and exfiltration.",
    image: "/placeholder.svg?height=120&width=120",
    requirements: [
      "Complete Combat Diver Qualification Course",
      "Pass physical fitness test",
      "Complete underwater navigation exercises",
      "Demonstrate proficiency in underwater operations",
    ],
    difficulty: "Expert",
    holders: 12,
  },
  {
    id: 2,
    name: "Military Freefall",
    description:
      "Advanced parachuting techniques for high-altitude, low-opening (HALO) and high-altitude, high-opening (HAHO) jumps.",
    image: "/placeholder.svg?height=120&width=120",
    requirements: [
      "Complete Military Freefall Parachutist Course",
      "Minimum of 25 freefall jumps",
      "Demonstrate proficiency in HALO and HAHO techniques",
      "Complete night jump operations",
    ],
    difficulty: "Expert",
    holders: 18,
  },
  {
    id: 3,
    name: "Combat Medic",
    description:
      "Advanced medical training for battlefield trauma care and extended field care in austere environments.",
    image: "/placeholder.svg?height=120&width=120",
    requirements: [
      "Complete Special Operations Combat Medic Course",
      "Demonstrate proficiency in trauma management",
      "Pass field medical scenarios",
      "Complete clinical rotations",
    ],
    difficulty: "Advanced",
    holders: 8,
  },
  {
    id: 4,
    name: "Sniper",
    description: "Specialized training in long-range precision shooting, observation, and intelligence gathering.",
    image: "/placeholder.svg?height=120&width=120",
    requirements: [
      "Complete Sniper School",
      "Demonstrate marksmanship proficiency",
      "Pass field craft and stalking exercises",
      "Complete observation and reporting training",
    ],
    difficulty: "Expert",
    holders: 6,
  },
  {
    id: 5,
    name: "Basic Airborne",
    description: "Training in military parachuting techniques using static line parachute deployment.",
    image: "/placeholder.svg?height=120&width=120",
    requirements: [
      "Complete Basic Airborne Course",
      "Complete five qualifying jumps",
      "Demonstrate proper landing techniques",
      "Pass physical fitness requirements",
    ],
    difficulty: "Intermediate",
    holders: 42,
  },
  {
    id: 6,
    name: "Breacher",
    description: "Specialized training in explosive and mechanical breaching techniques for entry operations.",
    image: "/placeholder.svg?height=120&width=120",
    requirements: [
      "Complete Tactical Breacher Course",
      "Demonstrate proficiency in explosive calculations",
      "Pass practical breaching exercises",
      "Complete safety certification",
    ],
    difficulty: "Advanced",
    holders: 15,
  },
]

export default function QualificationsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">You need to be logged in to view the PERSCOM qualifications.</p>
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
        <h1 className="text-3xl font-bold mb-2">PERSCOM Qualifications</h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Specialized training and certifications for Naval Special Warfare Group One personnel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qualifications.map((qualification) => (
          <Card key={qualification.id} className="overflow-hidden">
            <div className="bg-accent/10 dark:bg-accent/5 p-6 flex justify-center">
              <img
                src={qualification.image || "/placeholder.svg"}
                alt={qualification.name}
                className="h-24 w-24 object-contain"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{qualification.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={`ml-2 ${
                    qualification.difficulty === "Expert"
                      ? "border-red-500 text-red-500"
                      : qualification.difficulty === "Advanced"
                        ? "border-amber-500 text-amber-500"
                        : "border-green-500 text-green-500"
                  }`}
                >
                  {qualification.difficulty}
                </Badge>
              </div>
              <CardDescription>{qualification.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium mb-2">Requirements:</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-500 dark:text-zinc-400">
                  {qualification.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
                <div className="mt-4 text-right">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {qualification.holders} qualified personnel
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
