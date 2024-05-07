import colors from './colors.json';
import { CobaltFontFamily, CobaltTheme } from './theme';

const headingFontFamily: CobaltFontFamily = {
	fontFamily: '"Lexend", sans-serif',
	weights: {
		regular: 400,
		bold: 600,
	},
};

const bodyFontFamily: CobaltFontFamily = {
	fontFamily:
		'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
	weights: {
		regular: 400,
		bold: 600,
	},
};

const theme: CobaltTheme = {
	elevation: {
		e200: '0px 3px 5px #29282733, 0px 0px 1px #292827',
		e400: '0px 10px 18px #29282726, 0px 0px 1px #2928274D',
	},

	colors: {
		...colors,

		/* ----------------------------------------------------------- */
		/* Non-bootstrap available colors */
		/* ----------------------------------------------------------- */
		background: colors.n50,
		border: colors.n100,
		overlay: '#292827B2',
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
			default: {
				fontSize: '3.6rem',
				lineHeight: '4.4rem',
			},
			mobile: {
				fontSize: '2.9rem',
				lineHeight: '3.2rem',
			},
		},
		h2: {
			default: {
				fontSize: '3.0rem',
				lineHeight: '3.8rem',
			},
			mobile: {
				fontSize: '2.4rem',
				lineHeight: '2.8rem',
			},
		},
		h3: {
			default: {
				fontSize: '2.4rem',
				lineHeight: '2.8rem',
			},
			mobile: {
				fontSize: '2.0rem',
				lineHeight: '2.4rem',
			},
		},
		h4: {
			default: {
				fontSize: '2.0rem',
				lineHeight: '2.4rem',
			},
			mobile: {
				fontSize: '1.6rem',
				lineHeight: '2.0rem',
			},
		},
		h5: {
			default: {
				fontSize: '1.6rem',
				lineHeight: '2.0rem',
			},
			mobile: {
				fontSize: '1.4rem',
				lineHeight: '1.6rem',
			},
		},
		h6: {
			default: {
				fontSize: '1.4rem',
				lineHeight: '2.0rem',
				letterSpacing: '-0.02em',
			},
			mobile: {
				fontSize: '1.2rem',
				lineHeight: '1.6rem',
			},
		},
		default: {
			fontSize: '1.4rem',
			lineHeight: '2rem',
		},
		large: {
			fontSize: '1.6rem',
			lineHeight: '2.2rem',
		},
		small: {
			fontSize: '1.2rem',
			lineHeight: '1.6rem',
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

export default theme;
