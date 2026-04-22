"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const handleSignIn = async () => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `remember-me-intent=${
      rememberMe ? "true" : "false"
    }; path=/; max-age=600; SameSite=Lax${secure}`;

    await signIn("discord", {
      callbackUrl: callbackUrl,
    });
  };

  return (
    <main className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <Navbar />

      {/* Background with tactical scanline/grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-zinc-950 z-10" />
        <div 
          className="absolute inset-0 z-10 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }}
        />
        <Image
          src="/images/tacdev/tacdev-hero.png" // Using existing image for tactical feel
          alt="Login Background"
          fill
          className="object-cover opacity-30 grayscale"
        />
      </div>

      <div className="relative z-20 pt-20 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <FadeIn>
            <div className="w-full max-w-md relative group">
                
              {/* Outer Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/0 rounded-lg blur opacity-50 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
                
              {/* Glassmorphic Tactical Card */}
              <div className="relative bg-zinc-900/80 backdrop-blur-md rounded-sm border border-zinc-700/60 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                
                {/* Header Bar */}
                <div className="bg-zinc-800/80 px-4 py-3 border-b border-zinc-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="text-accent text-xs font-mono font-bold tracking-widest uppercase">
                       SECURE_LOGIN
                     </span>
                     <div className="h-1.5 w-1.5 bg-accent/80 rounded-full animate-pulse" />
                  </div>
                  <span className="text-zinc-500 text-[10px] font-mono tracking-widest">
                    NODE_5.2
                  </span>
                </div>

                <div className="p-8">
                  <div className="flex justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full" />
                    <div className="relative w-24 h-24 p-2 border border-zinc-700/50 rounded-full bg-zinc-950/50 backdrop-blur-sm shadow-[0_0_15px_rgba(var(--accent-color),0.1)] flex items-center justify-center">
                      <Image
                        src="/images/nswg1-emblem.png"
                        alt="NSWG1 Logo"
                        width={64}
                        height={64}
                        className="object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      />
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest text-zinc-100">
                    Authenticate
                  </h1>

                  <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-2 pb-2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded-sm border-zinc-600 bg-zinc-800 text-accent focus:ring-accent focus:ring-offset-zinc-900 cursor-pointer transition-colors"
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-xs font-mono text-zinc-400 cursor-pointer select-none uppercase tracking-wider hover:text-zinc-300 transition-colors"
                      >
                        Keep Session Active
                      </label>
                    </div>

                    {/* Discord Login */}
                    <Button
                      onClick={handleSignIn}
                      type="button"
                      className="w-full bg-zinc-800/80 hover:bg-[#5865F2] text-zinc-300 hover:text-white border border-zinc-700 hover:border-[#5865F2] h-12 flex items-center justify-center transition-all duration-300 group shadow-[0_0_15px_rgba(var(--accent-color),0.1)] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]"
                    >
                      <svg
                        className="h-5 w-5 mr-3 text-[#5865F2] group-hover:text-white transition-colors"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 127.14 96.36"
                        fill="currentColor"
                      >
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                      </svg>
                      <span className="font-semibold tracking-wider font-mono text-sm uppercase">Discord Network</span>
                    </Button>
                  </div>


                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-zinc-500 font-mono tracking-widest max-w-sm mx-auto">
              UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
