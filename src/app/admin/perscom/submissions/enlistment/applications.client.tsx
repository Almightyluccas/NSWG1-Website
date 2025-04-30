"use client"
import {CheckCircle, Eye, Filter, Search, XCircle} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import {useState} from "react";
import { ApplicationData } from "@/types/perscomApi";
import RoleGuard from "@/components/auth/role-guard";
import {useSession} from "next-auth/react";
import { PaginationBar } from "@/components/ui/pagination";
import {acceptApplication, rejectApplication} from "./actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";

const itemsPerPage = 10;


export const ApplicationsTable = ({ applications }: { applications: ApplicationData[] }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
  const [isApplicationDetailsOpen, setIsApplicationDetailsOpen] = useState(false)
  const { data: session } = useSession()
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [unitFilters, setUnitFilters] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'accept' | 'reject' | null>(null);
  const [applicationToConfirm, setApplicationToConfirm] = useState<ApplicationData | null>(null);
  const router = useRouter();


  const availablePositions = Array.from(
    new Set(
      applications
        .map(app => app.preferred_position)
        .filter((pos): pos is string =>
          isNaN(Number(pos))
        )
    )
  );

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchQuery.toLowerCase();
    const discordName = ((app.discord_name || '') as string).toLowerCase();
    const firstName = ((app.first_name || '') as string).toLowerCase();
    const emailAddress = ((app.email_address || '') as string).toLowerCase();
    const preferredPosition = (typeof app.preferred_position === 'string' ? app.preferred_position : '').toLowerCase();

    const matchesSearch =
      discordName.includes(searchLower) ||
      firstName.includes(searchLower) ||
      emailAddress.includes(searchLower) ||
      preferredPosition.includes(searchLower);

    let currentStatus = 'Pending';
    if (app.statuses && app.statuses.length > 0) {
      currentStatus = app.statuses[0].name;
    }
    const statusMatch = statusFilters.length === 0 || statusFilters.includes(currentStatus);

    const unitMatch = unitFilters.length === 0 ||
      (app.preferred_position && unitFilters.includes(app.preferred_position));

    return matchesSearch && statusMatch && unitMatch;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (application: ApplicationData) => {
    setSelectedApplication(application)
    setIsApplicationDetailsOpen(true)
  }
  const handleDialogOpenChange = (open: boolean) => {
    setIsApplicationDetailsOpen(open);
    if (!open) {
      setSelectedApplication(null);
      document.body.focus();
      setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
    }
  };
  const isAccepted = (application: ApplicationData) => {
    return application.statuses && application.statuses.length > 0 && application.statuses[0].name === 'Accepted';
  };

  const handleAccept = async (application: ApplicationData) => {
    if (application.id && application.user_id && application.first_name) {
      await acceptApplication(application.id, application.user_id, application.first_name, application.email_address);
      setIsApplicationDetailsOpen(false);
    }
  };

  const handleReject = async (application: ApplicationData) => {
    if (application.id && application.user_id) {
      console.log(application.id, application.user_id)
      await rejectApplication(application.id, application.user_id);
      setIsApplicationDetailsOpen(false);
    }
  };

  const requestConfirmation = (action: 'accept' | 'reject', application: ApplicationData) => {
    setActionToConfirm(action);
    setApplicationToConfirm(application);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!applicationToConfirm || !actionToConfirm) return;

    try {
      if (actionToConfirm === 'accept') {
        await handleAccept(applicationToConfirm);
      } else if (actionToConfirm === 'reject') {
        await handleReject(applicationToConfirm);
      }
      router.refresh();
    } catch (error) {
      throw new Error('Error at handleConfirmationAction'+ error);
    } finally {
      setShowConfirmDialog(false);
      setActionToConfirm(null);
      setApplicationToConfirm(null);
    }
  };

  return (
    <>
      <RoleGuard roles={session?.user?.roles || []} allowedRoles={["admin", "superAdmin", "instructor"]} >
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter{statusFilters.length + unitFilters.length > 0 && ` (${statusFilters.length + unitFilters.length})`}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["Pending", "Accepted", "Denied"].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={checked =>
                      setStatusFilters(prev =>
                        checked ? [...prev, status] : prev.filter(s => s !== status)
                      )
                    }
                    onSelect={e => e.preventDefault()}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Preferred Position</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availablePositions.map(role => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={unitFilters.includes(role)}
                    onCheckedChange={checked =>
                      setUnitFilters(prev =>
                        checked ? [...prev, role] : prev.filter(u => u !== role)
                      )
                    }
                    onSelect={e => e.preventDefault()}
                  >
                    {role}
                  </DropdownMenuCheckboxItem>
                ))}

                {(statusFilters.length > 0 || unitFilters.length > 0) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setStatusFilters([]);
                      setUnitFilters([]);
                    }}>
                      Clear all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Preferred Position
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {paginatedApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{application.first_name}</div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                          {application.discord_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{application.preferred_position}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{application.arma_experience_in_hours} hours</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.statuses && application.statuses.length > 0 ? (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: application.statuses[0].color,
                          color: 'white',
                        }}
                      >
                        {application.statuses[0].name}
                      </span>
                    ) : (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgb(255, 255, 0)',
                          color: 'black',
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(application.created_at).toLocaleDateString()}
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
                      {!(application.statuses && application.statuses.length > 0 && application.statuses[0].name === 'Accepted') && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-500" title="Approve" onClick={() => requestConfirmation('accept', application)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" title="Reject" onClick={() => requestConfirmation('reject', application)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />


        {/*
        TODO: Fix on mobile devices
        TODO: Fix Date of birth
        */}
        {/* Application Details Dialog */}
        {selectedApplication && (
          <Dialog open={isApplicationDetailsOpen} onOpenChange={setIsApplicationDetailsOpen}>
            <DialogContent className="w-[90vw] md:w-[50vw] !max-w-none">
              <DialogHeader>
                <DialogTitle>Enlistment Application</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedApplication.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-bold">{selectedApplication.first_name}</h3>
                    <p className="text-gray-500 dark:text-zinc-400">
                      {selectedApplication.discord_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{selectedApplication.email_address}</p>
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
                          <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.date_of_birth}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Arma 3 ID</p>
                          <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.arma_3_id}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Timezone</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.what_is_your_time_zone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Military Experience
                    </h4>
                    <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                      <div>
                        <p className="text-sm font-medium">Preferred Position</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedApplication.preferred_position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Arma Experience</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {selectedApplication.arma_experience_in_hours} hours
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Previous Unit</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {selectedApplication.previous_unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Application Details
                    </h4>
                    <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium">Reason for Joining</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {selectedApplication.why_do_you_want_to_join_red_squadron}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Capabilities</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {selectedApplication.what_makes_you_more_capable_than_other_candidates}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confirmed Requirements</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {selectedApplication.confirm_you_have_read_and_understand_the_recruitment_requirements_on_our_website}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsApplicationDetailsOpen(false)}>
                    Close
                  </Button>
                  {!isAccepted(selectedApplication) && (
                    <>
                      <Button variant="destructive" onClick={() => requestConfirmation('reject', selectedApplication)}>Reject</Button>
                      <Button className="bg-green-500 hover:bg-green-400 text-black" onClick={() => requestConfirmation('accept', selectedApplication)}>Approve</Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={showConfirmDialog} onOpenChange={handleDialogOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to {actionToConfirm} this application for {applicationToConfirm?.first_name}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant={actionToConfirm === 'reject' ? 'destructive' : 'default'}
                onClick={handleConfirmAction}
              >
                Confirm {actionToConfirm === 'accept' ? 'Approval' : 'Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </RoleGuard>
    </>
  )
}