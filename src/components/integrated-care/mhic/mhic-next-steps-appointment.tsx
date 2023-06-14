import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Card } from 'react-bootstrap';

import { PatientOrderModel, PatientOrderTriageStatusId } from '@/lib/models';
import { appointmentService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import NoData from '@/components/no-data';
import ConfirmDialog from '@/components/confirm-dialog';

interface Props {
	patientOrder: PatientOrderModel;
	disabled?: boolean;
	className?: string;
}

export const MhicNextStepsAppointment = ({ patientOrder, disabled, className }: Props) => {
	const handleError = useHandleError();
	const revalidator = useRevalidator();
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const handleCancelAppointmentConfirm = useCallback(async () => {
		try {
			if (!patientOrder.appointmentId) {
				throw new Error('appointment is undefined.');
			}

			await appointmentService.cancelAppointment(patientOrder.appointmentId).fetch();
			revalidator.revalidate();

			setShowConfirmDialog(false);
		} catch (error) {
			handleError(error);
		}
	}, [handleError, patientOrder.appointmentId, revalidator]);

	return (
		<>
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
				<div className={className}>
					{patientOrder.appointmentId ? (
						<NoData
							className="bg-white"
							title="Appointment is Scheduled"
							description={`${patientOrder.appointmentStartTimeDescription} with ${patientOrder.providerName}`}
							actions={[
								{
									variant: 'primary',
									title: 'Cancel Appointment',
									onClick: () => {
										setShowConfirmDialog(true);
									},
									disabled,
								},
							]}
						/>
					) : (
						<NoData
							title="No Appointment"
							description="Patient must schedule an appointment through Cobalt"
							actions={[]}
						/>
					)}
				</div>
			)}
		</>
	);
};
