import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import moment from 'moment';

import {
	Clinic,
	InstitutionLocation,
	Provider,
	ProviderAppointmentModalityId,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import {
	appointmentService,
	AvailabilityModel,
	clinicService,
	institutionService,
	providerService,
} from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import FullscreenBar from '@/components/fullscreen-bar';
import InputHelper from '@/components/input-helper';
import {
	getAppointmentModalitySummaryById,
	isProviderAppointmentModalityId,
} from '@/components/provider-appointment-modality-summary';
import SvgIcon from '@/components/svg-icon';
import useHandleError from '@/hooks/use-handle-error';
import { PROVIDER_BOOKING_EXPERIENCE_ID, shouldFetchInstitutionLocation } from '@/lib/utils';

const getAppointmentDateTimeFromSearchParams = (searchParams: URLSearchParams) => {
	const date = searchParams.get('date');
	const time = searchParams.get('time');
	const dateTime = date
		? moment(`${date} ${time ?? ''}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mmA'])
		: undefined;

	return dateTime?.isValid() ? dateTime : undefined;
};

const getAppointmentTypeDescriptionFromAvailability = ({
	appointmentDateTime,
	appointmentModalityId,
	appointmentTypeId,
	availability,
}: {
	appointmentDateTime: ReturnType<typeof getAppointmentDateTimeFromSearchParams>;
	appointmentModalityId?: ProviderAppointmentModalityId;
	appointmentTypeId?: string;
	availability: AvailabilityModel;
}) => {
	if (!appointmentDateTime || !appointmentModalityId) {
		return;
	}

	const selectedAppointmentModality = availability.appointmentModalities.find(
		(appointmentModality) => appointmentModality.appointmentModalityId === appointmentModalityId
	);
	const selectedAvailability = selectedAppointmentModality?.availability.find(
		(availability) => availability.date === appointmentDateTime.format('YYYY-MM-DD')
	);
	const selectedTimeSlot = selectedAvailability?.times.find((timeSlot) => {
		const timeSlotDateTime = moment(`${selectedAvailability.date} ${timeSlot.time}`, [
			'YYYY-MM-DD HH:mm:ss',
			'YYYY-MM-DD HH:mm',
			'YYYY-MM-DD h:mmA',
		]);

		return timeSlotDateTime.isSame(appointmentDateTime, 'minute');
	});

	if (selectedTimeSlot?.appointmentTypeDescription) {
		return selectedTimeSlot.appointmentTypeDescription;
	}

	const selectedAppointmentType = availability.appointmentTypes.find(
		(appointmentType) => appointmentType.appointmentTypeId === appointmentTypeId
	);

	return selectedAppointmentType?.description ?? selectedAppointmentType?.name;
};

export const loader = () => {
	return null;
};

export const Component = () => {
	const { account, institution } = useAccount();
	const navigate = useNavigate();
	const handleError = useHandleError();

	const [searchParams] = useSearchParams();
	const providerId = useMemo(() => searchParams.get('providerId') ?? '', [searchParams]);
	const providerIdToSchedule = useMemo(
		() => searchParams.get('providerIdToSchedule') ?? providerId,
		[providerId, searchParams]
	);
	const clinicId = useMemo(() => searchParams.get('clinicId') ?? '', [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);
	const appointmentTypeId = useMemo(() => searchParams.get('appointmentTypeId') ?? '', [searchParams]);
	const epicAppointmentFhirId = useMemo(() => searchParams.get('epicAppointmentFhirId') ?? undefined, [searchParams]);
	const featureId = useMemo(() => searchParams.get('featureId') ?? '', [searchParams]);
	const appointmentModalityId = useMemo(() => {
		const value = searchParams.get('appointmentModalityId');
		return isProviderAppointmentModalityId(value) ? value : undefined;
	}, [searchParams]);
	const providerSearchResultTypeId = useMemo(
		() => (searchParams.get('providerSearchResultTypeId') as ProviderSearchResultTypeId) ?? '',
		[searchParams]
	);
	const appointmentDateTime = useMemo(() => getAppointmentDateTimeFromSearchParams(searchParams), [searchParams]);

	const selectedAppointmentModalitySummary = useMemo(() => {
		return getAppointmentModalitySummaryById(appointmentModalityId);
	}, [appointmentModalityId]);

	const [provider, setProvider] = useState<Provider>();
	const [clinic, setClinic] = useState<Clinic>();
	const [institutionLocation, setInstitutionLocation] = useState<InstitutionLocation>();
	const [selectedAppointmentTypeDescription, setSelectedAppointmentTypeDescription] = useState<string>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const submissionInFlightRef = useRef(false);
	const [formValues, setFormValues] = useState({
		firstName: account?.firstName ?? '',
		lastName: account?.lastName ?? '',
		emailAddress: account?.emailAddress ?? '',
		phoneNumber: account?.phoneNumber ?? '',
	});

	const fetchData = useCallback(async () => {
		const institutionLocationRequest = shouldFetchInstitutionLocation(institutionLocationId)
			? institutionService.getInstitutionLocationByIinstitutionLocationId(institutionLocationId).fetch()
			: Promise.resolve(undefined);
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

			setProvider(providerResponse.provider);
			setClinic(undefined);
			setInstitutionLocation(institutionLocationResponse?.location);
			setSelectedAppointmentTypeDescription(
				getAppointmentTypeDescriptionFromAvailability({
					appointmentDateTime,
					appointmentModalityId,
					appointmentTypeId,
					availability: availabilityResponse.providerAvailability,
				})
			);
			return;
		}

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC && clinicId) {
			const [clinicResponse, institutionLocationResponse, availabilityResponse] = await Promise.all([
				clinicService.getClinicByClinicId(clinicId).fetch(),
				institutionLocationRequest,
				providerService.getClinicAvailability(clinicId, availabilityQueryParams).fetch(),
			]);

			setProvider(undefined);
			setClinic(clinicResponse.clinic);
			setInstitutionLocation(institutionLocationResponse?.location);
			setSelectedAppointmentTypeDescription(
				getAppointmentTypeDescriptionFromAvailability({
					appointmentDateTime,
					appointmentModalityId,
					appointmentTypeId,
					availability: availabilityResponse.clinicAvailability,
				})
			);
			return;
		}

		throw new Error('Required query parameters are undefined.');
	}, [
		appointmentDateTime,
		appointmentModalityId,
		appointmentTypeId,
		clinicId,
		featureId,
		institutionLocationId,
		providerId,
		providerSearchResultTypeId,
	]);

	const handleFormValueChange = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues((previousFormValues) => ({
			...previousFormValues,
			[currentTarget.name]: currentTarget.value,
		}));
	};

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (submissionInFlightRef.current) {
			return;
		}

		try {
			if (!providerIdToSchedule) {
				throw new Error('Provider ID to schedule is undefined.');
			}

			if (!appointmentTypeId) {
				throw new Error('Appointment type ID is undefined.');
			}

			if (!appointmentDateTime) {
				throw new Error('Appointment date and time are undefined.');
			}

			if (!appointmentModalityId) {
				throw new Error('Appointment modality ID is undefined.');
			}

			submissionInFlightRef.current = true;
			setIsSubmitting(true);

			await appointmentService
				.createAppointment({
					bookingExperienceId: PROVIDER_BOOKING_EXPERIENCE_ID,
					providerId: providerIdToSchedule,
					accountId: account?.accountId,
					firstName: formValues.firstName,
					lastName: formValues.lastName,
					date: appointmentDateTime?.format('YYYY-MM-DD') ?? '',
					time: appointmentDateTime?.format('HH:mm') ?? '',
					emailAddress: formValues.emailAddress,
					phoneNumber: formValues.phoneNumber,
					appointmentTypeId: appointmentTypeId,
					appointmentModalityId,
					epicAppointmentFhirId,
				})
				.fetch();

			const queryString = searchParams.toString();
			navigate(queryString ? `/provider-booking-complete?${queryString}` : '/provider-booking-complete');
		} catch (error) {
			handleError(error);
		} finally {
			submissionInFlightRef.current = false;
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Book Appointment</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<FullscreenBar
					title={
						institutionLocation?.name
							? `Appointment Scheduling - ${institutionLocation.name}`
							: 'Appointment Scheduling'
					}
					onExit={() => {
						navigate('/providers');
					}}
				/>

				<Container className="pt-10 pb-16">
					<Row className="mb-10">
						<Col>
							<h2 className="mb-4">Book Appointment</h2>
							<p className="mb-0 fs-large">Confirm your contact information before booking.</p>
						</Col>
					</Row>

					<Row className="mb-10">
						<Col lg={8} className="mb-6 mb-lg-0">
							<div className="bg-white border rounded-4 py-8 px-6">
								<h4 className="mb-4">Additional Info</h4>
								<p className="mb-8 fs-large">
									Your provider will receive this information and may use it to contact you about your
									appointment. Please make sure it is entered correctly.
								</p>

								<Form id="provider-book-appointment-form" onSubmit={handleFormSubmit}>
									<InputHelper
										required
										className="mb-4"
										name="firstName"
										label="First Name"
										value={formValues.firstName}
										onChange={handleFormValueChange}
									/>
									<InputHelper
										required
										className="mb-4"
										name="lastName"
										label="Last Name"
										value={formValues.lastName}
										onChange={handleFormValueChange}
									/>
									<InputHelper
										required
										className="mb-4"
										type="email"
										name="emailAddress"
										label="Email Address"
										value={formValues.emailAddress}
										onChange={handleFormValueChange}
									/>
									<InputHelper
										required
										className="mb-2"
										type="tel"
										name="phoneNumber"
										label="Phone Number"
										value={formValues.phoneNumber}
										onChange={handleFormValueChange}
									/>
									<p className="mb-0 text-muted small">
										Used for appointment updates and to help your provider reach you if needed.
									</p>
								</Form>
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

								<div className="d-flex align-items-start py-6 border-bottom">
									<SvgIcon
										kit="far"
										icon="calendar"
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
									/>
									<p className="mb-0 fs-large fw-bold">
										{appointmentDateTime?.format('MMMM D, YYYY [at] h:mmA')}
									</p>
								</div>

								<Button
									type="submit"
									form="provider-book-appointment-form"
									className="w-100 mt-6"
									disabled={isSubmitting}
								>
									Book Appointment
								</Button>
							</div>
						</Col>
					</Row>

					<Button
						type="button"
						variant="outline-primary"
						className="d-inline-flex align-items-center"
						onClick={() => {
							navigate(-1);
						}}
					>
						<SvgIcon kit="far" icon="chevron-left" size={16} className="me-3" />
						Previous
					</Button>
				</Container>
			</AsyncWrapper>
		</>
	);
};
