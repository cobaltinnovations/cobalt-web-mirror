import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { DepartmentAvailabilityStatusId, EpicDepartmentModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	epicDepartmentId: string;
	departmentAvailabilityStatusId: DepartmentAvailabilityStatusId;
	onSave(epicDepartment: EpicDepartmentModel): void;
}

export const MhicDepartmentAvailabilityStatusModal: FC<Props> = ({
	epicDepartmentId,
	departmentAvailabilityStatusId,
	onSave,
	...props
}) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({ departmentAvailabilityStatusId });

	const handleOnEnter = useCallback(() => {
		setFormValues({ departmentAvailabilityStatusId });
	}, [departmentAvailabilityStatusId]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!formValues.departmentAvailabilityStatusId) {
					throw new Error('departmentAvailabilityStatusId is undefined.');
				}

				const response = await integratedCareService
					.setEpicDepartmentAvailabilityStatus(epicDepartmentId, {
						departmentAvailabilityStatusId: formValues.departmentAvailabilityStatusId,
					})
					.fetch();

				let flagDescription = '';

				if (
					response.epicDepartment.departmentAvailabilityStatusId === DepartmentAvailabilityStatusId.AVAILABLE
				) {
					flagDescription = `BHS providers are available at ${response.epicDepartment.name}`;
				} else if (
					response.epicDepartment.departmentAvailabilityStatusId === DepartmentAvailabilityStatusId.BUSY
				) {
					flagDescription = `BHS providers are busy at ${response.epicDepartment.name}`;
				} else {
					flagDescription = `BHS providers are unavailable at ${response.epicDepartment.name}`;
				}

				addFlag({
					variant: 'success',
					title: 'BHS Availability Updated',
					description: flagDescription,
					actions: [],
				});

				onSave(response.epicDepartment);
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, epicDepartmentId, formValues.departmentAvailabilityStatusId, handleError, onSave]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Change Status</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						as="select"
						className="mb-4"
						label="Availability Status"
						value={formValues.departmentAvailabilityStatusId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								departmentAvailabilityStatusId: currentTarget.value as DepartmentAvailabilityStatusId,
							}));
						}}
					>
						<option value={DepartmentAvailabilityStatusId.AVAILABLE}>Available</option>
						<option value={DepartmentAvailabilityStatusId.BUSY}>Busy</option>
						<option value={DepartmentAvailabilityStatusId.UNAVAILABLE}>Unavailable</option>
					</InputHelper>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
						Cancel
					</Button>
					<Button variant="primary" type="submit">
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
