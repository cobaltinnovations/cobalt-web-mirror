import { CobaltFontFamily, CobaltTheme } from './theme';

const headingFontFamily: CobaltFontFamily = {
	fontFamily: '"Clarika Pro Geometric", sans-serif',
	weights: {
		regular: 400,
		bold: 700,
	},
};

const bodyFontFamily: CobaltFontFamily = {
	fontFamily:
		'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
	weights: {
		regular: 400,
		bold: 700,
	},
};

const theme: CobaltTheme = {
	elevation: {
		e200: '0px 3px 5px rgba(41, 40, 39, 0.2), 0px 0px 1px rgba(41, 40, 39, 0.31)',
		e400: '0px 10px 18px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
	},

	colors: {
		// neutrals
		n0: '#FFFFFF',
		n50: '#FAF7F5',
		n75: '#F5F0EC',
		n100: '#DBD7D3',
		n300: '#C2BEBB',
		n500: '#73716F',
		n900: '#292827',

		// brand -- primary
		p50: '#ECF2F8',
		p100: '#C3D0EB',
		p300: '#7A97CE',
		p500: '#30578E',
		p700: '#20406C',

		// brand -- accent
		a50: '#FAEDE1',
		a100: '#F4DDC9',
		a300: '#F2AD74',
		a500: '#EE934E',

		// semantic -- danger
		d50: '#F8ECEA',
		d100: '#F0D2CC',
		d300: '#E56F65',
		d500: '#B82214',

		// semantic -- warning
		w50: '#FAEEDC',
		w100: '#F5E5C9',
		w300: '#F2C87E',
		w500: '#F0B95B',

		// semantic -- success
		s50: '#E5F1F1',
		s100: '#C1DBDB',
		s300: '#A1C6C5',
		s500: '#377276',

		// semantic -- info
		i50: '#ECF2F8',
		i100: '#C3D0EB',
		i300: '#7A97CE',
		i500: '#30578E',

		// extra -- marketing1
		m50: '#30578E',
		m100: '#BCB6CC',
		m300: '#8B849D',
		m500: '#525178',
		m700: '#373F57',

		// extra -- marketing2
		mm50: '#F0E6EC',
		mm100: '#CCBCC7',
		mm300: '#A67E99',
		mm500: '#825C79',
		mm700: '#3E234C',

		// extra -- marketing3
		mmm50: '#F2EAE6',
		mmm100: '#E9DDD6',
		mmm300: '#D4AB9B',
		mmm500: '#876B63',
		mmm700: '#523829',

		/* ----------------------------------------------------------- */
		/* Non-bootstrap available colors */
		/* ----------------------------------------------------------- */
		background: '#FAF7F5', // n50
		border: '#C2BEBB', // n300
		overlay: '#292827B2', // n900, 70% alpha
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
				fontSize: '3.5rem',
				lineHeight: '4.0rem',
			},
			mobile: {
				fontSize: '2.9rem',
				lineHeight: '3.2rem',
			},
		},
		h2: {
			default: {
				fontSize: '2.9rem',
				lineHeight: '3.2rem',
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
				lineHeight: '1.6rem',
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

export default theme;
