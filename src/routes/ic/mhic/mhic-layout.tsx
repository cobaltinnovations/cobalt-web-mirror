import { MHIC_HEADER_HEIGHT, MhicHeader, MhicPatientOrderShelf } from '@/components/integrated-care/mhic';
import Loader from '@/components/loader';
import { STORAGE_KEYS } from '@/lib/config/constants';
import { PatientOrderAutocompleteResult, PatientOrderModel } from '@/lib/models';
import React, { Suspense, useCallback, useState } from 'react';
import { LoaderFunctionArgs, Outlet, useSearchParams } from 'react-router-dom';

export async function loader({ request }: LoaderFunctionArgs) {
	console.log('==> mhic layout loader');
	return null;
}

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const [recentOrders, setRecentOrders] = useState<PatientOrderAutocompleteResult[]>(
		JSON.parse(window.localStorage.getItem(STORAGE_KEYS.MHIC_RECENT_ORDERS_STORAGE_KEY) ?? '[]')
	);
	const [openOrder, setOpenOrder] = useState<PatientOrderModel>();

	const handleShelfOpen = useCallback((patientOrder: PatientOrderModel) => {
		setOpenOrder(patientOrder);

		const result = {
			patientMrn: patientOrder.patientMrn,
			patientId: patientOrder.patientId,
			patientIdType: patientOrder.patientIdType,
			patientFirstName: patientOrder.patientFirstName,
			patientLastName: patientOrder.patientLastName,
			patientDisplayName: patientOrder.patientDisplayName,
			patientPhoneNumber: patientOrder.patientPhoneNumber,
			patientPhoneNumberDescription: patientOrder.patientPhoneNumberDescription,
		} as PatientOrderAutocompleteResult;

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
	}, []);

	return (
		<>
			<MhicHeader patientOrder={openOrder} recentOrders={recentOrders} />

			<div
				style={{
					paddingTop: MHIC_HEADER_HEIGHT,
				}}
			>
				<Suspense fallback={<Loader />}>
					<Outlet />
				</Suspense>
			</div>

			<MhicPatientOrderShelf
				patientOrderId={searchParams.get('openPatientOrderId')}
				onShelfLoad={handleShelfOpen}
				onHide={() => {
					const params = new URLSearchParams(searchParams.toString());
					params.delete('openPatientOrderId');
					setSearchParams(params);
				}}
			/>
		</>
	);
};
