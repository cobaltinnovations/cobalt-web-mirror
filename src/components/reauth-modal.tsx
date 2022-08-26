import Cookies from 'js-cookie';
import React, { FC, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ReauthModalContext } from '@/contexts/reauth-modal-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const usStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 400,
		margin: '0 auto',
	},
});

const ReauthModal: FC<ModalProps> = ({ ...props }) => {
	useTrackModalView('ReauthModal', props.show);
	const classes = usStyles();
	const navigate = useNavigate();
	const location = useLocation();
	const { showReauthModal, setShowReauthModal, signOnUrl } = useContext(ReauthModalContext);

	const handleOnEnter = useCallback(() => {
		const authRedirectUrl = location.pathname + (location.search || '');
		Cookies.set('authRedirectUrl', authRedirectUrl);
	}, [location.pathname, location.search]);

	return (
		<Modal
			show={showReauthModal}
			dialogClassName={classes.modal}
			centered
			{...props}
			onHide={() => {
				navigate(-1);
				setShowReauthModal(false);
			}}
			onEnter={handleOnEnter}
		>
			<Modal.Header closeButton>
				<Modal.Title>Reauthentication Required</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-3">This page contains information that requires reauthentication.</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button
						type="button"
						variant="outline-primary"
						onClick={() => {
							navigate(-1);
							setShowReauthModal(false);
						}}
					>
						Cancel
					</Button>
					<Button
						className="ms-2"
						type="submit"
						variant="primary"
						onClick={() => {
							window.location.href = signOnUrl;
						}}
					>
						Proceed
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ReauthModal;
