"use client"

export const sanitizeHtmlClient = (html: string | null): string => {
  if (!html) return "";
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || "";
};
