import React, { useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import AppointmentDateTimePicker, {
	AppointmentDateTimePickerConfig,
	AppointmentDateTimePickerValue,
	getDefaultAppointmentDateTimePickerValue,
} from '@/components/appointment-date-time-picker';
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

export type ProviderScheduleModalConfig = AppointmentDateTimePickerConfig;

interface ProviderScheduleModalContinueOptions {
	config?: ProviderScheduleModalConfig;
	value: AppointmentDateTimePickerValue;
}

interface ProviderScheduleModalProps extends ModalProps {
	config?: ProviderScheduleModalConfig;
}

const providerConfirmAppointmentTimePath = '/provider-confirm-appointment-time';

const buildProviderConfirmAppointmentTimeUrl = ({ config, value }: ProviderScheduleModalContinueOptions) => {
	const params = new URLSearchParams();

	if (config?.featureId) {
		params.set('featureId', config.featureId);
	}

	if (config?.clinicId) {
		params.set('clinicId', config.clinicId);
	}

	if (config?.providerId) {
		params.set('providerId', config.providerId);
	}

	if (config?.providerSearchResultTypeId) {
		params.set('providerSearchResultTypeId', config.providerSearchResultTypeId);
	}

	if (value.appointmentModalityId) {
		params.set('appointmentModalityId', value.appointmentModalityId);
	}

	params.set('date', value.dateTime.format('YYYY-MM-DD'));
	params.set('time', value.dateTime.format('HH:mm:ss'));

	const queryString = params.toString();

	return queryString ? `${providerConfirmAppointmentTimePath}?${queryString}` : providerConfirmAppointmentTimePath;
};

const ProviderScheduleModal = ({ config, ...props }: ProviderScheduleModalProps) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const [selectedAppointmentDateTimePickerValue, setSelectedAppointmentDateTimePickerValue] = useState(
		getDefaultAppointmentDateTimePickerValue
	);
	const selectedDateLabel = selectedAppointmentDateTimePickerValue.dateTime.format('MMMM D, YYYY');
	const selectedTimeLabel = selectedAppointmentDateTimePickerValue.dateTime.format('h:mmA');

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
					config={config}
					value={selectedAppointmentDateTimePickerValue}
					onChange={setSelectedAppointmentDateTimePickerValue}
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
				<Button
					variant="primary"
					onClick={() => {
						navigate(
							buildProviderConfirmAppointmentTimeUrl({
								config,
								value: selectedAppointmentDateTimePickerValue,
							})
						);
					}}
				>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ProviderScheduleModal;
