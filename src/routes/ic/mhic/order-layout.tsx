import Loader from '@/components/loader';
import { integratedCareService } from '@/lib/services';
import React, { Suspense } from 'react';
import { LoaderFunctionArgs, Outlet, useRouteLoaderData } from 'react-router-dom';

type MhicOrderLayoutLoaderData = Awaited<ReturnType<typeof loader>>;

export function useMhicOrderLayoutLoaderData() {
	return useRouteLoaderData('mhic-order-assessment') as MhicOrderLayoutLoaderData;
}

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.patientOrderId) {
		throw new Error('Missing Patient Order ID');
	}

	const patientOrderRequest = integratedCareService.getPatientOrder(params.patientOrderId);

	const patientOrderResponse = await patientOrderRequest.fetch();

	return {
		patientOrderResponse,
	};
}

export const Component = () => {
	return (
		<Suspense fallback={<Loader />}>
			<Outlet />
		</Suspense>
	);
};
