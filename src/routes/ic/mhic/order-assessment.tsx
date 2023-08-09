import { ScreeningIntro } from '@/components/integrated-care/common';
import { MhicAssessmentComplete } from '@/components/integrated-care/mhic';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import React, { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useParams, useRevalidator } from 'react-router-dom';
import { useMhicOrderLayoutLoaderData } from './order-layout';

export const MhicOrderAssessment = () => {
	const { patientOrderId } = useParams<{ patientOrderId: string }>();
	const { patientOrderResponse } = useMhicOrderLayoutLoaderData();
	const revalidator = useRevalidator();

	const { institution } = useAccount();
	const { resumeScreeningSession, createScreeningSession } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId,
		instantiateOnLoad: false,
	});
	const [isRecreate, setIsRecreate] = useState(false);

	const showInProgress =
		!!patientOrderResponse.patientOrder?.screeningSession &&
		!patientOrderResponse.patientOrder.screeningSession.completed &&
		!!patientOrderResponse.patientOrder?.intakeScreeningSession &&
		!patientOrderResponse.patientOrder.intakeScreeningSession.completed &&
		!isRecreate;
	const isCompleted =
		!!patientOrderResponse.patientOrder?.screeningSession?.completed &&
		!!patientOrderResponse.patientOrder.screeningSessionResult &&
		!!patientOrderResponse.patientOrder?.intakeScreeningSession?.completed &&
		!!patientOrderResponse.patientOrder.intakeScreeningSessionResult &&
		!isRecreate;

	return (
		<>
			{!isCompleted && !showInProgress && (
				<ScreeningIntro
					isMhic
					patientOrder={patientOrderResponse.patientOrder}
					onBegin={async () => {
						await createScreeningSession();

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
									resumeScreeningSession(
										patientOrderResponse.patientOrder.mostRecentScreeningSessionId
									);
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
