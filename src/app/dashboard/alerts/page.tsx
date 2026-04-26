import { Metadata } from "next";
import { AlertsClient } from "./alerts-client";

export const metadata: Metadata = {
  title: "Alert Center | NSWG1",
  description: "Directives and system notifications.",
};

export default function AlertsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-100">
          Alert Center
        </h1>
        <p className="text-sm font-mono text-zinc-400">
          Priority directives, warnings, and system communications.
        </p>
      </div>

      <AlertsClient />
    </div>
  );
}
