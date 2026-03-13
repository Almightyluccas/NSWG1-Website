// src/app/admin/perscom/submissions/leave/loading.tsx
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Loading() {
  const placeholderRows = Array(5).fill(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave of absence requests</h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Review and process new LOA requests.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Search leave requests..."
              className="pl-10"
              disabled
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
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
              {placeholderRows.map((_, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-48" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-40" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
