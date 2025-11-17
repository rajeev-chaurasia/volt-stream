import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                volt: {
                    cyan: '#22d3ee',
                    blue: '#3b82f6',
                    dark: '#0f172a',
                }
            }
        },
    },
    plugins: [],
};
export default config;
