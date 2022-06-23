import React, { FC, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

const useStyles = createUseStyles({
	errorModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

const ErrorModal: FC = () => {
	const history = useHistory();
	const classes = useStyles();
	const { show, setShow, error } = useContext(ErrorModalContext);
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
			<Modal.Header>
				<h3 className="mb-0">
					{error?.code === 'VALIDATION_FAILED' ? 'oops!' : 'oh no! something went wrong'}
				</h3>
			</Modal.Header>
			<Modal.Body>
				{error?.code === 'VALIDATION_FAILED' ? (
					<>
						<p className="mb-1 font-karla-bold">{error?.message}</p>
					</>
				) : (
					<>
						<p className="mb-1 font-karla-bold">Need technical support?</p>
						<Button
							variant="link"
							size="sm"
							className="mb-4 p-0 text-decoration-none"
							onClick={() => {
								setShow(false);
								history.push('/feedback');
							}}
						>
							Send us a note
						</Button>

						<p className="mb-1 font-karla-bold">Need clinical support?</p>
						<a
							className="mb-4 d-block font-size-m font-weight-bold text-decoration-none"
							href="tel:866-301-4724"
						>
							call 866-301-4724
						</a>

						<p className="mb-1 font-karla-bold">Have a clinical emergency?</p>
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
			<Modal.Footer className="justify-content-center">
				<Button
					variant="outline-primary"
					size="sm"
					onClick={() => {
						setShow(false);
					}}
				>
					dismiss
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ErrorModal;
