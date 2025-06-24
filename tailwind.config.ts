import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        baie: 'hsl(var(--baie))',
      },
      spacing: {
        'sm': '0.5rem',  // 8px
        'md': '1rem',    // 16px
        'lg': '2rem',    // 32px
        'xl': '4rem',    // 64px (si besoin)
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "class",
};

export default config;
