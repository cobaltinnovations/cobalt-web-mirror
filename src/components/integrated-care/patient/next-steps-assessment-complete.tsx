import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { APIProvider } from '@vis.gl/react-google-maps';
import classNames from 'classnames';

import {
	AnalyticsNativeEventOverlayViewInCrisisSource,
	AnalyticsNativeEventTypeId,
	PatientOrderModel,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';
import { analyticsService, appointmentService, institutionService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useHandleError from '@/hooks/use-handle-error';
import AsyncWrapper from '@/components/async-page';
import ConfirmDialog from '@/components/confirm-dialog';
import InlineAlert from '@/components/inline-alert';
import NoData from '@/components/no-data';
import {
	CareResourceAccordion,
	NextStepsItem,
	PatientInsuranceStatementModal,
} from '@/components/integrated-care/patient';

interface NextStepsAssessmentCompleteProps {
	patientOrder: PatientOrderModel;
	onAppointmentCanceled(): void;
}

export const NextStepsAssessmentComplete = ({
	patientOrder,
	onAppointmentCanceled,
}: NextStepsAssessmentCompleteProps) => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const handleError = useHandleError();
	const [showInsuranceStatementModal, setShowInsuranceStatementModal] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [mapsKey, setMapsKey] = useState('');

	const fetchData = useCallback(async () => {
		const response = await institutionService.getGoogleMapsApiKey(institution.institutionId).fetch();
		setMapsKey(response.googleMapsPlatformApiKey);
	}, [institution.institutionId]);

	const handleCancelAppointmentConfirm = useCallback(async () => {
		try {
			if (!patientOrder.appointmentId) {
				throw new Error('appointment is undefined.');
			}

			await appointmentService.cancelAppointment(patientOrder.appointmentId).fetch();
			setShowConfirmDialog(false);
			onAppointmentCanceled();
		} catch (error) {
			handleError(error);
		}
	}, [handleError, onAppointmentCanceled, patientOrder.appointmentId]);

	return (
		<>
			<PatientInsuranceStatementModal
				show={showInsuranceStatementModal}
				onHide={() => {
					setShowInsuranceStatementModal(false);
				}}
				onContinue={() => {
					navigate(`/ic/patient/connect-with-support/mhp?patientOrderId=${patientOrder.patientOrderId}`);
				}}
			/>

			<ConfirmDialog
				show={showConfirmDialog}
				onHide={() => {
					setShowConfirmDialog(false);
				}}
				titleText="Cancel Appointment"
				bodyText="Are you sure you want to cancel this appointment?"
				dismissText="Do Not Cancel"
				confirmText="Cancel Appointment"
				onConfirm={handleCancelAppointmentConfirm}
				displayButtonsBlock
			/>

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.MHP && (
				<Card bsPrefix="ic-card" className="mb-10">
					<Card.Header>
						<Card.Title>Next Steps</Card.Title>
					</Card.Header>
					<Card.Body className="p-0">
						{patientOrder.appointmentId ? (
							<NextStepsItem
								complete
								title="Step 3: Schedule appointment with Mental Health Provider"
								description={`You have an appointment on ${patientOrder.appointmentStartTimeDescription} with ${patientOrder.providerName}`}
								button={{
									variant: 'danger',
									title: 'Cancel Appointment',
									onClick: () => {
										setShowConfirmDialog(true);
									},
								}}
							>
								{patientOrder.patientOrderSafetyPlanningStatusId ===
									PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && <SafetyPlanningAlert />}
							</NextStepsItem>
						) : (
							<NextStepsItem
								title="Step 3: Schedule appointment with Mental Health Provider"
								description={`Find an appointment by browsing the list of providers and choosing an available appointment time or call us at ${institution.integratedCarePhoneNumberDescription}.`}
								button={{
									variant: 'primary',
									title: 'Find Appointment',
									onClick: () => {
										setShowInsuranceStatementModal(true);
									},
								}}
							>
								{patientOrder.patientOrderSafetyPlanningStatusId ===
									PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && <SafetyPlanningAlert />}
							</NextStepsItem>
						)}
					</Card.Body>
				</Card>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE && (
				<>
					{patientOrder.resourcesSentFlag ? (
						<>
							<h4 className="mb-1">Schedule with a recommended resource</h4>
							<p className="mb-10">
								These resources are covered by your insurance and were recommended based on your
								responses to the assessment. If you have any questions, please feel free to call us at{' '}
								{institution.integratedCarePhoneNumberDescription}{' '}
								{institution.integratedCareAvailabilityDescription} or discuss with your primary care
								provider.
							</p>
							<AsyncWrapper fetchData={fetchData}>
								<APIProvider apiKey={mapsKey}>
									{(patientOrder.resourcePacket?.careResourceLocations ?? []).map((crl, crlIndex) => {
										const isLast =
											crlIndex ===
											(patientOrder.resourcePacket?.careResourceLocations ?? []).length - 1;
										return (
											<CareResourceAccordion
												className={classNames({ 'mb-4': !isLast, 'mb-10': isLast })}
												careResourceLocation={crl}
											/>
										);
									})}
								</APIProvider>
							</AsyncWrapper>
						</>
					) : (
						<Card bsPrefix="ic-card" className="mb-10">
							<Card.Header>
								<Card.Title>Next Steps</Card.Title>
							</Card.Header>
							<Card.Body className="p-0">
								<NextStepsItem
									title="Step 3: Schedule appointment with a recommended resource"
									description={`We will send you a ${
										institution?.myChartName ?? 'MyChart'
									} message in the next {[TODO]: timeframe} about recommended resources in your area.`}
								>
									<NoData
										title="Resources in progress"
										description={`We will send you a ${
											institution?.myChartName ?? 'MyChart'
										} message about recommended resources in your area.`}
										actions={[]}
										className={classNames({
											'mb-6':
												patientOrder.patientOrderSafetyPlanningStatusId ===
												PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
										})}
									/>
									{patientOrder.patientOrderSafetyPlanningStatusId ===
										PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
										<SafetyPlanningAlert />
									)}
								</NextStepsItem>
							</Card.Body>
						</Card>
					)}
				</>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SUBCLINICAL && (
				<Card bsPrefix="ic-card" className="mb-10">
					<Card.Header>
						<Card.Title>Next Steps</Card.Title>
					</Card.Header>
					<Card.Body className="p-0">
						<NextStepsItem
							title="Step 3: Call us for resources"
							description={`Call us at ${institution.integratedCarePhoneNumberDescription} ${institution.integratedCareAvailabilityDescription} to speak to a Mental Health Intake Coordinator about resources available in your area.`}
							button={{
								variant: 'primary',
								title: 'Call Us',
								onClick: () => {
									document.location.href = `tel:${institution.integratedCarePhoneNumber}`;
								},
							}}
						>
							{patientOrder.patientOrderSafetyPlanningStatusId ===
								PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && <SafetyPlanningAlert />}
						</NextStepsItem>
					</Card.Body>
				</Card>
			)}
		</>
	);
};

const SafetyPlanningAlert = () => {
	const { openInCrisisModal } = useInCrisisModal();

	return (
		<InlineAlert
			variant="warning"
			title="A clinician will reach out"
			description="As a reminder, a clinician will be reaching out to you by phone on the next business day to see how we can help. If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
			action={{
				title: 'View all crisis resources',
				onClick: () => {
					analyticsService.persistEvent(AnalyticsNativeEventTypeId.OVERLAY_VIEW_IN_CRISIS, {
						source: AnalyticsNativeEventOverlayViewInCrisisSource.TRIAGE_RESULTS,
					});

					openInCrisisModal();
				},
			}}
		/>
	);
};
