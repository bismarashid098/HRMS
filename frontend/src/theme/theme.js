import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        brand: {
            50:  "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#10b981",
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
        }
    },
    fonts: {
        heading: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        body:    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    styles: {
        global: {
            body: {
                bg:    "#061828",
                color: "#e2e8f0",
            },
            "*::-webkit-scrollbar":        { width: "4px", height: "4px" },
            "*::-webkit-scrollbar-track":  { background: "rgba(255,255,255,0.04)" },
            "*::-webkit-scrollbar-thumb":  { background: "#1e3a5f", borderRadius: "99px" },
        }
    }
});

export default theme;
