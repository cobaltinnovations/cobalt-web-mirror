/**
 * @type { import("../theme").CobaltFontFamily }
 */
const headingFontFamily = {
	fontFamily: '"Nunito Sans", sans-serif',
	weights: {
		regular: 400,
		bold: 700,
	},
};

/**
 * @type { import("../theme").CobaltFontFamily }
 */
const bodyFontFamily = {
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
		display1: {
			fontSize: '5.8rem',
			lineHeight: '6.4rem',
		},
		display2: {
			fontSize: '5.0rem',
			lineHeight: '5.6rem',
		},
		display3: {
			fontSize: '4.2rem',
			lineHeight: '4.8rem',
		},
		h1: {
			fontSize: '3.5rem',
			lineHeight: '4.0rem',
		},
		h2: {
			fontSize: '2.9rem',
			lineHeight: '3.2rem',
		},
		h3: {
			fontSize: '2.4rem',
			lineHeight: '2.8rem',
		},
		h4: {
			fontSize: '2.0rem',
			lineHeight: '2.4rem',
		},
		h5: {
			fontSize: '1.6rem',
			lineHeight: '2.0rem',
		},
		h6: {
			fontSize: '1.4rem',
			lineHeight: '1.6rem',
		},
		default: {
			fontSize: '1.5rem',
			lineHeight: '2rem',
		},
		large: {
			fontSize: '1.8rem',
			lineHeight: '2.2rem',
		},
		small: {
			fontSize: '1.3rem',
			lineHeight: '1.6rem',
		},
		uiSmall: {
			fontSize: '1.2rem',
			lineHeight: '1.4rem',
		},

		headingNormal: {
			fontFamily: headingFontFamily.fontFamily,
			fontWeight: headingFontFamily.weights.regular,
		},
		headingBold: {
			fontFamily: headingFontFamily.fontFamily,
			fontWeight: headingFontFamily.weights.bold,
		},

		bodyNormal: {
			fontFamily: bodyFontFamily.fontFamily,
			fontWeight: bodyFontFamily.weights.regular,
		},
		bodyBold: {
			fontFamily: bodyFontFamily.fontFamily,
			fontWeight: bodyFontFamily.weights.bold,
		},
	},
};

module.exports = theme;
