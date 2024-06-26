import ErrorDisplay from '@/components/error-display';
import Footer from '@/components/footer';
import { PatientHeader } from '@/components/integrated-care/patient';
import Loader from '@/components/loader';
import React, { Suspense } from 'react';
import { Outlet, useRouteError } from 'react-router-dom';

export const Component = () => {
	return (
		<>
			<PatientHeader />

			<Suspense fallback={<Loader />}>
				<Outlet />
			</Suspense>

			<Footer />
		</>
	);
};

const PatientErrorLayout = () => {
	const error = useRouteError();

	return (
		<>
			<PatientHeader />

			<ErrorDisplay
				error={error}
				showRetryButton
				onRetryButtonClick={() => {
					window.location.reload();
				}}
			/>
		</>
	);
};

export const errorElement = <PatientErrorLayout />;
