import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Await, defer, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import {
	PatientOrderConsentStatusId,
	PatientOrderDispositionId,
	PatientOrderClosureReasonId,
	PatientOrderModel,
	PatientOrderScreeningStatusId,
	ROLE_ID,
} from '@/lib/models';
import { LatestPatientOrderResponse, integratedCareService } from '@/lib/services';
import NoData from '@/components/no-data';

import useAccount from '@/hooks/use-account';
import { NextStepsAssessmentComplete, NextStepsItem } from '@/components/integrated-care/patient';
import Loader from '@/components/loader';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { MhicInlineAlert } from '@/components/integrated-care/mhic';
import { CobaltError } from '@/lib/http-client';

enum PAGE_STATES {
	ORDER_CLOSED = 'ORDER_CLOSED',
	AWAITING_PATIENT_ORDER = 'AWAITING_PATIENT_ORDER',
	ASSESSMENT_READY = 'ASSESSMENT_READY',
	ASSESSMENT_REFUSED = 'ASSESSMENT_REFUSED',
	ASSESSMENT_IN_PROGRESS = 'ASSESSMENT_IN_PROGRESS',
	ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

function loadLatestPatientOrder(isPolling = false) {
	const request = integratedCareService.getLatestPatientOrder();
	const patientOrderPromise = request.fetch({ isPolling }).catch((error) => {
		// Do not throw error, backend will 404  if there is no order, but that is ok.
		if (error instanceof CobaltError && error.axiosError?.response?.status === 404) {
			return null;
		}

		return Promise.reject(error);
	});

	return {
		getResponseChecksum: () => patientOrderPromise.then(() => request.cobaltResponseChecksum),
		patientOrderPromise,
	};
}

export async function loader() {
	return defer(loadLatestPatientOrder());
}

interface PatientLandingLoaderData {
	getResponseChecksum: () => Promise<string | undefined>;
	patientOrderPromise: Promise<LatestPatientOrderResponse | null>;
}

function usePatientLandingLoaderData() {
	return useRouteLoaderData('patient-landing') as PatientLandingLoaderData;
}

export const Component = () => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [homescreenState, setHomescreenState] = useState(PAGE_STATES.AWAITING_PATIENT_ORDER);
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const revalidator = useRevalidator();

	const pollingFn = useCallback(() => {
		return loadLatestPatientOrder(true);
	}, []);
	const { data } = usePolledLoaderData({
		useLoaderHook: usePatientLandingLoaderData,
		immediateUpdate: true,
		intervalSeconds: 10,
		pollingFn,
	});

