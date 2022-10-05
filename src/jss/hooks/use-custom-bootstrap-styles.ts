import { badge, button, card, form, modal, screeningButtonGroup, surveyForm } from '@/jss/bootstrap-theme';
import mediaQueries from '@/jss/media-queries';
import Color from 'color';
import { createUseThemedStyles } from '@/jss/theme';

export const useCustomBootstrapStyles = createUseThemedStyles((theme) => ({
	'@global': {
		/* ----------------------------------------------------------- */
		/* bsPrefix overrides */
		/* ----------------------------------------------------------- */
		...badge(theme),
		...button(theme),
		...card(theme),
		...form(theme),
		...modal(theme),
		...surveyForm(theme),
		...screeningButtonGroup(theme),

		/* ----------------------------------------------------------- */
		/* Generic overrides */
		/* ----------------------------------------------------------- */
		'.font-heading-normal': {
			...theme.fonts.headingNormal,
		},
		'.font-heading-bold': {
			...theme.fonts.headingBold,
		},

		'.fw-normal': {
			...theme.fonts.bodyNormal,
		},
		'.fw-bold': {
			...theme.fonts.bodyBold,
		},

		'.text-primary': {
			color: `${theme.colors.p500} !important`,
		},
		'.text-secondary': {
			color: `${theme.colors.a500} !important`,
		},
		'.text-success': {
			color: `${theme.colors.s500} !important`,
		},
		'.text-danger': {
			color: `${theme.colors.d500} !important`,
		},
		'.text-warning': {
			color: `${theme.colors.w500} !important`,
		},
		'.text-info': {
			color: `${theme.colors.i500} !important`,
		},
		'.text-light': {
			color: `${theme.colors.n0} !important`,
		},
		'.text-dark': {
			color: `${theme.colors.n900} !important`,
		},
		'.text-gray': {
			color: `${theme.colors.n500} !important`,
		},

		'.text-decoration-underline': {
			textDecoration: 'underline !important',
		},
		'.text-right': {
			textAlign: 'right',
		},

		'.cursor-pointer': {
			cursor: 'pointer !important',
		},

		'.bg-primary': {
			backgroundColor: `${theme.colors.p500} !important`,
		},
		'.bg-secondary': {
			backgroundColor: `${theme.colors.a500} !important`,
		},
		'.bg-success': {
			backgroundColor: `${theme.colors.s500} !important`,
		},
		'.bg-danger': {
			backgroundColor: `${theme.colors.d500} !important`,
		},
		'.bg-warning': {
			backgroundColor: `${theme.colors.w500} !important`,
		},
		'.bg-info': {
			backgroundColor: `${theme.colors.i500} !important`,
		},
		'.bg-light': {
			backgroundColor: `${theme.colors.n0} !important`,
		},
		'.bg-n50': {
			backgroundColor: `${theme.colors.n50} !important`,
		},
		'.bg-n75': {
			backgroundColor: `${theme.colors.n75} !important`,
		},
		'.bg-dark': {
			backgroundColor: `${theme.colors.n900} !important`,
		},

		'.border': {
			border: `1px solid ${theme.colors.border} !important`,
		},
		'.border-top': {
			borderTop: `1px solid ${theme.colors.border} !important`,
		},
		'.border-end': {
			borderRight: `1px solid ${theme.colors.border} !important`,
		},
		'.border-bottom': {
			borderBottom: `1px solid ${theme.colors.border} !important`,
		},
		'.border-start': {
			borderLeft: `1px solid ${theme.colors.border} !important`,
		},
		'.selected-border-bottom': {
			borderBottom: `3px solid ${theme.colors.a500} !important`,
		},
		'.no-border': {
			border: 'none',
		},

		'.carousel-item': {
			paddingBottom: 30,
			backgroundColor: theme.colors.n0,
		},
		'.carousel-control-prev, .carousel-control-next': {
			zIndex: 0,
			width: 44,
			height: 44,
			opacity: 1,
			transform: 'translateY(-50%)',
			marginTop: `calc(${((9 / 16) * 100) / 2}%)`,
			'& svg': {
				width: 16,
				height: 16,
				fill: theme.colors.n0,
			},
		},
		'.carousel-indicators': {
			zIndex: 1,
		},
		'.carousel-indicators li': {
			width: 10,
			height: 10,
			opacity: 1,
			marginLeft: 7,
			marginRight: 7,
			borderRadius: '50%',
			backgroundColor: theme.colors.background,
			'&.active': {
				backgroundColor: theme.colors.a300,
			},
		},

		'.container': {
			paddingLeft: 20,
			paddingRight: 20,
		},

		'.container-fluid': {
			paddingLeft: 0,
			paddingRight: 0,
			overflow: 'hidden',
		},
		'.container-xs': {
			[mediaQueries.xs]: {
				paddingLeft: 0,
				paddingRight: 0,
				overflow: 'hidden',
			},
		},
		'.container-sm': {
			[mediaQueries.sm]: {
				paddingLeft: 0,
				paddingRight: 0,
				overflow: 'hidden',
			},
		},
		'.container-md': {
			[mediaQueries.md]: {
				paddingLeft: 0,
				paddingRight: 0,
				overflow: 'hidden',
			},
		},
		'.container-lg': {
			[mediaQueries.lg]: {
				paddingLeft: 0,
				paddingRight: 0,
				overflow: 'hidden',
			},
		},
		'.container-xl': {
			[mediaQueries.xl]: {
				paddingLeft: 0,
				paddingRight: 0,
				overflow: 'hidden',
			},
		},

		/* ----------------------------------------------------------- */
		/* React Bootstrap Typeahead (RBT) */
		/* ----------------------------------------------------------- */
		'.rbt': {
			flex: 1,
			'&.has-aux': {
				display: 'flex',
			},
			'& input': {
				flex: 1,
				border: 0,
				padding: 0,
				height: 70,
				...theme.fonts.default,
				width: '100%',
				textIndent: 30,
				borderRadius: 0,
				display: 'block',
				appearance: 'none',
				color: theme.colors.n900,
				lineHeight: 'normal',
				...theme.fonts.bodyNormal,

				backgroundColor: 'transparent',
				'&:focus, &.focus': {
					border: 0,
					outline: 'none',
					boxShadow: 'none',
					color: theme.colors.n900,
					backgroundColor: 'transparent',
				},
			},
			'& .dropdown-menu': {
				margin: 0,
				border: 0,
				padding: 20,
				borderRadius: 0,
				'& li': {
					marginBottom: 10,
					'&:last-child': {
						marginBottom: 0,
					},
					'& .dropdown-item': {
						padding: 0,
						textDecoration: 'none',
					},
				},
			},
			'& .rbt-aux': {
				display: 'flex',
				alignItems: 'center',
			},
			'& .rbt-close': {
				width: 20,
				height: 20,
				opacity: 0.32,
				borderRadius: 10,
				fontSize: '1.8rem',
				lineHeight: '2rem',
				textShadow: 'none',
				color: theme.colors.background,
				backgroundColor: theme.colors.n900,
			},
			'& .btn-close:not(:disabled):not(.disabled):focus, .btn-close:not(:disabled):not(.disabled):hover': {
				color: theme.colors.n0,
				opacity: 0.48,
			},
		},

		'.overflow-visible': {
			overflow: 'visible',
		},
		'.w-80': {
			width: '80%',
		},
		'.min-h-50': {
			minHeight: '50% !important',
		},

		/* ----------------------------------------------------------- */
		/* React Bootstrap Typeahead Helper (RBT) */
		/* ----------------------------------------------------------- */
		'.typeahead-helper .rbt': {
			'& .rbt-input': {
				margin: 0,
				border: 0,
				...theme.fonts.default,
				width: '100%',
				minHeight: 56,
				height: '100%',
				resize: 'none',
				borderRadius: 0,
				display: 'block',
				appearance: 'none',
				padding: '25px 16px 1px',
				backgroundColor: 'transparent',
				'&:focus': {
					outline: 'none',
					boxShadow: 'none',
				},
				'&:disabled': {
					backgroundColor: theme.colors.background,
				},
			},
			'& .rbt-input-wrapper': {
				display: 'flex',
				flexWrap: 'wrap',
			},
			'& input': {
				height: 24,
				textIndent: 0,
				fontSize: '1.5rem',
				lineHeight: 'auto',
				color: theme.colors.n900,
				...theme.fonts.headingNormal,
			},
			'& .rbt-token': {
				height: 24,
				...theme.fonts.default,
				flexShrink: 0,
				marginRight: 5,
				marginBottom: 5,
				borderRadius: 500,
				color: theme.colors.n900,
				alignItems: 'center',
				display: 'inline-flex',
				padding: '0 4px 0 10px',
				border: `1px solid ${theme.colors.border}`,
				'&:focus-visible': {
					outline: 'none',
					border: `1px solid ${theme.colors.p500}`,
				},
			},
			'& .rbt-close': {
				width: 18,
				height: 18,
				marginTop: -2,
				display: 'flex',
				color: theme.colors.n900,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'transparent',
			},
			'& .rbt-menu': {
				padding: 0,
				marginTop: 1,
				'& .dropdown-item': {
					...theme.fonts.default,
					color: theme.colors.n900,
					padding: '8px 13px',
					...theme.fonts.bodyNormal,
					textDecoration: 'none',
					'&:hover, &:focus, &.active': {
						backgroundColor: Color('#DBD4CF').alpha(0.2).string(),
					},
					'&:active': {
						color: theme.colors.n900,
						backgroundColor: Color('#DBD4CF').alpha(0.4).string(),
					},
				},
				'& .rbt-highlight-text': {
					padding: 0,
					...theme.fonts.bodyBold,
					backgroundColor: 'transparent',
				},
				'& .rbt-menu-custom-option': {
					fontStyle: 'italic',
					color: theme.colors.n500,
					'& .rbt-highlight-text': {
						color: theme.colors.n900,
						fontStyle: 'normal',
					},
				},
			},
		},
	},
}));
