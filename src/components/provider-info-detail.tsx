import React, { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import ProviderScheduleCard from '@/components/provider-schedule-card';
import ProviderScheduleModal from './provider-schedule-modal';
import AsyncWrapper from './async-page';
import {
	Clinic,
	Provider,
	ProviderAppointmentModalityId,
	ProviderAppointmentSelectionTypeId,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AvailabilityModel, clinicService, providerService } from '@/lib/services';
import SvgIcon from './svg-icon';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import ProviderInfoDetailContact from './provider-info-detail-contact';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import {
	BOOKING_V1_FALLBACK_URL_SEARCH_PARAM,
	buildBookingV2UrlWithV1Fallback,
	getBookingV1FallbackUrlFromSearchParams,
	setFirstAvailableAppointmentSearchParams,
	shouldFetchInstitutionLocation,
} from '@/lib/utils';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		marginBottom: 32,
		padding: '40px 0',
		backgroundColor: theme.colors.n75,
	},
	flushHeader: {
		marginTop: -32,
		marginLeft: -40,
		marginRight: -40,
		[mediaQueries.lg]: {
			marginLeft: -32,
			marginRight: -32,
		},
	},
	imageOuter: {
		width: 120,
		height: 120,
		flexShrink: 0,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n0,
		[mediaQueries.md]: {
			width: 64,
			height: 64,
		},
	},
}));

interface ProviderInfoDetailProps {
	providerId?: string;
	clinicId?: string;
	className?: string;
	flushHeader?: boolean;
}

