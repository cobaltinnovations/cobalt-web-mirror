import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputHelper from '@/components/input-helper';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useCollectEmailModalStyles = createUseStyles({
	collectEmailModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface CollectEmailModalProps extends ModalProps {
	collectedEmail: string;
	onSubmitEmail(email: string): void;
}

const CollectEmailModal: FC<CollectEmailModalProps> = ({ onSubmitEmail, collectedEmail, ...props }) => {
	useTrackModalView('CollectEmailModal', props.show);
	const classes = useCollectEmailModalStyles();
	const [email, setEmail] = useState(collectedEmail);

	return (
		<Modal {...props} dialogClassName={classes.collectEmailModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>confirm your appointment</Modal.Title>
			</Modal.Header>
			<Form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					e.preventDefault();

					onSubmitEmail(email);
				}}
			>
				<Modal.Body>
					<p className="mb-3 fw-normal">
						To book an appointment with one of our resources, please supply your email address so that we
						can keep in contact with you.
					</p>
					<InputHelper
						required
						type="email"
						value={email}
						label="Your Email Address"
						autoFocus
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setEmail(e.target.value);
						}}
					/>
				</Modal.Body>

				<Modal.Footer>
					<div className="text-right">
						<Button type="button" variant="outline-primary" onClick={props.onHide}>
							cancel
						</Button>
						<Button className="ms-2" type="submit" variant="primary">
							reserve
						</Button>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CollectEmailModal;
