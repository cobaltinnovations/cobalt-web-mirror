import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputHelper from '@/components/input-helper';

const useCollectContactInfoModalStyles = createUseStyles({
	collectContactInfoModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface CollectContactInfoModalProps extends ModalProps {
	collectedEmail: string;
	collectedPhoneNumber: string;
	onSubmit(data: { email: string; phoneNumber: string }): void;
	promptForEmail?: boolean;
	promptForPhoneNumber?: boolean;
}

const CollectContactInfoModal: FC<CollectContactInfoModalProps> = ({
	collectedEmail,
	collectedPhoneNumber,
	onSubmit,
	promptForEmail,
	promptForPhoneNumber,
	...props
}) => {
	const classes = useCollectContactInfoModalStyles();
	const [emailInputValue, setEmailInputValue] = useState(collectedEmail || '');
	const [phoneNumberInputValue, setPhoneNumberInputValue] = useState<string>(collectedPhoneNumber || '');

	const missingInfo =
		promptForEmail && promptForPhoneNumber
			? 'email address and phone number'
			: promptForEmail
			? 'email address'
			: promptForPhoneNumber
			? 'phone number'
			: '';

	return (
		<Modal {...props} dialogClassName={classes.collectContactInfoModal} centered>
			<Modal.Header>
				<h3 className="mb-0">confirm your appointment</h3>
			</Modal.Header>
			<Form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					e.preventDefault();
					onSubmit({ email: emailInputValue, phoneNumber: phoneNumberInputValue });
				}}
			>
				<Modal.Body>
					<p className="mb-3">
						To book an appointment with one of our resources, please supply your {missingInfo} so that we
						can keep in contact with you.
					</p>

					{promptForEmail && (
						<InputHelper
							required
							type="email"
							value={emailInputValue}
							className="mb-2"
							label="Your Email Address"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setEmailInputValue(e.target.value);
							}}
						/>
					)}

					{promptForPhoneNumber && (
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
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button type="button" variant="outline-primary" size="sm" onClick={props.onHide}>
						cancel
					</Button>

					<Button type="submit" variant="primary" size="sm">
						reserve
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CollectContactInfoModal;
