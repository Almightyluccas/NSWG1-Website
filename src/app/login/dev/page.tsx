"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import Image from "next/image"

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const { login, register } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            if (activeTab === "login") {
                await login(email, password)
            } else {
                await register(name, email, password)
            }

            // Redirect to home page after successful login/register
            router.push("/")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-900">
            <Navbar />

            <div className="relative pt-20 min-h-screen flex items-center justify-center">

                <div className="container mx-auto px-4 z-10 py-16">
                    <FadeIn>
                        <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="flex border-b border-gray-200 dark:border-zinc-700">
                                <button
                                    className={`flex-1 py-4 text-center font-medium ${
                                        activeTab === "login" ? "border-b-2 border-accent text-accent" : "text-gray-500 dark:text-zinc-400"
                                    }`}
                                    onClick={() => setActiveTab("login")}
                                >
                                    Login
                                </button>
                                <button
                                    className={`flex-1 py-4 text-center font-medium ${
                                        activeTab === "register"
                                            ? "border-b-2 border-accent text-accent"
                                            : "text-gray-500 dark:text-zinc-400"
                                    }`}
                                    onClick={() => setActiveTab("register")}
                                >
                                    Register
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-center mb-6">
                                    <div className="relative w-16 h-16">
                                        <Image src="/images/nswg1-emblem.png" alt="NSWG1 Logo" fill className="object-contain" />
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold text-center mb-6">
                                    {activeTab === "login" ? "Welcome Back" : "Create an Account"}
                                </h1>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mb-4">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {activeTab === "register" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                required={activeTab === "register"}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-accent hover:bg-accent-darker text-black"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {activeTab === "login" ? "Logging in..." : "Creating account..."}
                                            </>
                                        ) : activeTab === "login" ? (
                                            "Login"
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </form>

                                {activeTab === "login" && (
                                    <div className="text-center mt-4">
                                        <button className="text-sm text-accent hover:underline">Forgot your password?</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </main>
    )
}
