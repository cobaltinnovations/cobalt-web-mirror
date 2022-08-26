import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputHelper from '@/components/input-helper';
import useTrackModalView from '@/hooks/use-track-modal-view';

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
	useTrackModalView('CollectContactInfoModal', props.show);

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
			<Modal.Header closeButton>
				<Modal.Title>confirm your appointment</Modal.Title>
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
							autoFocus
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setEmailInputValue(e.target.value);
							}}
						/>
					)}
					{promptForPhoneNumber && (
						<InputHelper
							required
							type="tel"
							value={phoneNumberInputValue}
							label="Your Phone Number"
							autoFocus={!promptForEmail}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setPhoneNumberInputValue(e.target.value);
							}}
						/>
					)}
				</Modal.Body>

				<Modal.Footer>
					<div className="text-right">
						<Button type="button" variant="outline-primary" onClick={props.onHide}>
							Cancel
						</Button>
						<Button className="ms-2" type="submit" variant="primary">
							Reserve
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CollectContactInfoModal;
