import { ScreeningIntro } from '@/components/integrated-care/common';
import { MhicAssessmentComplete } from '@/components/integrated-care/mhic';
import useAccount from '@/hooks/use-account';
import { PatientOrderIntakeScreeningStatusId, PatientOrderScreeningStatusId } from '@/lib/models';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import React, { useState } from 'react';
import { useParams, useRevalidator } from 'react-router-dom';
import { useMhicOrderLayoutLoaderData } from './order-layout';

export const MhicOrderAssessment = () => {
	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const { patientOrderResponse } = useMhicOrderLayoutLoaderData();
	const revalidator = useRevalidator();

	const { institution } = useAccount();
	const { createScreeningSession, renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareIntakeScreeningFlowId,
		patientOrderId,
		instantiateOnLoad: false,
	});
	const [isRecreate, setIsRecreate] = useState(false);
	const patientOrder = patientOrderResponse.patientOrder;

	const isCompleted = !!patientOrder?.mostRecentIntakeAndClinicalScreeningsSatisfied && !isRecreate;
	const isInProgress =
		(patientOrder?.patientOrderIntakeScreeningStatusId === PatientOrderIntakeScreeningStatusId.IN_PROGRESS ||
			patientOrder?.patientOrderScreeningStatusId === PatientOrderScreeningStatusId.IN_PROGRESS) &&
		!isRecreate;
	const isReviewable = isCompleted || isInProgress;

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			{!isReviewable && (
				<ScreeningIntro
					isMhic
					patientOrder={patientOrder}
					onBegin={async () => {
						await createScreeningSession();

						revalidator.revalidate();
					}}
				/>
			)}

			{isReviewable && (
				<MhicAssessmentComplete
					patientOrder={patientOrder}
					onStartNewAssessment={() => {
						setIsRecreate(true);
					}}
				/>
			)}
		</>
	);
};

export default MhicOrderAssessment;
