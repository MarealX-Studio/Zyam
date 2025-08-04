import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				50: 'hsl(var(--primary-50))',
  				100: 'hsl(var(--primary-100))',
  				500: 'hsl(var(--primary-500))',
  				600: 'hsl(var(--primary-600))',
  				900: 'hsl(var(--primary-900))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			third: {
  				DEFAULT: 'hsl(var(--third))',
  				foreground: 'hsl(var(--third-foreground))'
  			},
  			/* Enhanced Semantic Colors */
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			error: {
  				DEFAULT: 'hsl(var(--error))',
  				foreground: 'hsl(var(--error-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'var(--radius-xl)'
  		},
  		/* Enhanced Animation System */
  		animation: {
  			'fade-in': 'fade-in var(--animation-normal) var(--ease-out-cubic)',
  			'slide-up': 'slide-up var(--animation-slow) var(--ease-in-out-cubic)',
  			'scale-in': 'scale-in var(--animation-normal) var(--ease-out-cubic)',
  			'shimmer': 'shimmer 1.5s infinite'
  		},
  		/* Custom Timing Functions */
  		transitionTimingFunction: {
  			'ease-out-cubic': 'var(--ease-out-cubic)',
  			'ease-in-out-cubic': 'var(--ease-in-out-cubic)'
  		},
  		/* Enhanced Spacing for Modern Design */
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  			'component-xs': 'var(--spacing-component-xs)',
  			'component-sm': 'var(--spacing-component-sm)',
  			'component-md': 'var(--spacing-component-md)',
  			'component-lg': 'var(--spacing-component-lg)',
  			'component-xl': 'var(--spacing-component-xl)',
  			'component-2xl': 'var(--spacing-component-2xl)'
  		},
  		/* Enhanced Typography Hierarchy */
  		fontSize: {
  			'h1': 'var(--text-hierarchy-h1)',
  			'h2': 'var(--text-hierarchy-h2)',
  			'h3': 'var(--text-hierarchy-h3)',
  			'body': 'var(--text-hierarchy-body)',
  			'small': 'var(--text-hierarchy-small)',
  			'caption': 'var(--text-hierarchy-caption)'
  		},
  		/* Visual Hierarchy Colors */
  		extend: {
  			colors: {
  				hierarchy: {
  					primary: 'hsl(var(--hierarchy-primary))',
  					secondary: 'hsl(var(--hierarchy-secondary))',
  					tertiary: 'hsl(var(--hierarchy-tertiary))'
  				}
  			}
  		},
  		/* Glass Morphism Support */
  		backdropBlur: {
  			'xs': '2px',
  			'3xl': '64px'
  		}
  	}
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate"), require("tailwindcss-safe-area")],
} satisfies Config;
