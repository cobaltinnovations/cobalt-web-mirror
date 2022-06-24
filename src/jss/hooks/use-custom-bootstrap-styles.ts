import { button, card, form, modal, modalForm } from '@/jss/bootstrap-theme';
import fonts from '@/jss/fonts';
import mediaQueries from '@/jss/media-queries';
import Color from 'color';
import { createUseThemedStyles } from '@/jss/theme';

const spacerSize = 5;
const iterations = 40;

const m: Record<string, Record<string, string>> = {};
const ml: Record<string, Record<string, string>> = {};
const mr: Record<string, Record<string, string>> = {};
const mt: Record<string, Record<string, string>> = {};
const mb: Record<string, Record<string, string>> = {};
const my: Record<string, Record<string, string>> = {};
const mx: Record<string, Record<string, string>> = {};

const p: Record<string, Record<string, string>> = {};
const pl: Record<string, Record<string, string>> = {};
const pr: Record<string, Record<string, string>> = {};
const pt: Record<string, Record<string, string>> = {};
const pb: Record<string, Record<string, string>> = {};
const py: Record<string, Record<string, string>> = {};
const px: Record<string, Record<string, string>> = {};

for (let i = 0; i <= iterations; i++) {
	m[`.m-${i}`] = { margin: `${spacerSize * i}px !important` };
	ml[`.ml-${i}`] = { marginLeft: `${spacerSize * i}px !important` };
	mr[`.mr-${i}`] = { marginRight: `${spacerSize * i}px !important` };
	mt[`.mt-${i}`] = { marginTop: `${spacerSize * i}px !important` };
	mb[`.mb-${i}`] = { marginBottom: `${spacerSize * i}px !important` };
	my[`.my-${i}`] = { marginBottom: `${spacerSize * i}px !important`, marginTop: `${spacerSize * i}px !important` };
	mx[`.mx-${i}`] = { marginLeft: `${spacerSize * i}px !important`, marginRight: `${spacerSize * i}px !important` };

	p[`.p-${i}`] = { padding: `${spacerSize * i}px !important` };
	pl[`.pl-${i}`] = { paddingLeft: `${spacerSize * i}px !important` };
	pr[`.pr-${i}`] = { paddingRight: `${spacerSize * i}px !important` };
	pt[`.pt-${i}`] = { paddingTop: `${spacerSize * i}px !important` };
	pb[`.pb-${i}`] = { paddingBottom: `${spacerSize * i}px !important` };
	py[`.py-${i}`] = { paddingBottom: `${spacerSize * i}px !important`, paddingTop: `${spacerSize * i}px !important` };
	px[`.px-${i}`] = { paddingLeft: `${spacerSize * i}px !important`, paddingRight: `${spacerSize * i}px !important` };
}

