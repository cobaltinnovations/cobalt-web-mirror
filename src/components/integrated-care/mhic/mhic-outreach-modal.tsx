import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	isEdit?: boolean;
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicOutreachModal: FC<Props> = ({ isEdit, onSave, ...props }) => {
	const classes = useStyles();
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		comment: '',
	});

	const handleOnEnter = useCallback(() => {
		setFormValues({
			date: new Date(),
			time: moment().format('h:mm A'),
			comment: '',
		});
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>{isEdit ? 'Edit Outreach Attempt' : 'Add Outreach Attempt'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<DatePicker
					className="mb-4"
					labelText="Date"
					selected={formValues.date}
					onChange={(date) => {
						setFormValues((previousValues) => ({
							...previousValues,
							date: date ?? undefined,
						}));
					}}
				/>
				<TimeInputV2
					id="outreact-modal__time-input"
					className="mb-4"
					label="Time"
					value={formValues.time}
					onChange={(time) => {
						setFormValues((previousValues) => ({
							...previousValues,
							time,
						}));
					}}
				/>
				<InputHelper
					as="textarea"
					label="Comment"
					value=""
					onChange={({ currentTarget }) => {
						setFormValues((previousValues) => ({
							...previousValues,
							comment: currentTarget.value,
						}));
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					{isEdit ? 'Save' : 'Add Attempt'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
