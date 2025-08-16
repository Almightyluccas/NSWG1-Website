"use client"
import { CheckCircle, Eye, Filter, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import RoleGuard from "@/components/auth/role-guard";
import { useSession } from "next-auth/react";
import { PaginationBar } from "@/components/ui/pagination";
import { acceptApplication, rejectApplication } from "./actions";
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
import { LeaveApplication } from "@/types/api/perscomApi";



interface LeaveOfAbsenceTableProps {
  applications: LeaveApplication[];
}

type ActionType = 'accept' | 'reject' | null;

const itemsPerPage = 10;

export const LeaveOfAbsenceTable = ({ applications }: LeaveOfAbsenceTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [isApplicationDetailsOpen, setIsApplicationDetailsOpen] = useState(false)
  const { data: session } = useSession()
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<ActionType>(null);
  const [applicationToConfirm, setApplicationToConfirm] = useState<LeaveApplication | null>(null);
  const router = useRouter();

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchQuery.toLowerCase();
    const firstName = ((app.first_name || '') + '').toLowerCase();
    const reasonForLeave = ((app.reason_for_leave || '') + '').toLowerCase();

    const matchesSearch =
      firstName.includes(searchLower) ||
      reasonForLeave.includes(searchLower);

    let currentStatus = 'Pending';
    if (app.statuses && app.statuses.length > 0) {
      currentStatus = app.statuses[0].name;
    }
    const statusMatch = statusFilters.length === 0 || statusFilters.includes(currentStatus);

    return matchesSearch && statusMatch;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application)
    setIsApplicationDetailsOpen(true)
  }

  const isAccepted = (application: LeaveApplication) => {
    return application.statuses && application.statuses.length > 0 && application.statuses[0].name === 'Accepted';
  };

  const handleAccept = async (application: LeaveApplication) => {
    if (application.id && application.user_id && application.first_name && application.email_address) {
      await acceptApplication(application.id, application.user_id, application.first_name, application.email_address);
      setIsApplicationDetailsOpen(false);
    }
  };

  const handleReject = async (application: LeaveApplication) => {
    if (application.id && application.user_id) {
      await rejectApplication(application.id, application.user_id);
      setIsApplicationDetailsOpen(false);
    }
  };

  const requestConfirmation = (action: ActionType, application: LeaveApplication) => {
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
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
                placeholder="Search leave requests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter{statusFilters.length > 0 && ` (${statusFilters.length})`}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["Pending", "Accepted", "Denied"].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={(checked) =>
                      setStatusFilters(prev =>
                        checked ? [...prev, status] : prev.filter(s => s !== status)
                      )
                    }
                    onSelect={e => e.preventDefault()}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}

                {statusFilters.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilters([])}>
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
                  Member
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Leave Period
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
              {paginatedApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{application.first_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">{application.reason_for_leave || 'Not specified'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.date_of_leave ?
                      `${formatDate(application.date_of_leave)} - ${formatDate(application.date_of_return)}` :
                      'Not specified'}
                  </td>
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
              <p className="text-gray-500 dark:text-zinc-400">No leave requests found matching your search criteria.</p>
            </div>
          )}
        </div>
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Leave Request Details Dialog */}
        {selectedApplication && (
          <Dialog open={isApplicationDetailsOpen} onOpenChange={setIsApplicationDetailsOpen}>
            <DialogContent className="w-[90vw] md:w-[50vw] !max-w-none">
              <DialogHeader>
                <DialogTitle>Leave of Absence Request</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedApplication.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">{selectedApplication.first_name}</h3>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Leave Details
                    </h4>
                    <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-4">
                      {(selectedApplication.date_of_leave || selectedApplication.date_of_return) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                              {formatDate(selectedApplication.date_of_leave)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Return Date</p>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                              {formatDate(selectedApplication.date_of_return)}
                            </p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">Reason for Leave</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                          {selectedApplication.reason_for_leave || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Status History
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4">
                    <ul className="space-y-2">
                      {selectedApplication.statuses && selectedApplication.statuses.map((status, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{backgroundColor: status.color}}
                          />
                          <span>{status.name}</span>
                          <span className="text-sm text-gray-500 dark:text-zinc-400">
                            {status.created_at ? new Date(status.created_at).toLocaleString() : ''}
                          </span>
                        </li>
                      ))}
                      {(!selectedApplication.statuses || selectedApplication.statuses.length === 0) && (
                        <li className="text-sm text-gray-500 dark:text-zinc-400">No status updates</li>
                      )}
                    </ul>
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
                      <Button className="bg-green-500 hover:bg-green-400 text-white" onClick={() => requestConfirmation('accept', selectedApplication)}>Approve</Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to {actionToConfirm} this leave request for {applicationToConfirm?.first_name}?
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