import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

import config from '@/lib/config';
import { PatientOrderConsentStatusId, PatientOrderModel, PatientOrderScreeningStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';

import useAccount from '@/hooks/use-account';
import { NextStepsAssessmentComplete, NextStepsItem } from '@/components/integrated-care/patient';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';

enum PAGE_STATES {
	AWAITING_PATIENT_ORDER = 'AWAITING_PATIENT_ORDER',
	ASSESSMENT_READY = 'ASSESSMENT_READY',
	ASSESSMENT_REFUSED = 'ASSESSMENT_REFUSED',
	ASSESSMENT_IN_PROGRESS = 'ASSESSMENT_IN_PROGRESS',
	ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
}

const pageStates = [
	{
		homescreenStateId: PAGE_STATES.AWAITING_PATIENT_ORDER,
		title: 'Awaiting Patient Order',
	},
	{
		homescreenStateId: PAGE_STATES.ASSESSMENT_READY,
		title: 'Assessment Ready',
	},
	{
		homescreenStateId: PAGE_STATES.ASSESSMENT_REFUSED,
		title: 'Assessment Refused',
	},
	{
		homescreenStateId: PAGE_STATES.ASSESSMENT_IN_PROGRESS,
		title: 'Assessment In Progress',
	},
	{
		homescreenStateId: PAGE_STATES.ASSESSMENT_COMPLETE,
		title: 'Assessment Complete',
	},
];

const PatientLanding = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [homescreenState, setHomescreenState] = useState(PAGE_STATES.AWAITING_PATIENT_ORDER);
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const { checkAndStartScreeningFlow } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId: patientOrder?.patientOrderId,
		instantiateOnLoad: false,
	});

	const fetchData = useCallback(async () => {
		try {
			const response = await integratedCareService.getLatestPatientOrder().fetch();

			if (response.patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.UNKNOWN) {
				navigate('/ic/patient/consent');
				return;
			}

			setPatientOrder(response.patientOrder);

			switch (response.patientOrder.patientOrderScreeningStatusId) {
				case PatientOrderScreeningStatusId.COMPLETE:
					setHomescreenState(PAGE_STATES.ASSESSMENT_COMPLETE);
					break;
				case PatientOrderScreeningStatusId.NOT_SCREENED:
				case PatientOrderScreeningStatusId.SCHEDULED:
					setHomescreenState(PAGE_STATES.ASSESSMENT_READY);
					break;
				case PatientOrderScreeningStatusId.IN_PROGRESS:
					setHomescreenState(PAGE_STATES.ASSESSMENT_IN_PROGRESS);
					break;
				default:
					setHomescreenState(PAGE_STATES.AWAITING_PATIENT_ORDER);
			}
		} catch (_error) {
			// Do not throw error, backend will 404  if there is no order, but that is ok.
			// Instead, just set the page state to PAGE_STATES.AWAITING_PATIENT_ORDER

			setHomescreenState(PAGE_STATES.AWAITING_PATIENT_ORDER);
		}
	}, [navigate]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<Container className="py-10">
				{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
					<Row className="mb-10">
						<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
							<Form>
								<Form.Label className="mb-2">Homescreen State (For Dev Only)</Form.Label>
								<Form.Group>
									{pageStates.map((hs) => (
										<Form.Check
											inline
											key={hs.homescreenStateId}
											type="radio"
											name="homescreen-state"
											id={`homescreen-state--${hs.homescreenStateId}`}
											value={hs.homescreenStateId}
											label={hs.title}
											checked={homescreenState === hs.homescreenStateId}
											onChange={({ currentTarget }) => {
												setHomescreenState(currentTarget.value as PAGE_STATES);
											}}
										/>
									))}
								</Form.Group>
							</Form>
						</Col>
					</Row>
				)}

				<Row className="mb-10">
					<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
						<h1 className="mb-6">Welcome back, {patientOrder?.patientFirstName ?? 'patient'}</h1>
						<hr />
					</Col>
				</Row>

				<Row className="mb-10">
					<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
						<h4 className="mb-1">Current Episode</h4>
						<p className="mb-6 text-gray">
							{homescreenState === PAGE_STATES.AWAITING_PATIENT_ORDER
								? 'You do not have a current patient order'
								: `Referred ${patientOrder?.orderDateDescription} by ${patientOrder?.orderingProviderDisplayName}`}
						</p>

						{homescreenState === PAGE_STATES.ASSESSMENT_REFUSED && (
							<NoData
								className="mb-10 bg-white"
								title="No further action required"
								description={`You indicated that you are no longer seeking services for mental health concerns. We will let your primary care provider know, but you should feel free to call us at ${institution?.integratedCarePhoneNumberDescription} if you change your mind.`}
								actions={[]}
							/>
						)}

						{homescreenState === PAGE_STATES.AWAITING_PATIENT_ORDER && (
							<NoData
								className="mb-10"
								title="Awaiting Patient Order"
								description="Your patient order has not been sent yet. You will get an email when we are ready for you."
								actions={[]}
							/>
						)}

						{homescreenState !== PAGE_STATES.ASSESSMENT_REFUSED &&
							homescreenState !== PAGE_STATES.AWAITING_PATIENT_ORDER && (
								<Card bsPrefix="ic-card" className="mb-10">
									<Card.Header>
										<Card.Title>
											Follow these steps to connect to mental health services:
										</Card.Title>
									</Card.Header>
									<Card.Body className="p-0">
										<NextStepsItem
											complete={false}
											title="Step 1: Verify your information"
											description="[TODO]: Completed Apr 6, 2023 at 1:45 PM"
											button={{
												variant: 'outline-primary',
												title: 'Begin Verification Process',
												onClick: () => {
													navigate('/ic/patient/demographics');
												},
											}}
										/>
										<hr />
										<NextStepsItem
											complete={homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE}
											title="Step 2: Complete the assessment"
											description={
												homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE
													? `Completed ${patientOrder?.mostRecentScreeningSessionCompletedAtDescription}`
													: 'There are two ways to complete the assessment:'
											}
											button={
												homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE
													? {
															variant: 'outline-primary',
															title: 'Review Results',
															onClick: () => {
																navigate('/ic/patient/assessment-results');
															},
													  }
													: undefined
											}
										>
											{homescreenState === PAGE_STATES.ASSESSMENT_READY && (
												<Container fluid>
													<Row>
														<Col md={6} className="mb-6 mb-md-0">
															<Card bsPrefix="ic-card" className="h-100">
																<Card.Header className="bg-white">
																	<Card.Title>Online (Recommended)</Card.Title>
																</Card.Header>
																<Card.Body>
																	<p className="mb-5">
																		Completing the assessment online will take about
																		15 minutes. Only you and your care team will
																		have access to your answers.
																	</p>
																	<Button
																		onClick={() => {
																			checkAndStartScreeningFlow();
																		}}
																	>
																		Take the Assessment
																	</Button>
																</Card.Body>
															</Card>
														</Col>
														<Col md={6}>
															<Card bsPrefix="ic-card" className="h-100">
																<Card.Header className="bg-white">
																	<Card.Title>By Phone</Card.Title>
																</Card.Header>
																<Card.Body>
																	<p className="mb-5">
																		Call us at{' '}
																		{
																			institution?.integratedCarePhoneNumberDescription
																		}{' '}
																		Monday-Friday, 9am to 4pm and a Mental Health
																		Intake Coordinator will guide you through the
																		assessment over the phone.
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
											)}
											{homescreenState === PAGE_STATES.ASSESSMENT_IN_PROGRESS && (
												<NoData
													className="bg-white"
													title="Continue Assessment"
													description="You previously made progress on the assessment. If now is a good time, we can start from where you left off. Before we continue, please make sure you are in a comfortable place."
													actions={[
														{
															variant: 'primary',
															title: 'Continue Assessment',
															onClick: () => {
																window.alert(
																	'[TODO]: link to current assessment question'
																);
															},
														},
														{
															variant: 'outline-primary',
															title: 'Restart from Beginning',
															onClick: () => {
																checkAndStartScreeningFlow();
															},
														},
													]}
												/>
											)}
										</NextStepsItem>
										{homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE && (
											<>
												<hr />
												{patientOrder && (
													<NextStepsAssessmentComplete patientOrder={patientOrder} />
												)}
											</>
										)}
									</Card.Body>
								</Card>
							)}
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientLanding;
