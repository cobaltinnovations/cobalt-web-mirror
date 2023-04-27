import React, { FC, useCallback, useMemo, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel, PatientOrderTriageSourceId, ReferenceDataResponse } from '@/lib/models';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { integratedCareService } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	referenceData: ReferenceDataResponse;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicChangeTriageModal: FC<Props> = ({ patientOrder, referenceData, onSave, ...props }) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);
	const [formValues, setFormValues] = useState({
		patientOrderCareTypeId: '',
		patientOrderFocusTypeId: '',
		reason: '',
	});

	const currentTriageGroup = useMemo(
		() =>
			patientOrder.patientOrderTriageGroups?.find(
				(tg) => tg.patientOrderCareTypeId === patientOrder.patientOrderCareTypeId
			),
		[patientOrder.patientOrderCareTypeId, patientOrder.patientOrderTriageGroups]
	);

	const handleOnEnter = useCallback(() => {
		//TODO: Set initial formValues
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				const response = await integratedCareService
					.overrideTriage(patientOrder.patientOrderId, {
						patientOrderCareTypeId: formValues.patientOrderCareTypeId,
						patientOrderFocusTypeId: formValues.patientOrderFocusTypeId,
						reason: formValues.reason,
					})
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Assessment triage overridden',
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[
			addFlag,
			formValues.patientOrderCareTypeId,
			formValues.patientOrderFocusTypeId,
			formValues.reason,
			handleError,
			onSave,
			patientOrder.patientOrderId,
		]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Override Assessment Triage</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<p className="mb-4 fw-semibold">
						Please review proposed changes with a clinician before overriding the assessment triage.
					</p>
					<p className="mb-5">The patient will be enrolled in the new triage selected</p>
					<InputHelper
						as="select"
						className="mb-4"
						label="Care Type"
						value={formValues.patientOrderCareTypeId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderCareTypeId: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					>
						<option value="" disabled>
							Select Care Type...
						</option>
						{referenceData.patientOrderCareTypes.map((o) => (
							<option key={o.patientOrderCareTypeId} value={o.patientOrderCareTypeId}>
								{o.description}
							</option>
						))}
					</InputHelper>
					<InputHelper
						as="select"
						className="mb-4"
						label="Care Focus"
						value={formValues.patientOrderFocusTypeId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderFocusTypeId: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					>
						<option value="" disabled>
							Select Focus Type...
						</option>
						{referenceData.patientOrderFocusTypes.map((o) => (
							<option key={o.patientOrderFocusTypeId} value={o.patientOrderFocusTypeId}>
								{o.description}
							</option>
						))}
					</InputHelper>
					<InputHelper
						as="textarea"
						label="Reason for Override"
						value={formValues.reason}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								reason: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="d-flex align-items-center justify-content-between">
					<div>
						{currentTriageGroup?.patientOrderTriageSourceId === PatientOrderTriageSourceId.MANUALLY_SET && (
							<Button variant="danger">Revert to Assessment</Button>
						)}
					</div>
					<div>
						<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" disabled={isSaving}>
							Save
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};