import type { Preview } from '@storybook/react';
import React from 'react';
import { reactRouterParameters, withRouter } from 'storybook-addon-react-router-v6';
import { initialize, mswLoader } from 'msw-storybook-addon';
import cobaltStorybookTheme from './storybook-theme';

import { AppProviders } from '../src/app-providers';
import { AccountProvider } from '../src/contexts/account-context';
import { AnalyticsProvider } from '../src/contexts/analytics-context';
import { BookingProvider } from '../src/contexts/booking-context';
import { useCustomBootstrapStyles } from '../src/jss/hooks/use-custom-bootstrap-styles';
import { useGlobalStyles } from '../src/jss/hooks/use-global-styles';
import { CobaltThemeProvider } from '../src/jss/theme';

initialize();

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
					loader: () => ({
						institutionResponse: {
							institution: {
								epicFhirEnabled: false,
							},
						},
					}),
				},
			],
		}),
	},

	decorators: [
		(Story) => (
			<CobaltThemeProvider>
				<AppProviders>
					<AccountProvider>
						<AnalyticsProvider>
							<BookingProvider>
								<StoryWrapper>
									<Story />
								</StoryWrapper>
							</BookingProvider>
						</AnalyticsProvider>
					</AccountProvider>
				</AppProviders>
			</CobaltThemeProvider>
		),
		withRouter,
	],

	loaders: [mswLoader],
};

const StoryWrapper = ({ children }) => {
	useGlobalStyles();
	useCustomBootstrapStyles();

	return children;
};

export default preview;
