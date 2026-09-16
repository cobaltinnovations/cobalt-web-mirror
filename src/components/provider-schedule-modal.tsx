import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

import AppointmentDateTimePicker, {
	AppointmentDateTimePickerConfig,
	AppointmentDateTimePickerValue,
	getDefaultAppointmentDateTimePickerValue,
} from '@/components/appointment-date-time-picker';
import { createUseThemedStyles } from '@/jss/theme';
import {
	AnalyticsNativeEventProviderAppointmentSelectionPresentationId,
	AnalyticsNativeEventTypeId,
	AppointmentBookingRequirementsDestinationId,
	FirstAvailableAppointmentModel,
	ProviderAppointmentModalityId,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { analyticsService, appointmentService } from '@/lib/services';
import {
	buildBookingV2UrlWithV1Fallback,
	buildProviderBookingAnalyticsData,
	getProviderBookingScreeningSearchParams,
	setProviderIdToScheduleSearchParam,
} from '@/lib/utils';
import useHandleError from '@/hooks/use-handle-error';
import { useScreeningNavigation } from '@/pages/screening/screening.hooks';

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
	providerSearchResultId?: string;
	initialAppointment?: FirstAvailableAppointmentModel;
	initialAppointmentModalityId?: ProviderAppointmentModalityId;
};

export const createProviderScheduleModalConfig = ({
	featureId,
	institutionLocationId,
	provider,
	bookingV1FallbackUrl,
}: {
	featureId: string;
	institutionLocationId: string;
	provider: ProviderSearchResultModel;
	bookingV1FallbackUrl?: string;
}): ProviderScheduleModalConfig => {
	const initialAppointment = provider.firstAvailableAppointment ?? undefined;

	return {
		featureId,
		institutionLocationId,
		clinicId: provider.clinicId ?? undefined,
		providerId: provider.providerId ?? undefined,
		appointmentTypeId:
			provider.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER
				? initialAppointment?.appointmentTypeId
				: undefined,
		providerSearchResultTypeId: provider.providerSearchResultTypeId,
		providerSearchResultId: provider.providerSearchResultId,
		appointmentSelectionTypeId: provider.appointmentSelectionTypeId ?? undefined,
		bookingV1FallbackUrl,
		initialAppointment,
		initialAppointmentModalityId: provider.supportedAppointmentModalities[0]?.appointmentModalityId,
	};
};

export const getInitialAppointmentDateTimePickerValue = (
	config?: ProviderScheduleModalConfig
): AppointmentDateTimePickerValue => {
	const defaultValue = getDefaultAppointmentDateTimePickerValue();
	const initialAppointment = config?.initialAppointment;

	if (!initialAppointment) {
		return defaultValue;
	}

	return {
		...defaultValue,
		dateTime: moment.utc(`${initialAppointment.date} ${initialAppointment.time}`, [
			'YYYY-MM-DD HH:mm:ss',
			'YYYY-MM-DD HH:mm',
			'YYYY-MM-DD h:mmA',
		]),
		appointmentModalityId: config.initialAppointmentModalityId,
		appointmentTypeIds:
			initialAppointment.appointmentTypeIds ??
			(initialAppointment.appointmentTypeId ? [initialAppointment.appointmentTypeId] : undefined),
		appointmentTypeId: initialAppointment.appointmentTypeId,
		appointmentTypeDescription: initialAppointment.appointmentDescription,
		epicDepartmentId: initialAppointment.epicDepartmentId,
		epicAppointmentFhirId: initialAppointment.epicAppointmentFhirId,
		providerId: initialAppointment.providerId ?? config.providerId,
	};
};

interface ProviderScheduleModalContinueOptions {
	config?: ProviderScheduleModalConfig;
	value: AppointmentDateTimePickerValue;
}

interface ProviderScheduleModalProps extends ModalProps {
	config?: ProviderScheduleModalConfig;
}

const providerBookAppointmentPath = '/provider-book-appointment';

