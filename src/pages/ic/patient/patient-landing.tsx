import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import config from '@/lib/config';
import { PatientOrderModel, PatientOrderScreeningStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CheckIcon } from '@/assets/icons/icon-check.svg';

const useStyles = createUseThemedStyles((theme) => ({
	checkOuter: {
		width: 48,
		height: 48,
		flexShrink: 0,
		display: 'flex',
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.n300,
		border: `2px solid ${theme.colors.n300}`,
	},
	checkOuterGreen: {
		color: theme.colors.s500,
		backgroundColor: theme.colors.s50,
		border: `2px solid ${theme.colors.s300}`,
	},
}));

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
	const classes = useStyles();
	const navigate = useNavigate();
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
								<Card.Body>
									<Container fluid>
										<Row className="mb-5">
											<Col>
												<div className="d-flex">
													<div className={classes.checkOuter}>
														<CheckIcon width={24} height={24} />
													</div>
													<div className="ps-4">
														<p className="mb-1 fs-large fw-semibold">
															Complete the assessment
														</p>
														<p className="mb-0 text-gray">
															In order to connect you to the correct level of care, we
															need you to complete an assessment. There are two ways to
															complete the assessment:
														</p>
													</div>
												</div>
											</Col>
										</Row>
										<Row>
											<Col>
												<Card bsPrefix="ic-card">
													<Card.Header className="bg-white">
														<Card.Title>Online (Recommended)</Card.Title>
													</Card.Header>
													<Card.Body>
														<p className="mb-5">
															Completing the assessment online will take about 15 minutes.
															Only you and your care team will have access to your
															answers.
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
															Mental Health Intake Coordinator will guide you through the
															assessment over the phone.
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
								<Card.Body>
									<Container fluid>
										<Row className="mb-5">
											<Col>
												<div className="d-flex">
													<div className={classes.checkOuter}>
														<CheckIcon width={24} height={24} />
													</div>
													<div className="ps-4">
														<p className="mb-1 fs-large fw-semibold">
															Complete the assessment
														</p>
														<p className="mb-0 text-gray">Online assessment in progress</p>
													</div>
												</div>
											</Col>
										</Row>
										<Row>
											<Col>
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
											</Col>
										</Row>
									</Container>
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
									<div className="px-6 py-5">
										<div className="d-flex">
											<div className={classNames(classes.checkOuter, classes.checkOuterGreen)}>
												<CheckIcon width={24} height={24} />
											</div>
											<div className="ps-4 flex-grow-1">
												<p className="mb-1 fs-large fw-semibold">Complete the assessment</p>
												<p className="mb-0 text-gray">
													Completed{' '}
													{patientOrder?.mostRecentScreeningSessionCompletedAtDescription}
												</p>
											</div>
											<div>
												<Button
													className="text-nowrap"
													variant="outline-primary"
													onClick={() => {
														window.alert('[TODO]');
													}}
												>
													Review Results
												</Button>
											</div>
										</div>
									</div>
									<hr />
									<div className="px-6 py-5">
										<div className="d-flex">
											<div className={classes.checkOuter}>
												<CheckIcon width={24} height={24} />
											</div>
											<div className="ps-4 flex-grow-1">
												<p className="mb-1 fs-large fw-semibold">
													Schedule appointment with Behavioral Health Provider
												</p>
												<p className="mb-0 text-gray">
													Find an appointment by browsing the list of providers and choosing
													an available appointment time.
												</p>
											</div>
											<div>
												<Button
													className="text-nowrap"
													onClick={() => {
														window.alert('[TODO]');
													}}
												>
													Find Appointment
												</Button>
											</div>
										</div>
									</div>
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
