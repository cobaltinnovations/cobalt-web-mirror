import React, { FC, useState, useEffect } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import classNames from 'classnames';

import { ReactComponent as ReceptionistIllustration } from '@/assets/illustrations/receptionist.svg';
import { ReactComponent as DoctorIllustration } from '@/assets/illustrations/doctor-with-chart.svg';
import { createUseThemedStyles } from '@/jss/theme';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useHealthRecordsModal = createUseThemedStyles((theme) => ({
	healthRecordsModal: {
		maxWidth: 295,
	},
	pageIndicator: {
		width: 8,
		height: 8,
		margin: '0 4px',
		borderRadius: 4,
		backgroundColor: theme.colors.background,
	},
	pageIndicatorActive: {
		backgroundColor: theme.colors.p500,
	},
}));

interface HealthRecordsModalPageProps {
	onNextButtonClick?(): void;
	onExitButtonClick?(): void;
}

interface HealthRecordsModalProps extends ModalProps {
	onExitBooking?(): void;
}

const HealthRecordsModalPageOne: FC<HealthRecordsModalPageProps> = ({ onNextButtonClick, onExitButtonClick }) => {
	const classes = useHealthRecordsModal();

	return (
		<>
			<ReceptionistIllustration className="mb-4" />
			<ul className="mb-2 list-unstyled d-flex justify-content-center">
				<li className={classNames(classes.pageIndicator, classes.pageIndicatorActive)} />
				<li className={classes.pageIndicator} />
			</ul>
			<h1 className="mb-2">let's find your health records</h1>
			<p className="mb-6">
				To book with this provider, we'll need to find your electronic health records. We'll ask you questions
				until we can confidently identify your record.
			</p>
			<div className="d-grid gap-4">
				<Button variant="primary" size="sm" onClick={onNextButtonClick}>
					Next
				</Button>
				<Button variant="link" size="sm" onClick={onExitButtonClick}>
					Exit Booking
				</Button>
			</div>
		</>
	);
};

const HealthRecordsModalPageTwo: FC<HealthRecordsModalPageProps> = ({ onNextButtonClick, onExitButtonClick }) => {
	const classes = useHealthRecordsModal();

	return (
		<>
			<DoctorIllustration className="mb-4" />
			<ul className="mb-2 list-unstyled d-flex justify-content-center">
				<li className={classes.pageIndicator} />
				<li className={classNames(classes.pageIndicator, classes.pageIndicatorActive)} />
			</ul>
			<h1 className="mb-2">we take your privacy very seriously</h1>
			<p className="mb-6">This information is not shared outside of the context of an appointment.</p>
			<div className="d-grid gap-4">
				<Button variant="primary" size="sm" onClick={onNextButtonClick}>
					Continue
				</Button>
				<Button variant="link" size="sm" onClick={onExitButtonClick}>
					Exit Booking
				</Button>
			</div>
		</>
	);
};

const HealthRecordsModal: FC<HealthRecordsModalProps> = ({ onExitBooking, ...props }) => {
	useTrackModalView('HealthRecordsModal', props.show);
	const classes = useHealthRecordsModal();
	const [page, setPage] = useState(1);

	useEffect(() => {
		if (props.show) {
			setPage(1);
		}
	}, [props.show]);

	return (
		<Modal {...props} dialogClassName={classes.healthRecordsModal} centered>
			<Modal.Body className="pt-6">
				{page === 1 && (
					<HealthRecordsModalPageOne
						onNextButtonClick={() => {
							setPage(2);
						}}
						onExitButtonClick={onExitBooking}
					/>
				)}
				{page === 2 && (
					<HealthRecordsModalPageTwo onNextButtonClick={props.onHide} onExitButtonClick={onExitBooking} />
				)}
			</Modal.Body>
		</Modal>
	);
};

export default HealthRecordsModal;
