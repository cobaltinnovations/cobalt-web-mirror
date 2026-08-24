import React, { FC, useCallback, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 720,
	},
});

interface Props extends ModalProps {
	emailAddress: string;
	onSave(emailAddress: string): Promise<void>;
}

export const EditContactModal: FC<Props> = ({ emailAddress, onHide, onSave, ...props }) => {
	const classes = useStyles();
	const [emailAddressInput, setEmailAddressInput] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setEmailAddressInput(emailAddress);
		setIsSaving(false);
	}, [emailAddress]);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (isSaving) {
				return;
			}

			setIsSaving(true);

			try {
				await onSave(emailAddressInput.trim());
			} finally {
				setIsSaving(false);
			}
		},
		[emailAddressInput, isSaving, onSave]
	);

	const handleHide = useCallback(() => {
		if (!isSaving) {
			onHide?.();
		}
	}, [isSaving, onHide]);

	return (
		<Modal
			{...props}
			dialogClassName={classes.modal}
			centered
			onEnter={handleOnEnter}
			onHide={handleHide}
			backdrop={isSaving ? 'static' : props.backdrop}
			keyboard={!isSaving && props.keyboard !== false}
		>
			<Modal.Header closeButton={!isSaving}>
				<Modal.Title>Edit Primary Contact</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						type="email"
						label="Email Address"
						aria-label="Email Address"
						value={emailAddressInput}
						disabled={isSaving}
						onChange={({ currentTarget }) => {
							setEmailAddressInput(currentTarget.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={handleHide} disabled={isSaving}>
						Cancel
					</Button>
					<LoadingButton variant="primary" type="submit" isLoading={isSaving} disabled={isSaving}>
						Save
					</LoadingButton>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
