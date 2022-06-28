export type CobaltPrimaryFont = {
	fontFamily: string;
	weights: {
		regular: number;
		semiBold: number;
		bold: number;
	};
};

export type CobaltSecondaryFont = {
	fontFamily: string;
	weights: {
		regular: number;
		bold: number;
	};
};

type CobaltFontSizeConfig = {
	fontSize: string;
	lineHeight: string;
};

type CobaltFontConfig = {
	fontFamily: string;
	fontWeight: number;
};

export type CobaltTheme = {
	colors: {
		white: string;
		gray100: string;
		gray200: string;
		gray300: string;
		gray400: string;
		gray500: string;
		gray600: string;
		gray700: string;
		gray800: string;
		gray900: string;
		black: string;

		primary: string;
		secondary: string;
		success: string;
		danger: string;
		warning: string;
		info: string;
		light: string;
		dark: string;

		background: string;
		background2: string;
		border: string;
		footer: string;
		shadedPill: string;
	};

	fonts: {
		xxxs: CobaltFontSizeConfig;
		xxs: CobaltFontSizeConfig;
		xs: CobaltFontSizeConfig;
		s: CobaltFontSizeConfig;
		m: CobaltFontSizeConfig;
		l: CobaltFontSizeConfig;
		xl: CobaltFontSizeConfig;
		xxl: CobaltFontSizeConfig;
		xxxl: CobaltFontSizeConfig;
		primaryRegular: CobaltFontConfig;
		primarySemiBold: CobaltFontConfig;
		primaryBold: CobaltFontConfig;
		secondaryRegular: CobaltFontConfig;
		secondaryBold: CobaltFontConfig;
	};
};
