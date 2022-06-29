export type CobaltFontFamily = {
	fontFamily: string;
	weights: {
		normal: number;
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
		display1: CobaltFontSizeConfig;
		display2: CobaltFontSizeConfig;
		display3: CobaltFontSizeConfig;
		h1: CobaltFontSizeConfig;
		h2: CobaltFontSizeConfig;
		h3: CobaltFontSizeConfig;
		h4: CobaltFontSizeConfig;
		h5: CobaltFontSizeConfig;
		h6: CobaltFontSizeConfig;
		default: CobaltFontSizeConfig;
		large: CobaltFontSizeConfig;
		small: CobaltFontSizeConfig;
		uiSmall: CobaltFontSizeConfig;

		headingNormal: CobaltFontConfig;
		headingBold: CobaltFontConfig;
		bodyNormal: CobaltFontConfig;
		bodyBold: CobaltFontConfig;
	};
};
