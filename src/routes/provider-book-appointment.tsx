import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import {
	Clinic,
	InstitutionLocation,
	Provider,
	ProviderAppointmentModalityId,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import {
	accountService,
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
import {
	parseProviderAppointmentDateTime,
	PROVIDER_BOOKING_EXPERIENCE_ID,
	shouldFetchInstitutionLocation,
} from '@/lib/utils';
import useFlags from '@/hooks/use-flags';
import AppointmentUnavailableModal from '@/components/appointment-unavailable-modal';
import { CobaltError } from '@/lib/http-client';

const getAppointmentDateTimeFromSearchParams = (searchParams: URLSearchParams) => {
	const date = searchParams.get('date');
	const time = searchParams.get('time');
	return parseProviderAppointmentDateTime(date, time);
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
		const timeSlotDateTime = parseProviderAppointmentDateTime(selectedAvailability.date, timeSlot.time);

		return timeSlotDateTime?.isSame(appointmentDateTime, 'minute');
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
	const { addFlag } = useFlags();
	const [showUnavailableModal, setShowUnavailableModal] = useState(false);
	const appointmentCreationErrorHandler = useCallback((error: CobaltError) => {
		if (error.apiError?.metadata?.appointmentTimeslotUnavailable) {
			setShowUnavailableModal(true);
			return true;
		}

		return false;
	}, []);
	const handleError = useHandleError(appointmentCreationErrorHandler);

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
	const [confirmationCodeRequested, setConfirmationCodeRequested] = useState(false);
	const [confirmationCodeInputValue, setConfirmationCodeInputValue] = useState('');
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
			...(shouldFetchInstitutionLocation(institutionLocationId) ? { institutionLocationId } : {}),
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

	const createAppointmentAndNavigate = async () => {
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
	};

	const beginSubmission = () => {
		if (submissionInFlightRef.current) {
			return false;
		}

		submissionInFlightRef.current = true;
		setIsSubmitting(true);
		return true;
	};

	const endSubmission = () => {
		submissionInFlightRef.current = false;
		setIsSubmitting(false);
	};

	const handleContactInformationFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!beginSubmission()) {
			return;
		}

		try {
			if (!account) {
				throw new Error('Account is undefined.');
			}

			const response = await accountService
				.postEmailVerificationCode(account.accountId, {
					emailAddress: formValues.emailAddress,
					accountEmailVerificationFlowTypeId: 'APPOINTMENT_BOOKING',
				})
				.fetch();

			if (response.verified) {
				await createAppointmentAndNavigate();
				return;
			}

			setConfirmationCodeInputValue('');
			setConfirmationCodeRequested(true);
			addFlag({
				variant: 'success',
				title: 'Confirmation code sent',
				description: 'Check your email for the confirmation code',
				actions: [],
			});
		} catch (error) {
			handleError(error);
		} finally {
			endSubmission();
		}
	};

	const handleConfirmationCodeFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!beginSubmission()) {
			return;
		}

		try {
			if (!account) {
				throw new Error('Account is undefined.');
			}

			await accountService
				.postApplyEmailVerificationCode(account.accountId, {
					emailAddress: formValues.emailAddress,
					code: confirmationCodeInputValue,
				})
				.fetch();

			await createAppointmentAndNavigate();
		} catch (error) {
			handleError(error);
		} finally {
			endSubmission();
		}
	};

	const handleResendCodeButtonClick = async () => {
		if (!beginSubmission()) {
			return;
		}

		try {
			if (!account) {
				throw new Error('Account is undefined.');
			}

			const response = await accountService
				.postEmailVerificationCode(account.accountId, {
					emailAddress: formValues.emailAddress,
					accountEmailVerificationFlowTypeId: 'APPOINTMENT_BOOKING',
					forceVerification: true,
				})
				.fetch();

			if (response.verified) {
				await createAppointmentAndNavigate();
				return;
			}

			addFlag({
				variant: 'success',
				title: 'Confirmation code sent',
				description: 'Check your email for the confirmation code',
				actions: [],
			});
		} catch (error) {
			handleError(error);
		} finally {
			endSubmission();
		}
	};

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Book Appointment</title>
			</Helmet>
			<AppointmentUnavailableModal
				show={showUnavailableModal}
				onHide={() => {
					setShowUnavailableModal(false);
				}}
				onViewAppointments={() => {
					setShowUnavailableModal(false);
					const queryString = searchParams.toString();
					navigate(
						queryString
							? `/provider-confirm-appointment-time?${queryString}`
							: '/provider-confirm-appointment-time',
						{ replace: true }
					);
				}}
			/>

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
								<h4 className="mb-4">
									{confirmationCodeRequested ? 'Verify Email Address' : 'Additional Info'}
								</h4>
								<p className="mb-8 fs-large">
									{confirmationCodeRequested
										? `Enter the confirmation code sent to ${formValues.emailAddress} to finish booking.`
										: "Your provider will receive this information and may use it to contact you about your appointment. We'll verify the email address before booking, so please make sure it is entered correctly."}
								</p>

								<Form
									id="provider-book-appointment-form"
									onSubmit={
										confirmationCodeRequested
											? handleConfirmationCodeFormSubmit
											: handleContactInformationFormSubmit
									}
								>
									{confirmationCodeRequested ? (
										<>
											<InputHelper
												required
												className="mb-6"
												type="text"
												label="Confirmation Code"
												value={confirmationCodeInputValue}
												disabled={isSubmitting}
												onChange={({ currentTarget }) => {
													setConfirmationCodeInputValue(currentTarget.value);
												}}
											/>
											<div className="d-flex align-items-center justify-content-between">
												<Button
													type="button"
													variant="link"
													className="p-0"
													disabled={isSubmitting}
													onClick={() => {
														setConfirmationCodeRequested(false);
														setConfirmationCodeInputValue('');
													}}
												>
													Change email address
												</Button>
												<Button
													type="button"
													variant="light"
													disabled={isSubmitting}
													onClick={handleResendCodeButtonClick}
												>
													Resend Code
												</Button>
											</div>
										</>
									) : (
										<>
											<InputHelper
												required
												className="mb-4"
												name="firstName"
												label="First Name"
												value={formValues.firstName}
												disabled={isSubmitting}
												onChange={handleFormValueChange}
											/>
											<InputHelper
												required
												className="mb-4"
												name="lastName"
												label="Last Name"
												value={formValues.lastName}
												disabled={isSubmitting}
												onChange={handleFormValueChange}
											/>
											<InputHelper
												required
												className="mb-4"
												type="email"
												name="emailAddress"
												label="Email Address"
												value={formValues.emailAddress}
												disabled={isSubmitting}
												onChange={handleFormValueChange}
											/>
											<InputHelper
												required
												className="mb-2"
												type="tel"
												name="phoneNumber"
												label="Phone Number"
												value={formValues.phoneNumber}
												disabled={isSubmitting}
												onChange={handleFormValueChange}
											/>
											<p className="mb-0 text-muted small">
												Used for appointment updates and to help your provider reach you if
												needed.
											</p>
										</>
									)}
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
									{confirmationCodeRequested ? 'Verify & Book Appointment' : 'Book Appointment'}
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
