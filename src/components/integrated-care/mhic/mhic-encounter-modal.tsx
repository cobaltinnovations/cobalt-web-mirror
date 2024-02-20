import React, { FC, useCallback, useState } from 'react';
import { Modal, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { EncounterModel, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicEncounterModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [encounterOptions, setEncounterOptions] = useState<EncounterModel[]>([]);
	const [formValues, setFormValues] = useState({ encounterCsn: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleOnEnter = useCallback(async () => {
		setEncounterOptions([]);
		setFormValues({ encounterCsn: '' });

		try {
			const response = await integratedCareService.getEcounters(patientOrder.patientOrderId).fetch();
			setEncounterOptions(response.encounters);
		} catch (error) {
			handleError(error);
		}
	}, [handleError, patientOrder.patientOrderId]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!formValues.encounterCsn) {
					throw new Error('encounterCsn is undefined.');
				}

				setIsSubmitting(true);

				const response = await integratedCareService
					.setEncounterCsn(patientOrder.patientOrderId, {
						encounterCsn: formValues.encounterCsn,
					})
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Encounter sync completed',
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[addFlag, formValues.encounterCsn, handleError, onSave, patientOrder.patientOrderId]
	);

	return (
		<Modal
			{...props}
			dialogClassName={classes.modal}
			centered
			onEnter={handleOnEnter}
			onHide={() => {
				if (isSubmitting) {
					return;
				}

				if (props.onHide) {
					props.onHide();
				}
			}}
		>
			<Modal.Header closeButton>
				<Modal.Title>Select Encounter</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					{encounterOptions.length === 0 && (
						<Form.Label className="mb-0">No encounters exist for this patient.</Form.Label>
					)}
					{encounterOptions.length > 1 && (
						<>
							<Form.Label className="mb-0">Multiple encounters exist for this patient.</Form.Label>
							<Form.Label>Please select the correct encounter for this assessement.</Form.Label>
						</>
					)}
					<InputHelper
						as="select"
						label="Available Encounters"
						value={formValues.encounterCsn}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								encounterCsn: currentTarget.value,
							}));
						}}
						required
					>
						<option value="" disabled>
							Select Encounter
						</option>
						{encounterOptions.map((encounter) => (
							<option key={encounter.csn} value={encounter.csn}>
								{encounter.description}
							</option>
						))}
					</InputHelper>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<LoadingButton
						isLoading={isSubmitting}
						variant="outline-primary"
						className="me-2"
						onClick={props.onHide}
					>
						Cancel
					</LoadingButton>
					{encounterOptions.length !== 0 && (
						<LoadingButton isLoading={isSubmitting} variant="primary" type="submit">
							Confirm
						</LoadingButton>
					)}
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
