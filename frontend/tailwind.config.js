/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                background: "var(--background)",
                surface: "var(--surface)",
                "surface-light": "var(--surface-light)",
                glass: "var(--glass)",
                "glass-border": "var(--glass-border)",
                error: "var(--error)",
                warning: "var(--warning)",
                success: "var(--success)",
                muted: "var(--text-muted)",
            },
        },
    },
    plugins: [],
}
