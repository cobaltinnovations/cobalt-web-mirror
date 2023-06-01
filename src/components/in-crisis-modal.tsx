import React, { FC } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import useTrackModalView from '@/hooks/use-track-modal-view';
import InCrisisTemplate from '@/components/in-crisis-template';

const useInCrisisModalStyles = createUseStyles({
	inCrisisModal: {
		maxWidth: 408,
	},
	header: {
		border: 0,
		backgroundColor: 'transparent',
	},
});

interface InCrisisModalProps extends ModalProps {
	isCall?: boolean;
}

const InCrisisModal: FC<InCrisisModalProps> = ({ isCall, ...modalProps }) => {
	const classes = useInCrisisModalStyles();
	useTrackModalView('InCrisisModal', modalProps.show);

	return (
		<Modal {...modalProps} dialogClassName={classes.inCrisisModal} centered>
			<Modal.Header className={classes.header} closeButton>
				<Modal.Title>&nbsp;</Modal.Title>
			</Modal.Header>
			<Modal.Body className="pt-2 pb-8">
				<h3 className="mb-4">If you are in crisis</h3>
				<h5 className={isCall ? 'mb-4' : 'mb-8'}>
					Contact one of the listed resources or go to your nearest emergency department or crisis center.
				</h5>
				{isCall && (
					<p className="mb-8">
						We want to check in with you to make sure you are safe. A clinician will call you within one
						business day to talk about how they can help. Please don't hesitate to use the crisis resources
						listed below, which are available 24/7.
					</p>
				)}
				<InCrisisTemplate isModal />
			</Modal.Body>
		</Modal>
	);
};

export default InCrisisModal;
