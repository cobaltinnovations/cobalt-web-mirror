import { MhicHeader, MhicPatientOrderShelf, MHIC_HEADER_HEIGHT } from '@/components/integrated-care/mhic';
import { STORAGE_KEYS } from '@/lib/config/constants';
import { PatientOrderAutocompleteResult, PatientOrderModel } from '@/lib/models';
import React, { useCallback, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

export interface MhicLayoutContext {
	setOpenOrder: (order: PatientOrderModel) => void;
	setMainViewRefresher: React.Dispatch<React.SetStateAction<() => void>>;
}

export const MhicLayout = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const [mainViewRefresher, setMainViewRefresher] = useState<() => void>(() => () => {});
	const [recentOrders, setRecentOrders] = useState<PatientOrderAutocompleteResult[]>(
		JSON.parse(window.localStorage.getItem(STORAGE_KEYS.MHIC_RECENT_ORDERS_STORAGE_KEY) ?? '[]')
	);
	const [openOrder, setOpenOrder] = useState<PatientOrderModel>();

	const handleShelfOpen = useCallback((patientOrder: PatientOrderModel) => {
		setOpenOrder(patientOrder);

		const result = {
			patientOrderId: patientOrder.patientOrderId,
			patientMrn: patientOrder.patientMrn,
			patientId: patientOrder.patientId,
			patientIdType: patientOrder.patientIdType,
			patientFirstName: patientOrder.patientFirstName,
			patientLastName: patientOrder.patientLastName,
			patientDisplayName: patientOrder.patientDisplayName,
			patientPhoneNumber: patientOrder.patientPhoneNumber,
			patientPhoneNumberDescription: patientOrder.patientPhoneNumberDescription,
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
	}, []);

	return (
		<>
			<MhicHeader patientOrder={openOrder} recentOrders={recentOrders} />

			<div
				style={{
					paddingTop: MHIC_HEADER_HEIGHT,
				}}
			>
				<Outlet
					context={{
						setMainViewRefresher,
						setOpenOrder,
					}}
				/>
			</div>

			<MhicPatientOrderShelf
				patientOrderId={searchParams.get('openPatientOrderId')}
				onShelfLoad={handleShelfOpen}
				mainViewRefresher={mainViewRefresher}
				onHide={() => {
					const params = new URLSearchParams(searchParams.toString());
					params.delete('openPatientOrderId');
					setSearchParams(params);
				}}
			/>
		</>
	);
};

export default MhicLayout;
