import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import React, { useEffect } from 'react';

import config from '@/lib/config';
import { addMaximumScaleToViewportMetaTag, isIos } from '@/lib/utils/device-utils';

import { useCustomBootstrapStyles } from '@/jss/hooks/use-custom-bootstrap-styles';
import { useGlobalStyles } from '@/jss/hooks/use-global-styles';

import { AlertProvider } from '@/contexts/alert-context';
import { ErrorModalProvider } from '@/contexts/error-modal-context';
import { FlagsProvider } from '@/contexts/flags-context';
import { InCrisisModalProvider } from '@/contexts/in-crisis-modal-context';
import { ReauthModalProvider } from '@/contexts/reauth-modal-context';

import DownForMaintenance from '@/pages/down-for-maintenance';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-multi-carousel/lib/styles.css';
import './scss/main.scss';

export const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
	useGlobalStyles();
	useCustomBootstrapStyles();

	// One time startup code here.
	useEffect(() => {
		if (isIos()) {
			addMaximumScaleToViewportMetaTag();
		}
	}, []);

	// Can put application blocking pages here, while still using styles
	if (config.COBALT_WEB_DOWN_FOR_MAINTENANCE === 'true') {
		return <DownForMaintenance />;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<ErrorModalProvider>
				<ReauthModalProvider>
					<AlertProvider>
						<InCrisisModalProvider>
							<FlagsProvider>{children}</FlagsProvider>
						</InCrisisModalProvider>
					</AlertProvider>
				</ReauthModalProvider>
			</ErrorModalProvider>

			{__DEV__ && <ReactQueryDevtools position="bottom-right" />}
		</QueryClientProvider>
	);
};
