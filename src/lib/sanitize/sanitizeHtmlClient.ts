"use client";

import { sanitizeHtmlServer } from "@/lib/sanitize/sanitizeHtmlServer";

export const sanitizeHtmlClient = (html: string | null): string => {
  if (!html) return "";
  if (typeof document === "undefined") {
    return sanitizeHtmlServer(html);
  }
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || "";
};
