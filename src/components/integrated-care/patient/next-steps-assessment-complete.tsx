import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderTriageStatusId } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import { NextStepsItem } from './next-steps-item';

import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';

interface NextStepsAssessmentCompleteProps {
	patientOrder: PatientOrderModel;
}

export const NextStepsAssessmentComplete = ({ patientOrder }: NextStepsAssessmentCompleteProps) => {
	const navigate = useNavigate();
	const { institution } = useAccount();

	return (
		<>
			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.BHP && (
				<>
					{patientOrder.appointmentId ? (
						<NextStepsItem
							complete
							title="Step 3: Schedule appointment with Behavioral Health Provider"
							description={`You have an appointment on ${patientOrder.appointmentStartTimeDescription} with ${patientOrder.providerName}`}
							button={{
								variant: 'danger',
								title: 'Cancel Appointment',
								onClick: () => {
									window.alert('[TODO]: Show cancel appointment UI.');
								},
							}}
						/>
					) : (
						<NextStepsItem
							title="Step 3: Schedule appointment with Behavioral Health Provider"
							description="Find an appointment by browsing the list of providers and choosing an available appointment time."
							button={{
								variant: 'primary',
								title: 'Find Appointment',
								onClick: () => {
									navigate(
										`/ic/patient/connect-with-support/bhp?patientOrderId=${patientOrder.patientOrderId}`
									);
								},
							}}
						/>
					)}
				</>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE && (
				<>
					{!patientOrder.resourcesSentAt ? (
						<NextStepsItem
							title="Step 3: Receive resources"
							description={`Check ${
								institution?.myChartName ?? 'MyChart'
							} or call us for resources available in your area.`}
						>
							<RecieveResourcesInformation />
						</NextStepsItem>
					) : (
						<>
							<NextStepsItem
								complete
								title="Step 3: Receive Resources"
								description={`Resources were sent to ${institution?.myChartName ?? 'MyChart'} on ${
									patientOrder.resourcesSentAtDescription
								}`}
								button={{
									variant: 'outline-primary',
									title: `Check ${institution?.myChartName ?? 'MyChart'}`,
									onClick: () => {
										window.alert('[TODO]: Link to MyChart');
									},
								}}
							/>
							<hr />
							<NextStepsItem
								title="Step 4: Schedule & attend appointment"
								description={`Schedule an appointment by contacting one of the resources provided through ${
									institution?.myChartName ?? 'MyChart'
								}`}
							/>
						</>
					)}
				</>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SUBCLINICAL && (
				<>
					<NextStepsItem
						title="Step 3: Receive resources"
						description={`Check ${
							institution?.myChartName ?? 'MyChart'
						} or call us for resources available in your area.`}
					>
						<RecieveResourcesInformation />
					</NextStepsItem>
				</>
			)}
		</>
	);
};

const RecieveResourcesInformation = () => {
	const { institution } = useAccount();

	return (
		<Container fluid>
			<Row>
				<Col md={6} className="mb-6 mb-md-0">
					<Card bsPrefix="ic-card" className="h-100">
						<Card.Header className="bg-white">
							<Card.Title>Check {institution?.myChartName ?? 'MyChart'}</Card.Title>
						</Card.Header>
						<Card.Body>
							<p className="mb-5">
								A Mental Health Intake Coordinator will review your results and send a list of resources
								that work with your insurance <strong>within the next 2 business days</strong>. Please
								check {institution?.myChartName ?? 'MyChart'} for more details.
							</p>
							<Button
								className="d-flex align-items-center"
								onClick={() => {
									window.alert('[TODO]: Need a "MyChart" url to link to.');
								}}
							>
								Visit {institution?.myChartName ?? 'MyChart'}
								<ExternalIcon className="ms-2" width={20} height={20} />
							</Button>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6}>
					<Card bsPrefix="ic-card" className="h-100">
						<Card.Header className="bg-white">
							<Card.Title>Call Us</Card.Title>
						</Card.Header>
						<Card.Body>
							<p className="mb-5">
								Feel free to call us at{' '}
								<strong>
									{institution?.integratedCarePhoneNumberDescription ?? 'phone number unavailable'}
								</strong>{' '}
								if you do not receive the {institution?.myChartName ?? 'MyChart'} message or if you wish
								to speak to a Mental Health Intake Coordinator about your options.
							</p>
							<Button
								as="a"
								className="d-inline-block text-decoration-none"
								variant="outline-primary"
								href={`tel:${institution?.integratedCarePhoneNumber}`}
							>
								Call Us
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};
