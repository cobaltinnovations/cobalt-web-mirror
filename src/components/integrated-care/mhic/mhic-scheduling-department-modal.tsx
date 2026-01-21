import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { EpicDepartmentModel, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import InputHelper from '@/components/input-helper';
import { getDepartmentTriageDefaultLabel } from '@/lib/utils';

const DEFAULT = 'DEFAULT';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicSchedulingDepartmentModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const { addFlag } = useFlags();
	const handleError = useHandleError();
	const [isSaving, setIsSaving] = useState(false);

	const [epicDepartmentOptions, setEpicDepartmentOptions] = useState<EpicDepartmentModel[]>([]);
	const [formValues, setFormValues] = useState({ overrideSchedulingEpicDepartmentId: '' });
	const defaultDepartmentLabel = getDepartmentTriageDefaultLabel(patientOrder);

	const fetchEpicDepartments = useCallback(async () => {
		try {
			const { epicDepartments } = await integratedCareService.getEpicDepartments().fetch();
			setEpicDepartmentOptions(epicDepartments);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const handleOnEntering = useCallback(() => {
		setFormValues({
			overrideSchedulingEpicDepartmentId: patientOrder.overrideSchedulingEpicDepartmentId ?? DEFAULT,
		});
		fetchEpicDepartments();
	}, [fetchEpicDepartments, patientOrder.overrideSchedulingEpicDepartmentId]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				await integratedCareService
					.overrideSchedulingEpicDepartment(patientOrder.patientOrderId, {
						overrideSchedulingEpicDepartmentId:
							formValues.overrideSchedulingEpicDepartmentId === DEFAULT
								? null
								: formValues.overrideSchedulingEpicDepartmentId,
					})
					.fetch();
				const response = await integratedCareService.getPatientOrder(patientOrder.patientOrderId).fetch();

				addFlag({
					variant: 'success',
					title: 'Department triage changed.',
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[addFlag, formValues.overrideSchedulingEpicDepartmentId, handleError, onSave, patientOrder.patientOrderId]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEntering={handleOnEntering}>
			<Modal.Header closeButton>
				<Modal.Title>Change Department Triage</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<p className="mb-4 fw-semibold">Select the triage department</p>
					<InputHelper
						className="mb-4"
						as="select"
						label="Triage Department"
						value={formValues.overrideSchedulingEpicDepartmentId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								overrideSchedulingEpicDepartmentId: currentTarget.value,
							}));
						}}
						required
					>
						<option value={DEFAULT}>{defaultDepartmentLabel}</option>
						{epicDepartmentOptions.map((edo) => (
							<option key={edo.epicDepartmentId} value={edo.epicDepartmentId}>
								{edo.name} ({edo.departmentId})
							</option>
						))}
					</InputHelper>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
