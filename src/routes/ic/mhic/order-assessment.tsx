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
	const { checkAndStartScreeningFlow, createNewScreeningFlow } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId,
		instantiateOnLoad: false,
	});
	const [isRecreate, setIsRecreate] = useState(false);

	const showInProgress =
		!!patientOrderResponse.patientOrder?.screeningSession &&
		!patientOrderResponse.patientOrder.screeningSession.completed &&
		!isRecreate;
	const isCompleted =
		!!patientOrderResponse.patientOrder?.screeningSession?.completed &&
		!!patientOrderResponse.patientOrder.screeningSessionResult &&
		!isRecreate;

	return (
		<>
			{!isCompleted && !showInProgress && (
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
