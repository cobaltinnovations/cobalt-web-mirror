import { ScreeningIntro } from '@/components/integrated-care/common';
import {
	MhicAssessmentComplete,
	MhicVerifyPatientInfoForm,
	PatientInfoFormData,
} from '@/components/integrated-care/mhic';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useOutletContext, useParams } from 'react-router-dom';

export const MhicOrderAssessment = () => {
	const handleError = useHandleError();
	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const { referenceData, patientOrder, fetchOutletPatientOrder } = useOutletContext<{
		referenceData?: ReferenceDataResponse;
		patientOrder?: PatientOrderModel;
		fetchOutletPatientOrder: () => Promise<void>;
	}>();
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
			if (!patientOrder) {
				return;
			}

			try {
				await integratedCareService.patchPatientOrder(patientOrder.patientOrderId, values).fetch();
				await fetchOutletPatientOrder();
				setShowIntro(true);
				window.scrollTo(0, 0);
			} catch (error) {
				if ((error as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(error);
				}
			}
		},
		[fetchOutletPatientOrder, handleError, patientOrder]
	);

	const showVerificationForm = !!patientOrder && (isRecreate || !patientOrder.screeningSession) && !showIntro;
	const showInProgress =
		!!patientOrder?.screeningSession && !patientOrder.screeningSession.completed && !showIntro && !isRecreate;
	const isCompleted =
		!!patientOrder?.screeningSession?.completed && !!patientOrder.screeningSessionResult && !isRecreate;

	return (
		<>
			{showVerificationForm && (
				<MhicVerifyPatientInfoForm
					patientOrder={patientOrder}
					onSubmit={handleFormSubmit}
					referenceData={referenceData}
				/>
			)}

			{showIntro && (
				<ScreeningIntro
					isMhic
					patientOrder={patientOrder}
					onBegin={async () => {
						if (isRecreate) {
							await createNewScreeningFlow();
						} else {
							await checkAndStartScreeningFlow();
						}

						fetchOutletPatientOrder();
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
					patientOrder={patientOrder}
					referenceData={referenceData}
					onStartNewAssessment={() => {
						setIsRecreate(true);
					}}
				/>
			)}
		</>
	);
};

export default MhicOrderAssessment;
