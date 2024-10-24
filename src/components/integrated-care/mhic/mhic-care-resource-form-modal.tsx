import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Row, Col, Form } from 'react-bootstrap';
import InputHelper from '@/components/input-helper';
import { createUseStyles } from 'react-jss';
import { CARE_RESOURCE_TAG_GROUP_ID, CareResourceSpecialtyModel, CareResourceTag, PayorModel } from '@/lib/models';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface MhicCareResourceFormModalProps extends ModalProps {
	onSave(): void;
}

export const MhicCareResourceFormModal: FC<MhicCareResourceFormModalProps> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [payorOptions, setPayorOptions] = useState<CareResourceTag[]>([]);
	const [specialtyOptions, setSpecialtyOptions] = useState<CareResourceTag[]>([]);
	const [formValues, setFormValues] = useState({
		resourceName: '',
		phoneNumber: '',
		emailAddress: '',
		website: '',
		insurance: [] as PayorModel[],
		insuranceNotes: '',
		specialties: [] as CareResourceSpecialtyModel[],
		notes: '',
	});

	const handleFormSubmit = useCallback(async () => {
		onSave();
	}, [onSave]);

	const handleOnEnter = useCallback(async () => {
		try {
			setIsLoading(true);
			const [payorsResponse, specialtiesResponse] = await Promise.all([
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.PAYORS,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.SPECIALTIES,
					})
					.fetch(),
			]);

			setPayorOptions(payorsResponse.careResourceTags);
			setSpecialtyOptions(specialtiesResponse.careResourceTags);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError]);

	const handleOnExited = useCallback(() => {
		setPayorOptions([]);
		setSpecialtyOptions([]);
		setFormValues({
			resourceName: '',
			phoneNumber: '',
			emailAddress: '',
			website: '',
			insurance: [],
			insuranceNotes: '',
			specialties: [],
			notes: '',
		});
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter} onExited={handleOnExited}>
			<Modal.Header closeButton>
				<Modal.Title>Create Resource</Modal.Title>
			</Modal.Header>
			<Modal.Body className="py-8">
				<Form>
					<fieldset disabled={isLoading}>
						<InputHelper
							className="mb-4"
							type="text"
							label="Resource Name"
							name="resource-name"
							value={formValues.resourceName}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									resourceName: currentTarget.value,
								}));
							}}
							helperText="A resource may be a group or an individual."
							required
						/>
						<Row className="mb-4">
							<Col>
								<InputHelper
									type="tel"
									label="Phone Number"
									name="phone-name"
									value={formValues.phoneNumber}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											phoneNumber: currentTarget.value,
										}));
									}}
								/>
							</Col>
							<Col>
								<InputHelper
									type="email"
									label="Email Address"
									name="email-address"
									value={formValues.emailAddress}
									onChange={({ currentTarget }) => {
										setFormValues((previousValue) => ({
											...previousValue,
											emailAddress: currentTarget.value,
										}));
									}}
								/>
							</Col>
						</Row>
						<InputHelper
							className="mb-4"
							type="url"
							label="Website"
							name="website"
							value={formValues.website}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									website: currentTarget.value,
								}));
							}}
						/>
						<TypeaheadHelper
							className="mb-4"
							id="typeahead--insurance"
							label="Accepted Insurance"
							multiple
							labelKey="name"
							options={payorOptions}
							selected={formValues.insurance}
							onChange={(selected) => {
								setFormValues((previousValues) => ({
									...previousValues,
									insurance: selected as PayorModel[],
								}));
							}}
							helperText="You can override the insurance at the location level if needed."
						/>
						<InputHelper
							className="mb-4"
							as="textarea"
							label="Insurance Notes"
							name="insurance-notes"
							value={formValues.insuranceNotes}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									insuranceNotes: currentTarget.value,
								}));
							}}
						/>
						<TypeaheadHelper
							className="mb-4"
							id="typeahead--specialties"
							label="Specialties"
							multiple
							labelKey="name"
							options={specialtyOptions}
							selected={formValues.specialties}
							onChange={(selected) => {
								setFormValues((previousValues) => ({
									...previousValues,
									specialties: selected as CareResourceSpecialtyModel[],
								}));
							}}
						/>
						<hr className="mb-6" />
						<h5 className="mb-2">Notes</h5>
						<p className="mb-4">
							Include details about what patients can expect when they schedule or attend an appointment
							here.
						</p>
						<InputHelper
							as="textarea"
							label="Notes"
							name="notes"
							value={formValues.notes}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									notes: currentTarget.value,
								}));
							}}
						/>
					</fieldset>
				</Form>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button type="button" variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button type="submit" variant="primary" onClick={handleFormSubmit}>
					Create
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
