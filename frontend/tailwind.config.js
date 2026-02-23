/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1", // indigo-500
                secondary: "#0ea5e9", // sky-500
                background: "#0f172a", // slate-900
                surface: "#1e293b", // slate-800
                "surface-light": "#334155", // slate-700
                glass: "rgba(255, 255, 255, 0.05)",
                "glass-border": "rgba(255, 255, 255, 0.1)",
                error: "#f43f5e", // rose-500
                warning: "#f59e0b", // amber-500
                success: "#10b981", // emerald-500
            },
        },
    },
    plugins: [],
}
