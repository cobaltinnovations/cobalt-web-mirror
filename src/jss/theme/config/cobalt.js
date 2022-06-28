/**
 * @type { import("../theme").CobaltPrimaryFont }
 */
const primaryFont = {
	fontFamily: '"Nunito Sans", sans-serif',
	weights: {
		regular: 400,
		semiBold: 600,
		bold: 700,
	},
};

/**
 * @type { import("../theme").CobaltSecondaryFont }
 */
const secondaryFont = {
	fontFamily: '"Karla", sans-serif',
	weights: {
		regular: 400,
		bold: 700,
	},
};

/**
 * @type { import("../theme").CobaltTheme }
 */
const theme = {
	colors: {
		white: '#FFFFFF',
		gray100: '#F8F9FA',
		gray200: '#E9ECEF',
		gray300: '#DEE2E6',
		gray400: '#CED4DA',
		gray500: '#ADB5BD',
		gray600: '#6D757D',
		gray700: '#495057',
		gray800: '#343A40',
		gray900: '#212529',
		black: '#000000',

		primary: '#3551E1', // Royal Blue
		secondary: '#EBA366', // Jaffa Muted
		success: '#19C59F', // UI-Success
		danger: '#EF574B', // UI-Error
		warning: '#F2B500', // Selective Yellow
		info: '#A1CAEC', // NOT USED
		light: '#FFFFFF', // White
		dark: '#21312A', // Outer Space

		/* ----------------------------------------------------------- */
		/* Non-bootstrap available colors */
		/* ----------------------------------------------------------- */
		background: '#F8EFEA', // Fantasy
		background2: '#F8F8F7',
		border: '#E9DED6', // Pearl
		footer: '#EE8C4E', // Jaffa
		shadedPill: '#D8D8D8',
	},

	fonts: {
		xxxs: {
			fontSize: '1.2rem',
			lineHeight: '1.2rem',
		},
		xxs: {
			fontSize: '1.3rem',
			lineHeight: '1.8rem',
		},
		xs: {
			fontSize: '1.5rem',
			lineHeight: '2rem',
		},
		s: {
			fontSize: '1.6rem',
			lineHeight: '1.8rem',
		},
		m: {
			fontSize: '1.8rem',
			lineHeight: '2.2rem',
		},
		l: {
			fontSize: '2rem',
			lineHeight: '2.4rem',
		},
		xl: {
			fontSize: '2.4rem',
			lineHeight: '2.8rem',
		},
		xxl: {
			fontSize: '2.8rem',
			lineHeight: '3.2rem',
		},
		xxxl: {
			fontSize: '3rem',
			lineHeight: '3.6rem',
		},
		primaryRegular: {
			fontFamily: primaryFont.fontFamily,
			fontWeight: primaryFont.weights.regular,
		},
		primarySemiBold: {
			fontFamily: primaryFont.fontFamily,
			fontWeight: primaryFont.weights.semiBold,
		},
		primaryBold: {
			fontFamily: primaryFont.fontFamily,
			fontWeight: primaryFont.weights.bold,
		},
		secondaryRegular: {
			fontFamily: secondaryFont.fontFamily,
			fontWeight: secondaryFont.weights.regular,
		},
		secondaryBold: {
			fontFamily: secondaryFont.fontFamily,
			fontWeight: secondaryFont.weights.bold,
		},
	},
};

module.exports = theme;
