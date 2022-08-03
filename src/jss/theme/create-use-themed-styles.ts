import { createUseStyles } from 'react-jss';
import { CobaltTheme } from './theme';

// wrapper function locking type of theme
export function createUseThemedStyles<C extends string = string, Props = unknown>(
	...cusArgs: Parameters<typeof createUseStyles<C, Props, CobaltTheme>>
) {
	return createUseStyles(...cusArgs);
}
