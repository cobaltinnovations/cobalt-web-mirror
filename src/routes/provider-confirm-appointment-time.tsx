import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
	Clinic,
	InstitutionLocation,
	Provider,
	ProviderAppointmentModalityId,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { clinicService, institutionService, providerService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';

export const loader = () => {
	return null;
};

const providerAppointmentModalityIds: ProviderAppointmentModalityId[] = [
	ProviderAppointmentModalityId.IN_PERSON,
	ProviderAppointmentModalityId.PHONE,
	ProviderAppointmentModalityId.VIRTUAL,
];

const buildProviderBookAppointmentUrl = ({
	currentSearchString,
	value,
}: {
	currentSearchString: string;
	value: AppointmentDateTimePickerValue;
}) => {
	const params = new URLSearchParams(currentSearchString);

	if (value.appointmentModalityId) {
		params.set('appointmentModalityId', value.appointmentModalityId);
	}

	params.set('date', value.dateTime.format('YYYY-MM-DD'));
	params.set('time', value.dateTime.format('HH:mm:ss'));

	return `/provider-book-appointment?${params.toString()}`;
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
		institutionLocationId: searchParams.get('institutionLocationId') ?? undefined,
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

	const providerId = useMemo(() => searchParams.get('providerId') ?? '', [searchParams]);
	const clinicId = useMemo(() => searchParams.get('clinicId') ?? '', [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);
	const providerSearchResultTypeId = useMemo(
		() => (searchParams.get('providerSearchResultTypeId') as ProviderSearchResultTypeId) ?? '',
		[searchParams]
	);

	const searchString = searchParams.toString();
	const appointmentDateTimePickerConfig = useMemo(
		() => getAppointmentDateTimePickerConfigFromSearchParams(new URLSearchParams(searchString)),
		[searchString]
	);
	const [selectedAppointmentDateTimePickerValue, setSelectedAppointmentDateTimePickerValue] = useState(() =>
		getAppointmentDateTimePickerValueFromSearchParams(new URLSearchParams(searchString))
	);

	const [provider, setProvider] = useState<Provider>();
	const [clinic, setClinic] = useState<Clinic>();
	const [institutionLocation, setInstitutionLocation] = useState<InstitutionLocation>();

	const fetchData = useCallback(async () => {
		const institutionLocationRequest = institutionLocationId
			? institutionService.getInstitutionLocationByIinstitutionLocationId(institutionLocationId).fetch()
			: Promise.resolve(undefined);

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER && providerId) {
			const [providerResponse, institutionLocationResponse] = await Promise.all([
				providerService.getProviderById(providerId).fetch(),
				institutionLocationRequest,
			]);

			setProvider(providerResponse.provider);
			setClinic(undefined);
			setInstitutionLocation(institutionLocationResponse?.location);
			return;
		}

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC && clinicId) {
			const [clinicResponse, institutionLocationResponse] = await Promise.all([
				clinicService.getClinicByClinicId(clinicId).fetch(),
				institutionLocationRequest,
			]);

			setProvider(undefined);
			setClinic(clinicResponse.clinic);
			setInstitutionLocation(institutionLocationResponse?.location);
			return;
		}

		throw new Error('Required query parameters are undefined.');
	}, [clinicId, institutionLocationId, providerId, providerSearchResultTypeId]);

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

			<AsyncWrapper fetchData={fetchData}>
				<FullscreenBar
					title={`Appointment Scheduling - ${institutionLocation?.name}`}
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
											buildProviderBookAppointmentUrl({
												currentSearchString: searchString,
												value: selectedAppointmentDateTimePickerValue,
											})
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
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
									/>
									<div>
										<p className="mb-1 fs-large fw-bold">{provider?.name ?? clinic?.description}</p>
										{provider?.description && (
											<p className="mb-0 fs-large text-muted">{provider.description}</p>
										)}
										{clinic?.treatmentDescription && (
											<p className="mb-0 fs-large text-muted">{clinic.treatmentDescription}</p>
										)}
									</div>
								</div>

								<div className="d-flex align-items-start py-6 border-bottom">
									<SvgIcon
										kit="far"
										icon="phone"
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
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
			</AsyncWrapper>
		</>
	);
};
