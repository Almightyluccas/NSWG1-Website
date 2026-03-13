import { CustomTheme } from "@/types/database";

export const ThemeInitializer = async ({ theme }: { theme: CustomTheme }) => {
  const cssVariables = `
    :root {
      --accent-color: ${theme.accent};
      --accent-color-darker: ${theme.accentDarker};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVariables }} />;
};
