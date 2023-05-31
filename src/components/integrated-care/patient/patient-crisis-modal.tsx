import React, { FC } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InCrisisTemplate from '@/components/in-crisis-template';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useIcScreeningCrisisModalStyles = createUseStyles({
	inCrisisModal: {
		maxWidth: 408,
	},
	header: {
		border: 0,
		backgroundColor: 'transparent',
	},
});

interface useIcScreeningCrisisModalProps extends ModalProps {}

export const IcScreeningCrisisModal: FC<useIcScreeningCrisisModalProps> = ({ ...modalProps }) => {
	const classes = useIcScreeningCrisisModalStyles();
	useTrackModalView('IcScreeningCrisisModal', modalProps.show);

	return (
		<Modal {...modalProps} dialogClassName={classes.inCrisisModal} centered>
			<Modal.Header className={classes.header} closeButton>
				<Modal.Title>&nbsp;</Modal.Title>
			</Modal.Header>
			<Modal.Body className="pt-2 pb-8">
				<h3 className="mb-4">
					A clinician will follow up with you in the next 24 hours to see how we can help.
				</h3>
				<h5 className="mb-8">
					If you think you might harm yourself or others, please immediately contact one of the following
				</h5>
				<InCrisisTemplate isModal />
				<p className="my-4">The resources above can be accessed at any time from "In Crisis" button.</p>
				<Button
					className="w-100"
					variant="primary"
					onClick={() => {
						modalProps.onHide?.();
					}}
				>
					Continue Assessment
				</Button>
			</Modal.Body>
		</Modal>
	);
};
