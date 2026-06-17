import React, { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import ProviderScheduleCard from '@/components/provider-schedule-card';
import ProviderScheduleModal from './provider-schedule-modal';
import AsyncWrapper from './async-page';
import {
	Clinic,
	Provider,
	ProviderAppointmentModalityId,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { clinicService, providerService } from '@/lib/services';
import SvgIcon from './svg-icon';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';

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
	const [providerSearchResult, setProviderSearchResult] = useState<ProviderSearchResultModel>();

	const providerScheduleModalConfig = useMemo(() => {
		if (!providerSearchResult) {
			return;
		}

		return {
			featureId,
			institutionLocationId,
			clinicId: providerSearchResult.clinicId ?? undefined,
			providerId: providerSearchResult.providerId ?? undefined,
			providerSearchResultTypeId: providerSearchResult.providerSearchResultTypeId,
		};
	}, [featureId, institutionLocationId, providerSearchResult]);

	const fetchData = useCallback(async () => {
		if (!providerId && !clinicId) {
			throw new Error('providerId and clinicId are undefined.');
		}

		const providerSearchResultsRequest = providerService
			.searchProviders({
				...(featureId ? { featureId } : {}),
				...(institutionLocationId ? { institutionLocationId } : {}),
			})
			.fetch();

		if (providerId) {
			const [providerResponse, providerSearchResultsResponse] = await Promise.all([
				providerService.getProviderById(providerId).fetch(),
				providerSearchResultsRequest,
			]);

			setProvider(providerResponse.provider);
			setClinic(undefined);
			setProviderSearchResult(
				providerSearchResultsResponse.providers.find(
					(providerSearchResult) =>
						providerSearchResult.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER &&
						providerSearchResult.providerId === providerId
				)
			);
		} else if (clinicId) {
			const [clinicResponse, providerSearchResultsResponse] = await Promise.all([
				clinicService.getClinicByClinicId(clinicId).fetch(),
				providerSearchResultsRequest,
			]);

			setProvider(undefined);
			setClinic(clinicResponse.clinic);
			setProviderSearchResult(
				providerSearchResultsResponse.providers.find(
					(providerSearchResult) =>
						providerSearchResult.providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC &&
						providerSearchResult.clinicId === clinicId
				)
			);
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
					<Row>
						<Col xs={12} xl={7}>
							<Row>
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
							</Row>
							<Row>
								<div dangerouslySetInnerHTML={{ __html: provider?.bio ?? clinic?.description ?? '' }} />
							</Row>
						</Col>
						<Col xs={12} xl={5}>
							{providerSearchResult && (
								<ProviderInfoDetailSchedule
									featureId={featureId}
									institutionLocationId={institutionLocationId}
									providerSearchResult={providerSearchResult}
									onViewAppointmentsButtonClick={() => {
										setShowProviderScheduleModal(true);
									}}
								/>
							)}
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
	providerSearchResult: ProviderSearchResultModel;
	onViewAppointmentsButtonClick(): void;
}

const buildProviderConfirmAppointmentTimeUrl = ({
	featureId,
	institutionLocationId,
	providerSearchResult,
}: {
	featureId?: string;
	institutionLocationId?: string;
	providerSearchResult: ProviderSearchResultModel;
}) => {
	const firstAvailableAppointment = providerSearchResult.firstAvailableAppointment;

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

	if (providerSearchResult.providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC) {
		if (!providerSearchResult.clinicId) {
			return;
		}

		params.set('clinicId', providerSearchResult.clinicId);
	}

	if (providerSearchResult.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER) {
		if (!providerSearchResult.providerId) {
			return;
		}

		params.set('providerId', providerSearchResult.providerId);
	}

	params.set('providerSearchResultTypeId', providerSearchResult.providerSearchResultTypeId);

	const appointmentModalityId = providerSearchResult.supportedAppointmentModalities[0]?.appointmentModalityId;

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

const ProviderInfoDetailSchedule = ({
	featureId,
	institutionLocationId,
	providerSearchResult,
	onViewAppointmentsButtonClick,
}: ProviderInfoDetailScheduleProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const screeningRequired =
		providerSearchResult.screeningRequirement?.screeningRequired &&
		!providerSearchResult.screeningRequirement?.screeningSatisfied &&
		!!providerSearchResult.screeningRequirement?.screeningFlowId;
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: providerSearchResult.screeningRequirement?.screeningFlowId,
		instantiateOnLoad: false,
		disabled: !screeningRequired,
		screeningQuestionPathPrefix: '/screening-questions-fullscreen',
		screeningQuestionSearch: new URLSearchParams({
			returnTo: location.pathname + location.search,
		}).toString(),
	});

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			{renderedCollectPhoneModal}
			<ProviderScheduleCard
				scheduleAppointmentDescription={providerSearchResult.appointmentDescription ?? ''}
				scheduleTypeId={providerSearchResult.appointmentSelectionTypeId}
				firstAvailableAppointment={providerSearchResult.firstAvailableAppointment ?? undefined}
				onScheduleAppointmentButtonClick={() => {
					if (screeningRequired) {
						startScreeningFlow();
						return;
					}

					const providerConfirmAppointmentTimeUrl = buildProviderConfirmAppointmentTimeUrl({
						featureId,
						institutionLocationId,
						providerSearchResult,
					});

					if (providerConfirmAppointmentTimeUrl) {
						navigate(providerConfirmAppointmentTimeUrl);
					}
				}}
				onViewAppointmentsButtonClick={onViewAppointmentsButtonClick}
				showMoreAppointmentsButton={providerSearchResult.hasMoreAppointments}
				phoneNumber={providerSearchResult.phoneNumber}
				phoneNumberDescription={providerSearchResult.phoneNumberDescription}
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
