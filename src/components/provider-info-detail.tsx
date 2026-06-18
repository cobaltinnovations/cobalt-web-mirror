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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvailabilityModel, clinicService, providerService } from '@/lib/services';
import SvgIcon from './svg-icon';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import ProviderInfoDetailContact from './provider-info-detail-contact';

const useStyles = createUseThemedStyles((theme) => ({
	imageOuter: {
		width: 120,
		height: 120,
		flexShrink: 0,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		[mediaQueries.md]: {
			width: 64,
			height: 64,
		},
	},
}));

interface ProviderInfoDetailProps {
	providerId?: string;
	clinicId?: string;
}

const ProviderInfoDetail = ({ providerId, clinicId }: ProviderInfoDetailProps) => {
	const classes = useStyles();
	const [searchParams] = useSearchParams();
	const featureId = useMemo(() => searchParams.get('featureId') ?? undefined, [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? undefined, [searchParams]);

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
			clinicId,
			providerId,
			providerSearchResultTypeId: providerId
				? ProviderSearchResultTypeId.PROVIDER
				: ProviderSearchResultTypeId.CLINIC,
		};
	}, [availability, clinicId, featureId, institutionLocationId, providerId]);

	const fetchData = useCallback(async () => {
		if (!providerId && !clinicId) {
			throw new Error('providerId and clinicId are undefined.');
		}

		const availabilityQueryParams = {
			...(featureId ? { featureId } : {}),
			...(institutionLocationId ? { institutionLocationId } : {}),
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
			<ProviderScheduleModal
				config={providerScheduleModalConfig}
				show={showProviderScheduleModal && !!providerScheduleModalConfig}
				onHide={() => {
					setShowProviderScheduleModal(false);
				}}
			/>

			<AsyncWrapper fetchData={fetchData}>
				<Container>
					<Row className="mb-8">
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
													<p className="mb-0">{supportedAppointmentModality.description}</p>
												</div>
											)
										)}
									</div>
								</div>
							</div>
						</Col>
					</Row>
					<Row>
						<Col xs={12} xl={7}>
							<div
								dangerouslySetInnerHTML={{ __html: provider?.detailsHtml ?? clinic?.detailsHtml ?? '' }}
							/>
						</Col>
						<Col xs={12} xl={5}>
							{availability && (
								<ProviderInfoDetailSchedule
									featureId={featureId}
									institutionLocationId={institutionLocationId}
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
			</AsyncWrapper>
		</>
	);
};

interface ProviderInfoDetailScheduleProps {
	featureId?: string;
	institutionLocationId?: string;
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
}: {
	featureId?: string;
	institutionLocationId?: string;
	availability: AvailabilityModel;
	providerId?: string;
	clinicId?: string;
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

	params.set('date', firstAvailableAppointment.date);
	params.set('time', firstAvailableAppointment.time);

	if (firstAvailableAppointment.appointmentTypeId) {
		params.set('appointmentTypeId', firstAvailableAppointment.appointmentTypeId);
	}

	return `/provider-confirm-appointment-time?${params.toString()}`;
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
	const firstAvailableAppointment = availability.firstAvailableAppointment;

	if (!firstAvailableAppointment) {
		return phoneNumber
			? ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE
			: ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED;
	}

	const appointmentTypeIds =
		firstAvailableAppointment.appointmentTypeIds ??
		(firstAvailableAppointment.appointmentTypeId ? [firstAvailableAppointment.appointmentTypeId] : []);

	return appointmentTypeIds.length <= 1
		? ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED
		: ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED;
};

const ProviderInfoDetailSchedule = ({
	featureId,
	institutionLocationId,
	provider,
	clinic,
	availability,
	providerId,
	clinicId,
	onViewAppointmentsButtonClick,
}: ProviderInfoDetailScheduleProps) => {
	const navigate = useNavigate();
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

	return (
		<>
			<ProviderScheduleCard
				scheduleAppointmentDescription={scheduleAppointmentDescription}
				scheduleTypeId={scheduleTypeId}
				firstAvailableAppointment={firstAvailableAppointment ?? undefined}
				onScheduleAppointmentButtonClick={() => {
					const providerConfirmAppointmentTimeUrl = buildProviderConfirmAppointmentTimeUrl({
						featureId,
						institutionLocationId,
						availability,
						providerId,
						clinicId,
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
