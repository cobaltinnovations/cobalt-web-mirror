import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

export const useGlobalStyles = createUseStyles({
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
			...fonts.xs,
			minHeight: '100%',
			letterSpacing: 0.5,
			color: colors.dark,
			position: 'relative',
			...fonts.nunitoSansRegular,
			backgroundColor: colors.background,
			backgroundImage: 'url(/static/images/background-texture@2x.png), url(/static/images/background-shadow@2x.png)',
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
			...fonts.xxxl,
			...fonts.nunitoSansBold,
		},
		h2: {
			...fonts.xxl,
			...fonts.nunitoSansBold,
		},
		h3: {
			...fonts.xl,
			...fonts.nunitoSansBold,
		},
		h4: {
			...fonts.l,
			...fonts.nunitoSansBold,
		},
		h5: {
			...fonts.m,
			...fonts.nunitoSansBold,
		},
		h6: {
			...fonts.s,
			...fonts.nunitoSansBold,
		},
		p: {
			...fonts.xs,
			...fonts.karlaRegular,
		},
		'small, .small': {
			...fonts.xxs,
			display: 'block',
			...fonts.karlaRegular,
		},
		a: {
			wordBreak: 'break-word',
			...fonts.karlaBold,
			color: colors.primary,
			textDecoration: 'underline',
			'&:hover': {
				color: colors.primary,
			},
			'&:focus': {
				outline: 'none',
			},
			'&:not([href])': {
				cursor: 'pointer',
				color: colors.primary,
				'&:hover': {
					color: colors.white,
				},
			},
		},

		'.font-size-xxxs': {
			...fonts.xxxs,
		},
		'.font-size-xxs': {
			...fonts.xxs,
		},
		'.font-size-xs': {
			fontSize: `${fonts.xs.fontSize} !important`,
			lineHeight: `${fonts.xs.lineHeight} !important`,
		},
		'.font-size-s': {
			...fonts.s,
		},
		'.font-size-m': {
			...fonts.m,
		},
		'.font-size-l': {
			...fonts.l,
		},
		'.font-size-xl': {
			...fonts.xl,
		},
		'.font-size-xxl': {
			...fonts.xxl,
		},
		'.font-size-xxxl': {
			...fonts.xxxl,
		},

		/* ----------------------------------------------------------- */
		/* React-datepicker styleoverrides */
		/* ----------------------------------------------------------- */
		'.react-datepicker-popper': {
			zIndex: 2,
		},
		'.react-datepicker': {
			border: 0,
			...fonts.xs,
			borderRadius: 0,
			...fonts.karlaRegular,
			boxShadow: '1px 2px 8px 0px rgba(0,0,0,0.32)',
			'&__triangle': {
				borderBottomColor: `${colors.primary} !important`,
				'&:before': {
					borderColor: `transparent !important`,
				},
			},
			'&__header': {
				border: 0,
				borderRadius: 0,
				backgroundColor: colors.primary,
			},
			'&__current-month': {
				...fonts.xs,
				color: colors.white,
			},
			'&__day-name': {
				margin: 0,
				width: '3.5rem',
				color: colors.white,
				lineHeight: '3.5rem',
			},
			'&__month': {
				margin: 0,
				borderLeft: colors.border,
				borderRight: colors.border,
				borderBottom: colors.border,
			},
			'&__navigation': {
				'&--previous': {
					borderRightColor: colors.white,
				},
				'&--next': {
					borderLeftColor: colors.white,
				},
			},
			'&__day': {
				margin: 0,
				borderRadius: '0 !important',
				width: '3.5rem',
				lineHeight: '3.5rem',
				'&--today': {
					...fonts.karlaBold,
				},
				'&--selected': {
					backgroundColor: colors.primary,
				},
			},
			'&__day--outside-month': {
				color: colors.gray500,
				backgroundColor: colors.gray200,
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
					backgroundColor: colors.border,
					top: '20%',
				},
				'&--active': {
					backgroundColor: colors.primary,
				},
			},
			'&__slider': {
				width: 22,
				height: 22,
				marginTop: -14, // 22 - 8 === sliderSize - trackHeight
				border: `1px solid ${colors.gray500}`,
				backgroundColor: colors.white,
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
				...fonts.karlaBold,
				...fonts.xxs,
				color: '#6c7978',
			},
		},
		'.ql-editor': {
			minHeight: 400,
		},
	},
});
