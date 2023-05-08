import { ScreeningIntro } from '@/components/integrated-care/common';
import {
	MhicAssessmentComplete,
	MhicVerifyPatientInfoForm,
	PatientInfoFormData,
} from '@/components/integrated-care/mhic';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { integratedCareService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useParams, useRevalidator } from 'react-router-dom';
import { useIntegratedCareLoaderData } from '../landing';
import { useMhicOrderLayoutLoaderData } from './order-layout';

export const MhicOrderAssessment = () => {
	const handleError = useHandleError();
	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const { patientOrderResponse } = useMhicOrderLayoutLoaderData();
	const revalidator = useRevalidator();

	const { institution } = useAccount();
	const { checkAndStartScreeningFlow, createNewScreeningFlow } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId,
		instantiateOnLoad: false,
	});
	const [showIntro, setShowIntro] = useState(false);
	const [isRecreate, setIsRecreate] = useState(false);

	const handleFormSubmit = useCallback(
		async (values: PatientInfoFormData) => {
			if (!patientOrderResponse.patientOrder) {
				return;
			}

			try {
				await integratedCareService
					.patchPatientOrder(patientOrderResponse.patientOrder.patientOrderId, {
						...values,
						patientDemographicsConfirmed: true,
					})
					.fetch();

				revalidator.revalidate();

				setShowIntro(true);
				window.scrollTo(0, 0);
			} catch (error) {
				if ((error as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(error);
				}
			}
		},
		[handleError, patientOrderResponse.patientOrder, revalidator]
	);

	const showVerificationForm =
		!!patientOrderResponse.patientOrder &&
		(isRecreate || !patientOrderResponse.patientOrder.screeningSession) &&
		!showIntro;
	const showInProgress =
		!!patientOrderResponse.patientOrder?.screeningSession &&
		!patientOrderResponse.patientOrder.screeningSession.completed &&
		!showIntro &&
		!isRecreate;
	const isCompleted =
		!!patientOrderResponse.patientOrder?.screeningSession?.completed &&
		!!patientOrderResponse.patientOrder.screeningSessionResult &&
		!isRecreate;

	return (
		<>
			{showVerificationForm && (
				<MhicVerifyPatientInfoForm
					patientOrder={patientOrderResponse.patientOrder}
					onSubmit={handleFormSubmit}
					referenceData={referenceDataResponse}
				/>
			)}

			{showIntro && (
				<ScreeningIntro
					isMhic
					patientOrder={patientOrderResponse.patientOrder}
					onBegin={async () => {
						if (isRecreate) {
							await createNewScreeningFlow();
						} else {
							await checkAndStartScreeningFlow();
						}

						revalidator.revalidate();
					}}
				/>
			)}

			{showInProgress && (
				<Container className="py-20">
					<Row className="mb-8">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="mb-0">Assessment in progress/incomplete.</p>

							<Button
								onClick={() => {
									setIsRecreate(true);
								}}
							>
								Start New Assessment
							</Button>

							<Button
								onClick={() => {
									checkAndStartScreeningFlow();
								}}
							>
								Continue Current Assessment
							</Button>
						</Col>
					</Row>
				</Container>
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
