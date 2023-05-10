import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Ethnicity, GenderIdentity, PatientOrderModel, Race } from '@/lib/models';
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
	raceOptions: Race[];
	ethnicityOptions: Ethnicity[];
	genderIdentityOptions: GenderIdentity[];
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicDemographicsModal: FC<Props> = ({
	raceOptions,
	ethnicityOptions,
	genderIdentityOptions,
	patientOrder,
	onSave,
	...props
}) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({
		patientRaceId: '',
		patientEthnicityId: '',
		patientGenderIdentityId: '',
	});

	const handleOnEnter = useCallback(() => {
		setFormValues({
			patientRaceId: patientOrder.patientRaceId,
			patientEthnicityId: patientOrder.patientEthnicityId,
			patientGenderIdentityId: patientOrder.patientGenderIdentityId,
		});
	}, [patientOrder.patientEthnicityId, patientOrder.patientGenderIdentityId, patientOrder.patientRaceId]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				const response = await integratedCareService
					.patchPatientOrder(patientOrder.patientOrderId, {
						patientRaceId: formValues.patientRaceId,
						patientEthnicityId: formValues.patientEthnicityId,
						patientGenderIdentityId: formValues.patientGenderIdentityId,
					})
					.fetch();

				addFlag({
					variant: 'success',
					title: 'Patient Demographic Information Saved',
					actions: [],
				});

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			}
		},
		[
			addFlag,
			formValues.patientEthnicityId,
			formValues.patientGenderIdentityId,
			formValues.patientRaceId,
			handleError,
			onSave,
			patientOrder.patientOrderId,
		]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Demographics</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						as="select"
						className="mb-4"
						label="Race"
						value={formValues.patientRaceId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								patientRaceId: currentTarget.value,
							}));
						}}
					>
						<option value="NOT_ASKED">Not Specified</option>
						{raceOptions.map((option) => (
							<option key={option.raceId} value={option.raceId}>
								{option.description}
							</option>
						))}
					</InputHelper>
					<InputHelper
						as="select"
						className="mb-4"
						label="Ethnicity"
						value={formValues.patientEthnicityId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								patientEthnicityId: currentTarget.value,
							}));
						}}
					>
						<option value="NOT_ASKED">Not Specified</option>
						{ethnicityOptions.map((option) => (
							<option key={option.ethnicityId} value={option.ethnicityId}>
								{option.description}
							</option>
						))}
					</InputHelper>
					<InputHelper
						as="select"
						label="Gender Identity"
						value={formValues.patientGenderIdentityId}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								patientGenderIdentityId: currentTarget.value,
							}));
						}}
					>
						<option value="NOT_ASKED">Not Specified</option>
						{genderIdentityOptions.map((option) => (
							<option key={option.genderIdentityId} value={option.genderIdentityId}>
								{option.description}
							</option>
						))}
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
