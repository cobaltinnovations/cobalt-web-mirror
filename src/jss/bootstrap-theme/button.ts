import Color from 'color';
import fonts from '@/jss/fonts';
import { CobaltTheme } from '@/jss/theme';

export const button = (theme: CobaltTheme) => {
	return {
		'.cobalt-button': {
			border: 0,
			...fonts.l,
			borderRadius: 500,
			appearance: 'none',
			color: theme.colors.white,
			padding: '15px 35px',
			textDecoration: 'none',
			...fonts.nunitoSansBold,
			textTransform: 'none',
			backgroundColor: theme.colors.primary,
			'&:hover': {
				color: theme.colors.white,
				textDecoration: 'none',
				backgroundColor: Color(theme.colors.primary).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(theme.colors.primary).darken(0.16).hex(),
			},
			'&:focus': {
				outline: 'none',
			},
			'&:disabled': {
				color: theme.colors.gray500,
				backgroundColor: theme.colors.gray200,
				'&:hover': {
					color: theme.colors.gray500,
					backgroundColor: theme.colors.gray200,
				},
			},

			'&-sm': {
				...fonts.m,
				padding: '10px 25px',
			},
			'&-xsm': {
				...fonts.m,
				padding: '5px 7px',
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
				backgroundColor: theme.colors.primary,
				'&:hover': {
					backgroundColor: Color(theme.colors.primary).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.primary).darken(0.16).hex(),
				},
			},

			/* ----------------------------------------------------------- */
			/* Secondary variant */
			/* ----------------------------------------------------------- */
			'&-secondary': {
				backgroundColor: theme.colors.secondary,
				'&:hover': {
					backgroundColor: Color(theme.colors.secondary).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.secondary).darken(0.16).hex(),
				},
			},

			/* ----------------------------------------------------------- */
			/* Success variant */
			/* ----------------------------------------------------------- */
			'&-success': {
				backgroundColor: theme.colors.success,
				'&:hover': {
					backgroundColor: Color(theme.colors.success).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.success).darken(0.16).hex(),
				},
			},

			/* ----------------------------------------------------------- */
			/* Danger variant */
			/* ----------------------------------------------------------- */
			'&-danger': {
				backgroundColor: theme.colors.danger,
				'&:hover': {
					backgroundColor: Color(theme.colors.danger).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.danger).darken(0.16).hex(),
				},
			},

			/* ----------------------------------------------------------- */
			/* Warning variant */
			/* ----------------------------------------------------------- */
			'&-warning': {
				color: theme.colors.dark,
				backgroundColor: theme.colors.warning,
				'&:hover': {
					backgroundColor: Color(theme.colors.warning).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.warning).darken(0.16).hex(),
				},
			},

			/* ----------------------------------------------------------- */
			/* Info variant */
			/* ----------------------------------------------------------- */
			'&-info': {
				backgroundColor: theme.colors.info,
				'&:hover': {
					backgroundColor: Color(theme.colors.info).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.info).darken(0.16).hex(),
				},
			},

			/* ----------------------------------------------------------- */
			/* Light variant */
			/* ----------------------------------------------------------- */
			'&-light': {
				color: theme.colors.primary,
				backgroundColor: theme.colors.light,
				'&:hover': {
					color: theme.colors.primary,
					backgroundColor: Color(theme.colors.primary).lighten(0.8).hex(),
				},
				'&:active': {
					color: theme.colors.white,
					backgroundColor: theme.colors.secondary,
				},
			},

			/* ----------------------------------------------------------- */
			/* Dark variant */
			/* ----------------------------------------------------------- */
			'&-dark': {
				backgroundColor: theme.colors.dark,
				'&:hover': {
					backgroundColor: Color(theme.colors.dark).lighten(0.16).hex(),
				},
				'&:active': {
					backgroundColor: Color(theme.colors.dark).darken(0.16).hex(),
				},
			},
			/* ----------------------------------------------------------- */
			/* Grey variant */
			/* ----------------------------------------------------------- */
			'&-grey': {
				backgroundColor: theme.colors.gray200,
				color: theme.colors.black,
				'&:hover': {
					backgroundColor: Color(theme.colors.gray300).darken(0.16).hex(),
					color: theme.colors.black,
				},
				'&:active': {
					backgroundColor: Color(theme.colors.gray300).lighten(0.16).hex(),
					color: theme.colors.black,
				},
			},
			/* ----------------------------------------------------------- */
			/* No-background variant */
			/* ----------------------------------------------------------- */
			'&-no-background': {
				backgroundColor: theme.colors.background,
				color: theme.colors.primary,
				'&:hover': {
					backgroundColor: theme.colors.background,
					color: theme.colors.primary,
				},
				'&:active': {
					backgroundColor: theme.colors.background,
					color: theme.colors.primary,
				},
			},

			/* ----------------------------------------------------------- */
			/* Clear variant */
			/* ----------------------------------------------------------- */
			'&-clear': {
				backgroundColor: 'transparent',
				color: theme.colors.dark,
				'&:hover': {
					backgroundColor: 'transparent',
					color: theme.colors.black,
				},
				'&:active': {
					backgroundColor: 'transparent',
					color: theme.colors.black,
				},
			},

			/* ----------------------------------------------------------- */
			/* Icon variant */
			/* ----------------------------------------------------------- */
			'&-icon': {
				padding: 0,
				backgroundColor: 'transparent',
				'&:hover': {
					backgroundColor: 'transparent',
				},
				'&:active': {
					backgroundColor: 'transparent',
				},
			},

			/* ----------------------------------------------------------- */
			/* Link variant */
			/* ----------------------------------------------------------- */
			'&-link': {
				color: theme.colors.primary,
				textDecoration: 'underline',
				backgroundColor: 'transparent',
				'&:hover': {
					color: theme.colors.primary,
					textDecoration: 'underline',
					backgroundColor: 'transparent',
				},
				'&:active': {
					backgroundColor: 'transparent',
					color: theme.colors.primary,
				},
			},

			'&-inverse': {
				backgroundColor: theme.colors.white,
				'&-primary': {
					color: theme.colors.primary,
				},
			},

			/* ----------------------------------------------------------- */
			/* Outline variants */
			/* ----------------------------------------------------------- */
			'&-outline-primary': {
				color: theme.colors.primary,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.primary}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.primary,
				},
			},
			'&-outline-secondary': {
				color: theme.colors.secondary,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.secondary}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.secondary,
				},
			},
			'&-outline-success': {
				color: theme.colors.success,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.success}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.success,
				},
			},
			'&-outline-danger': {
				color: theme.colors.danger,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.danger}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.danger,
				},
			},
			'&-outline-warning': {
				color: theme.colors.warning,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.warning}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.warning,
				},
			},
			'&-outline-info': {
				color: theme.colors.info,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.info}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.info,
				},
			},
			'&-outline-dark': {
				color: theme.colors.dark,
				backgroundColor: 'transparent',
				border: `1px solid ${theme.colors.dark}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.dark,
				},
			},
			'&-outline-light': {
				color: theme.colors.primary,
				backgroundColor: theme.colors.white,
				border: `1px solid ${theme.colors.primary}`,
				'&:hover': {
					color: theme.colors.white,
					backgroundColor: theme.colors.secondary,
				},
			},
		},
	};
};
