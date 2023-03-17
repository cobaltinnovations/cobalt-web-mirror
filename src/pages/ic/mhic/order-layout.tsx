import AsyncPage from '@/components/async-page';
import { MhicHeader, MHIC_HEADER_HEIGHT } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import { ReferenceDataResponse, PatientOrderModel, AccountModel } from '@/lib/models';
import { integratedCareService, PatientOrderResponseSupplement } from '@/lib/services';
import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';

const useStyles = createUseThemedStyles((theme) => ({
	mhicOrderLayout: {
		paddingTop: MHIC_HEADER_HEIGHT,
	},
}));

export const MhicOrderLayout = () => {
	const classes = useStyles();

	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const [referenceData, setReferenceData] = useState<ReferenceDataResponse>();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [patientAccount, setPatientAccount] = useState<AccountModel>();

	const patientOrderRequest = useMemo(() => {
		if (!patientOrderId) {
			throw new Error('Missing Patient Order');
		}

		return integratedCareService.getPatientOrder(patientOrderId, [PatientOrderResponseSupplement.EVERYTHING]);
	}, [patientOrderId]);

	const fetchOutletPatientOrder = useCallback(async () => {
		const response = await patientOrderRequest.fetch();
		setPatientOrder(response.patientOrder);
		setPatientAccount(response.patientAccount);
	}, [patientOrderRequest]);

	const fetchData = useCallback(async () => {
		const [referenceDataResponse] = await Promise.all([
			integratedCareService.getReferenceData().fetch(),
			fetchOutletPatientOrder(),
		]);

		setReferenceData(referenceDataResponse);
	}, [fetchOutletPatientOrder]);

	return (
		<>
			<MhicHeader assessmentView patientOrder={patientOrder} patientAccount={patientAccount} />

			<div className={classes.mhicOrderLayout}>
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
			</div>
		</>
	);
};

export default MhicOrderLayout;
