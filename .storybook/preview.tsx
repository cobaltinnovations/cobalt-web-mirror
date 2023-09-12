import type { Preview } from '@storybook/react';
import React from 'react';

import { AppProviders } from '../src/app-providers';
import { useCustomBootstrapStyles } from '../src/jss/hooks/use-custom-bootstrap-styles';
import { useGlobalStyles } from '../src/jss/hooks/use-global-styles';
import { CobaltThemeProvider } from '../src/jss/theme';

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},

	decorators: [
		(Story) => (
			<CobaltThemeProvider>
				<AppProviders>
					<StoryWrapper>
						<Story />
					</StoryWrapper>
				</AppProviders>
			</CobaltThemeProvider>
		),
	],
};

const StoryWrapper = ({ children }) => {
	useGlobalStyles();
	useCustomBootstrapStyles();

	return children;
};

export default preview;