	useEffect(() => {
		data.patientOrderPromise.then((response) => {
			const patientOrderClosed =
				response?.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED;

			if (response?.patientOrder) {
				setPatientOrder(response.patientOrder);
			}

			if (response?.patientOrder.resourceCheckInResponseNeeded) {
				navigate('/ic/patient/check-in');
				return;
			}

			if (response?.patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.UNKNOWN) {
				navigate('/ic/patient/consent');
				return;
			} else if (response?.patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.REJECTED) {
				setHomescreenState(PAGE_STATES.ASSESSMENT_REFUSED);
				return;
			}

			if (
				(patientOrderClosed &&
					response.patientOrder.patientOrderClosureReasonId ===
						PatientOrderClosureReasonId.INELIGIBLE_DUE_TO_LOCATION) ||
				!response?.patientOrder.patientAddressRegionAccepted ||
				!response?.patientOrder.primaryPlanAccepted
			) {
				setHomescreenState(PAGE_STATES.SERVICE_UNAVAILABLE);
				return;
			}

			if (patientOrderClosed) {
				setHomescreenState(PAGE_STATES.ORDER_CLOSED);
				return;
			}

			switch (response?.patientOrder.patientOrderScreeningStatusId) {
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
		});
	}, [data.patientOrderPromise, navigate]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Welcome</title>
			</Helmet>

			<Suspense fallback={<Loader />}>
				<Await resolve={!!patientOrder || data.patientOrderPromise}>
					<Container className="py-10">
						<Row className="mb-10">
							<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
								<h1 className="mb-6">Welcome, {patientOrder?.patientFirstName ?? 'patient'}</h1>
								<hr className="mb-8" />
								{homescreenState !== PAGE_STATES.AWAITING_PATIENT_ORDER && (
									<p className="mb-0">
										Your primary care provider,{' '}
										<strong>{patientOrder?.orderingProviderDisplayName}</strong>, has referred you
										to the <strong>{institution.name}</strong> program for further assessment.
										Follow the steps below to connect to mental health services.
									</p>
								)}
							</Col>
						</Row>
						<Row className="mb-10">
							<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
								{homescreenState === PAGE_STATES.ORDER_CLOSED && (
									<Card bsPrefix="ic-card" className="mb-10">
										<Card.Header>
											<Card.Title>Next Steps</Card.Title>
										</Card.Header>
										<Card.Body className="p-0">
											<NoData
												className="border-0 bg-white"
												title="No further action is required"
												description={`Your order has been closed. This may be because you have successfully connected to care, because there was no response, or because care was refused. Please call us at ${institution.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} if you have questions.`}
												actions={[]}
											/>
										</Card.Body>
									</Card>
								)}

								{homescreenState === PAGE_STATES.AWAITING_PATIENT_ORDER && (
									<NoData
										className="mb-10"
										title={`Awaiting ${institution.name} Enrollment`}
										description={`We are waiting for your primary care provider to send us your information. We will send you an email or text message when we are ready for you. Call us at ${institution.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} if you have any questions.`}
										actions={[]}
									/>
								)}

								{homescreenState === PAGE_STATES.ASSESSMENT_REFUSED && (
									<Card bsPrefix="ic-card" className="mb-10">
										<Card.Header>
											<Card.Title>Next Steps</Card.Title>
										</Card.Header>
										<Card.Body className="p-0">
											<NoData
												className="border-0 bg-white"
												title="No further action required"
												description={`You indicated that you are no longer seeking services for mental health concerns. We will let your primary care provider know, but you should feel free to call us at ${institution?.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} if you change your mind.`}
												actions={[]}
											/>
										</Card.Body>
									</Card>
								)}

								{homescreenState === PAGE_STATES.SERVICE_UNAVAILABLE && (
									<MhicInlineAlert
										variant="warning"
										title="Service not available"
										description={`Your insurance plan or state of residence may not be eligible for ${institution.name} services. Please call us at ${institution.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} for more information or to discuss your options. We also encourage you to follow-up with your provider if you have other questions about your care.`}
									/>
								)}

								{homescreenState !== PAGE_STATES.SERVICE_UNAVAILABLE &&
									homescreenState !== PAGE_STATES.ASSESSMENT_REFUSED &&
									homescreenState !== PAGE_STATES.AWAITING_PATIENT_ORDER &&
									homescreenState !== PAGE_STATES.ORDER_CLOSED && (
										<Card bsPrefix="ic-card" className="mb-10">
											<Card.Header>
												<Card.Title>Next Steps</Card.Title>
											</Card.Header>
											<Card.Body className="p-0">
												<NextStepsItem
													complete={patientOrder?.patientDemographicsConfirmed}
													title="Step 1: Verify your information"
													description={
														patientOrder?.patientDemographicsConfirmed
															? `Completed ${patientOrder?.patientDemographicsConfirmedAtDescription}`
															: 'Review the information provided by your primary care provider and make sure it is correct.'
													}
													button={{
														variant: patientOrder?.patientDemographicsConfirmed
															? 'outline-primary'
															: 'primary',
														title: patientOrder?.patientDemographicsConfirmed
															? 'Edit Information'
															: 'Verify Information',
														onClick: () => {
															navigate('/ic/patient/demographics');
														},
													}}
												/>
												{patientOrder?.patientDemographicsCompleted &&
													!patientOrder?.patientAddressRegionAccepted && (
														<>
															<hr />
														</>
													)}
												{patientOrder?.patientDemographicsConfirmed && (
													<>
														<hr />
														<NextStepsItem
															complete={
																homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE
															}
															title="Step 2: Complete the assessment"
															description={
																homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE
																	? `Completed ${patientOrder?.mostRecentScreeningSessionCompletedAtDescription}`
																	: homescreenState ===
																	  PAGE_STATES.ASSESSMENT_IN_PROGRESS
																	? ''
																	: 'There are two ways to complete the assessment. A Mental Health Intake Coordinator will be in touch if the assessment is not completed within the next few days.'
															}
															button={
																homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE
																	? {
																			variant: 'outline-primary',
																			title: 'Review Results',
																			onClick: () => {
																				navigate(
																					'/ic/patient/assessment-results'
																				);
																			},
																	  }
																	: undefined
															}
														>
															{(homescreenState === PAGE_STATES.ASSESSMENT_READY ||
																homescreenState ===
																	PAGE_STATES.ASSESSMENT_IN_PROGRESS) && (
																<AssessmentNextStepItems
																	isReady={
																		homescreenState === PAGE_STATES.ASSESSMENT_READY
																	}
																	inProgress={
																		homescreenState ===
																		PAGE_STATES.ASSESSMENT_IN_PROGRESS
																	}
																	patientOrder={patientOrder}
																/>
															)}
														</NextStepsItem>
													</>
												)}
												{homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE && (
													<>
														<hr />
														{patientOrder && (
															<NextStepsAssessmentComplete
																patientOrder={patientOrder}
																onAppointmentCanceled={() => {
																	revalidator.revalidate();
																}}
															/>
														)}
													</>
												)}
											</Card.Body>
										</Card>
									)}
							</Col>
						</Row>
					</Container>
				</Await>
			</Suspense>
		</>
	);
};

interface AssessmentNextStepItemsProps {
	patientOrder: PatientOrderModel;
	isReady: boolean;
	inProgress: boolean;
}

const AssessmentNextStepItems = ({ patientOrder, isReady, inProgress }: AssessmentNextStepItemsProps) => {
	const { institution } = useAccount();
	const { isCreatingScreeningSession, createScreeningSession, resumeScreeningSession } = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId: patientOrder?.patientOrderId,
		instantiateOnLoad: false,
	});

	if (isReady) {
		return (
			<Container fluid>
				<Row>
					<Col md={6} className="mb-6 mb-md-0">
						<Card bsPrefix="ic-card" className="h-100">
							<Card.Header className="bg-white">
								<Card.Title>Online (Recommended)</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="mb-5">
									Completing the assessment online will take about 15 minutes. Only you and your care
									team will have access to your answers.
								</p>
								<Button
									disabled={isCreatingScreeningSession}
									onClick={() => {
										createScreeningSession();
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
									Call us at {institution?.integratedCarePhoneNumberDescription}{' '}
									{institution?.integratedCareAvailabilityDescription} and a Mental Health Intake
									Coordinator will guide you through the assessment over the phone.
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
	}

	if (inProgress) {
		if (patientOrder.mostRecentScreeningSessionCreatedByAccountRoleId === ROLE_ID.PATIENT) {
			return (
				<NoData
					className="bg-white"
					title="Continue Assessment"
					description="You previously made progress on the assessment. If now is a good time, we can start from where you left off. Before we continue, please make sure you are in a comfortable place."
					actions={[
						{
							variant: 'primary',
							title: 'Continue Assessment',
							onClick: () => {
								if (!patientOrder.mostRecentScreeningSessionId) {
									throw new Error('Unknown Recent Screening');
								}

								resumeScreeningSession(patientOrder.mostRecentScreeningSessionId);
							},
						},
						{
							variant: 'outline-primary',
							title: 'Restart from Beginning',
							onClick: () => {
								createScreeningSession();
							},
							disabled: isCreatingScreeningSession,
						},
					]}
				/>
			);
		}

		if (patientOrder.mostRecentScreeningSessionCreatedByAccountRoleId === ROLE_ID.MHIC) {
			return (
				<NoData
					className="bg-white"
					title="Assessment in Progress"
					description={`Your assessment with a mental health intake coordinator is in progress. If you have been disconnected please call us back at ${institution.integratedCarePhoneNumberDescription}`}
					actions={[]}
				/>
			);
		}

		return null;
	}

	return null;
};