const ProviderInfoDetail = ({ providerId, clinicId, className, flushHeader = false }: ProviderInfoDetailProps) => {
	const classes = useStyles();
	const [searchParams] = useSearchParams();
	const featureId = useMemo(() => searchParams.get('featureId') ?? undefined, [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? undefined, [searchParams]);
	const bookingV1FallbackUrl = useMemo(() => getBookingV1FallbackUrlFromSearchParams(searchParams), [searchParams]);

	const [showProviderScheduleModal, setShowProviderScheduleModal] = useState(false);
	const [provider, setProvider] = useState<Provider>();
	const [clinic, setClinic] = useState<Clinic>();
	const [availability, setAvailability] = useState<AvailabilityModel>();

	const providerScheduleModalConfig = useMemo(() => {
		if (!availability) {
			return;
		}

		return {
			featureId,
			institutionLocationId,
			bookingV1FallbackUrl,
			clinicId,
			providerId,
			providerSearchResultTypeId: providerId
				? ProviderSearchResultTypeId.PROVIDER
				: ProviderSearchResultTypeId.CLINIC,
			appointmentSelectionTypeId: getAppointmentSelectionTypeId({
				availability,
				phoneNumber: provider?.phoneNumber ?? clinic?.phoneNumber,
			}),
		};
	}, [
		availability,
		bookingV1FallbackUrl,
		clinic?.phoneNumber,
		clinicId,
		featureId,
		institutionLocationId,
		provider?.phoneNumber,
		providerId,
	]);

	const fetchData = useCallback(async () => {
		if (!providerId && !clinicId) {
			throw new Error('providerId and clinicId are undefined.');
		}

		const availabilityQueryParams = {
			...(featureId ? { featureId } : {}),
			...(shouldFetchInstitutionLocation(institutionLocationId) ? { institutionLocationId } : {}),
		};

		if (providerId) {
			const [providerResponse, availabilityResponse] = await Promise.all([
				providerService.getProviderById(providerId).fetch(),
				providerService.getProviderAvailability(providerId, availabilityQueryParams).fetch(),
			]);

			setProvider(providerResponse.provider);
			setClinic(undefined);
			setAvailability(availabilityResponse.providerAvailability);
		} else if (clinicId) {
			const [clinicResponse, availabilityResponse] = await Promise.all([
				clinicService.getClinicByClinicId(clinicId).fetch(),
				providerService.getClinicAvailability(clinicId, availabilityQueryParams).fetch(),
			]);

			setProvider(undefined);
			setClinic(clinicResponse.clinic);
			setAvailability(availabilityResponse.clinicAvailability);
		}
	}, [clinicId, featureId, institutionLocationId, providerId]);

	return (
		<>
			<IneligibleBookingModal />
			<ProviderScheduleModal
				config={providerScheduleModalConfig}
				show={showProviderScheduleModal && !!providerScheduleModalConfig}
				onHide={() => {
					setShowProviderScheduleModal(false);
				}}
			/>

			<AsyncWrapper fetchData={fetchData}>
				<div className={className}>
					<div className={classNames(classes.header, { [classes.flushHeader]: flushHeader })}>
						<Container>
							<Row>
								<Col>
									<div className="d-flex align-items-center">
										<div
											className={classNames(classes.imageOuter, 'me-6')}
											style={{ backgroundImage: `url(${provider?.imageUrl ?? ''})` }}
										/>
										<div>
											<h3 className="mb-2">{provider?.name ?? clinic?.description}</h3>
											<div className="d-flex align-items-center">
												{(provider?.supportedAppointmentModalities ?? []).map(
													(supportedAppointmentModality) => (
														<div
															key={supportedAppointmentModality.appointmentModalityId}
															className="me-4 d-inline-flex align-items-center"
														>
															{getSupportedAppointmentModalityIconById(
																supportedAppointmentModality.appointmentModalityId
															)}
															<p className="mb-0">
																{supportedAppointmentModality.description}
															</p>
														</div>
													)
												)}
											</div>
										</div>
									</div>
								</Col>
							</Row>
						</Container>
					</div>
					<Container>
						<Row>
							<Col xs={12} xl={7}>
								<div
									dangerouslySetInnerHTML={{
										__html: provider?.detailsHtml ?? clinic?.detailsHtml ?? '',
									}}
								/>
							</Col>
							<Col xs={12} xl={5}>
								{availability && (
									<ProviderInfoDetailSchedule
										featureId={featureId}
										institutionLocationId={institutionLocationId}
										bookingV1FallbackUrl={bookingV1FallbackUrl}
										provider={provider}
										clinic={clinic}
										availability={availability}
										providerId={providerId}
										clinicId={clinicId}
										onViewAppointmentsButtonClick={() => {
											setShowProviderScheduleModal(true);
										}}
									/>
								)}
								<ProviderInfoDetailContact className="mt-6" provider={provider} clinic={clinic} />
							</Col>
						</Row>
					</Container>
				</div>
			</AsyncWrapper>
		</>
	);
};

interface ProviderInfoDetailScheduleProps {
	featureId?: string;
	institutionLocationId?: string;
	bookingV1FallbackUrl?: string;
	provider?: Provider;
	clinic?: Clinic;
	availability: AvailabilityModel;
	providerId?: string;
	clinicId?: string;
	onViewAppointmentsButtonClick(): void;
}

const buildProviderConfirmAppointmentTimeUrl = ({
	featureId,
	institutionLocationId,
	availability,
	providerId,
	clinicId,
	appointmentSelectionTypeId,
	bookingV1FallbackUrl,
}: {
	featureId?: string;
	institutionLocationId?: string;
	availability: AvailabilityModel;
	providerId?: string;
	clinicId?: string;
	appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId;
	bookingV1FallbackUrl?: string;
}) => {
	const firstAvailableAppointment = availability.firstAvailableAppointment;

	if (!firstAvailableAppointment) {
		return;
	}

	const params = new URLSearchParams();

	if (featureId) {
		params.set('featureId', featureId);
	}

	if (institutionLocationId) {
		params.set('institutionLocationId', institutionLocationId);
	}

	if (clinicId) {
		params.set('clinicId', clinicId);
		params.set('providerSearchResultTypeId', ProviderSearchResultTypeId.CLINIC);
	} else if (providerId) {
		params.set('providerId', providerId);
		params.set('providerSearchResultTypeId', ProviderSearchResultTypeId.PROVIDER);
	} else {
		return;
	}

	const appointmentModalityId = availability.appointmentModalities[0]?.appointmentModalityId;

	if (appointmentModalityId) {
		params.set('appointmentModalityId', appointmentModalityId);
	}

	params.set('appointmentSelectionTypeId', appointmentSelectionTypeId);

	setFirstAvailableAppointmentSearchParams(params, firstAvailableAppointment);

	return buildBookingV2UrlWithV1Fallback(
		`/provider-confirm-appointment-time?${params.toString()}`,
		bookingV1FallbackUrl
	);
};

const appointmentBookingContextForProviderAvailability = ({
	featureId,
	institutionLocationId,
	availability,
	providerId,
	clinicId,
	appointmentSelectionTypeId,
	bookingV1FallbackUrl,
}: {
	featureId?: string;
	institutionLocationId?: string;
	availability: AvailabilityModel;
	providerId?: string;
	clinicId?: string;
	appointmentSelectionTypeId: ProviderAppointmentSelectionTypeId;
	bookingV1FallbackUrl?: string;
}) => {
	const firstAvailableAppointment = availability.firstAvailableAppointment;

	const context: Record<string, string> = {};

	if (featureId) {
		context.featureId = featureId;
	}

	if (institutionLocationId) {
		context.institutionLocationId = institutionLocationId;
	}

	if (bookingV1FallbackUrl) {
		context[BOOKING_V1_FALLBACK_URL_SEARCH_PARAM] = bookingV1FallbackUrl;
	}

	if (clinicId) {
		context.clinicId = clinicId;
		context.providerSearchResultTypeId = ProviderSearchResultTypeId.CLINIC;
	} else if (providerId) {
		context.providerId = providerId;
		context.providerSearchResultTypeId = ProviderSearchResultTypeId.PROVIDER;
	} else {
		return;
	}

	const appointmentModalityId = availability.appointmentModalities[0]?.appointmentModalityId;

	if (appointmentModalityId) {
		context.appointmentModalityId = appointmentModalityId;
	}

	context.appointmentSelectionTypeId = appointmentSelectionTypeId;

	if (firstAvailableAppointment) {
		context.date = firstAvailableAppointment.date;
		context.time = firstAvailableAppointment.time;

		if (firstAvailableAppointment.providerId) {
			context.providerId = firstAvailableAppointment.providerId;
			context.providerIdToSchedule = firstAvailableAppointment.providerId;
		}

		if (firstAvailableAppointment.appointmentTypeId) {
			context.appointmentTypeId = firstAvailableAppointment.appointmentTypeId;
		}

		if (firstAvailableAppointment.epicDepartmentId) {
			context.epicDepartmentId = firstAvailableAppointment.epicDepartmentId;
		}

		if (firstAvailableAppointment.epicAppointmentFhirId) {
			context.epicAppointmentFhirId = firstAvailableAppointment.epicAppointmentFhirId;
		}
	}

	return context;
};

const getAvailabilityAppointmentCount = (availability: AvailabilityModel) => {
	const appointmentKeys = new Set<string>();

	for (const appointmentModality of availability.appointmentModalities) {
		for (const appointmentDate of appointmentModality.availability) {
			for (const timeSlot of appointmentDate.times) {
				appointmentKeys.add(
					[
						appointmentDate.date,
						timeSlot.time,
						timeSlot.providerId ?? '',
						...(timeSlot.appointmentTypeIds ?? []),
					].join('|')
				);
			}
		}
	}

	return appointmentKeys.size;
};

const getAppointmentSelectionTypeId = ({
	availability,
	phoneNumber,
}: {
	availability: AvailabilityModel;
	phoneNumber?: string;
}) => {
	if (availability.appointmentSelectionTypeId) {
		return availability.appointmentSelectionTypeId;
	}

	const firstAvailableAppointment = availability.firstAvailableAppointment;

	if (!firstAvailableAppointment) {
		return phoneNumber
			? ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE
			: ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED;
	}

	const appointmentTypeIds =
		firstAvailableAppointment.appointmentTypeIds ??
		(firstAvailableAppointment.appointmentTypeId ? [firstAvailableAppointment.appointmentTypeId] : []);

	return appointmentTypeIds.length === 1
		? ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED
		: ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED;
};

const ProviderInfoDetailSchedule = ({
	featureId,
	institutionLocationId,
	bookingV1FallbackUrl,
	provider,
	clinic,
	availability,
	providerId,
	clinicId,
	onViewAppointmentsButtonClick,
}: ProviderInfoDetailScheduleProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const phoneNumber = provider?.phoneNumber ?? clinic?.phoneNumber;
	const phoneNumberDescription =
		provider?.formattedPhoneNumber ?? clinic?.formattedPhoneNumber ?? provider?.phoneNumber ?? clinic?.phoneNumber;
	const scheduleTypeId = getAppointmentSelectionTypeId({
		availability,
		phoneNumber,
	});
	const firstAvailableAppointment = availability.firstAvailableAppointment;
	const scheduleAppointmentDescription = firstAvailableAppointment?.appointmentDescription ?? '';
	const showMoreAppointmentsButton = getAvailabilityAppointmentCount(availability) > 1;
	const screeningRequirement = availability.screeningRequirement;
	const screeningRequired = Boolean(
		screeningRequirement?.screeningRequired &&
			!screeningRequirement?.screeningSatisfied &&
			screeningRequirement?.screeningFlowId
	);
	const appointmentBookingContext = useMemo(
		() =>
			appointmentBookingContextForProviderAvailability({
				featureId,
				institutionLocationId,
				availability,
				providerId,
				clinicId,
				appointmentSelectionTypeId: scheduleTypeId,
				bookingV1FallbackUrl,
			}),
		[availability, bookingV1FallbackUrl, clinicId, featureId, institutionLocationId, providerId, scheduleTypeId]
	);
	const screeningQuestionSearch = useMemo(() => {
		const params = new URLSearchParams({
			returnTo: location.pathname + location.search,
		});

		if (bookingV1FallbackUrl) {
			params.set(BOOKING_V1_FALLBACK_URL_SEARCH_PARAM, bookingV1FallbackUrl);
		}

		return params.toString();
	}, [bookingV1FallbackUrl, location.pathname, location.search]);
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader, renderedAccountSourcesModal } =
		useScreeningFlow({
			screeningFlowId: screeningRequirement?.screeningFlowId,
			instantiateOnLoad: false,
			checkCompletionState: false,
			disabled: !screeningRequired,
			screeningQuestionPathPrefix: '/screening-questions-fullscreen',
			screeningQuestionSearch,
			...(appointmentBookingContext && { metadata: { appointmentBooking: appointmentBookingContext } }),
		});

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			{renderedCollectPhoneModal}
			{renderedAccountSourcesModal}
			<ProviderScheduleCard
				scheduleAppointmentDescription={scheduleAppointmentDescription}
				scheduleTypeId={scheduleTypeId}
				firstAvailableAppointment={firstAvailableAppointment ?? undefined}
				onScheduleAppointmentButtonClick={() => {
					if (screeningRequired) {
						startScreeningFlow(true);
						return;
					}

					const providerConfirmAppointmentTimeUrl = buildProviderConfirmAppointmentTimeUrl({
						featureId,
						institutionLocationId,
						availability,
						providerId,
						clinicId,
						appointmentSelectionTypeId: scheduleTypeId,
						bookingV1FallbackUrl,
					});

					if (providerConfirmAppointmentTimeUrl) {
						navigate(providerConfirmAppointmentTimeUrl);
					}
				}}
				onViewAppointmentsButtonClick={onViewAppointmentsButtonClick}
				showMoreAppointmentsButton={showMoreAppointmentsButton}
				phoneNumber={phoneNumber}
				phoneNumberDescription={phoneNumberDescription}
			/>
		</>
	);
};

const getSupportedAppointmentModalityIconById = (providerAppointmentModalityId: ProviderAppointmentModalityId) => {
	const iconMap: Record<ProviderAppointmentModalityId, JSX.Element> = {
		[ProviderAppointmentModalityId.IN_PERSON]: <SvgIcon kit="far" icon="location-dot" size={16} className="me-2" />,
		[ProviderAppointmentModalityId.PHONE]: <SvgIcon kit="far" icon="phone" size={16} className="me-2" />,
		[ProviderAppointmentModalityId.VIRTUAL]: <SvgIcon kit="far" icon="laptop-mobile" size={16} className="me-2" />,
	};

	return iconMap[providerAppointmentModalityId];
};

export default ProviderInfoDetail;
