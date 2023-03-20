import RenderJson from '@/components/render-json';
import { PatientOrderModel, ReferenceDataResponse } from '@/lib/models';
import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

interface MhicAssessmentCompleteProps {
	referenceData?: ReferenceDataResponse;
	patientOrder?: PatientOrderModel;
	onStartNewAssessment: () => void;
}

export const MhicAssessmentComplete = ({
	patientOrder,
	referenceData,
	onStartNewAssessment,
}: MhicAssessmentCompleteProps) => {
	return (
		<Container className="py-20">
			<Row className="mb-8">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3 className="mb-2">Assessment Complete</h3>
					<p className="mb-0">Based on the patient’s answers, we recommend the following:</p>
				</Col>
			</Row>
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					[TODO]: Results Card
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Button
						onClick={() => {
							onStartNewAssessment();
						}}
					>
						Start New Assessment
					</Button>
				</Col>
			</Row>
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<RenderJson json={patientOrder?.screeningSessionResult} />
				</Col>
			</Row>
		</Container>
	);
};
