import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        brand: {
            50: "#ecfeff",
            100: "#cffafe",
            200: "#a5f3fc",
            300: "#67e8f9",
            400: "#22d3ee",
            500: "#06b6d4",
            600: "#0891b2",
            700: "#0e7490",
            800: "#155e75",
            900: "#164e63"
        }
    },
    fonts: {
        heading: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    styles: {
        global: {
            body: {
                bg: "#f8fafc",
                color: "#0f172a"
            }
        }
    }
});

export default theme;
