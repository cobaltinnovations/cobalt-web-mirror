import React, { FC, useCallback, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	emailAddress: string;
}

export const EditContactModal: FC<Props> = ({ emailAddress, onHide, ...props }) => {
	const classes = useStyles();
	const [emailAddressInput, setEmailAddressInput] = useState('');

	const handleOnEnter = useCallback(() => {
		setEmailAddressInput(emailAddress);
	}, [emailAddress]);

	const handleFormSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			onHide?.();
		},
		[onHide]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Primary Contact</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						type="email"
						label="Email Address"
						aria-label="Email Address"
						value={emailAddressInput}
						onChange={({ currentTarget }) => {
							setEmailAddressInput(currentTarget.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={onHide}>
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
