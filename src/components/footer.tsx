import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold">
                            <span className="text-accent">NSWG</span>1
                        </h3>
                        <p className="text-zinc-400 mt-2">The Only Easy Day Was Yesterday</p>
                    </div>

                    <div className="flex flex-wrap gap-6 md:gap-12">
                        <Link href="/about" className="text-zinc-400 hover:text-accent transition-colors">
                            About
                        </Link>

                        <div className="flex flex-col">
                            <span className="text-zinc-400 font-medium mb-2">Units</span>
                            <Link href="/tf160th" className="text-zinc-500 hover:text-accent transition-colors text-sm mb-1">
                                Task Force 160th
                            </Link>
                            <Link href="/tacdevron2" className="text-zinc-500 hover:text-accent transition-colors text-sm">
                                TACDEVRON2
                            </Link>
                        </div>

                        <Link href="/operations" className="text-zinc-400 hover:text-accent transition-colors">
                            Operations
                        </Link>
                        <Link href="/gallery" className="text-zinc-400 hover:text-accent transition-colors">
                            Gallery
                        </Link>
                        <Link href="/join" className="text-zinc-400 hover:text-accent transition-colors">
                            Join
                        </Link>
                    </div>
                </div>

                <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500 text-sm">
                    © {new Date().getFullYear()} Naval Special Warfare Group One Milsim Unit. All rights reserved.
                    <br />
                    Website developed and maintained by <a href="https://luccasportfolio.vercel.app" target="_blank" rel="noopener noreferrer">Luccas Amorim</a>.
                </div>
            </div>
        </footer>
    )
}
