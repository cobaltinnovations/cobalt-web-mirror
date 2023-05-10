import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicInsuranceModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const [formValues, setFormValues] = useState({
		patientOrderInsurancePayorId: '',
		patientOrderInsurancePlanId: '',
	});

	const onEnter = useCallback(() => {
		setFormValues({
			patientOrderInsurancePayorId: patientOrder.patientOrderInsurancePayorId,
			patientOrderInsurancePlanId: patientOrder.patientOrderInsurancePlanId,
		});
	}, [patientOrder.patientOrderInsurancePayorId, patientOrder.patientOrderInsurancePlanId]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				const response = await integratedCareService
					.patchPatientOrder(patientOrder.patientOrderId, {
						patientOrderInsurancePlanId: formValues.patientOrderInsurancePlanId,
					})
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Patient Insurance Information Saved',
					description: '{Message}',
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, formValues.patientOrderInsurancePlanId, handleError, onSave, patientOrder.patientOrderId]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEntering={onEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Insurance</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						className="mb-2"
						label="Insurance Provider"
						as="select"
						name="patientOrderInsurancePayorId"
						value={formValues.patientOrderInsurancePayorId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderInsurancePayorId: currentTarget.value,
							}));
						}}
						required
					>
						<option value="" disabled>
							Select...
						</option>
						{referenceDataResponse.patientOrderInsurancePayors.map((insurancePayor) => {
							return (
								<option
									key={insurancePayor.patientOrderInsurancePayorId}
									value={insurancePayor.patientOrderInsurancePayorId}
								>
									{insurancePayor.name}
								</option>
							);
						})}
					</InputHelper>
					<InputHelper
						label="Insurance Plan"
						as="select"
						name="patientOrderInsurancePlanId"
						value={formValues.patientOrderInsurancePlanId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								patientOrderInsurancePlanId: currentTarget.value,
							}));
						}}
						disabled={!formValues.patientOrderInsurancePayorId}
						required
					>
						<option value="" disabled label="Select..." />
						{referenceDataResponse.patientOrderInsurancePlans
							.filter(
								(plan) => plan.patientOrderInsurancePayorId === formValues.patientOrderInsurancePayorId
							)
							.map((insurancePlan) => {
								return (
									<option
										key={insurancePlan.patientOrderInsurancePlanId}
										value={insurancePlan.patientOrderInsurancePlanId}
									>
										{insurancePlan.name}
									</option>
								);
							})}
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
