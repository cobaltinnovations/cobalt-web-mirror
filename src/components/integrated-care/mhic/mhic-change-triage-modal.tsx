import React, { FC, useCallback, useMemo, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import {
	PatientOrderCareTypeId,
	PatientOrderModel,
	PatientOrderTriageOverrideReasonId,
	PatientOrderTriageSourceId,
	ReferenceDataResponse,
} from '@/lib/models';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { integratedCareService } from '@/lib/services';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';

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

const initialFormValues = {
	patientOrderCareTypeId: '' as PatientOrderCareTypeId,
	patientOrderFocusTypeIds: [''],
	patientOrderTriageOverrideReasonId: '' as PatientOrderTriageOverrideReasonId,
};

export const MhicChangeTriageModal: FC<Props> = ({ patientOrder, referenceData, onSave, ...props }) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);
	const [formValues, setFormValues] = useState(initialFormValues);

	console.log({ formValues });

	const currentTriageGroup = useMemo(
		() =>
			patientOrder.patientOrderTriageGroups?.find(
				(tg) => tg.patientOrderCareTypeId === patientOrder.patientOrderCareTypeId
			),
		[patientOrder.patientOrderCareTypeId, patientOrder.patientOrderTriageGroups]
	);

	console.log({ currentTriageGroup });

	const { careTypeOptions, overrideReasonOptions } = useMemo(() => {
		// Remove SAFETY_PLANNING and UNSPECIFIED as they break the UI
		// by removing the triage from the patientOrder
		const excludedCareTypes = [
			PatientOrderCareTypeId.SAFETY_PLANNING,
			PatientOrderCareTypeId.UNSPECIFIED,
		] as string[];

		// Remove NOT_OVERRIDDEN
		const excludedOverrideReasons = [PatientOrderTriageOverrideReasonId.NOT_OVERRIDDEN] as string[];

		return {
			careTypeOptions: referenceData.patientOrderCareTypes.filter((option) => {
				return !excludedCareTypes.includes(option.patientOrderCareTypeId);
			}),
			overrideReasonOptions: referenceData.patientOrderTriageOverrideReasons.filter((option) => {
				return !excludedOverrideReasons.includes(option.patientOrderTriageOverrideReasonId);
			}),
		};
	}, [referenceData.patientOrderCareTypes, referenceData.patientOrderTriageOverrideReasons]);

	const handleOnEnter = useCallback(() => {
		setFormValues({
			...initialFormValues,
		});
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				const response = await integratedCareService
					.overrideTriage(patientOrder.patientOrderId, {
						patientOrderCareTypeId: formValues.patientOrderCareTypeId,
						patientOrderTriageOverrideReasonId: formValues.patientOrderTriageOverrideReasonId,
						patientOrderTriages: formValues.patientOrderFocusTypeIds.map((focusTypeId) => ({
							patientOrderCareTypeId: formValues.patientOrderCareTypeId,
							patientOrderFocusTypeId: focusTypeId,
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
			formValues.patientOrderFocusTypeIds,
			formValues.patientOrderTriageOverrideReasonId,
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

	const isManuallySet = currentTriageGroup?.patientOrderTriageSourceId === PatientOrderTriageSourceId.MANUALLY_SET;

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{isManuallySet ? 'Edit MHIC Triage' : 'Override Assessment Triage'}</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Form id="triage-override-modal-form" onSubmit={handleFormSubmit}>
					<p className="mb-4 fw-semibold">
						Please review proposed changes with a clinician before overriding the assessment triage.
					</p>
					<p className="mb-5">The patient will be enrolled in the new triage selected</p>
					<InputHelper
						required
						as="select"
						className="mb-4"
						label="Care Type"
						value={formValues.patientOrderCareTypeId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderCareTypeId: currentTarget.value as PatientOrderCareTypeId,
							}));
						}}
						disabled={isSaving}
					>
						<option value="" disabled>
							Select Care Type...
						</option>
						{careTypeOptions.map((o) => (
							<option key={o.patientOrderCareTypeId} value={o.patientOrderCareTypeId}>
								{o.description}
							</option>
						))}
					</InputHelper>

					{formValues.patientOrderFocusTypeIds.map((selectedFocusTypeId, idx) => {
						return (
							<InputHelper
								key={idx}
								as="select"
								className="mb-4"
								label="Treatment Disposition"
								required={idx === 0}
								value={selectedFocusTypeId}
								onChange={({ currentTarget }) => {
									console.log({ currentTarget });
									setFormValues((previousValues) => {
										const updated = [...previousValues.patientOrderFocusTypeIds];
										updated[idx] = currentTarget.value;

										return {
											...previousValues,
											patientOrderFocusTypeIds: updated,
										};
									});
								}}
								disabled={isSaving}
							>
								<option value="" disabled>
									Select Treatment Disposition...
								</option>
								{referenceData.patientOrderFocusTypes.map((o) => {
									if (
										o.patientOrderFocusTypeId !== selectedFocusTypeId &&
										formValues.patientOrderFocusTypeIds.includes(o.patientOrderFocusTypeId)
									) {
										return null;
									}
									return (
										<option key={o.patientOrderFocusTypeId} value={o.patientOrderFocusTypeId}>
											{o.description}
										</option>
									);
								})}
							</InputHelper>
						);
					})}

					<div className="d-flex">
						<Button
							disabled={isSaving}
							variant="link"
							className="mb-4 ms-auto text-decoration-none"
							onClick={() => {
								setFormValues((previousValues) => ({
									...previousValues,
									patientOrderFocusTypeIds: [...previousValues.patientOrderFocusTypeIds, ''],
								}));
							}}
						>
							<PlusIcon /> Add Treatment Disposition
						</Button>
					</div>

					<InputHelper
						required
						as="select"
						className="mb-4"
						label="Reason for Override"
						value={formValues.patientOrderTriageOverrideReasonId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderTriageOverrideReasonId:
									currentTarget.value as PatientOrderTriageOverrideReasonId,
							}));
						}}
						disabled={isSaving}
					>
						<option value="" disabled>
							Select Reason for Override...
						</option>
						{overrideReasonOptions.map((o) => (
							<option
								key={o.patientOrderTriageOverrideReasonId}
								value={o.patientOrderTriageOverrideReasonId}
							>
								{o.description}
							</option>
						))}
					</InputHelper>
				</Form>
			</Modal.Body>

			<Modal.Footer className="d-flex align-items-center justify-content-between">
				<div>
					{isManuallySet && (
						<Button variant="danger" onClick={handleRevertToAssessmentButtonClick} disabled={isSaving}>
							Revert to Assessment
						</Button>
					)}
				</div>

				<div>
					<Button
						form="triage-override-modal-form"
						variant="outline-primary"
						className="me-2"
						onClick={props.onHide}
						disabled={isSaving}
					>
						Cancel
					</Button>

					<Button form="triage-override-modal-form" variant="primary" type="submit" disabled={isSaving}>
						Save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
