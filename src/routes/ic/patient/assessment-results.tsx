import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import {
	PatientOrderClosureReasonId,
	PatientOrderDispositionId,
	PatientOrderIntakeInsuranceStatusId,
	PatientOrderIntakeLocationStatusId,
	PatientOrderIntakeWantsServicesStatusId,
	PatientOrderModel,
	PatientOrderReferralSourceId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import { PatientInsuranceStatementModal } from '@/components/integrated-care/patient';
import InlineAlert from '@/components/inline-alert';

export const PatientAssessmentResults = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { institution } = useAccount();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();
	const [showInsuranceStatementModal, setShowInsuranceStatementModal] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getLatestPatientOrder().fetch();

		if (!response.patientOrder) {
			navigate('/ic/patient');
			return;
		}

		if (
			response.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED ||
			response.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED
		) {
			navigate('/ic/patient');
			return;
		}

		if (response.patientOrder.patientOrderDispositionId === PatientOrderDispositionId.OPEN) {
			if (
				response.patientOrder.patientOrderIntakeWantsServicesStatusId ===
				PatientOrderIntakeWantsServicesStatusId.NO
			) {
				navigate('/ic/patient');
				return;
			} else if (
				response.patientOrder.patientOrderIntakeLocationStatusId === PatientOrderIntakeLocationStatusId.INVALID
			) {
				navigate('/ic/patient');
				return;
			} else if (
				response.patientOrder.patientOrderIntakeInsuranceStatusId ===
				PatientOrderIntakeInsuranceStatusId.INVALID
			) {
				navigate('/ic/patient');
				return;
			} else if (
				response.patientOrder.patientOrderIntakeInsuranceStatusId ===
				PatientOrderIntakeInsuranceStatusId.CHANGED_RECENTLY
			) {
				navigate('/ic/patient');
				return;
			}
		}

		setPatientOrder(response.patientOrder);
	}, [navigate]);

	const handleSubclinicalFormSubmit = useCallback(
		async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
			event.preventDefault();
			const { value } = event.nativeEvent.submitter as HTMLButtonElement;

			try {
				if (!patientOrder) {
					throw new Error('patientOrder is undefined.');
				}

				setIsSaving(true);

				if (value === 'YES') {
					navigate('/ic/patient');
				} else if (value === 'NO') {
					await integratedCareService
						.closePatientOrder(patientOrder.patientOrderId, {
							patientOrderClosureReasonId: PatientOrderClosureReasonId.DECLINED_CARE,
						})
						.fetch();
				}
			} catch (error) {
				setIsSaving(false);
				handleError(error);
			}
		},
		[handleError, navigate, patientOrder]
	);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Assessment Results</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<PatientInsuranceStatementModal
					show={showInsuranceStatementModal}
					content={institution.integratedCareBookingInsuranceRequirements!}
					onHide={() => {
						setShowInsuranceStatementModal(false);
					}}
					onContinue={() => {
						navigate(`/ic/patient/connect-with-support/mhp?patientOrderId=${patientOrder?.patientOrderId}`);
					}}
				/>

				<Container className="py-10">
					<Row className="mb-6">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h1 className="mb-1">Assessment Results</h1>
							{patientOrder?.mostRecentScreeningSessionCompletedAtDescription && (
								<p className="mb-6 fs-large text-gray">
									Completed {patientOrder?.mostRecentScreeningSessionCompletedAtDescription}
								</p>
							)}

							<hr className="mb-8" />

							{/* This is when the patient is ineligible per the intake assessment */}
							{patientOrder?.mostRecentIntakeAndClinicalScreeningsSatisfied &&
								!patientOrder.mostRecentScreeningSessionId && (
									<>
										<p className="mb-6 fs-large">
											Based on your responses, you are not currently eligible for this program.
										</p>

										<p className="mb-6 fs-large">
											Please call us at{' '}
											<strong>
												<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
													{institution?.integratedCarePhoneNumberDescription}
												</a>
											</strong>{' '}
											{institution.integratedCareAvailabilityDescription} if you have any
											questions or would like to speak with us about your options.
										</p>

										<div className="text-center">
											<Button
												variant="outline-primary"
												size="lg"
												onClick={() => {
													navigate('/ic/patient');
												}}
											>
												Return to Home
											</Button>
										</div>
									</>
								)}

							{patientOrder?.patientOrderTriageStatusId === PatientOrderTriageStatusId.MHP && (
								<>
									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.PROVIDER && (
										<p className="mb-6 fs-large">
											Based on the symptoms reported and your provider's request, we recommend
											that you meet with a <strong>Mental Health Provider</strong> in your primary
											care practice.
										</p>
									)}

									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.PROVIDER && (
										<p className="mb-6 fs-large">
											The Mental Health Provider will discuss treatment options that will work in
											collaboration with your primary care provider.
										</p>
									)}

									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.PROVIDER && (
										<p className="mb-6 fs-large">
											You can <strong>schedule a telehealth appointment</strong> with a Mental
											Health Provider by browsing the list of providers and choosing an available
											appointment time. If you need an in-person appointment, please call us at{' '}
											<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
												{institution?.integratedCarePhoneNumberDescription}
											</a>{' '}
											{institution.integratedCareAvailabilityDescription}.
										</p>
									)}

									{patientOrder.patientOrderReferralSourceId === PatientOrderReferralSourceId.SELF &&
										!institution.integratedCareMhpTriageOverviewOverride && (
											<p className="mb-6 fs-large">
												Based on your responses,{' '}
												<strong>
													you are eligible to self-schedule an an appointment with a Mental
													Health Provider
												</strong>
												.
											</p>
										)}

									{patientOrder.patientOrderReferralSourceId === PatientOrderReferralSourceId.SELF &&
										institution.integratedCareMhpTriageOverviewOverride && (
											<p
												className="mb-6 fs-large"
												dangerouslySetInnerHTML={{
													__html: institution.integratedCareMhpTriageOverviewOverride,
												}}
											/>
										)}

									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.SELF && (
										<p className="mb-6 fs-large">
											Please browse the list of available times and choose the appointment that is
											most convenient for you. If you have any questions, please call{' '}
											{institution.integratedCareCallCenterName
												? `the ${institution.integratedCareCallCenterName}`
												: 'us'}{' '}
											at{' '}
											<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
												{institution?.integratedCarePhoneNumberDescription}
											</a>{' '}
											{institution.integratedCareAvailabilityDescription}.
										</p>
									)}

									<div className="mb-4 text-center">
										<Button
											size="lg"
											onClick={() => {
												setShowInsuranceStatementModal(true);
											}}
										>
											Find Appointment
										</Button>
									</div>
									<div className="text-center">
										<Button
											variant="outline-primary"
											size="lg"
											onClick={() => {
												navigate('/ic/patient');
											}}
										>
											Return to Home
										</Button>
									</div>
								</>
							)}

							{patientOrder?.patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE && (
								<>
									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.PROVIDER && (
										<p className="mb-6 fs-large">
											Based on the symptoms reported and your provider's request, we would like to
											set you up with a <strong>Mental Health Specialist</strong> in your area.
										</p>
									)}

									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.PROVIDER && (
										<p className="mb-6 fs-large">
											Please call us at{' '}
											<strong>
												<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
													{institution?.integratedCarePhoneNumberDescription}
												</a>
											</strong>{' '}
											{institution.integratedCareAvailabilityDescription} to speak to a Mental
											Health Intake Coordinator about your options.
										</p>
									)}

									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.SELF && (
										<p className="mb-6 fs-large">
											Based on the symptoms reported, a followup conversation is needed.
										</p>
									)}

									{patientOrder.patientOrderReferralSourceId ===
										PatientOrderReferralSourceId.SELF && (
										<p className="mb-6 fs-large">
											Please call us at{' '}
											<strong>
												<a href={`tel:${institution?.integratedCarePhoneNumber}`}>
													{institution?.integratedCarePhoneNumberDescription}
												</a>
											</strong>{' '}
											{institution.integratedCareAvailabilityDescription} to discuss your options
											for care.
										</p>
									)}

									<div className="text-center">
										<Button
											size="lg"
											onClick={() => {
												navigate('/ic/patient');
											}}
										>
											Return to Home
										</Button>
									</div>
								</>
							)}

							{patientOrder?.patientOrderTriageStatusId === PatientOrderTriageStatusId.SUBCLINICAL && (
								<>
									<p className="mb-8 fs-large">
										You reported a low severity of symptoms which may or may not require treatment.
										If you are interested in an appointment with a therapist, we can help set that
										up for you.
									</p>
									<h3 className="mb-6">Are you interested in mental health care?</h3>
									<Form className="mb-8" onSubmit={handleSubclinicalFormSubmit}>
										<Button
											className="mb-2 d-block w-100 text-left border"
											variant="light"
											size="lg"
											name="subclincal"
											id="subclincal-yes"
											value="YES"
											type="submit"
											disabled={isSaving}
										>
											Yes
										</Button>
										<Button
											className="d-block w-100 text-left border"
											variant="light"
											size="lg"
											name="subclincal"
											id="subclincal-no"
											value="NO"
											type="submit"
											disabled={isSaving}
										>
											No
										</Button>
									</Form>
								</>
							)}

							{patientOrder?.patientOrderSafetyPlanningStatusId ===
								PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
								<InlineAlert
									className="mt-8"
									variant="warning"
									title="A clinician will reach out"
									description="As a reminder, a clinician will be reaching out to you by phone on the next business day to see how we can help. "
								/>
							)}
							<InlineAlert
								className={classNames({
									'mt-6':
										patientOrder?.patientOrderSafetyPlanningStatusId ===
										PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
									'mt-8':
										patientOrder?.patientOrderSafetyPlanningStatusId !==
										PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
								})}
								variant="info"
								title="Your responses are not reviewed in real time"
								description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
							/>
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default PatientAssessmentResults;