const buildProviderBookAppointmentUrl = ({ config, value }: ProviderScheduleModalContinueOptions) => {
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

	if (config?.providerSearchResultId) {
		params.set('providerSearchResultId', config.providerSearchResultId);
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

	const providerBookAppointmentUrl = queryString
		? `${providerBookAppointmentPath}?${queryString}`
		: providerBookAppointmentPath;

	return buildBookingV2UrlWithV1Fallback(providerBookAppointmentUrl, config?.bookingV1FallbackUrl);
};

const ProviderScheduleModal = ({ config, ...props }: ProviderScheduleModalProps) => {
	const classes = useStyles();
	const navigate = useNavigate();
	const location = useLocation();
	const handleError = useHandleError();
	const screeningQuestionSearch = useMemo(
		() => getProviderBookingScreeningSearchParams(new URLSearchParams(location.search)),
		[location.search]
	);
	const { navigateToNext } = useScreeningNavigation({ screeningQuestionSearch });
	const [isCheckingBookingRequirements, setIsCheckingBookingRequirements] = useState(false);
	const [selectedAppointmentDateTimePickerValue, setSelectedAppointmentDateTimePickerValue] = useState(() =>
		getInitialAppointmentDateTimePickerValue(config)
	);

	useEffect(() => {
		setSelectedAppointmentDateTimePickerValue(getInitialAppointmentDateTimePickerValue(config));
	}, [config, props.show]);
	useEffect(() => {
		if (!props.show || !config) {
			return;
		}

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_PROVIDER_APPOINTMENT_SELECTION_VIEWED, {
			...buildProviderBookingAnalyticsData({
				featureId: config.featureId,
				institutionLocationId: config.institutionLocationId,
				providerSearchResultId: config.providerSearchResultId,
				providerSearchResultTypeId: config.providerSearchResultTypeId,
				providerId: config.providerId,
				clinicId: config.clinicId,
				providerIdToSchedule: config.initialAppointment?.providerId ?? config.providerId,
				appointmentSelectionTypeId: config.appointmentSelectionTypeId,
				appointmentTypeId: config.initialAppointment?.appointmentTypeId ?? config.appointmentTypeId,
				appointmentModalityId: config.initialAppointmentModalityId,
			}),
			presentation: AnalyticsNativeEventProviderAppointmentSelectionPresentationId.MODAL,
		});
	}, [config, props.show]);
	const selectedDateLabel = selectedAppointmentDateTimePickerValue.dateTime.format('ddd, MMM D, YYYY');
	const selectedTimeLabel = selectedAppointmentDateTimePickerValue.dateTime.format('h:mm a');
	const canContinue = Boolean(
		selectedAppointmentDateTimePickerValue.appointmentModalityId &&
			selectedAppointmentDateTimePickerValue.appointmentTypeId &&
			selectedAppointmentDateTimePickerValue.providerId
	);
	const handleContinue = async () => {
		const selectedProviderId = selectedAppointmentDateTimePickerValue.providerId;
		const selectedAppointmentTypeId = selectedAppointmentDateTimePickerValue.appointmentTypeId;
		const selectedAppointmentModalityId = selectedAppointmentDateTimePickerValue.appointmentModalityId;

		if (
			!selectedProviderId ||
			!selectedAppointmentTypeId ||
			!selectedAppointmentModalityId ||
			isCheckingBookingRequirements
		) {
			return;
		}

		setIsCheckingBookingRequirements(true);
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.EVENT_PROVIDER_APPOINTMENT_SELECTED, {
			...buildProviderBookingAnalyticsData({
				featureId: config?.featureId,
				institutionLocationId: config?.institutionLocationId,
				providerSearchResultId: config?.providerSearchResultId,
				providerSearchResultTypeId: config?.providerSearchResultTypeId,
				providerId: config?.providerId,
				clinicId: config?.clinicId,
				providerIdToSchedule: selectedProviderId,
				appointmentSelectionTypeId: config?.appointmentSelectionTypeId,
				appointmentTypeId: selectedAppointmentTypeId,
				appointmentModalityId: selectedAppointmentModalityId,
			}),
			presentation: AnalyticsNativeEventProviderAppointmentSelectionPresentationId.MODAL,
		});

		try {
			const response = await appointmentService
				.getAppointmentBookingRequirements({
					providerId: selectedProviderId,
					appointmentTypeId: selectedAppointmentTypeId,
					...(config?.appointmentSelectionTypeId && {
						appointmentSelectionTypeId: config.appointmentSelectionTypeId,
					}),
					appointmentModalityId: selectedAppointmentModalityId,
					date: selectedAppointmentDateTimePickerValue.dateTime.format('YYYY-MM-DD'),
					time: selectedAppointmentDateTimePickerValue.dateTime.format('HH:mm:ss'),
					...(selectedAppointmentDateTimePickerValue.epicDepartmentId && {
						epicDepartmentId: selectedAppointmentDateTimePickerValue.epicDepartmentId,
					}),
					...(selectedAppointmentDateTimePickerValue.epicAppointmentFhirId && {
						epicAppointmentFhirId: selectedAppointmentDateTimePickerValue.epicAppointmentFhirId,
					}),
				})
				.fetch();
			const bookingRequirements = response.appointmentBookingRequirements;

			if (
				bookingRequirements.appointmentBookingRequirementsDestinationId ===
				AppointmentBookingRequirementsDestinationId.SCREENING_SESSION
			) {
				if (!bookingRequirements.screeningSession) {
					throw new Error('Screening session is required but was not returned.');
				}

				navigateToNext(bookingRequirements.screeningSession);
				return;
			}

			if (
				bookingRequirements.appointmentBookingRequirementsDestinationId !==
				AppointmentBookingRequirementsDestinationId.APPOINTMENT_BOOKING
			) {
				throw new Error('Unknown appointment booking destination.');
			}

			navigate(
				buildProviderBookAppointmentUrl({
					config,
					value: selectedAppointmentDateTimePickerValue,
				})
			);
		} catch (error) {
			handleError(error);
		} finally {
			setIsCheckingBookingRequirements(false);
		}
	};

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
					disabled={!canContinue || isCheckingBookingRequirements}
					onClick={handleContinue}
				>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ProviderScheduleModal;
