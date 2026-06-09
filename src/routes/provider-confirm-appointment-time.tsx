import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import { useNavigate, useSearchParams } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import FullscreenBar from '@/components/fullscreen-bar';
import SvgIcon from '@/components/svg-icon';
import AppointmentDateTimePicker, {
	AppointmentDateTimePickerConfig,
	AppointmentDateTimePickerValue,
	getDefaultAppointmentDateTimePickerValue,
} from '@/components/appointment-date-time-picker';
import { ProviderAppointmentModalityId, ProviderSearchResultTypeId } from '@/lib/models';

export const loader = () => {
	return null;
};

const providerAppointmentModalityIds: ProviderAppointmentModalityId[] = [
	ProviderAppointmentModalityId.IN_PERSON,
	ProviderAppointmentModalityId.PHONE,
	ProviderAppointmentModalityId.VIRTUAL,
];

const bookAppointmentPath = '/provider-book-appointment';

const buildProviderBookAppointmentUrl = (searchString: string, value: AppointmentDateTimePickerValue) => {
	const params = new URLSearchParams(searchString);

	if (value.appointmentModalityId) {
		params.set('appointmentModalityId', value.appointmentModalityId);
	}

	params.set('date', value.dateTime.format('YYYY-MM-DD'));
	params.set('time', value.dateTime.format('HH:mm:ss'));

	return `${bookAppointmentPath}?${params.toString()}`;
};

const getAppointmentModalitySummary = (appointmentModalityId?: ProviderAppointmentModalityId) => {
	if (appointmentModalityId === ProviderAppointmentModalityId.IN_PERSON) {
		return {
			icon: 'location-dot',
			title: 'In-Person Appointment',
			subtitle: '30 minute intake appointment',
		} as const;
	}

	if (appointmentModalityId === ProviderAppointmentModalityId.VIRTUAL) {
		return {
			icon: 'video',
			title: 'Online Appointment',
			subtitle: '30 minute intake video call',
		} as const;
	}

	return {
		icon: 'phone',
		title: 'Phone Appointment',
		subtitle: '30 minute intake call',
	} as const;
};

const isProviderAppointmentModalityId = (value: string | null): value is ProviderAppointmentModalityId => {
	return providerAppointmentModalityIds.includes(value as ProviderAppointmentModalityId);
};

const isProviderSearchResultTypeId = (value: string | null): value is ProviderSearchResultTypeId => {
	return value === ProviderSearchResultTypeId.CLINIC || value === ProviderSearchResultTypeId.PROVIDER;
};

const getAppointmentDateTimePickerConfigFromSearchParams = (
	searchParams: URLSearchParams
): AppointmentDateTimePickerConfig | undefined => {
	const providerSearchResultTypeId = searchParams.get('providerSearchResultTypeId');
	const providerId = searchParams.get('providerId') ?? undefined;
	const clinicId = searchParams.get('clinicId') ?? undefined;

	if (!isProviderSearchResultTypeId(providerSearchResultTypeId)) {
		return undefined;
	}

	if (providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER && !providerId) {
		return undefined;
	}

	if (providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC && !clinicId) {
		return undefined;
	}

	return {
		featureId: searchParams.get('featureId') ?? undefined,
		clinicId,
		providerId,
		providerSearchResultTypeId,
	};
};

const getAppointmentDateTimePickerValueFromSearchParams = (
	searchParams: URLSearchParams
): AppointmentDateTimePickerValue => {
	const defaultValue = getDefaultAppointmentDateTimePickerValue();
	const date = searchParams.get('date');
	const time = searchParams.get('time');
	const appointmentModalityId = searchParams.get('appointmentModalityId');
	const dateTime = date
		? moment(`${date} ${time ?? ''}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mmA'])
		: undefined;

	return {
		dateTime: dateTime?.isValid() ? dateTime : defaultValue.dateTime,
		...(isProviderAppointmentModalityId(appointmentModalityId) && { appointmentModalityId }),
	};
};

export const Component = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const searchString = searchParams.toString();
	const appointmentDateTimePickerConfig = useMemo(
		() => getAppointmentDateTimePickerConfigFromSearchParams(new URLSearchParams(searchString)),
		[searchString]
	);
	const [selectedAppointmentDateTimePickerValue, setSelectedAppointmentDateTimePickerValue] = useState(() =>
		getAppointmentDateTimePickerValueFromSearchParams(new URLSearchParams(searchString))
	);
	const appointmentModalitySummary = useMemo(
		() => getAppointmentModalitySummary(selectedAppointmentDateTimePickerValue.appointmentModalityId),
		[selectedAppointmentDateTimePickerValue.appointmentModalityId]
	);

	useEffect(() => {
		setSelectedAppointmentDateTimePickerValue(
			getAppointmentDateTimePickerValueFromSearchParams(new URLSearchParams(searchString))
		);
	}, [searchString]);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Confirm Appointment Time</title>
			</Helmet>

			<FullscreenBar
				title={'TODO Title, use API'}
				onExit={() => {
					navigate('/providers');
				}}
			/>

			<Container className="pt-10 pb-16">
				<Row className="mb-10">
					<Col>
						<h2 className="mb-0">Confirm Appointment Time</h2>
					</Col>
				</Row>
				<Row>
					<Col lg={8} className="mb-6 mb-lg-0">
						<div className="mb-6 bg-white border rounded-4">
							<AppointmentDateTimePicker
								config={appointmentDateTimePickerConfig}
								value={selectedAppointmentDateTimePickerValue}
								onChange={setSelectedAppointmentDateTimePickerValue}
							/>
						</div>
						<div className="text-right">
							<Button
								className="d-inline-flex align-items-center"
								onClick={() => {
									navigate(
										buildProviderBookAppointmentUrl(
											searchString,
											selectedAppointmentDateTimePickerValue
										)
									);
								}}
							>
								Continue
								<SvgIcon kit="far" icon="chevron-right" size={16} className="ms-2" />
							</Button>
						</div>
					</Col>
					<Col lg={4}>
						<div className="bg-white border rounded-4 shadow-lg py-8 px-6">
							<h5 className="mb-6">Booking Summary</h5>

							<div className="d-flex align-items-start pb-6 border-bottom">
								<SvgIcon
									kit="far"
									icon="location-dot"
									size={18}
									className="text-primary me-4 mt-1 flex-shrink-0"
								/>
								<div>
									<p className="mb-1 fs-large fw-bold">[TODO]: Need data</p>
									<p className="mb-0 fs-large text-muted">[TODO]: Need data</p>
								</div>
							</div>

							<div className="d-flex align-items-start py-6 border-bottom">
								<SvgIcon
									kit="far"
									icon={appointmentModalitySummary.icon}
									size={18}
									className="text-primary me-4 mt-1 flex-shrink-0"
								/>
								<div>
									<p className="mb-1 fs-large fw-bold">[TODO]: Need data</p>
									<p className="mb-0 fs-large text-muted">[TODO]: Need data</p>
								</div>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};
