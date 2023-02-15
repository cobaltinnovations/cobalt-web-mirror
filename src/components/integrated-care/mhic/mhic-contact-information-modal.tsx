import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';

enum PHONE_NUMBER_TYPES {
	MOBILE = 'MOBILE',
	HOME = 'HOME',
	WORK = 'WORK',
	SCHOOL = 'SCHOOL',
	MAIN = 'MAIN',
	HOME_FAX = 'HOME_FAX',
	WORK_FAX = 'WORK_FAX',
	PAGER = 'PAGER',
	OTHER = 'OTHER',
}

interface PhoneNumberType {
	phoneNumberTypeId: PHONE_NUMBER_TYPES;
	title: string;
}

const phoneNumberTypes: Record<PHONE_NUMBER_TYPES, PhoneNumberType> = {
	[PHONE_NUMBER_TYPES.MOBILE]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.MOBILE,
		title: 'Mobile Phone',
	},
	[PHONE_NUMBER_TYPES.HOME]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.HOME,
		title: 'Home Phone',
	},
	[PHONE_NUMBER_TYPES.WORK]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.WORK,
		title: 'Work Phone',
	},
	[PHONE_NUMBER_TYPES.SCHOOL]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.SCHOOL,
		title: 'School Phone',
	},
	[PHONE_NUMBER_TYPES.MAIN]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.MAIN,
		title: 'Main Phone',
	},
	[PHONE_NUMBER_TYPES.HOME_FAX]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.HOME_FAX,
		title: 'Home Fax',
	},
	[PHONE_NUMBER_TYPES.WORK_FAX]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.WORK_FAX,
		title: 'Work Fax',
	},
	[PHONE_NUMBER_TYPES.PAGER]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.PAGER,
		title: 'Pager',
	},
	[PHONE_NUMBER_TYPES.OTHER]: {
		phoneNumberTypeId: PHONE_NUMBER_TYPES.OTHER,
		title: 'Other',
	},
};

interface PhoneNumber {
	phoneNumberId: string;
	type: PHONE_NUMBER_TYPES;
	value: string;
	preferred: boolean;
}

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicContactInformationModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [formValues, setFormValues] = useState<{
		phoneNumbers: PhoneNumber[];
		emailAddress: string;
	}>({
		phoneNumbers: [],
		emailAddress: '',
	});

	const handleOnEnter = useCallback(() => {
		setFormValues({
			phoneNumbers: [
				{
					phoneNumberId: uuidv4(),
					type: PHONE_NUMBER_TYPES.MOBILE,
					value: '',
					preferred: false,
				},
			],
			emailAddress: '',
		});
	}, []);

	const handleAddPhoneNumberButtonClick = useCallback(() => {
		setFormValues((previousValue) => {
			const phoneNumbersClone = cloneDeep(previousValue.phoneNumbers);
			phoneNumbersClone.push({
				phoneNumberId: uuidv4(),
				type: PHONE_NUMBER_TYPES.MOBILE,
				value: '',
				preferred: false,
			});

			return {
				...previousValue,
				phoneNumbers: phoneNumbersClone,
			};
		});
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Patient's Contact Information</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-4 d-flex justify-content-between">
					<Form.Label className="mb-0">Phone Numbers</Form.Label>
					<p className="mb-0">Preferred?</p>
				</div>
				{formValues.phoneNumbers.map((phoneNumber) => {
					return (
						<div key={phoneNumber.phoneNumberId} className="mb-4 d-flex">
							<InputHelper
								className="flex-fill me-4"
								as="select"
								label="Type"
								value={phoneNumber.type}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => {
										const phoneNumbersClone = cloneDeep(previousValue.phoneNumbers);
										const indexToUpdate = phoneNumbersClone.findIndex(
											(pn) => pn.phoneNumberId === phoneNumber.phoneNumberId
										);

										if (indexToUpdate < 0) {
											return previousValue;
										}

										phoneNumbersClone[indexToUpdate].type =
											currentTarget.value as PHONE_NUMBER_TYPES;

										return {
											...previousValue,
											phoneNumbers: phoneNumbersClone,
										};
									});
								}}
							>
								{Object.values(phoneNumberTypes).map((phoneNumberType) => (
									<option
										key={phoneNumberType.phoneNumberTypeId}
										value={phoneNumberType.phoneNumberTypeId}
									>
										{phoneNumberType.title}
									</option>
								))}
							</InputHelper>
							<InputHelper
								className="flex-fill me-4"
								type="tel"
								label={`${phoneNumberTypes[phoneNumber.type].title} Number`}
								value={phoneNumber.value}
								onChange={({ currentTarget }) => {
									setFormValues((previousValue) => {
										const phoneNumbersClone = cloneDeep(previousValue.phoneNumbers);
										const indexToUpdate = phoneNumbersClone.findIndex(
											(pn) => pn.phoneNumberId === phoneNumber.phoneNumberId
										);

										if (indexToUpdate < 0) {
											return previousValue;
										}

										phoneNumbersClone[indexToUpdate].value = currentTarget.value;

										return {
											...previousValue,
											phoneNumbers: phoneNumbersClone,
										};
									});
								}}
							/>
							<Form.Check
								type="radio"
								name="phone-number"
								id="phone-number__PREFERRED"
								label=""
								value="PREFERRED"
								checked={phoneNumber.preferred}
								onChange={() => {
									setFormValues((previousValue) => {
										const phoneNumbersClone = cloneDeep(previousValue.phoneNumbers);
										const phoneNumbersCloneFormatted = phoneNumbersClone.map((pn) => ({
											...pn,
											preferred: false,
										}));
										const indexToUpdate = phoneNumbersCloneFormatted.findIndex(
											(pn) => pn.phoneNumberId === phoneNumber.phoneNumberId
										);

										if (indexToUpdate < 0) {
											return previousValue;
										}

										phoneNumbersCloneFormatted[indexToUpdate].preferred = true;

										return {
											...previousValue,
											phoneNumbers: phoneNumbersCloneFormatted,
										};
									});
								}}
							/>
						</div>
					);
				})}
				<div className="mb-4">
					<Button
						size="sm"
						className="d-inline-flex align-items-center"
						variant="light"
						onClick={handleAddPhoneNumberButtonClick}
					>
						<PlusIcon className="me-1" width={24} height={24} />
						Add Phone Number
					</Button>
				</div>
				<InputHelper
					type="email"
					label="Email Address"
					value={formValues.emailAddress}
					onChange={({ currentTarget }) => {
						setFormValues((previousValue) => {
							return {
								...previousValue,
								emailAddress: currentTarget.value,
							};
						});
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
