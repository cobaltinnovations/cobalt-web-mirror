import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PatientOrderModel, PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';
import { appointmentService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { NextStepsItem } from './next-steps-item';
import { PatientInsuranceStatementModal } from './patient-insurance-statement-modal';
import ConfirmDialog from '@/components/confirm-dialog';
import useHandleError from '@/hooks/use-handle-error';
import InlineAlert from '@/components/inline-alert';

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
				<>
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
							description={`Find an appointment by browsing the list of providers and choosing an available appointment time or call us at ${institution.integratedCarePhoneNumber}.`}
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
				</>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SPECIALTY_CARE && (
				<>
					{!patientOrder.resourcesSentAt ? (
						<NextStepsItem
							title="Step 3: Receive resources"
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
										window.open(institution.myChartDefaultUrl, '_blank');
									},
								}}
							/>
							<hr />
							<NextStepsItem
								title="Step 4: Schedule & attend appointment"
								description={`Schedule an appointment by contacting one of the resources provided through ${
									institution?.myChartName ?? 'MyChart'
								}`}
							>
								{patientOrder.patientOrderSafetyPlanningStatusId ===
									PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && <SafetyPlanningAlert />}
							</NextStepsItem>
						</>
					)}
				</>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SUBCLINICAL && (
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
					openInCrisisModal();
				},
			}}
		/>
	);
};
