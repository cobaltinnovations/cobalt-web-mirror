import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useCovidCopayModalStyles = createUseThemedStyles((theme) => ({
	covidCopayModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
		'& .modal-content': {
			display: 'flex',
			justifyContent: 'center',
			height: 295,
			width: 295,
			borderRadius: '50%',
			backgroundColor: theme.colors.s500,
		},
	},
	subTitle: {
		...theme.fonts.uiSmall,
	},
}));

interface CovidCopayModalProps extends ModalProps {}

const CovidCopayModal: FC<CovidCopayModalProps> = ({ ...props }) => {
	useTrackModalView('CovidCopayModal', props.show);
	const classes = useCovidCopayModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.covidCopayModal} centered>
			<Modal.Header>
				<p className={classNames('text-center text-white text-uppercase', classes.subTitle)}>
					In light of covid-19
				</p>
				<h3 className="mb-0 text-center text-white">your co-pays are being waived</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 fw-normal text-center text-white">
					please use our services as much as you need during this challenging time
				</p>
			</Modal.Body>

			<Modal.Footer className="justify-content-center">
				<Button variant="light" size="sm" onClick={props.onHide}>
					okay
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CovidCopayModal;
