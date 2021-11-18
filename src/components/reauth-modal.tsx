import React, { FC } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const usStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 400,
		margin: '0 auto',
	},
});

const ReauthModal: FC<ModalProps> = ({ ...props }) => {
	const classes = usStyles();

	return (
		<Modal dialogClassName={classes.modal} centered {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Reauthentication Required</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-3">This page contains information that requires reauthentication.</p>
			</Modal.Body>
			<Modal.Footer>
				<Button type="button" variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button
					type="submit"
					variant="primary"
					size="sm"
					onClick={() => {
						window.alert('[TODO]: Link to sso page');
						props.onHide();
					}}
				>
					proceed
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ReauthModal;
