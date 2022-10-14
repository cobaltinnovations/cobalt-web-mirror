import * as Sentry from '@sentry/react';
import React, { PropsWithChildren } from 'react';
import ErrorDisplay from './error-display';

const SentryErrorBoundary = ({ children }: PropsWithChildren) => {
	return (
		<Sentry.ErrorBoundary
			fallback={({ error, resetError }) => {
				return (
					<ErrorDisplay
						error={error}
						showBackButton={false}
						showRetryButton
						onRetryButtonClick={() => {
							resetError();
						}}
					/>
				);
			}}
		>
			{children}
		</Sentry.ErrorBoundary>
	);
};

export default SentryErrorBoundary;
