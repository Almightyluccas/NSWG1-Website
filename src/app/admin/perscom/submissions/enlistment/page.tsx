"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Filter, CheckCircle, XCircle, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Mock enlistment applications
const mockApplications = [
  {
    id: "APP-001",
    user: {
      id: "456789123",
      username: "RecruitCharlie",
      discriminator: "9012",
      avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
    },
    name: "M. Williams",
    email: "mwilliams@example.com",
    dateOfBirth: "1995-06-15",
    steamId: "STEAM_0:1:34567890",
    desiredUnit: "Task Force 160th",
    previousExperience: "No",
    armaExperience: "350",
    timezone: "Eastern Time (EST/EDT)",
    reason:
      "I've always been interested in military simulation and would love to join a structured unit that focuses on realism and teamwork.",
    capabilities:
      "I have experience with tactical shooters and good communication skills. I'm a quick learner and team player.",
    submittedAt: "2024-02-20T14:30:00Z",
    status: "Pending",
  },
  {
    id: "APP-002",
    user: {
      id: "321654987",
      username: "MedicEcho",
      discriminator: "7890",
      avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
    },
    name: "A. Davis",
    email: "adavis@example.com",
    dateOfBirth: "1992-09-23",
    steamId: "STEAM_0:1:56789012",
    desiredUnit: "TACDEVRON2",
    previousExperience: "Yes",
    previousUnits: "Served in ArmA 3 Milsim unit 'Task Force Phoenix' for 1 year as a combat medic",
    armaExperience: "780",
    timezone: "Central Time (CST/CDT)",
    reason:
      "Looking for a more structured and realistic unit after my previous experience. I enjoy the teamwork and coordination aspects of milsim.",
    capabilities:
      "Experienced as a combat medic in previous unit. Good under pressure and familiar with tactical communication.",
    submittedAt: "2024-03-25T09:15:00Z",
    status: "Pending",
  },
  {
    id: "APP-003",
    user: {
      id: "654321987",
      username: "EngineerFoxtrot",
      discriminator: "2468",
      avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
    },
    name: "J. Wilson",
    email: "jwilson@example.com",
    dateOfBirth: "1997-03-12",
    steamId: "STEAM_0:0:67890123",
    desiredUnit: "Combat Engineer",
    previousExperience: "No",
    armaExperience: "420",
    timezone: "Pacific Time (PST/PDT)",
    reason:
      "I'm looking for a community that values teamwork and realistic military operations. I enjoy the technical aspects of military simulation.",
    capabilities: "Strong problem-solving skills and attention to detail. Quick to learn new systems and procedures.",
    submittedAt: "2024-04-02T16:45:00Z",
    status: "Pending",
  },
]

export default function EnlistmentApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isApplicationDetailsOpen, setIsApplicationDetailsOpen] = useState(false)

  // Filter applications based on search query
  const filteredApplications = mockApplications.filter((app) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      app.user.username.toLowerCase().includes(searchLower) ||
      app.name.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      app.desiredUnit.toLowerCase().includes(searchLower)
    )
  })

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application)
    setIsApplicationDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enlistment Applications</h1>
        <p className="text-gray-500 dark:text-zinc-400">Review and process new enlistment applications.</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Search applications..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
            <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Desired Unit
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredApplications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={application.user.avatar || "/placeholder.svg"}
                        alt={application.user.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{application.name}</div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">
                        {application.user.username}#{application.user.discriminator}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{application.desiredUnit}</td>
                <td className="px-6 py-4 whitespace-nowrap">{application.armaExperience} hours</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(application.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      application.status === "Approved"
                        ? "accent"
                        : application.status === "Rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {application.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(application)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-green-500" title="Approve">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" title="Reject">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-zinc-400">No applications found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={isApplicationDetailsOpen} onOpenChange={setIsApplicationDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Enlistment Application</DialogTitle>
              <DialogDescription>
                Submitted on {new Date(selectedApplication.submittedAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={selectedApplication.user.avatar || "/placeholder.svg"}
                      alt={selectedApplication.user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold">{selectedApplication.name}</h3>
                  <p className="text-gray-500 dark:text-zinc-400">
                    {selectedApplication.user.username}#{selectedApplication.user.discriminator}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{selectedApplication.email}</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Personal Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Steam ID</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.steamId}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timezone</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.timezone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Military Experience
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                    <div>
                      <p className="text-sm font-medium">Desired Unit/Role</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.desiredUnit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Arma Experience</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {selectedApplication.armaExperience} hours
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Previous Unit Experience</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {selectedApplication.previousExperience}
                      </p>
                    </div>
                    {selectedApplication.previousUnits && (
                      <div>
                        <p className="text-sm font-medium">Previous Units</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.previousUnits}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Application Details
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium">Reason for Joining</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Capabilities</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.capabilities}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <div>
                <Badge
                  variant={
                    selectedApplication.status === "Approved"
                      ? "accent"
                      : selectedApplication.status === "Rejected"
                        ? "destructive"
                        : "outline"
                  }
                  className="text-sm"
                >
                  {selectedApplication.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsApplicationDetailsOpen(false)}>
                  Close
                </Button>
                <Button variant="destructive">Reject</Button>
                <Button className="bg-accent hover:bg-accent-darker text-black">Approve</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
