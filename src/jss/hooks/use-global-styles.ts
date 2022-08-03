import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '../media-queries';

export const useGlobalStyles = createUseThemedStyles((theme) => ({
	'@global': {
		':root': {
			'--bs-white': theme.colors.n0,
			'--bs-black': theme.colors.n900,
			'--bs-gray': theme.colors.n300,
			'--bs-gray-dark': theme.colors.n500,
			'--bs-gray-100': theme.colors.n100,
			'--bs-gray-300': theme.colors.n300,
			'--bs-gray-500': theme.colors.n500,
			'--bs-primary': theme.colors.p500,
			'--bs-secondary': theme.colors.a500,
			'--bs-success': theme.colors.s500,
			'--bs-info': theme.colors.i500,
			'--bs-warning': theme.colors.w500,
			'--bs-danger': theme.colors.d500,
			'--bs-light': theme.colors.n0,
			'--bs-dark': theme.colors.n900,
		},
		'::-ms-clear': {
			width: 0,
			height: 0,
			display: 'none',
		},

		/* ----------------------------------------------------------- */
		/* Generics */
		/* ----------------------------------------------------------- */
		html: {
			height: '100%',
			fontSize: '10px',
		},
		body: {
			...theme.fonts.default,
			minHeight: '100%',
			letterSpacing: 0.5,
			color: theme.colors.n900,
			position: 'relative',
			...theme.fonts.bodyNormal,
			backgroundColor: theme.colors.background,
			backgroundPosition: 'top left, right 0px',
			backgroundRepeat: 'repeat, no-repeat',
			backgroundSize: '100px 100px, 881px 106px',
			backgroundAttachment: 'fixed, fixed',
		},
		hr: {
			margin: 0,
		},

		/* ----------------------------------------------------------- */
		/* Headings and text */
		/* ----------------------------------------------------------- */
		h1: {
			...theme.fonts.h1.default,
			...theme.fonts.headingBold,
		},
		h2: {
			...theme.fonts.h2.default,
			...theme.fonts.headingBold,
		},
		h3: {
			...theme.fonts.h3.default,
			...theme.fonts.headingBold,
		},
		h4: {
			...theme.fonts.h4.default,
			...theme.fonts.headingBold,
		},
		h5: {
			...theme.fonts.h5.default,
			...theme.fonts.headingBold,
		},
		h6: {
			...theme.fonts.h6.default,
			...theme.fonts.headingBold,
		},
		[mediaQueries.md]: {
			h1: {
				...theme.fonts.h1.mobile,
			},
			h2: {
				...theme.fonts.h2.mobile,
			},
			h3: {
				...theme.fonts.h3.mobile,
			},
			h4: {
				...theme.fonts.h4.mobile,
			},
			h5: {
				...theme.fonts.h5.mobile,
			},
			h6: {
				...theme.fonts.h6.mobile,
			},
		},
		p: {
			...theme.fonts.default,
			...theme.fonts.bodyNormal,
		},
		'small, .small': {
			...theme.fonts.small,
			display: 'block',
			...theme.fonts.bodyNormal,
		},
		a: {
			wordBreak: 'break-word',
			...theme.fonts.bodyBold,
			color: theme.colors.p500,
			'&:hover': {
				color: theme.colors.p700,
			},
			'&:focus': {
				outline: 'none',
			},
			'&:not([href])': {
				cursor: 'pointer',
				color: theme.colors.p500,
				'&:hover': {
					color: theme.colors.n0,
				},
			},
		},

		'.fs-display1': {
			...theme.fonts.display1,
		},
		'.fs-display2': {
			...theme.fonts.display2,
		},
		'.fs-display3': {
			...theme.fonts.display3,
		},

		'.fs-h1': {
			...theme.fonts.h1,
		},
		'.fs-h2': {
			...theme.fonts.h2,
		},
		'.fs-h3': {
			...theme.fonts.h3,
		},
		'.fs-h4': {
			...theme.fonts.h4,
		},
		'.fs-h5': {
			...theme.fonts.h5,
		},
		'.fs-h6': {
			...theme.fonts.h6,
		},

		'.fs-ui-small': {
			...theme.fonts.uiSmall,
		},
		'.fs-small': {
			...theme.fonts.small,
		},
		'.fs-default': {
			fontSize: `${theme.fonts.default.fontSize} !important`,
			lineHeight: `${theme.fonts.default.lineHeight} !important`,
		},
		'.fs-large': {
			...theme.fonts.large,
		},

		/* ----------------------------------------------------------- */
		/* React-datepicker styleoverrides */
		/* ----------------------------------------------------------- */
		'.react-datepicker-popper': {
			zIndex: 2,
		},
		'.react-datepicker': {
			border: 0,
			...theme.fonts.default,
			borderRadius: 0,
			...theme.fonts.bodyNormal,
			boxShadow: theme.elevation.e400,
			'&__triangle': {
				borderBottomColor: `${theme.colors.p500} !important`,
				'&:before': {
					borderColor: `transparent !important`,
				},
			},
			'&__header': {
				border: 0,
				borderRadius: 0,
				backgroundColor: theme.colors.p500,
			},
			'&__current-month': {
				...theme.fonts.default,
				color: theme.colors.n0,
			},
			'&__day-name': {
				margin: 0,
				width: '3.5rem',
				color: theme.colors.n0,
				lineHeight: '3.5rem',
			},
			'&__month': {
				margin: 0,
				borderLeft: theme.colors.border,
				borderRight: theme.colors.border,
				borderBottom: theme.colors.border,
			},
			'&__navigation': {
				'&--previous': {
					borderRightColor: theme.colors.n0,
				},
				'&--next': {
					borderLeftColor: theme.colors.n0,
				},
			},
			'&__navigation-icon': {
				'&:before': {
					borderColor: theme.colors.n0,
				},
			},
			'&__day': {
				color: theme.colors.n900,
				margin: 0,
				borderRadius: '0 !important',
				width: '3.5rem',
				lineHeight: '3.5rem',
				'&--today': {
					...theme.fonts.bodyBold,
				},
				'&--selected': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.p500,
				},
				'&--keyboard-selected': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.p700,
				},
				'&--outside-month': {
					color: theme.colors.n500,
					backgroundColor: theme.colors.n75,
				},
				'&--disabled': {
					color: theme.colors.n500,
					backgroundColor: `${theme.colors.n300} !important`,
					'&:hover': {
						color: `${theme.colors.n500} !important`,
						backgroundColor: `${theme.colors.n300} !important`,
						cursor: 'not-allowed',
					},
				},
				'&:hover': {
					color: theme.colors.n0,
					backgroundColor: theme.colors.p300,
				},
				'&:active': {
					backgroundColor: theme.colors.p700,
				},
			},
			'&__close-icon': {
				marginRight: 30,
			},
		},

		/* ----------------------------------------------------------- */
		/* react-input-range style overrides */
		/* ----------------------------------------------------------- */
		'.input-range': {
			minHeight: 36,
			'&__track': {
				height: 8,
				'&--background': {
					backgroundColor: theme.colors.border,
					top: '20%',
				},
				'&--active': {
					backgroundColor: theme.colors.p500,
				},
			},
			'&__slider': {
				width: 22,
				height: 22,
				marginTop: -14, // 22 - 8 === sliderSize - trackHeight
				border: `1px solid ${theme.colors.n500}`,
				backgroundColor: theme.colors.n0,
				'&-container:last-of-type .input-range__label-container': {
					left: '-20%',
				},
			},
			'&__label': {
				'&--min, &--max': {
					display: 'none',
				},
				'&--value': {
					top: 8, // trackHeight
				},
			},
			'&__label-container': {
				...theme.fonts.bodyBold,
				...theme.fonts.small,
				color: '#6c7978',
			},
		},
		'.ql-editor': {
			minHeight: 400,
		},
	},
}));
