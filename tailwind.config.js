/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Government neutral palette
        "gov-bg": "#F5F6FA",
        "gov-card": "#FFFFFF",
        "gov-text-primary": "#1D1F24",
        "gov-text-secondary": "#6B7280",
        "gov-blue": "#2B6CB0",
        "gov-amber": "#D97706",
        "gov-red": "#C53030",
        // Status colors (unified 3-color system)
        "status-high": "#2B6CB0", // High readiness - muted blue
        "status-medium": "#C49B0B", // Medium - muted gold
        "status-low": "#B91C1C", // Low - muted red
      },
    },
  },
  plugins: [],
};
