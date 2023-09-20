import { create } from '@storybook/theming/create';
import theme from '../src/jss/theme/config';

export default create({
	base: 'light',

	fontBase: theme.fonts.bodyNormal.fontFamily,

	brandTitle: 'Cobalt',
	brandUrl: 'https://cobaltinnovations.org',
	brandImage: 'https://www.cobaltinnovations.org/static/assets/images/cobalt-logo-text-only.svg',
	brandTarget: '_blank',

	colorPrimary: theme.colors.p500,
	colorSecondary: theme.colors.a500,

	appBg: theme.colors.background,
	appContentBg: theme.colors.background,
	appBorderColor: theme.colors.border,

	textColor: theme.colors.n700,
	textInverseColor: theme.colors.n0,

	barTextColor: theme.colors.p500,
	barSelectedColor: theme.colors.p300,
	barBg: theme.colors.n0,

	inputBg: theme.colors.background,
	inputBorder: theme.colors.border,
	inputTextColor: theme.colors.n700,
});
