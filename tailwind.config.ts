// tailwind.config.ts
import type { Config } from "tailwindcss"
import tailwindcssRadix from "tailwindcss-radix" // Import the plugin

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Make sure your main app entry file is covered, e.g., 'app/**/*.{js,ts,jsx,tsx,mdx}' or 'src/**/*.{js,ts,jsx,tsx,mdx}'
    // If you have components directly in the root, then `*.{js,ts,jsx,tsx,mdx}` is okay, but generally, components are in `components/`
    // Double-check your actual file structure for content array.
    "*.{js,ts,jsx,tsx,mdx}", // Consider if this is truly needed or if your components/app covers everything
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        amber: {
          400: "#DFC069",
          500: "#C9A84B",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    tailwindcssRadix({
      // Configure radix variants you want to enable.
      // By default, it enables most common ones.
      // You can explicitly list them if you only want certain ones.
      // e.g., 'state', 'disabled', 'open', 'checked', etc.
      // For your case, `disabled` is key.
    }),
    // If you use animations from shadcn/ui, you'll need this.
                                    // It's often included in shadcn setup.
  ],
}
export default config