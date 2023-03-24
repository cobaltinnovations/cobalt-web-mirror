import AsyncPage from '@/components/async-page';
import { AccountModel, PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import React, { useCallback, useMemo, useState } from 'react';
import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { MhicLayoutContext } from './mhic-layout';

export const MhicOrderLayout = () => {
	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [patientAccount, setPatientAccount] = useState<AccountModel>();
	const { setOpenOrder } = useOutletContext<MhicLayoutContext>();

	const patientOrderRequest = useMemo(() => {
		if (!patientOrderId) {
			throw new Error('Missing Patient Order');
		}

		return integratedCareService.getPatientOrder(patientOrderId);
	}, [patientOrderId]);

	const fetchOutletPatientOrder = useCallback(async () => {
		const response = await patientOrderRequest.fetch();
		setPatientOrder(response.patientOrder);
		setOpenOrder(response.patientOrder);
		setPatientAccount(response.patientAccount);
	}, [patientOrderRequest, setOpenOrder]);

	const fetchData = useCallback(async () => {
		const [referenceDataResponse] = await Promise.all([
			integratedCareService.getReferenceData().fetch(),
			fetchOutletPatientOrder(),
		]);

		setReferenceData(referenceDataResponse);
	}, [fetchOutletPatientOrder]);

	return (
		<AsyncPage fetchData={fetchData} abortFetch={patientOrderRequest.abort}>
			<Outlet
				context={{
					referenceData,
					patientOrder,
					patientAccount,
					fetchOutletPatientOrder,
				}}
			/>
		</AsyncPage>
	);
};

export default MhicOrderLayout;
