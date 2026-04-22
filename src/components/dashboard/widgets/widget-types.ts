import { type LucideIcon } from "lucide-react";

export type WidgetSize = "sm" | "md" | "full";

export interface WidgetConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  size: WidgetSize;
}

// Grid column span mapping for each size
export const WIDGET_GRID_CLASSES: Record<WidgetSize, string> = {
  sm: "col-span-1",
  md: "col-span-1 md:col-span-2",
  full: "col-span-1 md:col-span-2 lg:col-span-3",
};
