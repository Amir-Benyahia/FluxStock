/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: '#161618',
                    light: '#1e1e21',
                    border: '#232326',
                },
                accent: {
                    DEFAULT: '#2dd4bf',
                    dim: '#1a3a35',
                    hover: '#14b8a6',
                    muted: 'rgba(45, 212, 191, 0.10)',
                },
            },
            fontFamily: {
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
