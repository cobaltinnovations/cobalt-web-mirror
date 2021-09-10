import React, { FC, useState, useEffect } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import { ReactComponent as ReceptionistIllustration } from '@/assets/illustrations/receptionist.svg';
import { ReactComponent as DoctorIllustration } from '@/assets/illustrations/doctor-with-chart.svg';
import colors from '@/jss/colors';

const useHealthRecordsModal = createUseStyles({
	healthRecordsModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
	pageIndicator: {
		width: 8,
		height: 8,
		margin: '0 4px',
		borderRadius: 4,
		backgroundColor: colors.background,
	},
	pageIndicatorActive: {
		backgroundColor: colors.primary,
	},
});

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
			<Button variant="primary" size="sm" className="btn-block" onClick={onNextButtonClick}>
				next
			</Button>
			<Button variant="link" size="sm" className="btn-block" onClick={onExitButtonClick}>
				exit booking
			</Button>
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
			<Button variant="primary" size="sm" className="btn-block" onClick={onNextButtonClick}>
				continue
			</Button>
			<Button variant="link" size="sm" className="btn-block" onClick={onExitButtonClick}>
				exit booking
			</Button>
		</>
	);
};

const HealthRecordsModal: FC<HealthRecordsModalProps> = ({ onExitBooking, ...props }) => {
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
