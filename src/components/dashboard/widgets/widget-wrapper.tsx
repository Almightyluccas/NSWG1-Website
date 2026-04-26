import { type WidgetConfig, WIDGET_GRID_CLASSES } from "./widget-types";

interface WidgetWrapperProps {
  config: WidgetConfig;
  children: React.ReactNode;
}

export function WidgetWrapper({ config, children }: WidgetWrapperProps) {
  const Icon = config.icon;
  const colSpan = WIDGET_GRID_CLASSES[config.size];

  return (
    <div className={colSpan}>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-900/40 backdrop-blur-md shadow-sm h-full flex flex-col overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800/80 px-3.5 py-2.5 flex items-center gap-2 shrink-0">
          <Icon className="h-3.5 w-3.5 text-accent/90 shrink-0" />
          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-200 uppercase tracking-widest">
            {config.title}
          </span>
        </div>
        <div className="p-3.5 bg-zinc-50/50 dark:bg-zinc-950/30 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
