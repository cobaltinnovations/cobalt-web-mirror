import React from 'react';
import ConfirmDialog from '@/components/confirm-dialog';

interface MhicResetAssessmentModelProps {
	show?: boolean;
	onHide?(): void;
	onReset(): void;
}

export const MhicResetAssessmentModel = ({ show, onHide, onReset }: MhicResetAssessmentModelProps) => {
	return (
		<ConfirmDialog
			show={show}
			onHide={onHide}
			titleText="Reset Assessment"
			bodyText="Resetting this order will clear its assessment and any associated triages."
			detailText={
				<p className="mb-0 mt-4">
					The assessment can then be re-taken by you or the patient. Do you want to reset?
				</p>
			}
			dismissText="No, Cancel"
			confirmText="Yes, Reset"
			onConfirm={onReset}
		/>
	);
};
