import { CobaltTheme } from '@/jss/theme';
import Color from 'color';

export const button = (theme: CobaltTheme) => {
	return {
		'.cobalt-button': {
			border: 0,
			borderRadius: 500,
			appearance: 'none',
			padding: '8px 20px',
			...theme.fonts.bodyBold,
			fontSize: '1.4rem',
			lineHeight: '2.4rem',
			position: 'relative',
			textTransform: 'none',
			'&:focus-visible': {
				outline: 'none',
				boxShadow: `0 0 0 4px ${Color(theme.colors.p500).alpha(0.24).string()}`,
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
				fontSize: '1.6rem',
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
				color: theme.colors.n0,
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
				color: theme.colors.n0,
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
				border: `1px solid ${theme.colors.border}`,
				'&:hover': {
					backgroundColor: theme.colors.n50,
				},
				'&:active': {
					backgroundColor: theme.colors.n75,
				},
			},

			/* ----------------------------------------------------------- */
			/* Dark variant / Disabled */
			/* ----------------------------------------------------------- */
			'&-dark': {
				color: theme.colors.n500,
				backgroundColor: theme.colors.n100,
				cursor: 'not-allowed',
				'&:hover': {
					color: theme.colors.n500,
					backgroundColor: theme.colors.n100,
				},
				'&:active': {
					backgroundColor: theme.colors.n100,
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
				...outlineButton(theme.colors.p500, theme.colors.n0, theme.colors.p700),
			},
			'&-outline-secondary': {
				...outlineButton(theme.colors.a500, theme.colors.n0, theme.colors.a700),
			},
			'&-outline-success': {
				...outlineButton(theme.colors.s500, theme.colors.n0, theme.colors.s700),
			},
			'&-outline-danger': {
				...outlineButton(theme.colors.d500, theme.colors.n0, theme.colors.d700),
			},
			'&-outline-warning': {
				...outlineButton(theme.colors.w500, theme.colors.n0, theme.colors.w700),
			},
			'&-outline-info': {
				...outlineButton(theme.colors.i500, theme.colors.n0, theme.colors.i700),
			},
			'&-outline-dark': {
				...outlineButton(theme.colors.n900, theme.colors.n0, theme.colors.n900),
			},
			'&-outline-light': {
				color: theme.colors.p500,
				backgroundColor: theme.colors.n0,
				border: `2px solid ${theme.colors.p500}`,
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.a500,
				},
			},
		},
	};
};

const outlineButton = (color: string, hoverTextColor: string, activeColor: string) => {
	return {
		color: color,
		backgroundColor: 'transparent',
		'&:after': {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			content: '""',
			position: 'absolute',
			pointerEvents: 'none',
			borderRadius: 'inherit',
			border: `2px solid ${color}`,
		},
		'&:hover': {
			color: hoverTextColor,
			backgroundColor: color,
		},
		'&:active': {
			color: hoverTextColor,
			backgroundColor: activeColor,
		},
		'&:disabled:after': {
			border: `2px solid ${color}`,
		},
	};
};

export const screeningButtonGroup = (theme: CobaltTheme) => {
	return {
		'.cobalt-screening-button-group': {
			'& input.btn-check': {
				'& + label': {
					paddingLeft: 16,
					cursor: 'pointer',

					'& .checkmark-wrapper': {
						width: 25,
						height: 25,
						marginLeft: -8,
						borderRadius: 500,
						border: `2px solid ${theme.colors.n300}`,
						'& svg': {
							width: 20,
							height: 20,
							'& polygon#Shape': {
								fill: theme.colors.n0,
							},
						},
					},

					// when checked
					'&.cobalt-button-primary': {
						'& .checkmark-wrapper': {
							backgroundColor: theme.colors.p300,
							borderColor: theme.colors.p300,
						},

						'&:hover': {
							'& .checkmark-wrapper': {
								borderColor: theme.colors.p300,
							},
						},
					},
				},
			},

			'& .cobalt-button': {
				border: 0,
				'&:after': {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					content: '""',
					position: 'absolute',
					pointerEvents: 'none',
					borderRadius: 'inherit',
					border: `1px solid ${theme.colors.border}`,
				},

				'&:hover': {
					'&:after': {
						border: `2px solid ${theme.colors.p500}`,
					},
				},

				'&.cobalt-button-light': {
					'&:hover': {
						backgroundColor: theme.colors.n0,
						color: theme.colors.p500,
					},
				},

				'&.cobalt-button-primary': {
					'&:after': {
						border: `2px solid ${theme.colors.p500}`,
					},
					'&:hover': {
						backgroundColor: theme.colors.p500,
					},
				},

				'&.disabled': {
					opacity: 0.5,
				},
			},
		},
	};
};
