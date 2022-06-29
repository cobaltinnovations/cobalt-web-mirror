import { createUseThemedStyles } from '@/jss/theme';

export const useGlobalStyles = createUseThemedStyles((theme) => ({
	'@global': {
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
			color: theme.colors.dark,
			position: 'relative',
			...theme.fonts.headingNormal,
			backgroundColor: theme.colors.background,
			backgroundImage:
				'url(/static/images/background-texture@2x.png), url(/static/images/background-shadow@2x.png)',
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
			...theme.fonts.h1,
			...theme.fonts.headingBold,
		},
		h2: {
			...theme.fonts.h2,
			...theme.fonts.headingBold,
		},
		h3: {
			...theme.fonts.h3,
			...theme.fonts.headingBold,
		},
		h4: {
			...theme.fonts.h4,
			...theme.fonts.headingBold,
		},
		h5: {
			...theme.fonts.h6,
			...theme.fonts.headingBold,
		},
		h6: {
			...theme.fonts.h6,
			...theme.fonts.headingBold,
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
			color: theme.colors.primary,
			textDecoration: 'underline',
			'&:hover': {
				color: theme.colors.primary,
			},
			'&:focus': {
				outline: 'none',
			},
			'&:not([href])': {
				cursor: 'pointer',
				color: theme.colors.primary,
				'&:hover': {
					color: theme.colors.white,
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
			boxShadow: '1px 2px 8px 0px rgba(0,0,0,0.32)',
			'&__triangle': {
				borderBottomColor: `${theme.colors.primary} !important`,
				'&:before': {
					borderColor: `transparent !important`,
				},
			},
			'&__header': {
				border: 0,
				borderRadius: 0,
				backgroundColor: theme.colors.primary,
			},
			'&__current-month': {
				...theme.fonts.default,
				color: theme.colors.white,
			},
			'&__day-name': {
				margin: 0,
				width: '3.5rem',
				color: theme.colors.white,
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
					borderRightColor: theme.colors.white,
				},
				'&--next': {
					borderLeftColor: theme.colors.white,
				},
			},
			'&__day': {
				margin: 0,
				borderRadius: '0 !important',
				width: '3.5rem',
				lineHeight: '3.5rem',
				'&--today': {
					...theme.fonts.bodyBold,
				},
				'&--selected': {
					backgroundColor: theme.colors.primary,
				},
			},
			'&__day--outside-month': {
				color: theme.colors.gray500,
				backgroundColor: theme.colors.gray200,
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
					backgroundColor: theme.colors.primary,
				},
			},
			'&__slider': {
				width: 22,
				height: 22,
				marginTop: -14, // 22 - 8 === sliderSize - trackHeight
				border: `1px solid ${theme.colors.gray500}`,
				backgroundColor: theme.colors.white,
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
