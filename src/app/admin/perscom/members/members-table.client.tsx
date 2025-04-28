"use client"

import { useState } from "react";
import { ChevronDown, Filter, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PerscomUserResponse } from "@/types/perscomApi";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";


interface MembersTableProps {
  members: PerscomUserResponse[];
}

const itemsPerPage = 10;

export const MembersTable = ({ members }: MembersTableProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<PerscomUserResponse | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [positionFilters, setPositionFilters] = useState<string[]>([]);
  const [unitFilters, setUnitFilters] = useState<string[]>([]);
  const [expandedFilterSection, setExpandedFilterSection] = useState<'status' | 'position' | 'unit' | null>(null);


  const availableStatuses = Array.from(
    new Set(
      members
        .map(user => user.status?.name)
        .filter((status): status is string => !!status)
    )
  );

  const availablePositions = Array.from(
    new Set(
      members
        .map(user => user.position?.name)
        .filter((position): position is string => !!position)
    )
  );

  const availableUnits = Array.from(
    new Set(
      members
        .map(user => user.unit?.name)
        .filter((unit): unit is string => !!unit)
    )
  );

  const filteredUsers = members.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchLower) || false) ||
      (user.rank?.name?.toLowerCase().includes(searchLower) || false) ||
      (user.unit?.name?.toLowerCase().includes(searchLower) || false) ||
      (user.status?.name?.toLowerCase().includes(searchLower) || false)

    const statusMatch = statusFilters.length === 0 ||
      (user.status?.name && statusFilters.includes(user.status.name));

    const positionMatch = positionFilters.length === 0 ||
      (user.position?.name && positionFilters.includes(user.position.name));

    const unitMatch = unitFilters.length === 0 ||
      (user.unit?.name && unitFilters.includes(user.unit.name));

    return matchesSearch && statusMatch && positionMatch && unitMatch;
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (user: PerscomUserResponse) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  const toggleFilterSection = (section: 'status' | 'position' | 'unit') => {
    setExpandedFilterSection(expandedFilterSection === section ? null : section);
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter{statusFilters.length + unitFilters.length + positionFilters.length > 0 &&
                ` (${statusFilters.length + unitFilters.length + positionFilters.length})`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <div>
                <button
                  onClick={() => toggleFilterSection('status')}
                  className="w-full px-2 py-1.5 text-sm font-medium flex justify-between items-center hover:bg-accent hover:text-accent-foreground rounded-sm"
                >
                  <span>Status</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedFilterSection === 'status' ? 'rotate-180' : ''}`} />
                </button>

                {expandedFilterSection === 'status' && (
                  <div className="pl-2 py-1 border-l-2 ml-3 mt-1">
                    {availableStatuses.map(status => (
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
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              <div>
                <button
                  onClick={() => toggleFilterSection('position')}
                  className="w-full px-2 py-1.5 text-sm font-medium flex justify-between items-center hover:bg-accent hover:text-accent-foreground rounded-sm"
                >
                  <span>Position</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedFilterSection === 'position' ? 'rotate-180' : ''}`} />
                </button>

                {expandedFilterSection === 'position' && (
                  <div className="pl-2 py-1 border-l-2 ml-3 mt-1">
                    {availablePositions.map(position => (
                      <DropdownMenuCheckboxItem
                        key={position}
                        checked={positionFilters.includes(position)}
                        onCheckedChange={checked =>
                          setPositionFilters(prev =>
                            checked ? [...prev, position] : prev.filter(p => p !== position)
                          )
                        }
                        onSelect={e => e.preventDefault()}
                      >
                        {position}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              <div>
                <button
                  onClick={() => toggleFilterSection('unit')}
                  className="w-full px-2 py-1.5 text-sm font-medium flex justify-between items-center hover:bg-accent hover:text-accent-foreground rounded-sm"
                >
                  <span>Unit</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedFilterSection === 'unit' ? 'rotate-180' : ''}`} />
                </button>

                {expandedFilterSection === 'unit' && (
                  <div className="pl-2 py-1 border-l-2 ml-3 mt-1">
                    {availableUnits.map(unit => (
                      <DropdownMenuCheckboxItem
                        key={unit}
                        checked={unitFilters.includes(unit)}
                        onCheckedChange={checked =>
                          setUnitFilters(prev =>
                            checked ? [...prev, unit] : prev.filter(u => u !== unit)
                          )
                        }
                        onSelect={e => e.preventDefault()}
                      >
                        {unit}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                )}
              </div>

              {(statusFilters.length > 0 || positionFilters.length > 0 || unitFilters.length > 0) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setStatusFilters([]);
                    setPositionFilters([]);
                    setUnitFilters([]);
                  }} className="text-center">
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
                User
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                      {/*<Image*/}
                      {/*  src={user.user?.avatar || "/placeholder.svg"}*/}
                      {/*  alt={user.user?.username || 'User'}*/}
                      {/*  fill*/}
                      {/*  className="object-cover"*/}
                      {/*/>*/}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline">{user.rank?.name}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline">{user.position?.name}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.status?.name === "Active" ? "accent" : "outline"}>
                    {user.status?.name}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.unit?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(user)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 dark:text-red-400">Suspend User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-zinc-400">No users found matching your search criteria.</p>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-zinc-400">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span> of{" "}
            <span className="font-medium">{filteredUsers.length}</span> users
          </div>
        </div>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationPrevious
            href="#"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationNext
            href="#"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </PaginationContent>
      </Pagination>

      {selectedUser && (
        <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
          <DialogContent className="w-[90vw] md:w-[50vw] !max-w-none">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about the selected user.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                    {/*<Image*/}
                    {/*  src={selectedUser.user?.avatar || "/placeholder.svg"}*/}
                    {/*  alt={selectedUser.user?.username || 'User'}*/}
                    {/*  fill*/}
                    {/*  className="object-cover"*/}
                    {/*/>*/}
                  </div>
                  {/*<h3 className="text-lg font-bold">{selectedUser.user?.username}</h3>*/}
                  <p className="text-gray-500 dark:text-zinc-400">{selectedUser.rank?.name}</p>
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
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.status?.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date Joined</p>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Unit Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-md p-4 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Unit</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.unit?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Position</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedUser.position?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}