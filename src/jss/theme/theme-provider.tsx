import { getSubdomain } from '@/hooks/use-subdomain';
import prefixes from '@/jss/bootstrap-theme/_prefixes';
import React, { FC, PropsWithChildren } from 'react';
import { ThemeProvider as BootstrapThemeProvider } from 'react-bootstrap';
import { ThemeProvider, useTheme } from 'react-jss';
import defaultTheme from './config/cobalt';
import { CobaltTheme } from './theme';

export function loadTheme(): Readonly<CobaltTheme> {
	if (__DEV__) {
		try {
			return require(`./config/${getSubdomain()}`);
		} catch (e) {
			console.warn('Running with default theme');

			return defaultTheme;
		}
	}

	const themeConfigElement = document.getElementById('react-app-theme-config');
	if (!themeConfigElement) {
		return defaultTheme;
	}

	try {
		return JSON.parse(themeConfigElement.innerHTML);
	} catch (e) {
		console.warn('Running with default theme');

		return defaultTheme;
	}
}

export const CobaltThemeProvider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<BootstrapThemeProvider prefixes={prefixes}>
			<ThemeProvider theme={loadTheme()}>{children}</ThemeProvider>
		</BootstrapThemeProvider>
	);
};

// helper hook with theme type
export const useCobaltTheme = useTheme<CobaltTheme>;
