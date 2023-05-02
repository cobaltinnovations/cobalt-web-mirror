import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

import config from '@/lib/config';
import { PatientOrderModel, PatientOrderScreeningStatusId, PatientOrderStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';

import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import useAccount from '@/hooks/use-account';
import { NextStepsItem } from '@/components/integrated-care/patient';

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

	const fetchData = useCallback(async () => {
		try {
			const response = await integratedCareService.getOpenOrderForCurrentPatient().fetch();
			setPatientOrder(response.patientOrder);

			const { screeningSessionResult, screeningSession, patientOrderScreeningStatusId } = response.patientOrder;

			if (screeningSessionResult) {
				setHomescreenState(PAGE_STATES.ASSESSMENT_COMPLETE);
				return;
			}

			if (!screeningSession) {
				if (
					patientOrderScreeningStatusId === PatientOrderScreeningStatusId.NOT_SCREENED ||
					patientOrderScreeningStatusId === PatientOrderScreeningStatusId.SCHEDULED
				) {
					setHomescreenState(PAGE_STATES.ASSESSMENT_READY);
					return;
				}
				if (patientOrderScreeningStatusId === PatientOrderScreeningStatusId.IN_PROGRESS) {
					setHomescreenState(PAGE_STATES.ASSESSMENT_IN_PROGRESS);
					return;
				}
			}
		} catch (_error) {
			// Do not throw error, backend will 404  if there is no order, but that is ok.
			// Instead, just set the page state to PAGE_STATES.AWAITING_PATIENT_ORDER

			setHomescreenState(PAGE_STATES.AWAITING_PATIENT_ORDER);
		}
	}, []);

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

				{homescreenState === PAGE_STATES.AWAITING_PATIENT_ORDER && (
					<Row className="mb-10">
						<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
							<h4 className="mb-1">Current Episode</h4>
							<p className="mb-6 text-gray">You do not have a current patient order</p>
							<NoData
								className="mb-10"
								title="Awaiting Patient Order"
								description="Your patient order has not been sent yet. You will get an email when we are ready for you."
								actions={[]}
							/>
							<hr />
						</Col>
					</Row>
				)}

				{homescreenState === PAGE_STATES.ASSESSMENT_READY && (
					<Row className="mb-10">
						<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
							<h4 className="mb-1">Current Episode</h4>
							<p className="mb-6 text-gray">
								Referred {patientOrder?.orderDateDescription} by{' '}
								{patientOrder?.orderingProviderDisplayName}
							</p>
							<Card bsPrefix="ic-card" className="mb-10">
								<Card.Header>
									<Card.Title>Next Steps</Card.Title>
								</Card.Header>
								<Card.Body className="p-0">
									<NextStepsItem
										title="Complete the assessment"
										description="In order to connect you to the correct level of care, we need you to complete an assessment. There are two ways to complete the assessment:"
									>
										<Container fluid>
											<Row>
												<Col>
													<Card bsPrefix="ic-card">
														<Card.Header className="bg-white">
															<Card.Title>Online (Recommended)</Card.Title>
														</Card.Header>
														<Card.Body>
															<p className="mb-5">
																Completing the assessment online will take about 15
																minutes. Only you and your care team will have access to
																your answers.
															</p>
															<Button
																onClick={() => {
																	navigate('/ic/patient/consent/');
																}}
															>
																Take the Assessment
															</Button>
														</Card.Body>
													</Card>
												</Col>
												<Col>
													<Card bsPrefix="ic-card">
														<Card.Header className="bg-white">
															<Card.Title>By Phone</Card.Title>
														</Card.Header>
														<Card.Body>
															<p className="mb-5">
																Call us at 215-615-4222 Monday-Friday, 9am to 4pm and a
																Mental Health Intake Coordinator will guide you through
																the assessment over the phone.
															</p>
															<Button
																variant="outline-primary"
																onClick={() => {
																	window.alert('[TODO]');
																}}
															>
																Call Us
															</Button>
														</Card.Body>
													</Card>
												</Col>
											</Row>
										</Container>
									</NextStepsItem>
								</Card.Body>
							</Card>
							<hr />
						</Col>
					</Row>
				)}

				{homescreenState === PAGE_STATES.ASSESSMENT_REFUSED && (
					<Row className="mb-10">
						<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
							<h4 className="mb-1">Current Episode</h4>
							<p className="mb-6 text-gray">
								Referred {patientOrder?.orderDateDescription} by{' '}
								{patientOrder?.orderingProviderDisplayName}
							</p>
							<NoData
								className="mb-10 bg-white"
								title="No further action required"
								description="You indicated that you are no longer seeking services for mental health concerns. We will let your primary care provider know, but you should feel free to call us at 215-615-4222 if you change your mind."
								actions={[]}
							/>
							<hr />
						</Col>
					</Row>
				)}

				{homescreenState === PAGE_STATES.ASSESSMENT_IN_PROGRESS && (
					<Row className="mb-10">
						<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
							<h4 className="mb-1">Current Episode</h4>
							<p className="mb-6 text-gray">
								Referred {patientOrder?.orderDateDescription} by{' '}
								{patientOrder?.orderingProviderDisplayName}
							</p>
							<Card bsPrefix="ic-card" className="mb-10">
								<Card.Header>
									<Card.Title>Next Steps</Card.Title>
								</Card.Header>
								<Card.Body className="p-0">
									<NextStepsItem
										title="Complete the assessment"
										description="Online assessment in progress"
									>
										<NoData
											className="bg-white"
											title="Continue Assessment"
											description="You previously made progress on the assessment. If now is a good time, we can restart from where you left off. Before we continue, please make sure you are in a comfortable place."
											actions={[
												{
													variant: 'primary',
													title: 'Continue Assessment',
													onClick: () => {
														window.alert('[TODO]');
													},
												},
												{
													variant: 'outline-primary',
													title: 'Restart from Beginning',
													onClick: () => {
														navigate('/ic/patient/consent');
													},
												},
											]}
										/>
									</NextStepsItem>
								</Card.Body>
							</Card>
							<hr />
						</Col>
					</Row>
				)}

				{homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE && (
					<Row className="mb-10">
						<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
							<h4 className="mb-1">Current Episode</h4>
							<p className="mb-6 text-gray">
								Referred {patientOrder?.orderDateDescription} by{' '}
								{patientOrder?.orderingProviderDisplayName}
							</p>
							<Card bsPrefix="ic-card" className="mb-10">
								<Card.Header>
									<Card.Title>Next Steps</Card.Title>
								</Card.Header>
								<Card.Body className="p-0">
									<NextStepsItem
										complete
										title="Complete the assessment"
										description={`Completed ${
											patientOrder?.mostRecentScreeningSessionCompletedAtDescription ?? 'N/A'
										}`}
										button={{
											variant: 'outline-primary',
											title: 'Review Results',
										}}
									/>
									{patientOrder?.patientOrderStatusId === PatientOrderStatusId.BHP && (
										<>
											<hr />
											<NextStepsItem
												title="Schedule appointment with Behavioral Health Provider"
												description="Find an appointment by browsing the list of providers and choosing an available appointment time."
												button={{
													variant: 'primary',
													title: 'Find Appointment',
												}}
											/>
											<hr />
											<NextStepsItem
												title="Schedule appointment with Behavioral Health Provider"
												description="You have an appointment on [Date] at [Time] with [Provider Name]"
												button={{
													variant: 'danger',
													title: 'Cancel Appointment',
												}}
											/>
										</>
									)}
									{patientOrder?.patientOrderStatusId === PatientOrderStatusId.SPECIALTY_CARE && (
										<>
											<hr />
											<NextStepsItem
												title="Review resources & schedule appointment"
												description={`Check ${
													institution?.myChartName ?? 'MyChart'
												} or call us for resources about available [Provider Type]s in your area.`}
											>
												<Container fluid>
													<Row>
														<Col>
															<Card bsPrefix="ic-card">
																<Card.Header className="bg-white">
																	<Card.Title>
																		Check {institution?.myChartName ?? 'MyChart'}
																	</Card.Title>
																</Card.Header>
																<Card.Body>
																	<p className="mb-5">
																		A Mental Health Intake Coordinator will review
																		your results and send a list of resources that
																		work with your insurance within the next 24
																		hours. Please check{' '}
																		{institution?.myChartName ?? 'MyChart'} for more
																		details.
																	</p>
																	<Button
																		className="d-flex align-items-center"
																		onClick={() => {
																			window.alert('[TODO]');
																		}}
																	>
																		Visit {institution?.myChartName ?? 'MyChart'}
																		<ExternalIcon
																			className="ms-2"
																			width={20}
																			height={20}
																		/>
																	</Button>
																</Card.Body>
															</Card>
														</Col>
														<Col>
															<Card bsPrefix="ic-card">
																<Card.Header className="bg-white">
																	<Card.Title>Call Us</Card.Title>
																</Card.Header>
																<Card.Body>
																	<p className="mb-5">
																		Feel free to call us at{' '}
																		{institution?.integratedCarePhoneNumberDescription ??
																			'N/A'}{' '}
																		if you do not receive the{' '}
																		{institution?.myChartName ?? 'MyChart'} message
																		or if you wish to speak to a Mental Health
																		Intake Coordinator about your options.
																	</p>
																	<Button
																		variant="outline-primary"
																		onClick={() => {
																			window.alert('[TODO]');
																		}}
																	>
																		Call Us
																	</Button>
																</Card.Body>
															</Card>
														</Col>
													</Row>
												</Container>
											</NextStepsItem>
											<hr />
											<NextStepsItem
												title="Attend appointment"
												description={`You indicated that you attended an appointment on [Date] at [Time] with [Provider Name].`}
											/>
										</>
									)}
									{patientOrder?.patientOrderStatusId === PatientOrderStatusId.SUBCLINICAL && (
										<>
											<hr />
											<NextStepsItem
												title="Review resources & schedule appointment"
												description={`Check ${
													institution?.myChartName ?? 'MyChart'
												} or call us for resources about available [Provider Type]s in your area.`}
											/>
										</>
									)}
								</Card.Body>
							</Card>
							<hr />
						</Col>
					</Row>
				)}

				<Row className="mb-10">
					<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
						<h4 className="mb-1">Past Episodes</h4>
						<p className="mb-6 text-gray">You 2 past episodes</p>
						<div className="rounded border bg-white">
							<div className="px-6 py-5">
								<p className="mb-1 fs-large fw-semibold">Nov 12, 2023</p>
								<p className="mb-0 text-gray">Closed: Nov 18, 2022 | Scheduled with BHP</p>
							</div>
							<hr />
							<div className="px-6 py-5">
								<p className="mb-1 fs-large fw-semibold">Apr 5, 2023</p>
								<p className="mb-0 text-gray">Closed: Apr 7, 2022 | Scheduled with BHP</p>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</AsyncWrapper>
	);
};

export default PatientLanding;
