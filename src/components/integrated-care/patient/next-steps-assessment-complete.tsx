import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PatientOrderModel, PatientOrderTriageStatusId } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import { NextStepsItem } from './next-steps-item';

import { PatientInsuranceStatementModal } from './patient-insurance-statement-modal';

interface NextStepsAssessmentCompleteProps {
	patientOrder: PatientOrderModel;
}

export const NextStepsAssessmentComplete = ({ patientOrder }: NextStepsAssessmentCompleteProps) => {
	const navigate = useNavigate();
	const { institution } = useAccount();
	const [showInsuranceStatementModal, setShowInsuranceStatementModal] = useState(false);

	return (
		<>
			<PatientInsuranceStatementModal
				show={showInsuranceStatementModal}
				onHide={() => {
					setShowInsuranceStatementModal(false);
				}}
				onContinue={() => {
					navigate(`/ic/patient/connect-with-support/mhppatientOrderId=${patientOrder.patientOrderId}`);
				}}
			/>

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.MHP && (
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
									setShowInsuranceStatementModal(true);
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
							title="Step 3: Call us for resources"
							description={`Call us at ${institution.integratedCarePhoneNumberDescription} to speak to a Mental Health Intake Coordinator about resources available in your area.`}
							button={{
								variant: 'primary',
								title: 'Call Us',
								onClick: () => {
									document.location.href = `tel:${institution.integratedCarePhoneNumber}`;
								},
							}}
						/>
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
							/>
						</>
					)}
				</>
			)}

			{patientOrder.patientOrderTriageStatusId === PatientOrderTriageStatusId.SUBCLINICAL && (
				<NextStepsItem
					title="Step 3: Call us for resources"
					description={`Call us at ${institution.integratedCarePhoneNumberDescription} to speak to a Mental Health Intake Coordinator about resources available in your area.`}
					button={{
						variant: 'primary',
						title: 'Call Us',
						onClick: () => {
							document.location.href = `tel:${institution.integratedCarePhoneNumber}`;
						},
					}}
				/>
			)}
		</>
	);
};
