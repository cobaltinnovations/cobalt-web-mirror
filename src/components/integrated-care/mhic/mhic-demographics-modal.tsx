import React, { FC, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicDemographicsModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();

	const handleOnEnter = useCallback(() => {
		//TODO: Set <select/> values to Patient's values
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Demographics</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<InputHelper
					as="select"
					className="mb-4"
					label="Race"
					value=""
					onChange={() => {
						return;
					}}
				/>
				<InputHelper
					as="select"
					className="mb-4"
					label="Ethnicity"
					value=""
					onChange={() => {
						return;
					}}
				/>
				<InputHelper
					as="select"
					label="Gender Identity"
					value=""
					onChange={() => {
						return;
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
