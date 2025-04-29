
export const sanitizeHtmlClient = (html: string | null): string => {
  if (!html) return "";
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || "";
};

export const sanitizeHtmlServer = (html: string | null): string => {
  if (!html) return "";

  const withoutTags = html.replace(/<[^>]*>/g, '');

  return withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'");
};