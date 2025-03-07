import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Await, defer, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import {
	PatientOrderDispositionId,
	PatientOrderModel,
	PatientOrderScreeningStatusId,
	ROLE_ID,
	PatientOrderIntakeScreeningStatusId,
	PatientOrderIntakeWantsServicesStatusId,
	PatientOrderIntakeLocationStatusId,
	PatientOrderIntakeInsuranceStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderReferralSourceId,
	PatientOrderConsentStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';
import { LatestPatientOrderResponse, integratedCareService } from '@/lib/services';
import { CobaltError } from '@/lib/http-client';
import useAccount from '@/hooks/use-account';
import { usePolledLoaderData } from '@/hooks/use-polled-loader-data';
import NoData from '@/components/no-data';
import { NextStepsAssessmentComplete, NextStepsItem } from '@/components/integrated-care/patient';
import Loader from '@/components/loader';
import InlineAlert from '@/components/inline-alert';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';

enum PAGE_STATES {
	TERMINAL = 'TERMINAL',
	ASSESSMENT_READY = 'ASSESSMENT_READY',
	ASSESSMENT_IN_PROGRESS = 'ASSESSMENT_IN_PROGRESS',
	ASSESSMENT_COMPLETE = 'ASSESSMENT_COMPLETE',
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
	const [homescreenState, setHomescreenState] = useState(PAGE_STATES.TERMINAL);
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const revalidator = useRevalidator();

	const hasCompletedIntakeScreening =
		patientOrder?.patientOrderIntakeScreeningStatusId === PatientOrderIntakeScreeningStatusId.COMPLETE;

	const {
		renderedPreScreeningLoader: intakeLoading,
		renderedCollectPhoneModal: intakePhoneModal,
		...intakeScreeningFlow
	} = useScreeningFlow({
		screeningFlowId: institution?.integratedCareIntakeScreeningFlowId,
		patientOrderId: patientOrder?.patientOrderId,
		instantiateOnLoad: false,
		disabled: !patientOrder?.patientDemographicsConfirmed || !patientOrder?.patientOrderId,
	});

	const {
		renderedPreScreeningLoader: clinicalLoading,
		renderedCollectPhoneModal: clinicalPhoneModal,
		...clinicalScreeningFlow
	} = useScreeningFlow({
		screeningFlowId: institution?.integratedCareScreeningFlowId,
		patientOrderId: patientOrder?.patientOrderId,
		instantiateOnLoad: false,
		disabled: !intakeScreeningFlow.didCheckScreeningSessions || !hasCompletedIntakeScreening,
	});

	const pollingFn = useCallback(() => {
		return loadLatestPatientOrder(true);
	}, []);

	const { data } = usePolledLoaderData({
		useLoaderHook: usePatientLandingLoaderData,
		immediateUpdate: true,
		intervalSeconds: 30,
		pollingFn,
	});

	const [introductionText, setIntroductionText] = useState('');
	const [terminalTitle, setTerminalTitle] = useState('');
	const [terminalDescription, setTerminalDescription] = useState('');

	useEffect(() => {
		data.patientOrderPromise.then((response) => {
			/* ------------------------------------------------------------------ */
			/* Anything related to the response containing no patientOrder */
			/* ------------------------------------------------------------------ */
			if (!response?.patientOrder) {
				setHomescreenState(PAGE_STATES.TERMINAL);
				setIntroductionText('');
				setTerminalTitle('No further action is required');
				setTerminalDescription(
					`There is currently no order open for you with ${institution.integratedCareProgramName}. Please call us at ${institution.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} for more information or to discuss your options. We also encourage you to follow-up with your provider if you have other questions about your care.`
				);
				return;
			}
			setPatientOrder(response.patientOrder);

			/* ------------------------------------------------------------------ */
			/* Anything related redirecting or navigating */
			/* ------------------------------------------------------------------ */
			if (response.patientOrder.resourceCheckInResponseNeeded) {
				navigate('/ic/patient/check-in');
				return;
			}
			// if (response?.patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.UNKNOWN) {
			// 	navigate('/ic/patient/consent');
			// 	return;
			// }

			/* ------------------------------------------------------------------ */
			/* All the terminal conditions */
			/* ------------------------------------------------------------------ */
			if (response.patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.REJECTED) {
				setHomescreenState(PAGE_STATES.TERMINAL);
				setIntroductionText('');
				setTerminalTitle('No further action is required');
				setTerminalDescription(
					`Thank you. We will let your primary care provider know, but you should feel free to call the ${institution.integratedCareProgramName} Resource Center at ${institution.integratedCarePhoneNumberDescription} if you change your mind.`
				);
				return;
			}

			if (
				response.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED ||
				response.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED
			) {
				setHomescreenState(PAGE_STATES.TERMINAL);
				setIntroductionText('');
				setTerminalTitle('No further action is required');
				setTerminalDescription(
					`There is currently no order open for you with ${institution.integratedCareProgramName}. Please call us at ${institution.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} for more information or to discuss your options. We also encourage you to follow-up with your provider if you have other questions about your care.`
				);
				return;
			}

			if (response.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.OPEN) {
				if (
					response.patientOrder.patientOrderIntakeWantsServicesStatusId ===
					PatientOrderIntakeWantsServicesStatusId.NO
				) {
					setHomescreenState(PAGE_STATES.TERMINAL);
					setIntroductionText('');
					setTerminalTitle('No further action is required');
					setTerminalDescription(
						`Thank you. We will let your primary care provider know, but you should feel free to call the ${institution.integratedCareProgramName} Resource Center at ${institution.integratedCarePhoneNumberDescription} if you change your mind.`
					);
					return;
				} else if (
					response.patientOrder.patientOrderIntakeLocationStatusId ===
					PatientOrderIntakeLocationStatusId.INVALID
				) {
					setHomescreenState(PAGE_STATES.TERMINAL);
					setIntroductionText('');
					setTerminalTitle('No further action is required');
					setTerminalDescription(
						`Thank you for answering the questions. Please be aware to participate in ${institution.integratedCareProgramName}, all patients must be physically be located in the state of their primary care provider's office. A representative from the ${institution.integratedCareProgramName} Resource Center is going to call you in the next 3 business days to help you get connected to care. If you have any immediate questions or concerns, please contact the ${institution.integratedCareProgramName} at ${institution.integratedCarePhoneNumberDescription}.`
					);
					return;
				} else if (
					response.patientOrder.patientOrderIntakeInsuranceStatusId ===
					PatientOrderIntakeInsuranceStatusId.INVALID
				) {
					setHomescreenState(PAGE_STATES.TERMINAL);
					setIntroductionText('');
					setTerminalTitle('No further action is required');
					setTerminalDescription(
						`Unfortunately, your insurance does not cover ${institution.integratedCareProgramName} services. Please call your insurance company for mental health services covered by your insurance. We will follow up with your PCP to inform them of the outcome of this referral.`
					);
					return;
				} else if (
					response.patientOrder.patientOrderIntakeInsuranceStatusId ===
					PatientOrderIntakeInsuranceStatusId.CHANGED_RECENTLY
				) {
					setHomescreenState(PAGE_STATES.TERMINAL);
					setIntroductionText('');
					setTerminalTitle('No further action is required');
					setTerminalDescription(
						`Thank you for answering the questions. Please contact your primary care provider with your updated insurance information. A representative from the ${institution.integratedCareProgramName} Resource Center is going to call you in the next 3 business days to help you get connected to care. If you have any immediate questions or concerns, please contact the ${institution.integratedCareProgramName} at ${institution.integratedCarePhoneNumberDescription}.`
					);
					return;
				}
			}

			/* ------------------------------------------------------------------ */
			/* Set defaults for if not terminal */
			/* ------------------------------------------------------------------ */
			if (response.patientOrder.patientOrderReferralSourceId === PatientOrderReferralSourceId.SELF) {
				setIntroductionText(
					`Thank you for contacting the <strong>${institution.name}</strong> program for further assessment. Follow the steps below to connect to mental health services.`
				);
			} else {
				setIntroductionText(
					`Your primary care provider, <strong>${response.patientOrder.orderingProviderDisplayName}</strong>, has referred you to the <strong>${institution.name}</strong> program for further assessment. Follow the steps below to connect to mental health services.`
				);
			}

			/* ------------------------------------------------------------------ */
			/* Set page state */
			/* ------------------------------------------------------------------ */
			if (response.patientOrder.mostRecentIntakeAndClinicalScreeningsSatisfied) {
				setHomescreenState(PAGE_STATES.ASSESSMENT_COMPLETE);
			} else if (
				response.patientOrder.patientOrderIntakeScreeningStatusId ===
					PatientOrderIntakeScreeningStatusId.IN_PROGRESS ||
				response?.patientOrder.patientOrderScreeningStatusId === PatientOrderScreeningStatusId.IN_PROGRESS
			) {
				setHomescreenState(PAGE_STATES.ASSESSMENT_IN_PROGRESS);
			} else {
				setHomescreenState(PAGE_STATES.ASSESSMENT_READY);
			}
		});
	}, [
		data.patientOrderPromise,
		institution.integratedCareAvailabilityDescription,
		institution.integratedCarePhoneNumberDescription,
		institution.integratedCareProgramName,
		institution.name,
		navigate,
	]);

	if (intakeLoading || clinicalLoading) {
		return intakeLoading || clinicalLoading;
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Welcome</title>
			</Helmet>

			{intakePhoneModal}
			{clinicalPhoneModal}

			<Suspense fallback={<Loader />}>
				<Await resolve={!!patientOrder || data.patientOrderPromise}>
					<Container className="py-10">
						<Row className="mb-10">
							<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
								{patientOrder?.patientFirstName && (
									<h1 className="mb-6">Welcome, {patientOrder?.patientFirstName}</h1>
								)}
								{!patientOrder?.patientFirstName && <h1 className="mb-6">Welcome!</h1>}
								<hr className="mb-8" />
								{introductionText && (
									<p className="mb-0" dangerouslySetInnerHTML={{ __html: introductionText }} />
								)}
							</Col>
						</Row>
						<Row className="mb-4">
							<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
								{homescreenState === PAGE_STATES.TERMINAL && (
									<Card bsPrefix="ic-card" className="mb-10">
										<Card.Header>
											<Card.Title>Next Steps</Card.Title>
										</Card.Header>
										<Card.Body className="p-0">
											<NoData
												className="border-0 bg-white"
												title={terminalTitle}
												description={terminalDescription}
												actions={[]}
											/>
										</Card.Body>
									</Card>
								)}

								{homescreenState !== PAGE_STATES.TERMINAL && (
									<>
										{homescreenState === PAGE_STATES.ASSESSMENT_COMPLETE && (
											<>
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
										<Card bsPrefix="ic-card">
											<Card.Header>
												<Card.Title>Completed</Card.Title>
											</Card.Header>
											<Card.Body className="p-0 bg-n50">
												<NextStepsItem
													complete={patientOrder?.patientDemographicsConfirmed}
													title="Step 1: Verify your information"
													description={
														patientOrder?.patientDemographicsConfirmed
															? `Completed ${patientOrder?.patientDemographicsConfirmedAtDescription}`
															: patientOrder?.patientOrderReferralSourceId ===
															  PatientOrderReferralSourceId.SELF
															? 'Review the information we have on file and make sure it is correct.'
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
																	? `Completed ${
																			patientOrder?.mostRecentScreeningSessionCompletedAtDescription ??
																			patientOrder?.mostRecentIntakeScreeningSessionCompletedAtDescription
																	  }`
																	: homescreenState ===
																	  PAGE_STATES.ASSESSMENT_IN_PROGRESS
																	? ''
																	: patientOrder.patientOrderReferralSourceId ===
																	  PatientOrderReferralSourceId.SELF
																	? 'There are two ways to complete the assessment. Performing the assessment yourself online can more quickly determine your eligibility and connect you to care.'
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
																	disabled={
																		intakeScreeningFlow.isCreatingScreeningSession ||
																		clinicalScreeningFlow.isCreatingScreeningSession
																	}
																	onStartAssessment={() => {
																		intakeScreeningFlow.createScreeningSession();
																	}}
																	onResumeAssessment={() => {
																		if (!hasCompletedIntakeScreening) {
																			intakeScreeningFlow.resumeScreeningSession(
																				patientOrder.mostRecentIntakeScreeningSessionId
																			);
																		} else {
																			clinicalScreeningFlow.resumeScreeningSession(
																				patientOrder.mostRecentScreeningSessionId
																			);
																		}
																	}}
																	onRestartAssessment={() => {
																		intakeScreeningFlow.createScreeningSession();
																	}}
																	patientOrder={patientOrder}
																/>
															)}
														</NextStepsItem>
													</>
												)}
												{patientOrder?.patientOrderTriageStatusId ===
													PatientOrderTriageStatusId.SPECIALTY_CARE &&
													!institution.resourcePacketsEnabled &&
													patientOrder.resourcesSentFlag && (
														<>
															<hr />
															<NextStepsItem
																complete
																title="Step 3: Receive Resources"
																description={`Resources were sent to ${
																	institution?.myChartName ?? 'MyChart'
																} on ${patientOrder.resourcesSentAtDescription}`}
																button={{
																	variant: 'outline-primary',
																	title: `Check ${
																		institution?.myChartName ?? 'MyChart'
																	}`,
																	onClick: () => {
																		window.open(
																			institution.myChartDefaultUrl,
																			'_blank'
																		);
																	},
																}}
															/>
														</>
													)}
											</Card.Body>
										</Card>
									</>
								)}
							</Col>
						</Row>
						<Row>
							<Col md={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
								{homescreenState !== PAGE_STATES.TERMINAL && (
									<>
										{patientOrder?.patientOrderSafetyPlanningStatusId ===
										PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING ? (
											<InlineAlert
												className="mt-6"
												variant="warning"
												title="A clinician will reach out"
												description="As a reminder, a clinician will be reaching out to you by phone on the next business day to see how we can help. "
											/>
										) : (
											<InlineAlert
												className="mt-6"
												variant="info"
												title="Your responses are not reviewed in real time"
												description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
											/>
										)}
									</>
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
	disabled?: boolean;
	onStartAssessment: () => void;
	onResumeAssessment: () => void;
	onRestartAssessment: () => void;
}

const AssessmentNextStepItems = ({
	patientOrder,
	isReady,
	inProgress,
	disabled,
	onStartAssessment,
	onResumeAssessment,
	onRestartAssessment,
}: AssessmentNextStepItemsProps) => {
	const { institution } = useAccount();

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
									disabled={disabled}
									onClick={() => {
										onStartAssessment();
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
		const intakeComplete = !!patientOrder.intakeScreeningSession?.completed;

		if (
			intakeComplete
				? patientOrder.mostRecentScreeningSessionCreatedByAccountRoleId === ROLE_ID.PATIENT
				: patientOrder.mostRecentIntakeScreeningSessionByPatient
		) {
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
								onResumeAssessment();
							},
						},
						{
							variant: 'outline-primary',
							title: 'Restart from Beginning',
							onClick: () => {
								onRestartAssessment();
							},
							disabled,
						},
					]}
				/>
			);
		}

		if (
			intakeComplete
				? patientOrder.mostRecentScreeningSessionCreatedByAccountRoleId === ROLE_ID.MHIC
				: patientOrder.mostRecentIntakeScreeningSessionCreatedByAccountRoleId === ROLE_ID.MHIC
		) {
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
