import { ScreeningIntro } from '@/components/integrated-care/common';
import { MhicAssessmentComplete } from '@/components/integrated-care/mhic';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import React, { useState } from 'react';
import { useParams, useRevalidator } from 'react-router-dom';
import { useMhicOrderLayoutLoaderData } from './order-layout';

export const MhicOrderAssessment = () => {
	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const { patientOrderResponse } = useMhicOrderLayoutLoaderData();
	const revalidator = useRevalidator();

	const { institution } = useAccount();
	const { createScreeningSession } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId,
		instantiateOnLoad: false,
	});
	const [isRecreate, setIsRecreate] = useState(false);

	const isCompleted =
		!!patientOrderResponse.patientOrder?.mostRecentIntakeAndClinicalScreeningsSatisfied && !isRecreate;

	return (
		<>
			{!isCompleted && (
				<ScreeningIntro
					isMhic
					patientOrder={patientOrderResponse.patientOrder}
					onBegin={async () => {
						await createScreeningSession();

						revalidator.revalidate();
					}}
				/>
			)}

			{isCompleted && (
				<MhicAssessmentComplete
					patientOrder={patientOrderResponse.patientOrder}
					onStartNewAssessment={() => {
						setIsRecreate(true);
					}}
				/>
			)}
		</>
	);
};

export default MhicOrderAssessment;
