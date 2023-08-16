import useTrackModalView from '@/hooks/use-track-modal-view';
import { ScreeningSessionDestinationResultId } from '@/lib/models';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { useLocation } from 'react-router-dom';

const useIneligibleBookingModal = createUseStyles({
	ineligibleBookingModal: {
		maxWidth: 295,
	},
});

interface IneligibleBookingModalProps extends ModalProps {
	uiType?: 'provider' | 'group-session';
}

const modalConfig = {
	provider: {
		title: "Let's Find the Right Match",
		body: 'Based on your responses, we do not believe this provider is the right fit for your needs. Please select an appointment with a different provider.',
	},
	'group-session': {
		title: 'Session Screening Notification',
		body: "We're sorry, it looks like you are not eligible for this group session. Please select another group session.",
	},
};

const IneligibleBookingModal = ({ uiType = 'provider', show, onHide, ...props }: IneligibleBookingModalProps) => {
	useTrackModalView('IneligibleBookingModal', props.show);
	const classes = useIneligibleBookingModal();
	const location = useLocation();
	const [isShown, setIsShown] = useState(false);

	const didFailIntake =
		location.state?.screeningSessionDestinationResultId === ScreeningSessionDestinationResultId.FAILURE;

	// TODO: should be cleaned up after replacing provider `/intake-assessment` with a screeningFlow;
	useEffect(() => {
		setIsShown(!!didFailIntake || !!show);
	}, [didFailIntake, show]);

	const handleDismiss = useCallback(() => {
		if (didFailIntake) {
			window.history.replaceState({}, '', location.pathname);
			setIsShown(false);
		} else {
			onHide?.();
		}
	}, [didFailIntake, location.pathname, onHide]);

	return (
		<Modal
			{...props}
			show={isShown}
			onHide={handleDismiss}
			dialogClassName={classes.ineligibleBookingModal}
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title>{modalConfig[uiType].title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0">{modalConfig[uiType].body}</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="primary" onClick={handleDismiss}>
						Okay
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default IneligibleBookingModal;
