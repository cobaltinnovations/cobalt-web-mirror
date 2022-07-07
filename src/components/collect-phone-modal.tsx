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
			<Modal.Header>
				<h3 className="mb-0">take our assessment</h3>
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
						className="mb-3"
						value={phoneNumberInputValue}
						label="Your Phone Number"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setPhoneNumberInputValue(e.target.value);
						}}
					/>

					<Button type="submit" variant="primary" size="sm" className="btn-block">
						continue assessment
					</Button>
					<Button type="button" variant="link" size="sm" className="btn-block" onClick={props.onHide}>
						skip for now
					</Button>
				</Modal.Body>
			</Form>
		</Modal>
	);
};

export default CollectPhoneModal;
