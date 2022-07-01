import { CobaltTheme } from '@/jss/theme';

export const button = (theme: CobaltTheme) => {
	return {
		'.cobalt-button': {
			border: 0,
			borderRadius: 500,
			appearance: 'none',
			padding: '10px 20px',
			...theme.fonts.bodyBold,
			fontSize: '1.6rem',
			lineHeight: '2rem',
			textTransform: 'none',
			'&:focus': {
				outline: 'none',
			},
			'&:disabled': {
				color: theme.colors.n500,
				backgroundColor: theme.colors.n100,
				cursor: 'not-allowed',
				'&:hover': {
					color: theme.colors.n500,
					backgroundColor: theme.colors.n100,
				},
			},

			'&-lg': {
				fontSize: '1.8rem',
				lineHeight: '2.4rem',
				padding: '12px 28px',
			},

			'&-sm': {
				fontSize: '1.4rem',
				padding: '6px 16px',
			},

			'& svg': {
				fill: 'currentColor',
				'& path': {
					fill: 'currentColor',
				},
			},

			/* ----------------------------------------------------------- */
			/* Primary variant */
			/* ----------------------------------------------------------- */
			'&-primary': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.p500,
				'&:hover': {
					backgroundColor: theme.colors.p300,
				},
				'&:active': {
					backgroundColor: theme.colors.p700,
				},
			},

			/* ----------------------------------------------------------- */
			/* Secondary variant */
			/* ----------------------------------------------------------- */
			'&-secondary': {
				color: theme.colors.n0,
				backgroundColor: theme.colors.a500,
				'&:hover': {
					backgroundColor: theme.colors.a300,
				},
				'&:active': {
					backgroundColor: theme.colors.a500,
				},
			},

			/* ----------------------------------------------------------- */
			/* Success variant */
			/* ----------------------------------------------------------- */
			'&-success': {
				backgroundColor: theme.colors.s500,
				'&:hover': {
					backgroundColor: theme.colors.s300,
				},
				'&:active': {
					backgroundColor: theme.colors.s500,
				},
			},

			/* ----------------------------------------------------------- */
			/* Danger variant */
			/* ----------------------------------------------------------- */
			'&-danger': {
				backgroundColor: theme.colors.d500,
				'&:hover': {
					backgroundColor: theme.colors.d300,
				},
				'&:active': {
					backgroundColor: theme.colors.d500,
				},
			},

			/* ----------------------------------------------------------- */
			/* Warning variant */
			/* ----------------------------------------------------------- */
			'&-warning': {
				color: theme.colors.n900,
				backgroundColor: theme.colors.w500,
				'&:hover': {
					backgroundColor: theme.colors.w300,
				},
				'&:active': {
					backgroundColor: theme.colors.w500,
				},
			},

			/* ----------------------------------------------------------- */
			/* Info variant */
			/* ----------------------------------------------------------- */
			'&-info': {
				backgroundColor: theme.colors.i500,
				'&:hover': {
					backgroundColor: theme.colors.i300,
				},
				'&:active': {
					backgroundColor: theme.colors.i500,
				},
			},

			/* ----------------------------------------------------------- */
			/* Light variant */
			/* ----------------------------------------------------------- */
			'&-light': {
				color: theme.colors.p700,
				backgroundColor: theme.colors.n0,
				'&:hover': {
					backgroundColor: theme.colors.n50,
				},
				'&:active': {
					backgroundColor: theme.colors.n75,
				},
			},

			/* ----------------------------------------------------------- */
			/* Link variant */
			/* ----------------------------------------------------------- */
			'&-link': {
				color: theme.colors.p500,
				textDecoration: 'underline',
				backgroundColor: 'transparent',
				'&:hover': {
					color: theme.colors.p700,
					textDecoration: 'underline',
					backgroundColor: 'transparent',
				},
				'&:active': {
					backgroundColor: 'transparent',
					color: theme.colors.p700,
				},
			},

			/* ----------------------------------------------------------- */
			/* Outline variants */
			/* ----------------------------------------------------------- */
			'&-outline-primary': {
				color: theme.colors.p500,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.p500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.p500,
				},
				'&:active': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.p700,
				},
			},
			'&-outline-secondary': {
				color: theme.colors.a500,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.a500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.a500,
				},
			},
			'&-outline-success': {
				color: theme.colors.s500,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.s500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.s500,
				},
			},
			'&-outline-danger': {
				color: theme.colors.d500,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.d500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.d500,
				},
			},
			'&-outline-warning': {
				color: theme.colors.w500,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.w500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.w500,
				},
			},
			'&-outline-info': {
				color: theme.colors.i500,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.i500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.i500,
				},
			},
			'&-outline-dark': {
				color: theme.colors.n900,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.n900}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.n900,
				},
			},
			'&-outline-light': {
				color: theme.colors.p500,
				backgroundColor: theme.colors.n0,
				border: `1px solid ${theme.colors.p500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.a500,
				},
			},
		},
	};
};
