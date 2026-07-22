import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxWidth: { container: "var(--container-max-width)" },
      spacing: {
        sidebar: "var(--sidebar-width)",
        header: "var(--header-height)",
        card: "var(--card-padding)",
      },
      borderRadius: {
        card: "var(--card-radius)",
        input: "var(--input-radius)",
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--surface-border)",
        foreground: "var(--text-main)",
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        success: "var(--accent-green)",
        danger: "var(--accent-red)",
      },
    },
  },
  plugins: [],
} satisfies Config;