export const useCustomBootstrapStyles = createUseThemedStyles((theme) => ({
	'@global': {
		/* ----------------------------------------------------------- */
		/* bsPrefix overrides */
		/* ----------------------------------------------------------- */
		...button(theme),
		...card(theme),
		...form(theme),
		...modal(theme),
		...modalForm(theme),

		/* ----------------------------------------------------------- */
		/* Generic overrides */
		/* ----------------------------------------------------------- */
		'.font-weight-regular': {
			...fonts.nunitoSansRegular,
		},
		'.font-weight-semi-bold': {
			...fonts.nunitoSansSemiBold,
		},
		'.font-weight-bold': {
			...fonts.nunitoSansBold,
		},

		'.font-karla-regular': {
			...fonts.karlaRegular,
		},
		'.font-karla-bold': {
			...fonts.karlaBold,
		},

		'.text-primary': {
			color: `${theme.colors.primary} !important`,
		},
		'.text-secondary': {
			color: `${theme.colors.secondary} !important`,
		},
		'.text-success': {
			color: `${theme.colors.success} !important`,
		},
		'.text-danger': {
			color: `${theme.colors.danger} !important`,
		},
		'.text-warning': {
			color: `${theme.colors.warning} !important`,
		},
		'.text-info': {
			color: `${theme.colors.info} !important`,
		},
		'.text-light': {
			color: `${theme.colors.light} !important`,
		},
		'.text-dark': {
			color: `${theme.colors.dark} !important`,
		},
		'.text-gray': {
			color: `${theme.colors.gray600} !important`,
		},

		'.text-decoration-underline': {
			textDecoration: 'underline !important',
		},
		'.cursor-pointer': {
			cursor: 'pointer !important',
		},

		'.bg-primary': {
			backgroundColor: `${theme.colors.primary} !important`,
		},
		'.bg-secondary': {
			backgroundColor: `${theme.colors.secondary} !important`,
		},
		'.bg-success': {
			backgroundColor: `${theme.colors.success} !important`,
		},
		'.bg-danger': {
			backgroundColor: `${theme.colors.danger} !important`,
		},
		'.bg-warning': {
			backgroundColor: `${theme.colors.warning} !important`,
		},
		'.bg-info': {
			backgroundColor: `${theme.colors.info} !important`,
		},
		'.bg-light': {
			backgroundColor: `${theme.colors.light} !important`,
		},
		'.bg-dark': {
			backgroundColor: `${theme.colors.dark} !important`,
		},
		'.bg-light-gray': {
			backgroundColor: `${theme.colors.gray200} !important`,
		},

		'.border': {
			border: `1px solid ${theme.colors.border} !important`,
		},
		'.border-top': {
			borderTop: `1px solid ${theme.colors.border} !important`,
		},
		'.border-right': {
			borderRight: `1px solid ${theme.colors.border} !important`,
		},
		'.border-bottom': {
			borderBottom: `1px solid ${theme.colors.border} !important`,
		},
		'.border-left': {
			borderLeft: `1px solid ${theme.colors.border} !important`,
		},
		'.selected-border-bottom': {
			borderBottom: `3px solid ${theme.colors.secondary} !important`,
		},
		'.no-border': {
			border: 'none',
		},

		'.carousel-item': {
			paddingBottom: 30,
			backgroundColor: theme.colors.white,
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
				fill: theme.colors.white,
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
				backgroundColor: theme.colors.footer,
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
		/* Spacer overrides */
		/* ----------------------------------------------------------- */
		...m,
		...ml,
		...mr,
		...mt,
		...mb,
		...mx,
		...my,
		...p,
		...pl,
		...pr,
		...pt,
		...pb,
		...px,
		...py,

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
				...fonts.xs,
				width: '100%',
				textIndent: 30,
				borderRadius: 0,
				display: 'block',
				appearance: 'none',
				color: theme.colors.dark,
				lineHeight: 'normal',
				...fonts.karlaRegular,

				backgroundColor: 'transparent',
				'&:focus, &.focus': {
					border: 0,
					outline: 'none',
					boxShadow: 'none',
					color: theme.colors.dark,
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
				backgroundColor: theme.colors.dark,
			},
			'& .close:not(:disabled):not(.disabled):focus, .close:not(:disabled):not(.disabled):hover': {
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
				...fonts.xs,
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
				color: theme.colors.black,
				...fonts.nunitoSansRegular,
			},
			'& .rbt-token': {
				height: 24,
				...fonts.xs,
				flexShrink: 0,
				marginRight: 5,
				marginBottom: 5,
				borderRadius: 500,
				color: theme.colors.dark,
				alignItems: 'center',
				display: 'inline-flex',
				padding: '0 4px 0 10px',
				border: `1px solid ${Color(theme.colors.gray600).alpha(0.2).string()}`,
				'&:focus-visible': {
					outline: 'none',
					border: `1px solid ${theme.colors.primary}`,
				},
			},
			'& .rbt-close': {
				width: 18,
				height: 18,
				marginTop: -2,
				display: 'flex',
				color: theme.colors.black,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'transparent',
			},
			'& .rbt-menu': {
				padding: 0,
				marginTop: 1,
				'& .dropdown-item': {
					...fonts.xs,
					color: theme.colors.dark,
					padding: '8px 13px',
					...fonts.karlaRegular,
					textDecoration: 'none',
					'&:hover, &:focus, &.active': {
						backgroundColor: Color('#DBD4CF').alpha(0.2).string(),
					},
					'&:active': {
						color: theme.colors.dark,
						backgroundColor: Color('#DBD4CF').alpha(0.4).string(),
					},
				},
				'& .rbt-highlight-text': {
					padding: 0,
					...fonts.karlaBold,
					backgroundColor: 'transparent',
				},
				'& .rbt-menu-custom-option': {
					fontStyle: 'italic',
					color: theme.colors.gray600,
					'& .rbt-highlight-text': {
						color: theme.colors.dark,
						fontStyle: 'normal',
					},
				},
			},
		},

		'.custom-control.custom-switch': {
			padding: 0,
			'& label': {
				alignItems: 'center',
				color: theme.colors.gray600,
				display: 'inline-flex',
				...fonts.nunitoSansSemiBold,
				'&:before': {
					top: 0,
					left: 0,
					width: 56,
					height: 32,
					marginRight: 8,
					borderRadius: 500,
					position: 'relative',
				},
				'&:after': {
					top: 4,
					left: 4,
					width: 24,
					height: 24,
					borderRadius: '50%',
				},
			},
			'& .custom-control-input:checked~.custom-control-label::before': {
				backgroundColor: theme.colors.primary,
			},
			'& .custom-control-input:checked~.custom-control-label::after': {
				transform: 'translateX(24px)',
			},
		},
	},
}));
