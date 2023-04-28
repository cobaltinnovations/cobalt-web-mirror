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
	const filteredCareOptions = useMemo(
		() =>
			compact(
				referenceData.patientOrderCareTypes.map((option) => {
					if (
						option.patientOrderCareTypeId === 'SAFETY_PLANNING' ||
						option.patientOrderCareTypeId === 'UNSPECIFIED'
					) {
						return null;
					}

					return option;
				})
			),
		[referenceData.patientOrderCareTypes]
	);

	const handleOnEnter = useCallback(() => {
		if (!currentTriageGroup) {
			return;
		}

		setFormValues({
			patientOrderCareTypeId: currentTriageGroup.patientOrderCareTypeId,
			patientOrderFocusTypes: compact(
				currentTriageGroup.patientOrderFocusTypes.map((ft) =>
					referenceData.patientOrderFocusTypes.find(
						(rd) => rd.patientOrderFocusTypeId === ft.patientOrderFocusTypeId
					)
				)
			),
			reason: currentTriageGroup.patientOrderFocusTypes.map((ft) => ft.reasons).join(', '),
		});
	}, [currentTriageGroup, referenceData.patientOrderFocusTypes]);

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
					title: 'Triage updated',
					description: 'Triage overridden',
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

	const handleRevertToAssessmentButtonClick = useCallback(async () => {
		try {
			setIsSaving(true);

			const response = await integratedCareService.revertTriage(patientOrder.patientOrderId).fetch();

			addFlag({
				variant: 'success',
				title: 'Triage updated',
				description: 'Triage reverted',
				actions: [],
			});

			onSave(response.patientOrder);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	}, [addFlag, handleError, onSave, patientOrder.patientOrderId]);

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
						{filteredCareOptions.map((o) => (
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
						options={referenceData.patientOrderFocusTypes}
						selected={formValues.patientOrderFocusTypes}
						onChange={(selected) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderFocusTypes: selected as PatientOrderFocusType[],
							}));
						}}
						disabled={isSaving}
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
							<Button variant="danger" onClick={handleRevertToAssessmentButtonClick} disabled={isSaving}>
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
