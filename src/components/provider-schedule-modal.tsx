import React, { useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';

import AppointmentDateTimePicker, { getDefaultAppointmentDateTime } from '@/components/appointment-date-time-picker';
import InlineAlert from '@/components/inline-alert';
import { createUseThemedStyles } from '@/jss/theme';

const appointmentTitle = 'UPHS Employee Assistance Program';
const appointmentSubtitle = '30 minute intake phone call';

const useStyles = createUseThemedStyles((theme) => ({
	providerScheduleModal: {
		maxWidth: 760,
		'& .cobalt-modal__body': {
			padding: 0,
		},
	},
	imagePlaceholder: {
		width: 56,
		height: 56,
		flexShrink: 0,
		marginRight: 16,
		backgroundColor: theme.colors.n500,
	},
}));

interface ProviderScheduleModalProps extends ModalProps {}

const ProviderScheduleModal = ({ ...props }: ProviderScheduleModalProps) => {
	const classes = useStyles();
	const [selectedAppointmentDateTime, setSelectedAppointmentDateTime] = useState(getDefaultAppointmentDateTime);
	const selectedDateLabel = selectedAppointmentDateTime.format('MMMM D, YYYY');
	const selectedTimeLabel = selectedAppointmentDateTime.format('h:mmA');

	return (
		<Modal {...props} dialogClassName={classes.providerScheduleModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Schedule Appointment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex border-bottom py-8 px-6">
					<div className={classes.imagePlaceholder} aria-hidden="true" />
					<div>
						<h4 className="mb-2">{appointmentTitle}</h4>
						<h4 className="mb-0">{appointmentSubtitle}</h4>
					</div>
				</div>
				<AppointmentDateTimePicker
					value={selectedAppointmentDateTime}
					onChange={setSelectedAppointmentDateTime}
				/>
				<div className="pb-8 px-6">
					<InlineAlert
						variant="warning"
						title="Insurance Warning"
						description="Description would go here if needed"
					/>
				</div>
			</Modal.Body>
			<Modal.Footer className="d-flex align-items-center justify-content-between">
				<p className="mb-0 fs-large">
					Appointment Selected:{' '}
					<strong>
						{selectedDateLabel} at {selectedTimeLabel}
					</strong>
				</p>
				<Button variant="primary" onClick={props.onHide}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ProviderScheduleModal;
