import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 relative">
      {/* Accent line at top */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-3">
              <span className="text-accent">NSWG</span>1
            </h3>
            <p className="text-zinc-500 text-sm italic">
              The Only Easy Day Was Yesterday
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Navigation
            </h4>
            <div className="flex flex-col space-y-2">
              <Link
                href="/about"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                About
              </Link>
              <Link
                href="/gallery"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                Gallery
              </Link>
              <Link
                href="/join"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                Join
              </Link>
              <Link
                href="/privacy"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Units */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Units
            </h4>
            <div className="flex flex-col space-y-2">
              <Link
                href="/units/tf160th"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                Task Force 160th
              </Link>
              <Link
                href="/units/tacdevron2"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                TACDEVRON2
              </Link>
            </div>
          </div>

          {/* Operations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Operations
            </h4>
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard/operations"
                className="text-zinc-500 hover:text-accent transition-colors text-sm"
              >
                Operations
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800/50 mt-10 pt-8 text-center text-zinc-600 text-xs tracking-wider">
          © {new Date().getFullYear()} Naval Special Warfare Group One Milsim
          Unit. All rights reserved.
          <br />
          Website developed and maintained by{" "}
          <a
            href="https://luccasportfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-accent transition-colors"
          >
            Luccas Amorim
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
