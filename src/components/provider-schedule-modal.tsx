import React, { useEffect, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import AppointmentDateTimePicker, {
	AppointmentDateTimePickerConfig,
	AppointmentDateTimePickerValue,
	getDefaultAppointmentDateTimePickerValue,
} from '@/components/appointment-date-time-picker';
import { createUseThemedStyles } from '@/jss/theme';
import { buildBookingV2UrlWithV1Fallback, setProviderIdToScheduleSearchParam } from '@/lib/utils';

const useStyles = createUseThemedStyles(() => ({
	providerScheduleModal: {
		maxWidth: 760,
		'& .cobalt-modal__body': {
			padding: 0,
		},
	},
}));

export type ProviderScheduleModalConfig = AppointmentDateTimePickerConfig & {
	bookingV1FallbackUrl?: string;
};

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

	if (config?.institutionLocationId) {
		params.set('institutionLocationId', config.institutionLocationId);
	}

	if (config?.clinicId) {
		params.set('clinicId', config.clinicId);
	}

	if (config?.providerId) {
		params.set('providerId', config.providerId);
	}

	setProviderIdToScheduleSearchParam(params, value.providerId);

	if (config?.providerSearchResultTypeId) {
		params.set('providerSearchResultTypeId', config.providerSearchResultTypeId);
	}

	if (config?.appointmentSelectionTypeId) {
		params.set('appointmentSelectionTypeId', config.appointmentSelectionTypeId);
	}

	if (value.appointmentModalityId) {
		params.set('appointmentModalityId', value.appointmentModalityId);
	}

	if (value.appointmentTypeId) {
		params.set('appointmentTypeId', value.appointmentTypeId);
	}

	if (value.epicDepartmentId) {
		params.set('epicDepartmentId', value.epicDepartmentId);
	}

	if (value.epicAppointmentFhirId) {
		params.set('epicAppointmentFhirId', value.epicAppointmentFhirId);
	}

	params.set('date', value.dateTime.format('YYYY-MM-DD'));
	params.set('time', value.dateTime.format('HH:mm:ss'));

	const queryString = params.toString();

	const providerConfirmAppointmentTimeUrl = queryString
		? `${providerConfirmAppointmentTimePath}?${queryString}`
		: providerConfirmAppointmentTimePath;

	return buildBookingV2UrlWithV1Fallback(providerConfirmAppointmentTimeUrl, config?.bookingV1FallbackUrl);
};

const ProviderScheduleModal = ({ config, ...props }: ProviderScheduleModalProps) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const [selectedAppointmentDateTimePickerValue, setSelectedAppointmentDateTimePickerValue] = useState(
		getDefaultAppointmentDateTimePickerValue
	);

	useEffect(() => {
		setSelectedAppointmentDateTimePickerValue(getDefaultAppointmentDateTimePickerValue());
	}, [config, props.show]);
	const selectedDateLabel = selectedAppointmentDateTimePickerValue.dateTime.format('MMMM D, YYYY');
	const selectedTimeLabel = selectedAppointmentDateTimePickerValue.dateTime.format('h:mmA');
	const canContinue = Boolean(
		selectedAppointmentDateTimePickerValue.appointmentModalityId &&
			selectedAppointmentDateTimePickerValue.appointmentTypeId &&
			selectedAppointmentDateTimePickerValue.providerId
	);

	return (
		<Modal {...props} dialogClassName={classes.providerScheduleModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Schedule Appointment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<AppointmentDateTimePicker
					config={config}
					value={selectedAppointmentDateTimePickerValue}
					onChange={setSelectedAppointmentDateTimePickerValue}
				/>
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
					disabled={!canContinue}
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
