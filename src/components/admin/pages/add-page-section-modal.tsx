import React, { FC, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelper from '@/components/input-helper';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		maxWidth: 480,
	},
}));

interface AddPageSectionModalProps extends ModalProps {
	onSave(): void;
}

export const AddPageSectionModal: FC<AddPageSectionModalProps> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [formValues, setFormValues] = useState({ name: '' });

	const handleOnEnter = () => {
		setFormValues({ name: '' });
	};

	const handleOnEntered = () => {
		nameInputRef.current?.focus();
	};

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log(formValues);
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Add section</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						ref={nameInputRef}
						type="text"
						label="Name"
						value={formValues.name}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								name: currentTarget.value,
							}));
						}}
						required
					/>
				</Modal.Body>
				<Modal.Footer>
					<div className="text-right">
						<Button type="button" variant="outline-primary" onClick={props.onHide}>
							Cancel
						</Button>
						<Button type="submit" className="ms-2" variant="primary" onClick={onSave}>
							Add
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
