import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputHelper from '@/components/input-helper';

const useCollectPhoneModalStyles = createUseStyles({
	collectPhoneNumberModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface CollectPhoneModalProps extends ModalProps {
	onSubmit(phoneNumber: string): void;
}

const CollectPhoneModal: FC<CollectPhoneModalProps> = ({ onSubmit, ...props }) => {
	const classes = useCollectPhoneModalStyles();
	const [phoneNumberInputValue, setPhoneNumberInputValue] = useState<string>('');

	return (
		<Modal {...props} dialogClassName={classes.collectPhoneNumberModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>take our assessment</Modal.Title>
			</Modal.Header>
			<Form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					e.preventDefault();
					onSubmit(phoneNumberInputValue);
				}}
			>
				<Modal.Body>
					<p className="mb-3">
						To take the Cobalt assessment we'd like a way to reach you if there is a need. Please enter your
						phone number to continue.
					</p>
					<InputHelper
						required
						type="tel"
						value={phoneNumberInputValue}
						label="Your Phone Number"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setPhoneNumberInputValue(e.target.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer>
					<div className="text-center">
						<Button
							className="mb-2"
							type="button"
							variant="outline-primary"
							size="sm"
							onClick={props.onHide}
						>
							skip for now
						</Button>
						<Button type="submit" variant="primary" size="sm" className="btn-block">
							continue assessment
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CollectPhoneModal;
