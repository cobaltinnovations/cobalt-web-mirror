import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

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
	const classes = useCollectEmailModalStyles();
	const [email, setEmail] = useState(collectedEmail);

	return (
		<Modal {...props} dialogClassName={classes.collectEmailModal} centered>
			<Modal.Header>
				<h3 className="mb-0">confirm your appointment</h3>
			</Modal.Header>
			<Form
				onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
					e.preventDefault();

					onSubmitEmail(email);
				}}
			>
				<Modal.Body>
					<p className="mb-3 font-body-normal">
						To book an appointment with one of our resources, please supply your email address so that we
						can keep in contact with you.
					</p>
					<Form.Control
						required
						type="email"
						value={email}
						className="mb-2"
						placeholder="Your Email Address"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setEmail(e.target.value);
						}}
					/>
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

export default CollectEmailModal;
