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
		'input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration':
			{
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
			borderRadius: 5,
			overflow: 'hidden',
			...theme.fonts.default,
			...theme.fonts.bodyNormal,
			boxShadow: theme.elevation.e400,
			'&__triangle': {
				display: 'none',
			},
			'&__header': {
				border: 0,
				padding: 0,
				borderRadius: '0 !important',
				backgroundColor: theme.colors.p500,
			},
			'&__current-month': {
				display: 'flex',
				height: '4rem',
				alignItems: 'center',
				...theme.fonts.default,
				color: theme.colors.n0,
				justifyContent: 'center',
			},
			'&__day-names': {
				margin: 1,
			},
			'&__day-name': {
				margin: 1,
				width: '4rem',
				lineHeight: '4rem',
				color: theme.colors.n0,
			},
			'&__month': {
				margin: 1,
				borderLeft: theme.colors.border,
				borderRight: theme.colors.border,
				borderBottom: theme.colors.border,
			},
			'&__navigation': {
				top: 2,
				width: '4rem',
				height: '4rem',
				borderRadius: '50%',
				'&--previous': {
					left: 2,
					borderRightColor: theme.colors.n0,
					'& .react-datepicker__navigation-icon:before': {
						top: '50%',
						left: '50%',
						borderWidth: '2px 2px 0 0',
						transform: 'translate(-50%, -50%) rotate(225deg)',
					},
				},
				'&--next': {
					right: 2,
					borderLeftColor: theme.colors.n0,
					'& .react-datepicker__navigation-icon:before': {
						top: '50%',
						left: '50%',
						borderWidth: '2px 2px 0 0',
						transform: 'translate(-50%, -50%) rotate(45deg)',
					},
				},
				'&:hover': {
					backgroundColor: theme.colors.p300,
					'& *::before': {
						borderColor: theme.colors.n0,
					},
				},
				'&:active': {
					backgroundColor: theme.colors.p700,
				},
			},
			'&__navigation-icon': {
				'&:before': {
					borderColor: theme.colors.n0,
				},
			},
			'&__day': {
				margin: 1,
				width: '4rem',
				lineHeight: '4rem',
				color: theme.colors.n900,
				borderRadius: '50% !important',
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
					color: theme.colors.n100,
				},
				'&--disabled': {
					color: theme.colors.n500,
					textDecoration: 'line-through',
					'&:hover': {
						color: `${theme.colors.n500} !important`,
						backgroundColor: `${theme.colors.n100} !important`,
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
		'.ql-container': {
			'& .ql-editor': {
				minHeight: 400,
				'& a': {
					...theme.fonts.bodyNormal,
					color: theme.colors.p500,
				},
			},
			'& .ql-tooltip': {
				'& a': {
					color: theme.colors.p500,
					'&:not([href]):hover': {
						color: theme.colors.p700,
					},
				},
			},
		},
		'.wysiwyg-display': {
			'& p > br:first-child': {
				display: 'none',
			},
		},
	},
}));
