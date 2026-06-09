import React, { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import { useSearchParams } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
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
	const [searchParams] = useSearchParams();
	const searchString = searchParams.toString();
	const appointmentDateTimePickerConfig = useMemo(
		() => getAppointmentDateTimePickerConfigFromSearchParams(new URLSearchParams(searchString)),
		[searchString]
	);
	const [selectedAppointmentDateTimePickerValue, setSelectedAppointmentDateTimePickerValue] = useState(() =>
		getAppointmentDateTimePickerValueFromSearchParams(new URLSearchParams(searchString))
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

			<Container className="pt-10 pb-16">
				<Row className="mb-10">
					<Col>
						<h2 className="mb-0">Confirm Appointment Time</h2>
					</Col>
				</Row>
				<Row>
					<Col xs={8}>
						<div className="bg-white border rounded">
							<AppointmentDateTimePicker
								config={appointmentDateTimePickerConfig}
								value={selectedAppointmentDateTimePickerValue}
								onChange={setSelectedAppointmentDateTimePickerValue}
							/>
						</div>
					</Col>
					<Col xs={4}></Col>
				</Row>
			</Container>
		</>
	);
};
