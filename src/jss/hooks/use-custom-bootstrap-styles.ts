import { createUseStyles } from 'react-jss';

import { button, card, form, modal, modalForm } from '@/jss/bootstrap-theme';
import fonts from '@/jss/fonts';
import colors from '@/jss/colors';
import mediaQueries from '@/jss/media-queries';
import Color from 'color';

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

export const useCustomBootstrapStyles = createUseStyles({
	'@global': {
		/* ----------------------------------------------------------- */
		/* bsPrefix overrides */
		/* ----------------------------------------------------------- */
		...button,
		...card,
		...form,
		...modal,
		...modalForm,

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
			color: `${colors.primary} !important`,
		},
		'.text-secondary': {
			color: `${colors.secondary} !important`,
		},
		'.text-success': {
			color: `${colors.success} !important`,
		},
		'.text-danger': {
			color: `${colors.danger} !important`,
		},
		'.text-warning': {
			color: `${colors.warning} !important`,
		},
		'.text-info': {
			color: `${colors.info} !important`,
		},
		'.text-light': {
			color: `${colors.light} !important`,
		},
		'.text-dark': {
			color: `${colors.dark} !important`,
		},
		'.text-gray': {
			color: `${colors.gray600} !important`,
		},

		'.text-decoration-underline': {
			textDecoration: 'underline !important',
		},
		'.cursor-pointer': {
			cursor: 'pointer !important',
		},

		'.bg-primary': {
			backgroundColor: `${colors.primary} !important`,
		},
		'.bg-secondary': {
			backgroundColor: `${colors.secondary} !important`,
		},
		'.bg-success': {
			backgroundColor: `${colors.success} !important`,
		},
		'.bg-danger': {
			backgroundColor: `${colors.danger} !important`,
		},
		'.bg-warning': {
			backgroundColor: `${colors.warning} !important`,
		},
		'.bg-info': {
			backgroundColor: `${colors.info} !important`,
		},
		'.bg-light': {
			backgroundColor: `${colors.light} !important`,
		},
		'.bg-dark': {
			backgroundColor: `${colors.dark} !important`,
		},
		'.bg-light-gray': {
			backgroundColor: `${colors.gray200} !important`,
		},

		'.border': {
			border: `1px solid ${colors.border} !important`,
		},
		'.border-top': {
			borderTop: `1px solid ${colors.border} !important`,
		},
		'.border-right': {
			borderRight: `1px solid ${colors.border} !important`,
		},
		'.border-bottom': {
			borderBottom: `1px solid ${colors.border} !important`,
		},
		'.border-left': {
			borderLeft: `1px solid ${colors.border} !important`,
		},
		'.selected-border-bottom': {
			borderBottom: `3px solid ${colors.secondary} !important`,
		},
		'.no-border': {
			border: 'none',
		},

		'.carousel-item': {
			paddingBottom: 30,
			backgroundColor: colors.white,
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
				fill: colors.white,
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
			backgroundColor: colors.background,
			'&.active': {
				backgroundColor: colors.footer,
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
				color: colors.dark,
				lineHeight: 'normal',
				...fonts.karlaRegular,

				backgroundColor: 'transparent',
				'&:focus, &.focus': {
					border: 0,
					outline: 'none',
					boxShadow: 'none',
					color: colors.dark,
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
				color: colors.background,
				backgroundColor: colors.dark,
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
					backgroundColor: colors.background,
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
				color: colors.black,
				...fonts.nunitoSansRegular,
			},
			'& .rbt-token': {
				height: 24,
				...fonts.xs,
				flexShrink: 0,
				marginRight: 5,
				marginBottom: 5,
				borderRadius: 500,
				color: colors.dark,
				alignItems: 'center',
				display: 'inline-flex',
				padding: '0 4px 0 10px',
				border: `1px solid ${Color(colors.gray600).alpha(0.2).string()}`,
				'&:focus-visible': {
					outline: 'none',
					border: `1px solid ${colors.primary}`,
				},
			},
			'& .rbt-close': {
				width: 18,
				height: 18,
				marginTop: -2,
				display: 'flex',
				color: colors.black,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: 'transparent',
			},
			'& .rbt-menu': {
				padding: 0,
				marginTop: 1,
				'& .dropdown-item': {
					...fonts.xs,
					color: colors.dark,
					padding: '8px 13px',
					...fonts.karlaRegular,
					textDecoration: 'none',
					'&:hover, &:focus, &.active': {
						backgroundColor: Color('#DBD4CF').alpha(0.2).string(),
					},
					'&:active': {
						color: colors.dark,
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
					color: colors.gray600,
					'& .rbt-highlight-text': {
						color: colors.dark,
						fontStyle: 'normal',
					},
				},
			},
		},

		'.custom-control.custom-switch': {
			padding: 0,
			'& label': {
				alignItems: 'center',
				color: colors.gray600,
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
				backgroundColor: colors.primary,
			},
			'& .custom-control-input:checked~.custom-control-label::after': {
				transform: 'translateX(24px)',
			},
		},
	},
});
