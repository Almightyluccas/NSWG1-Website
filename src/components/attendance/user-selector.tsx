"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface UserSelectorProps {
  users: { id: string; name: string; username?: string; discriminator?: string; unit?: string; position?: string }[]
  selectedUserId: string | undefined
  onSelectUser: (userId: string | null) => void
}

export function UserSelector({ users, selectedUserId, onSelectUser }: UserSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedUser = users.find((user) => user.id === selectedUserId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate">
                {selectedUser.name}
                {selectedUser.username && ` (${selectedUser.username})`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Select user...</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.name} ${user.username || ""}`}
                  onSelect={() => {
                    onSelectUser(user.id === selectedUserId ? null : user.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedUserId === user.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user.name}</span>
                      {user.username && (
                        <span className="text-sm text-gray-500">
                          ({user.username}#{user.discriminator})
                        </span>
                      )}
                    </div>
                    {(user.unit || user.position) && (
                      <span className="text-xs text-gray-400 ml-6">
                        {user.unit} {user.position && `• ${user.position}`}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
