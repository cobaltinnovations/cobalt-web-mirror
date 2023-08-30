import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useCovidCopayModalStyles = createUseThemedStyles((theme) => ({
	covidCopayModal: {
		maxWidth: 295,
		'& .modal-content': {
			width: 295,
			height: 295,
			display: 'flex',
			borderRadius: '50%',
			justifyContent: 'center',
			backgroundColor: theme.colors.s500,
		},
	},
}));

interface CovidCopayModalProps extends ModalProps {}

const CovidCopayModal: FC<CovidCopayModalProps> = ({ ...props }) => {
	useTrackModalView('CovidCopayModal', props.show);
	const classes = useCovidCopayModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.covidCopayModal} centered>
			<Modal.Header>
				<p className="text-center text-white text-uppercase fs-small">In light of covid-19</p>
				<h3 className="mb-0 text-center text-white">your co-pays are being waived</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 fw-normal text-center text-white">
					please use our services as much as you need during this challenging time
				</p>
			</Modal.Body>

			<Modal.Footer className="justify-content-center">
				<Button variant="light" size="sm" onClick={props.onHide}>
					Okay
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CovidCopayModal;
