/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#800000', // Bordó
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#f3f4f6', // Gris claro
                    foreground: '#1f2937',
                },
                accent: {
                    DEFAULT: '#d4af37', // Dorado
                    foreground: '#000000',
                },
            },
        },
    },
    plugins: [],
};
