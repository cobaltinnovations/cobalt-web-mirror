export type CobaltColorName = keyof CobaltTheme['colors'];

export type CobaltFontFamily = {
	fontFamily: string;
	weights: {
		regular: number;
		bold: number;
	};
};

type CobaltFontSizeConfig = {
	fontSize: string;
	lineHeight: string;
	letterSpacing?: string;
};

type CobaltHeadingConfig = {
	default: CobaltFontSizeConfig;
	mobile: CobaltFontSizeConfig;
};

type CobaltFontConfig = {
	fontFamily: string;
	fontWeight: number;
};

export type CobaltTheme = {
	elevation: {
		e200: string;
		e400: string;
	};

	colors: {
		// neutrals
		n0: string;
		n50: string;
		n75: string;
		n100: string;
		n300: string;
		n500: string;
		n700: string;
		n900: string;

		// brand -- primary
		p50: string;
		p100: string;
		p300: string;
		p500: string;
		p700: string;
		p900: string;

		// brand -- accent
		a50: string;
		a100: string;
		a300: string;
		a500: string;
		a700: string;
		a900: string;

		// semantic -- danger
		d50: string;
		d100: string;
		d300: string;
		d500: string;
		d700: string;
		d900: string;

		// semantic -- warning
		w50: string;
		w100: string;
		w300: string;
		w500: string;
		w700: string;
		w900: string;

		// semantic -- success
		s50: string;
		s100: string;
		s300: string;
		s500: string;
		s700: string;
		s900: string;

		// semantic -- info
		i50: string;
		i100: string;
		i300: string;
		i500: string;
		i700: string;
		i900: string;

		// semantic -- attention
		t50: string;
		t100: string;
		t300: string;
		t500: string;
		t700: string;
		t900: string;

		background: string;
		border: string;
		overlay: string;
	};

	fonts: {
		display1: CobaltFontSizeConfig;
		display2: CobaltFontSizeConfig;
		display3: CobaltFontSizeConfig;
		h1: CobaltHeadingConfig;
		h2: CobaltHeadingConfig;
		h3: CobaltHeadingConfig;
		h4: CobaltHeadingConfig;
		h5: CobaltHeadingConfig;
		h6: CobaltHeadingConfig;
		default: CobaltFontSizeConfig;
		large: CobaltFontSizeConfig;
		small: CobaltFontSizeConfig;

		headingNormal: CobaltFontConfig;
		headingBold: CobaltFontConfig;
		bodyNormal: CobaltFontConfig;
		bodyBold: CobaltFontConfig;
	};
};
