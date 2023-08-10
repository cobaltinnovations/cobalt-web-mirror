import React, { useState } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useRevalidator } from 'react-router-dom';

import ConfirmDialog from '@/components/confirm-dialog';
import useHandleError from '@/hooks/use-handle-error';
import { PatientOrderSafetyPlanningStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import classNames from 'classnames';

interface MhicFlagOrderForSafetyPlanningProps extends ButtonProps {
	patientOrderId: string;
}

export const MhicFlagOrderForSafetyPlanning = ({
	patientOrderId,
	...buttonProps
}: MhicFlagOrderForSafetyPlanningProps) => {
	const handleError = useHandleError();
	const revalidator = useRevalidator();
	const [isSaving, setIsSaving] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	return (
		<>
			<ConfirmDialog
				size="lg"
				show={showConfirmDialog}
				onHide={() => {
					setShowConfirmDialog(false);
				}}
				titleText="Flag for safety planning"
				bodyText="Are you sure you want to flag this patient for safety planning?"
				detailText="A crisis counselor will get in touch with this patient within 1 business day after the flag has been added."
				dismissText="Cancel"
				confirmText="Add flag"
				onConfirm={async () => {
					try {
						setShowConfirmDialog(false);
						setIsSaving(true);

						await integratedCareService
							.updateSafetyPlanningStatus(patientOrderId, {
								patientOrderSafetyPlanningStatusId:
									PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
							})
							.fetch();

						revalidator.revalidate();
					} catch (error) {
						handleError(error);
					} finally {
						setIsSaving(false);
					}
				}}
			/>

			<Button
				{...buttonProps}
				onClick={(e) => {
					setShowConfirmDialog(true);
					buttonProps.onClick?.(e);
				}}
				disabled={isSaving || buttonProps.disabled}
				size={buttonProps.size ?? 'sm'}
				variant={buttonProps.variant ?? 'link'}
				className={classNames(buttonProps.className, 'text-decoration-none')}
			>
				Flag for safety planning
			</Button>
		</>
	);
};
