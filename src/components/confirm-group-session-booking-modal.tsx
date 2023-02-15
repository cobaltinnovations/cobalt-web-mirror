import useTrackModalView from '@/hooks/use-track-modal-view';
import React, { FC, useCallback, useEffect } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useConfirmGroupSessionBookingModalStyles = createUseStyles({
	confirmGroupSessionBookingModal: {
		maxWidth: 295,
	},
});

interface ConfirmGroupSessionBookingModalProps extends ModalProps {
	onConfirm(): void;
	groupSessionName: string;
	dateTime: string;
	externalUrl?: string;
}

const ConfirmGroupSessionBookingModal: FC<ConfirmGroupSessionBookingModalProps> = ({
	onConfirm,
	groupSessionName,
	dateTime,
	externalUrl,
	...modalProps
}) => {
	useTrackModalView('ConfirmGroupSessionBookingModal', modalProps.show);
	const classes = useConfirmGroupSessionBookingModalStyles();

	const navigateToExternalUrl = useCallback(() => {
		if (!externalUrl) {
			return;
		}

		const url = externalUrl?.startsWith('http') ? externalUrl : `https://${externalUrl}`;

		window.open(url, '_self');
	}, [externalUrl]);

	useEffect(() => {
		if (modalProps.show) {
			const timeoutId = setTimeout(() => {
				navigateToExternalUrl();
			}, 3000);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [modalProps.show, navigateToExternalUrl]);

	return (
		<Modal {...modalProps} dialogClassName={classes.confirmGroupSessionBookingModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Confirm Reservation</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{!!externalUrl ? (
					<p>
						This session is managed outside of Cobalt. Please wait a moment while we take you to the site
						where you can complete your booking.
					</p>
				) : (
					<>
						<p className="mb-0 fw-bold">Group Session</p>
						<p className="mb-2">{groupSessionName}</p>

						<p className="mb-0 fw-bold">Scheduled for</p>
						<p className="mb-0">{dateTime}</p>
					</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={modalProps.onHide}>
						Cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							if (externalUrl) {
								navigateToExternalUrl();
							} else {
								onConfirm();
							}
						}}
					>
						{externalUrl ? 'Ok' : 'Reserve'}
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmGroupSessionBookingModal;
