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
			...theme.fonts.xs,
			minHeight: '100%',
			letterSpacing: 0.5,
			color: theme.colors.dark,
			position: 'relative',
			...theme.fonts.primaryRegular,
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
			...theme.fonts.xxxl,
			...theme.fonts.primaryBold,
		},
		h2: {
			...theme.fonts.xxl,
			...theme.fonts.primaryBold,
		},
		h3: {
			...theme.fonts.xl,
			...theme.fonts.primaryBold,
		},
		h4: {
			...theme.fonts.l,
			...theme.fonts.primaryBold,
		},
		h5: {
			...theme.fonts.m,
			...theme.fonts.primaryBold,
		},
		h6: {
			...theme.fonts.s,
			...theme.fonts.primaryBold,
		},
		p: {
			...theme.fonts.xs,
			...theme.fonts.secondaryRegular,
		},
		'small, .small': {
			...theme.fonts.xxs,
			display: 'block',
			...theme.fonts.secondaryRegular,
		},
		a: {
			wordBreak: 'break-word',
			...theme.fonts.secondaryBold,
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

		'.font-size-xxxs': {
			...theme.fonts.xxxs,
		},
		'.font-size-xxs': {
			...theme.fonts.xxs,
		},
		'.font-size-xs': {
			fontSize: `${theme.fonts.xs.fontSize} !important`,
			lineHeight: `${theme.fonts.xs.lineHeight} !important`,
		},
		'.font-size-s': {
			...theme.fonts.s,
		},
		'.font-size-m': {
			...theme.fonts.m,
		},
		'.font-size-l': {
			...theme.fonts.l,
		},
		'.font-size-xl': {
			...theme.fonts.xl,
		},
		'.font-size-xxl': {
			...theme.fonts.xxl,
		},
		'.font-size-xxxl': {
			...theme.fonts.xxxl,
		},

		/* ----------------------------------------------------------- */
		/* React-datepicker styleoverrides */
		/* ----------------------------------------------------------- */
		'.react-datepicker-popper': {
			zIndex: 2,
		},
		'.react-datepicker': {
			border: 0,
			...theme.fonts.xs,
			borderRadius: 0,
			...theme.fonts.secondaryRegular,
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
				...theme.fonts.xs,
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
					...theme.fonts.secondaryBold,
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
				...theme.fonts.secondaryBold,
				...theme.fonts.xxs,
				color: '#6c7978',
			},
		},
		'.ql-editor': {
			minHeight: 400,
		},
	},
}));
