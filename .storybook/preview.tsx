import type { Preview } from '@storybook/react';
import React from 'react';
import { reactRouterParameters, withRouter } from 'storybook-addon-react-router-v6';
import cobaltStorybookTheme from './storybook-theme';

import { AppProviders } from '../src/app-providers';
import { AnalyticsProvider } from '../src/contexts/analytics-context';
import { BookingProvider } from '../src/contexts/booking-context';
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
		docs: {
			theme: cobaltStorybookTheme,
		},
		reactRouter: reactRouterParameters({
			routing: [
				{
					id: 'root',
					loader: () => ({}),
				},
			],
		}),
	},

	decorators: [
		(Story) => (
			<CobaltThemeProvider>
				<AppProviders>
					<AnalyticsProvider>
						<BookingProvider>
							<StoryWrapper>
								<Story />
							</StoryWrapper>
						</BookingProvider>
					</AnalyticsProvider>
				</AppProviders>
			</CobaltThemeProvider>
		),
		withRouter,
	],
};

const StoryWrapper = ({ children }) => {
	useGlobalStyles();
	useCustomBootstrapStyles();

	return children;
};

export default preview;
