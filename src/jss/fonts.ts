const nunitoSans = {
	fontFamily: '"Nunito Sans", sans-serif',
	weights: {
		regular: 400,
		semiBold: 600,
		bold: 700,
	},
};

const karla = {
	fontFamily: '"Karla", sans-serif',
	weights: {
		regular: 400,
		bold: 700,
	},
};

const fonts = {
	...nunitoSans,
	...karla,
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
	nunitoSansRegular: {
		fontFamily: nunitoSans.fontFamily,
		fontWeight: nunitoSans.weights.regular,
	},
	nunitoSansSemiBold: {
		fontFamily: nunitoSans.fontFamily,
		fontWeight: nunitoSans.weights.semiBold,
	},
	nunitoSansBold: {
		fontFamily: nunitoSans.fontFamily,
		fontWeight: nunitoSans.weights.bold,
	},
	karlaRegular: {
		fontFamily: karla.fontFamily,
		fontWeight: karla.weights.regular,
	},
	karlaBold: {
		fontFamily: karla.fontFamily,
		fontWeight: karla.weights.bold,
	},
};

export default fonts;
