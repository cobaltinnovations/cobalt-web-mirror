import Color from 'color';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

export const button = {
	'.cobalt-button': {
		border: 0,
		...fonts.l,
		borderRadius: 500,
		appearance: 'none',
		color: colors.white,
		padding: '15px 35px',
		textDecoration: 'none',
		...fonts.nunitoSansBold,
		textTransform: 'none',
		backgroundColor: colors.primary,
		'&:hover': {
			color: colors.white,
			textDecoration: 'none',
			backgroundColor: Color(colors.primary).lighten(0.16).hex(),
		},
		'&:active': {
			backgroundColor: Color(colors.primary).darken(0.16).hex(),
		},
		'&:focus': {
			outline: 'none',
		},
		'&:disabled': {
			color: colors.gray500,
			backgroundColor: colors.gray200,
			'&:hover': {
				color: colors.gray500,
				backgroundColor: colors.gray200,
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
			backgroundColor: colors.primary,
			'&:hover': {
				backgroundColor: Color(colors.primary).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.primary).darken(0.16).hex(),
			},
		},

		/* ----------------------------------------------------------- */
		/* Secondary variant */
		/* ----------------------------------------------------------- */
		'&-secondary': {
			backgroundColor: colors.secondary,
			'&:hover': {
				backgroundColor: Color(colors.secondary).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.secondary).darken(0.16).hex(),
			},
		},

		/* ----------------------------------------------------------- */
		/* Success variant */
		/* ----------------------------------------------------------- */
		'&-success': {
			backgroundColor: colors.success,
			'&:hover': {
				backgroundColor: Color(colors.success).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.success).darken(0.16).hex(),
			},
		},

		/* ----------------------------------------------------------- */
		/* Danger variant */
		/* ----------------------------------------------------------- */
		'&-danger': {
			backgroundColor: colors.danger,
			'&:hover': {
				backgroundColor: Color(colors.danger).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.danger).darken(0.16).hex(),
			},
		},

		/* ----------------------------------------------------------- */
		/* Warning variant */
		/* ----------------------------------------------------------- */
		'&-warning': {
			color: colors.dark,
			backgroundColor: colors.warning,
			'&:hover': {
				backgroundColor: Color(colors.warning).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.warning).darken(0.16).hex(),
			},
		},

		/* ----------------------------------------------------------- */
		/* Info variant */
		/* ----------------------------------------------------------- */
		'&-info': {
			backgroundColor: colors.info,
			'&:hover': {
				backgroundColor: Color(colors.info).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.info).darken(0.16).hex(),
			},
		},

		/* ----------------------------------------------------------- */
		/* Light variant */
		/* ----------------------------------------------------------- */
		'&-light': {
			color: colors.primary,
			backgroundColor: colors.light,
			'&:hover': {
				color: colors.primary,
				backgroundColor: Color(colors.primary).lighten(0.8).hex(),
			},
			'&:active': {
				color: colors.white,
				backgroundColor: colors.secondary,
			},
		},

		/* ----------------------------------------------------------- */
		/* Dark variant */
		/* ----------------------------------------------------------- */
		'&-dark': {
			backgroundColor: colors.dark,
			'&:hover': {
				backgroundColor: Color(colors.dark).lighten(0.16).hex(),
			},
			'&:active': {
				backgroundColor: Color(colors.dark).darken(0.16).hex(),
			},
		},
		/* ----------------------------------------------------------- */
		/* Grey variant */
		/* ----------------------------------------------------------- */
		'&-grey': {
			backgroundColor: colors.gray200,
			color: colors.black,
			'&:hover': {
				backgroundColor: Color(colors.gray300).darken(0.16).hex(),
				color: colors.black,
			},
			'&:active': {
				backgroundColor: Color(colors.gray300).lighten(0.16).hex(),
				color: colors.black,
			},
		},
		/* ----------------------------------------------------------- */
		/* No-background variant */
		/* ----------------------------------------------------------- */
		'&-no-background': {
			backgroundColor: colors.background,
			color: colors.primary,
			'&:hover': {
				backgroundColor: colors.background,
				color: colors.primary,
			},
			'&:active': {
				backgroundColor: colors.background,
				color: colors.primary,
			},
		},

		/* ----------------------------------------------------------- */
		/* Clear variant */
		/* ----------------------------------------------------------- */
		'&-clear': {
			backgroundColor: 'transparent',
			color: colors.dark,
			'&:hover': {
				backgroundColor: 'transparent',
				color: colors.black,
			},
			'&:active': {
				backgroundColor: 'transparent',
				color: colors.black,
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
			color: colors.primary,
			textDecoration: 'underline',
			backgroundColor: 'transparent',
			'&:hover': {
				color: colors.primary,
				textDecoration: 'underline',
				backgroundColor: 'transparent',
			},
			'&:active': {
				backgroundColor: 'transparent',
				color: colors.primary,
			},
		},

		'&-inverse': {
			backgroundColor: colors.white,
			'&-primary': {
				color: colors.primary,
			},
		},

		/* ----------------------------------------------------------- */
		/* Outline variants */
		/* ----------------------------------------------------------- */
		'&-outline-primary': {
			color: colors.primary,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.primary}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.primary,
			},
		},
		'&-outline-secondary': {
			color: colors.secondary,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.secondary}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.secondary,
			},
		},
		'&-outline-success': {
			color: colors.success,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.success}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.success,
			},
		},
		'&-outline-danger': {
			color: colors.danger,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.danger}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.danger,
			},
		},
		'&-outline-warning': {
			color: colors.warning,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.warning}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.warning,
			},
		},
		'&-outline-info': {
			color: colors.info,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.info}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.info,
			},
		},
		'&-outline-dark': {
			color: colors.dark,
			backgroundColor: 'transparent',
			border: `1px solid ${colors.dark}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.dark,
			},
		},
		'&-outline-light': {
			color: colors.primary,
			backgroundColor: colors.white,
			border: `1px solid ${colors.primary}`,
			'&:hover': {
				color: colors.white,
				backgroundColor: colors.secondary,
			},
		},
	},
};
