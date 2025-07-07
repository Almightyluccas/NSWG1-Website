"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/auth/user-menu"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import RoleGuard from "@/components/auth/role-guard";
import Image from "next/image";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUnitsDropdownOpen, setIsUnitsDropdownOpen] = useState(false)
  const [isPerscomDropdownOpen, setIsPerscomDropdownOpen] = useState(false)
  const [isMobileUnitsOpen, setIsMobileUnitsOpen] = useState(false)
  const [isMobilePerscomOpen, setIsMobilePerscomOpen] = useState(false)
  const [isOperationCenterOpen, setIsOperationCenterOpen] = useState(false)
  const [isMobileOperationCenterOpen, setIsMobileOperationCenterOpen] = useState(false)

  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleJoinClick = () => {
    router.push("/join")
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="mr-4">
              <Image
                src={"/images/nswg1-emblem.png"}
                alt={"NSWG1 Emblem"}
                width={50}
                height={50}
              />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-accent">NSWG</span>1
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/about">About</NavLink>

            {/* Units Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsUnitsDropdownOpen(true)}
              onMouseLeave={() => setIsUnitsDropdownOpen(false)}
            >
              <button className="text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors relative group flex items-center">
                Units
                <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
              </button>

              {isUnitsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-zinc-700">
                  <Link
                    href="/tf160th"
                    className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                  >
                    Task Force 160th
                  </Link>
                  <Link
                    href="/tacdevron2"
                    className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                  >
                    TACDEVRON2
                  </Link>
                </div>
              )}
            </div>

            <NavLink href="/gallery">Gallery</NavLink>


            {session && (
              <>
                <RoleGuard roles={session.user.roles} allowedRoles={['member', 'greenTeam']} hide={true}>
                  <div
                    className="relative group"
                    onMouseEnter={() => setIsOperationCenterOpen(true)}
                    onMouseLeave={() => setIsOperationCenterOpen(false)}
                  >
                    <button className="text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors relative group flex items-center">
                      Operation Center
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
                    </button>

                    {isOperationCenterOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-zinc-700">
                        <Link
                          href="/calendar"
                          className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                        >
                          Calendar
                        </Link>

                      </div>
                    )}
                  </div>
                  {/*<NavLink href="/calendar">Calendar</NavLink>*/}
                  <div
                    className="relative group"
                    onMouseEnter={() => setIsPerscomDropdownOpen(true)}
                    onMouseLeave={() => setIsPerscomDropdownOpen(false)}
                  >
                    <button className="text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors relative group flex items-center">
                      PERSCOM
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
                    </button>

                    {isPerscomDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-zinc-700">
                        <Link
                          href="/perscom/roster"
                          className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                        >
                          Roster
                        </Link>
                        <Link
                          href="/perscom/awards"
                          className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                        >
                          Awards
                        </Link>
                        <Link
                          href="/perscom/ranks"
                          className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                        >
                          Ranks
                        </Link>
                        <Link
                          href="/perscom/qualifications"
                          className="block px-4 py-2 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-accent"
                        >
                          Qualifications
                        </Link>
                      </div>
                    )}
                  </div>
                </RoleGuard>
              </>

            )}

            <UserMenu onJoinClickAction={handleJoinClick} />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden bg">
            <UserMenu onJoinClickAction={handleJoinClick} />
            <button className="ml-4" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 mt-3">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>
              About
            </MobileNavLink>

            {/* Mobile Units Dropdown */}
            <div>
              <button
                className="flex items-center justify-between w-full text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors py-2 border-b border-gray-200 dark:border-zinc-800"
                onClick={() => setIsMobileUnitsOpen(!isMobileUnitsOpen)}
              >
                <span>Units</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isMobileUnitsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isMobileUnitsOpen && (
                <div className="pl-4 py-2 space-y-2 bg-gray-50 dark:bg-zinc-800/50 rounded-md mt-1">
                  <Link
                    href="/tf160th"
                    className="block py-2 text-gray-700 dark:text-zinc-300 hover:text-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Task Force 160th
                  </Link>
                  <Link
                    href="/tacdevron2"
                    className="block py-2 text-gray-700 dark:text-zinc-300 hover:text-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    TACDEVRON2
                  </Link>
                </div>
              )}
            </div>

            <MobileNavLink href="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
              Gallery
            </MobileNavLink>

            {session && (
              <>
                <RoleGuard roles={session.user.roles} allowedRoles={['member', 'greenTeam']} hide={true}>
                  <MobileNavLink href="/calendar" onClick={() => setIsMobileMenuOpen(false)}>
                    Calendar
                  </MobileNavLink>

                  <div>
                    <button
                      className="flex items-center justify-between w-full text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors py-2 border-b border-gray-200 dark:border-zinc-800"
                      onClick={() => setIsMobilePerscomOpen(!isMobilePerscomOpen)}
                    >
                      <span>PERSCOM</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isMobilePerscomOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobilePerscomOpen && (
                      <div className="pl-4 py-2 space-y-2 bg-gray-50 dark:bg-zinc-800/50 rounded-md mt-1">
                        <Link
                          href="/perscom/roster"
                          className="block py-2 text-gray-700 dark:text-zinc-300 hover:text-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Roster
                        </Link>
                        <Link
                          href="/perscom/awards"
                          className="block py-2 text-gray-700 dark:text-zinc-300 hover:text-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Awards
                        </Link>
                        <Link
                          href="/perscom/ranks"
                          className="block py-2 text-gray-700 dark:text-zinc-300 hover:text-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Ranks
                        </Link>
                        <Link
                          href="/perscom/qualifications"
                          className="block py-2 text-gray-700 dark:text-zinc-300 hover:text-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Qualifications
                        </Link>
                      </div>
                    )}
                  </div>
                </RoleGuard>
                <RoleGuard roles={session.user.roles} allowedRoles={['guest']} hide={true}>
                  <Button className="bg-accent hover:bg-accent-darker text-black w-full mt-2" onClick={handleJoinClick}>
                    Join Now
                  </Button>
                </RoleGuard>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link href={href} className="text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
    </Link>
  )
}

interface MobileNavLinkProps {
  href: string
  children: React.ReactNode
  onClick: () => void
}

function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className="text-gray-700 dark:text-zinc-300 hover:text-accent transition-colors py-2 border-b border-gray-200 dark:border-zinc-800 block"
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
