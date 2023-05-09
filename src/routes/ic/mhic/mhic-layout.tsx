import { MHIC_HEADER_HEIGHT, MhicHeader } from '@/components/integrated-care/mhic';
import { STORAGE_KEYS } from '@/lib/config/constants';
import { PatientOrderAutocompleteResult } from '@/lib/models';
import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useRouteLoaderData } from 'react-router-dom';
import { useMhicOrderLayoutLoaderData } from './order-layout';
import Loader from '@/components/loader';
import { useMhicPatientOrdereShelfLoaderData } from './patient-order-shelf';
import { integratedCareService } from '@/lib/services';

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

export const Component = () => {
	const mhicOrderLayoutLoaderData = useMhicOrderLayoutLoaderData();
	const shelfLoaderData = useMhicPatientOrdereShelfLoaderData();

	const [recentOrders, setRecentOrders] = useState<PatientOrderAutocompleteResult[]>(
		JSON.parse(window.localStorage.getItem(STORAGE_KEYS.MHIC_RECENT_ORDERS_STORAGE_KEY) ?? '[]')
	);

	useEffect(() => {
		if (!shelfLoaderData?.patientOrderPromise) {
			return;
		}

		shelfLoaderData.patientOrderPromise.then((patientOrderResponse) => {
			const result = {
				patientOrderId: patientOrderResponse.patientOrder.patientOrderId,
				patientMrn: patientOrderResponse.patientOrder.patientMrn,
				patientId: patientOrderResponse.patientOrder.patientId,
				patientIdType: patientOrderResponse.patientOrder.patientIdType,
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
				window.localStorage.setItem(STORAGE_KEYS.MHIC_RECENT_ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
				return newOrders;
			});
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
