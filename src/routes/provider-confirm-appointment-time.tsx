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
	getAppointmentModalitySummaryById,
	isProviderAppointmentModalityId,
} from '@/components/provider-appointment-modality-summary';
import { Clinic, InstitutionLocation, Provider, ProviderSearchResultTypeId } from '@/lib/models';
import { AvailabilityModel, clinicService, institutionService, providerService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';

export const loader = () => {
	return null;
};

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

type AppointmentAvailabilityData = {
	[x: string]: AvailabilityModel;
};

const getAppointmentModalitiesFromAvailabilityData = (availabilityData?: AppointmentAvailabilityData) =>
	Object.values(availabilityData ?? {}).flatMap((availability) => availability.appointmentModalities);

export const Component = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const providerId = useMemo(() => searchParams.get('providerId') ?? '', [searchParams]);
	const clinicId = useMemo(() => searchParams.get('clinicId') ?? '', [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);
	const appointmentTypeId = useMemo(() => searchParams.get('appointmentTypeId') ?? '', [searchParams]);
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
	const selectedAppointmentModalityId = selectedAppointmentDateTimePickerValue.appointmentModalityId;
	const selectedAppointmentTypeDescription = selectedAppointmentDateTimePickerValue.appointmentTypeDescription;
	const [appointmentAvailabilityData, setAppointmentAvailabilityData] = useState<AppointmentAvailabilityData>();
	const selectedAppointmentModality = useMemo(() => {
		return getAppointmentModalitiesFromAvailabilityData(appointmentAvailabilityData).find(
			(appointmentModality) => appointmentModality.appointmentModalityId === selectedAppointmentModalityId
		);
	}, [appointmentAvailabilityData, selectedAppointmentModalityId]);
	const selectedAppointmentModalitySummary = useMemo(() => {
		return getAppointmentModalitySummaryById(
			selectedAppointmentModality?.appointmentModalityId ?? selectedAppointmentModalityId
		);
	}, [selectedAppointmentModality?.appointmentModalityId, selectedAppointmentModalityId]);

	const [provider, setProvider] = useState<Provider>();
	const [clinic, setClinic] = useState<Clinic>();
	const [institutionLocation, setInstitutionLocation] = useState<InstitutionLocation>();

	const fetchData = useCallback(async (): Promise<AppointmentAvailabilityData> => {
		const institutionLocationRequest = institutionLocationId
			? institutionService.getInstitutionLocationByIinstitutionLocationId(institutionLocationId).fetch()
			: Promise.resolve(undefined);
		const featureId = appointmentDateTimePickerConfig?.featureId ?? '';
		const availabilityQueryParams = {
			featureId,
			...(appointmentTypeId ? { appointmentTypeId } : {}),
		};

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER && providerId) {
			const [providerResponse, institutionLocationResponse, availabilityResponse] = await Promise.all([
				providerService.getProviderById(providerId).fetch(),
				institutionLocationRequest,
				providerService.getProviderAvailability(providerId, availabilityQueryParams).fetch(),
			]);
			const nextAppointmentAvailabilityData = {
				providerAvailability: availabilityResponse.providerAvailability,
			};

			setProvider(providerResponse.provider);
			setClinic(undefined);
			setInstitutionLocation(institutionLocationResponse?.location);
			setAppointmentAvailabilityData(nextAppointmentAvailabilityData);

			return nextAppointmentAvailabilityData;
		}

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC && clinicId) {
			const [clinicResponse, institutionLocationResponse, availabilityResponse] = await Promise.all([
				clinicService.getClinicByClinicId(clinicId).fetch(),
				institutionLocationRequest,
				providerService.getClinicAvailability(clinicId, availabilityQueryParams).fetch(),
			]);
			const nextAppointmentAvailabilityData = {
				clinicAvailability: availabilityResponse.clinicAvailability,
			};

			setProvider(undefined);
			setClinic(clinicResponse.clinic);
			setInstitutionLocation(institutionLocationResponse?.location);
			setAppointmentAvailabilityData(nextAppointmentAvailabilityData);

			return nextAppointmentAvailabilityData;
		}

		throw new Error('Required query parameters are undefined.');
	}, [
		appointmentDateTimePickerConfig?.featureId,
		appointmentTypeId,
		clinicId,
		institutionLocationId,
		providerId,
		providerSearchResultTypeId,
	]);

	const fetchAppointmentAvailabilityData = useCallback(async (): Promise<AppointmentAvailabilityData> => {
		if (appointmentAvailabilityData) {
			return appointmentAvailabilityData;
		}

		return fetchData();
	}, [appointmentAvailabilityData, fetchData]);

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
									fetchData={fetchAppointmentAvailabilityData}
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
										{provider?.treatmentDescription && (
											<p className="mb-0 fs-large text-muted">{provider.treatmentDescription}</p>
										)}
										{clinic?.treatmentDescription && (
											<p className="mb-0 fs-large text-muted">{clinic.treatmentDescription}</p>
										)}
									</div>
								</div>

								<div className="d-flex align-items-start py-6 border-bottom">
									<SvgIcon
										kit="far"
										icon={selectedAppointmentModalitySummary.icon}
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
									/>
									<div>
										<p className="mb-1 fs-large fw-bold">
											{selectedAppointmentModalitySummary.title}
										</p>
										<p className="mb-0 fs-large text-muted">
											{selectedAppointmentTypeDescription ??
												selectedAppointmentModalitySummary.description}
										</p>
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
