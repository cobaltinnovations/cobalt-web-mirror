import AsyncPage from '@/components/async-page';
import { AccountModel, PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LoaderFunction, Outlet, useLoaderData, useOutletContext, useParams } from 'react-router-dom';
import { MhicLayoutContext } from './mhic-layout';

interface MhicOrderLayoutLoaderData {
	patientOrder: PatientOrderModel;
	patientAccount: AccountModel;
}

export const mhicOrderLayoutLoader: LoaderFunction = async ({ params, request }) => {
	if (!params.patientOrderId) {
		throw new Error('Missing Patient Order ID');
	}

	const dataRequest = integratedCareService.getPatientOrder(params.patientOrderId);
	request.signal.addEventListener('abort', () => {
		dataRequest.abort();
	});
	const dataResponse = await dataRequest.fetch();

	return dataResponse;
};

const MhicOrderLayout = () => {
	const loaderData = useLoaderData() as MhicOrderLayoutLoaderData;

	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>(loaderData.patientOrder);
	const [patientAccount, setPatientAccount] = useState<AccountModel | undefined>(loaderData.patientAccount);
	const { setOpenOrder } = useOutletContext<MhicLayoutContext>();

	useEffect(() => {
		setPatientOrder(loaderData.patientOrder);
		setPatientAccount(loaderData.patientAccount);
	}, [loaderData.patientAccount, loaderData.patientOrder]);

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
		const referenceDataResponse = await integratedCareService.getReferenceData().fetch();

		setReferenceData(referenceDataResponse);
	}, []);

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
