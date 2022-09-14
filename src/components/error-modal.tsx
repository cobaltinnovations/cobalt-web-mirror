import React, { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useStyles = createUseStyles({
	errorModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

const ErrorModal: FC = () => {
	const navigate = useNavigate();
	const classes = useStyles();
	const { show, setShow, error } = useContext(ErrorModalContext);
	useTrackModalView('ErrorModal', show);
	const { openInCrisisModal } = useInCrisisModal();

	return (
		<Modal
			show={show}
			dialogClassName={classes.errorModal}
			centered
			onHide={() => {
				setShow(false);
			}}
		>
			<Modal.Header closeButton>
				<Modal.Title>
					{error?.code === 'VALIDATION_FAILED' ? 'Oops!' : 'Oh no! Something went wrong'}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{error?.code === 'VALIDATION_FAILED' ? (
					<>
						<p className="mb-1 fw-bold">{error?.message}</p>
					</>
				) : (
					<>
						<p className="mb-1 fw-bold">Need technical support?</p>
						<Button
							variant="link"
							size="sm"
							className="mb-4 p-0 text-decoration-none"
							onClick={() => {
								setShow(false);
								navigate('/feedback');
							}}
						>
							Send Us a Note
						</Button>

						<p className="mb-1 fw-bold">Need clinical support?</p>
						<a
							className="mb-4 d-block fs-large font-heading-bold text-decoration-none"
							href="tel:866-301-4724"
						>
							Call 866-301-4724
						</a>

						<p className="mb-1 fw-bold">Have a clinical emergency?</p>
						<Button
							variant="link"
							size="sm"
							className="mb-2 p-0 text-decoration-none"
							onClick={() => {
								setShow(false);
								openInCrisisModal(true);
							}}
						>
							Crisis Resources
						</Button>
					</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button
						variant="outline-primary"
						onClick={() => {
							setShow(false);
						}}
					>
						Dismiss
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ErrorModal;
