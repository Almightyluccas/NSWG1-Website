export function WorldMap({ lat, lng }: { lat: number; lng: number }) {
  // A simplified, stylized SVG world map
  // We'll map the provided coordinates roughly onto the SVG path.
  // The map coordinates are roughly: minX: 0, maxX: 1000, minY: 0, maxY: 600

  // Calculate marker position (very rough mercator-ish projection for aesthetic purposes)
  const x = (lng + 180) * (1000 / 360);
  const y = (90 - lat) * (600 / 180);

  return (
    <div className="relative w-full aspect-[5/3] bg-zinc-950/80 rounded-sm overflow-hidden border border-zinc-800/80 group">
      {/* Grid overlay for tactical look */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-zinc-950 to-zinc-950" />

      {/* SVG Map */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full text-zinc-800/60 drop-shadow-md relative z-10"
        fill="currentColor"
      >
        {/* Simplified world paths for aesthetic purposes */}
        <path d="M120 180 Q150 150 180 160 T250 190 T280 250 T220 300 T180 350 T150 450 T130 500 T100 480 T80 400 T70 300 T90 220 Z" />{" "}
        {/* Americas rough shape */}
        <path d="M450 150 Q500 120 540 140 T580 180 T650 190 T700 150 T750 120 T800 160 T850 200 T900 250 T880 300 T850 350 T750 400 T650 380 T550 450 T500 480 T460 380 T420 350 T400 300 T420 200 Z" />{" "}
        {/* Eurasia/Africa rough shape */}
        <path d="M750 450 Q800 420 850 450 T900 500 T850 550 T780 520 Z" />{" "}
        {/* Oceania rough shape */}
      </svg>

      {/* Crosshairs & Target Info lines */}
      <div
        className="absolute top-0 bottom-0 w-px bg-accent/20 z-10 pointer-events-none"
        style={{ left: `${x}%` }}
      />
      <div
        className="absolute left-0 right-0 h-px bg-accent/20 z-10 pointer-events-none"
        style={{ top: `${y}%` }}
      />

      {/* The Pin / Marker */}
      <div
        className="absolute z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 600) * 100}%` }}
      >
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-black"></span>
        </div>

        {/* Targeting HUD box that appears on hover */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-zinc-950/90 border border-accent/40 px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">
          <p className="text-[9px] font-mono text-accent uppercase">
            TGT LOCK {lat.toFixed(2)}, {lng.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Coordinates Display at bottom corner */}
      <div className="absolute bottom-2 left-2 z-20 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-sm backdrop-blur-md">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <span className="text-accent/60">LAT</span> {Math.abs(lat).toFixed(4)}
          ° {lat >= 0 ? "N" : "S"}
          <span className="text-zinc-700">|</span>
          <span className="text-accent/60">LNG</span> {Math.abs(lng).toFixed(4)}
          ° {lng >= 0 ? "E" : "W"}
        </p>
      </div>

      {/* Top right tactical overlay */}
      <div className="absolute top-2 right-2 z-20 flex gap-1">
        <div className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-pulse" />
        <div className="text-[8px] font-mono text-accent/60 tracking-widest">
          SAT-LINK ACTIVE
        </div>
      </div>
    </div>
  );
}
