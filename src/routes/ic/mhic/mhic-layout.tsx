import { MHIC_HEADER_HEIGHT, MhicHeader } from '@/components/integrated-care/mhic';
import { config } from '@/config';
import { PatientOrderAutocompleteResult } from '@/lib/models';
import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useRouteError, useRouteLoaderData } from 'react-router-dom';
import { useMhicOrderLayoutLoaderData } from './order-layout';
import Loader from '@/components/loader';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';
import { integratedCareService } from '@/lib/services';
import ErrorDisplay from '@/components/error-display';

type MhicLayoutLoaderData = Awaited<ReturnType<typeof loader>>;

export function useMhicLayoutLoaderData() {
	return useRouteLoaderData('mhic') as MhicLayoutLoaderData;
}

export async function loader() {
	const accounts = await integratedCareService.getPanelAccounts().fetch();

	return {
		panelAccounts: accounts.panelAccounts,
	};
}

function getRecentOrdersFromStorage() {
	return JSON.parse(window.localStorage.getItem(config.storageKeys.mhicRecentOrdersStorageKey) ?? '[]');
}

export const Component = () => {
	const mhicOrderLayoutLoaderData = useMhicOrderLayoutLoaderData();
	const shelfLoaderData = useMhicPatientOrdereShelfLoaderData();

	const [recentOrders, setRecentOrders] = useState<PatientOrderAutocompleteResult[]>(getRecentOrdersFromStorage());

	useEffect(() => {
		if (!shelfLoaderData?.patientOrderPromise) {
			return;
		}

		shelfLoaderData.patientOrderPromise
			.then((patientOrderResponse) => {
				const result = {
					patientOrderId: patientOrderResponse.patientOrder.patientOrderId,
					patientMrn: patientOrderResponse.patientOrder.patientMrn,
					patientUniqueId: patientOrderResponse.patientOrder.patientUniqueId,
					patientUniqueIdType: patientOrderResponse.patientOrder.patientUniqueIdType,
					patientFirstName: patientOrderResponse.patientOrder.patientFirstName,
					patientLastName: patientOrderResponse.patientOrder.patientLastName,
					patientDisplayName: patientOrderResponse.patientOrder.patientDisplayName,
					patientPhoneNumber: patientOrderResponse.patientOrder.patientPhoneNumber,
					patientPhoneNumberDescription: patientOrderResponse.patientOrder.patientPhoneNumberDescription,
				} as PatientOrderAutocompleteResult & { patientOrderId: string };

				setRecentOrders((orders) => {
					const newOrders = orders.slice(0, 4);
					const index = newOrders.findIndex((o) => o.patientMrn === result.patientMrn);

					if (index > -1) {
						return newOrders;
					}

					newOrders.unshift(result);
					window.localStorage.setItem(
						config.storageKeys.mhicRecentOrdersStorageKey,
						JSON.stringify(newOrders)
					);
					return newOrders;
				});
			})
			.catch((e) => {
				// don't update recent orders on rejection/fail/cancellation
			});
	}, [shelfLoaderData?.patientOrderPromise]);

	return (
		<>
			<MhicHeader
				patientOrder={mhicOrderLayoutLoaderData?.patientOrderResponse.patientOrder}
				recentOrders={recentOrders}
			/>

			<div
				style={{
					paddingTop: MHIC_HEADER_HEIGHT,
				}}
			>
				<Suspense fallback={<Loader />}>
					<Outlet />
				</Suspense>
			</div>
		</>
	);
};

const MhicErrorLayout = () => {
	const error = useRouteError();
	const mhicOrderLayoutLoaderData = useMhicOrderLayoutLoaderData();

	const recentOrders = getRecentOrdersFromStorage();

	return (
		<>
			<MhicHeader
				patientOrder={mhicOrderLayoutLoaderData?.patientOrderResponse.patientOrder}
				recentOrders={recentOrders}
			/>

			<div
				style={{
					paddingTop: MHIC_HEADER_HEIGHT,
				}}
			>
				<ErrorDisplay
					error={error}
					showRetryButton
					onRetryButtonClick={() => {
						window.location.reload();
					}}
				/>
			</div>
		</>
	);
};

export const errorElement = <MhicErrorLayout />;
