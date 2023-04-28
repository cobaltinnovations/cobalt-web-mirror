import Loader from '@/components/loader';
import { integratedCareService } from '@/lib/services';
import React, { Suspense } from 'react';
import { LoaderFunctionArgs, Outlet, useRouteLoaderData } from 'react-router-dom';

type IntegratedCareLoaderData = Awaited<ReturnType<typeof loader>>;

export function useIntegratedCareLoaderData() {
	return useRouteLoaderData('ic') as IntegratedCareLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	console.log('==> ic loader');
	const referenceDataRequest = integratedCareService.getReferenceData();

	request.signal.addEventListener('abort', () => {
		referenceDataRequest.abort();
	});

	const referenceDataResponse = await referenceDataRequest.fetch();

	return {
		referenceDataResponse,
	};
}

export const Component = () => {
	return (
		<Suspense fallback={<Loader />}>
			<Outlet />
		</Suspense>
	);
};
