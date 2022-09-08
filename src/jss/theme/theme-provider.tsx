import prefixes from '@/jss/bootstrap-theme/_prefixes';
import React, { FC, PropsWithChildren } from 'react';
import { ThemeProvider as BootstrapThemeProvider } from 'react-bootstrap';
import { ThemeProvider, useTheme } from 'react-jss';
import theme from './config';
import { CobaltTheme } from './theme';

export const CobaltThemeProvider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<BootstrapThemeProvider prefixes={prefixes}>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</BootstrapThemeProvider>
	);
};

// helper hook with theme type
export const useCobaltTheme = useTheme<CobaltTheme>;
