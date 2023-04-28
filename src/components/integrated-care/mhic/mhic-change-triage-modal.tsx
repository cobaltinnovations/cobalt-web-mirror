import React, { FC, useCallback, useMemo, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import {
	PatientOrderFocusType,
	PatientOrderModel,
	PatientOrderTriageSourceId,
	ReferenceDataResponse,
} from '@/lib/models';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { integratedCareService } from '@/lib/services';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { compact } from 'lodash';

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
		patientOrderFocusTypes: [] as PatientOrderFocusType[],
		reason: '',
	});

	const currentTriageGroup = useMemo(
		() =>
			patientOrder.patientOrderTriageGroups?.find(
				(tg) => tg.patientOrderCareTypeId === patientOrder.patientOrderCareTypeId
			),
		[patientOrder.patientOrderCareTypeId, patientOrder.patientOrderTriageGroups]
	);

	// Remove SAFETY_PLANNING and UNSPECIFIED as they break the UI
	// by removing the triage from the patientOrder
	const filteredFocusOptions = useMemo(
		() =>
			compact(
				referenceData.patientOrderFocusTypes.map((option) => {
					if (
						option.patientOrderFocusTypeId === 'SAFETY_PLANNING' ||
						option.patientOrderFocusTypeId === 'UNSPECIFIED'
					) {
						return null;
					}

					return option;
				})
			),
		[referenceData.patientOrderFocusTypes]
	);

	const handleOnEnter = useCallback(() => {
		if (!currentTriageGroup) {
			return;
		}

		setFormValues({
			patientOrderCareTypeId: currentTriageGroup.patientOrderCareTypeId,
			patientOrderFocusTypes: compact(
				currentTriageGroup.patientOrderFocusTypes.map((ft) =>
					filteredFocusOptions.find((rd) => rd.patientOrderFocusTypeId === ft.patientOrderFocusTypeId)
				)
			),
			reason: currentTriageGroup.patientOrderFocusTypes.map((ft) => ft.reasons).join(', '),
		});
	}, [currentTriageGroup, filteredFocusOptions]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				const response = await integratedCareService
					.overrideTriage(patientOrder.patientOrderId, {
						patientOrderTriages: formValues.patientOrderFocusTypes.map(({ patientOrderFocusTypeId }) => ({
							patientOrderCareTypeId: formValues.patientOrderCareTypeId,
							patientOrderFocusTypeId,
							reason: formValues.reason,
						})),
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
			formValues.patientOrderFocusTypes,
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
					<TypeaheadHelper
						className="mb-4"
						id="typeahead--care-focus"
						label="Care Focus"
						multiple
						labelKey="description"
						options={filteredFocusOptions}
						selected={formValues.patientOrderFocusTypes}
						onChange={(selected) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderFocusTypes: selected as PatientOrderFocusType[],
							}));
						}}
					/>
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
							<Button
								variant="danger"
								onClick={() => {
									window.alert('[TODO]: Call endpoint to revert back to original triage');
								}}
							>
								Revert to Assessment
							</Button>
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
