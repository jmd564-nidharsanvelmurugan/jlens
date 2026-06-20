/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
export default {
	darkMode: ["class"],

	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"../../../packages/ui/dist/**/*.{js,ts,jsx,tsx}", // Add this line
		'../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				righteous: ['"Righteous"', { fontFeatureSettings: '"salt" 1, "ss01" 1' }, ...defaultTheme.fontFamily.sans],
				"share-tech-mono": [
					'"Share Tech Mono"',
					{ fontFeatureSettings: '"calt" 1, "liga" 1' },
					...defaultTheme.fontFamily.sans,
				],
				"share-tech": ['"Share Tech"', { fontFeatureSettings: '"calt" 1, "liga" 1' }, ...defaultTheme.fontFamily.sans],
				"rethink-sans": [
					{
						fontFeatureSettings: '"calt" 1, "liga" 1, "ss01" 1',
						fontVariationSettings: '"wght" 450',
					},
					'"Rethink Sans"',
					...defaultTheme.fontFamily.sans,
				],
				sans: ['"Rethink Sans"', ...defaultTheme.fontFamily.sans],
			},
			colors: {
				background: '#ffffff',
				foreground: '#4c4c4c',
				card: {
					DEFAULT: '#fafafa',
					foreground: '#4c4c4c'
				},
				popover: {
					DEFAULT: '#fcfcfc',
					foreground: '#4c4c4c'
				},
				primary: {
					DEFAULT: '#19105b',
					dark: '#1b163e',
					foreground: '#19105bcc'
				},
				primary2: {
					DEFAULT: '#7a70c2',
				},
				secondary: {
					DEFAULT: '#ff6196',
					foreground: '#4c4c4c'
				},
				secondaryLight: {
					DEFAULT: '#ff6196',
					foreground: '#4c4c4c'
				},
				muted: {
					DEFAULT: '#bcbcbc',
					foreground: '#4c4c4c'
				},
				accent: {
					DEFAULT: '#fafafa',
					foreground: '#4c4c4c'
				},
				destructive: {
					DEFAULT: '#fa5252',
					foreground: '#ffffff'
				},
				border: '#bcbcbc',
				input: '#ffffff',
				ring: '#7a70c2',
				chart: {
					'1': '#31286c',
					'2': '#4c4c4c',
					'3': '#fdfdfd',
					'4': '#fafafa',
					'5': '#bcbcbc'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				shrink: {
					'0%': { width: '100%' },
					'100%': { width: '0%' },
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'light-bounce': {
					'0%, 80%, 100%': { transform: 'scale(0)' },
					'40%': { transform: 'scale(1)' },
				},
				'gentle-fade': {
					'0%, 100%': { opacity: 0.2 },
					'50%': { opacity: 1 },
				},
				marquee: {
					from: {
						transform: 'translateX(0)'
					},
					to: {
						transform: 'translateX(calc(-100% - var(--gap)))'
					}
				},
				'marquee-vertical': {
					from: {
						transform: 'translateY(0)'
					},
					to: {
						transform: 'translateY(calc(-100% - var(--gap)))'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'light-bounce': 'light-bounce 1.4s infinite ease-in-out',
				'gentle-fade': 'gentle-fade 1.5s infinite ease-in-out',
				marquee: 'marquee var(--duration) infinite linear',
				'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
				shrink: 'shrink 5s linear forwards',
			},
			scrollbar: {
				thin: {
					width: '2px',
					height: '2px',
				},
			},
			typography: {
				custom: {
					css: {
						color: 'inherit',
						maxWidth: 'none',
						fontSize: '0.875rem',
						h1: { fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' },
						h2: { fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' },
						h3: { marginTop: '0.5rem' },
						hr: { borderColor: 'black', marginTop: '1rem', marginBottom: '1rem' },
						p: { marginTop: '0.5rem', marginBottom: '0.5rem' },
						a: {
							color: 'var(--primary-04)',
							textDecoration: 'underline',
							'&:hover': { color: 'var(--primary)' },
						},
						code: {
							backgroundColor: '#f4f4f5',
							padding: '0.2rem 0.4rem',
							borderRadius: '4px',
							color: '#41368f', // <-- Updated color
							fontSize: '0.85em',
							fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
						},
						'pre code': {
							backgroundColor: '#0f172a', // dark slate
							color: '#f8fafc',
							padding: '1rem',
							display: 'block',
							borderRadius: '0.5rem',
							fontSize: '0.85rem',
							overflowX: 'auto',
							lineHeight: '1.5',
							fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
						},
						pre: {
							backgroundColor: '#0f172a',
							padding: 0,
							borderRadius: '0.5rem',
							overflowX: 'auto',
							marginTop: '1rem',
							marginBottom: '1rem',
						},
					},
				},
			}

		}
	},
	plugins: [
		require('tailwind-scrollbar'),
		require("@tailwindcss/typography"),
	],
}

