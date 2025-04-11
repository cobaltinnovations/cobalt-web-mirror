import classNames from 'classnames';
import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
	flex1: {
		flex: 1,
	},
});

interface Props extends ModalProps {
	onContinue(): void;
	content: string;
}

export const PatientInsuranceStatementModal: FC<Props> = ({ onContinue, content, ...props }) => {
	const classes = useStyles();

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Body>
				<h3 className="mb-5">Insurance Information</h3>
				<div
					dangerouslySetInnerHTML={{
						__html: content,
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="py-5 bg-white">
				<p className="mb-4 fs-small text-gray text-center">
					By clicking “Continue” you acknowledge that you have read and understand the insurance information.
				</p>
				<div className="d-flex align-items-center">
					<Button
						variant="outline-primary"
						className={classNames('me-1', classes.flex1)}
						onClick={props.onHide}
					>
						Close
					</Button>
					<Button variant="primary" className={classNames('ms-1', classes.flex1)} onClick={onContinue}>
						Continue
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
