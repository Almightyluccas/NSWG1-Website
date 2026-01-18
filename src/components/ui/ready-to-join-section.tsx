"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RequirementItem } from "@/components/ui/requirment-list-items";
import Link from "next/link";

export function ReadyToJoinSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openRequirementsModal = (): void => setIsModalOpen(true);
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/*<Image src="/images/join-background.png" alt="Join NSWG1" fill className="object-cover opacity-40" />*/}
        {/* bg-gradient-to-b from-zinc-900/90 via-zinc-900/80 to-zinc-900*/}
        <div className="absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="bg-zinc-800/50 backdrop-blur-sm p-10 rounded-lg border border-zinc-700">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                Are <span className="text-accent">you</span> ready to join{" "}
                <span className="text-accent">NSWG1</span>?
              </h2>
              <div className="h-1 w-24 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-zinc-300 mb-8 text-center">
                Whether you&apos;re a seasoned MILSIM veteran or brand new to
                the scene, experience military realism at its finest with Naval
                Special Warfare Group One. Join an elite tactical team in Arma
                3, where immersive simulations meet real-world tactics. Your
                journey into true military realism begins here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/join"}>
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent-darker text-black"
                  >
                    Enlist Today
                  </Button>
                </Link>
                <Button
                  onClick={openRequirementsModal}
                  size="lg"
                  variant="outline"
                  className="border-zinc-600 hover:bg-zinc-700"
                >
                  View Requirements
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <ul className="space-y-6">
            <RequirementItem>
              You must be at least 18 years of age (Waivers can apply).
            </RequirementItem>
            <RequirementItem>
              You must be willing to submit to a lengthy and detailed training
              process.
            </RequirementItem>
            <RequirementItem>
              You must be able to attend Eastern Time Operations / Events.
            </RequirementItem>
            <RequirementItem>
              You must have a working Microphone (No static, echo, etc).
            </RequirementItem>
          </ul>
        </DialogContent>
      </Dialog>
    </section>
  );
}
