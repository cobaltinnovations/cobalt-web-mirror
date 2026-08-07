import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import ProviderSearchResult from '@/components/provider-search-result';
import ProviderScheduleModal, { ProviderScheduleModalConfig } from '@/components/provider-schedule-modal';
import ProviderInfoDetail from '@/components/provider-info-detail';
import {
	InstitutionFeature,
	InstitutionLocation,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { accountService, institutionService, providerService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import NoData from '@/components/no-data';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import useHandleError from '@/hooks/use-handle-error';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import {
	ALL_INSTITUTION_LOCATIONS_ID,
	BOOKING_V1_FALLBACK_URL_SEARCH_PARAM,
	buildBookingV2UrlWithV1Fallback,
	getBookingV1FallbackUrlFromSearchParams,
	getEffectiveProviderSearchFeatureId,
	getPersistedInstitutionLocationId,
	isAllInstitutionLocationsId,
} from '@/lib/utils';

export const loader = () => {
	return null;
};

const buildProviderConfirmAppointmentTimeUrl = ({
	featureId,
	institutionLocationId,
	provider,
	bookingV1FallbackUrl,
}: {
	featureId: string;
	institutionLocationId: string;
	provider: ProviderSearchResultModel;
	bookingV1FallbackUrl?: string;
}) => {
	const firstAvailableAppointment = provider.firstAvailableAppointment;

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

	if (provider.providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC) {
		if (!provider.clinicId) {
			return;
		}

		params.set('clinicId', provider.clinicId);
	}

	if (provider.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER) {
		if (!provider.providerId) {
			return;
		}

		params.set('providerId', provider.providerId);
	}

	params.set('providerSearchResultTypeId', provider.providerSearchResultTypeId);
	params.set('appointmentSelectionTypeId', provider.appointmentSelectionTypeId);

	const appointmentModalityId = provider.supportedAppointmentModalities[0]?.appointmentModalityId;

	if (appointmentModalityId) {
		params.set('appointmentModalityId', appointmentModalityId);
	}

	params.set('date', firstAvailableAppointment.date);
	params.set('time', firstAvailableAppointment.time);

	if (firstAvailableAppointment.appointmentTypeId) {
		params.set('appointmentTypeId', firstAvailableAppointment.appointmentTypeId);
	}

	if (firstAvailableAppointment.epicDepartmentId) {
		params.set('epicDepartmentId', firstAvailableAppointment.epicDepartmentId);
	}

	if (firstAvailableAppointment.epicAppointmentFhirId) {
		params.set('epicAppointmentFhirId', firstAvailableAppointment.epicAppointmentFhirId);
	}

	return buildBookingV2UrlWithV1Fallback(
		`/provider-confirm-appointment-time?${params.toString()}`,
		bookingV1FallbackUrl
	);
};

const appointmentBookingContextForProviderSearchResult = ({
	featureId,
	institutionLocationId,
	provider,
	bookingV1FallbackUrl,
}: {
	featureId: string;
	institutionLocationId: string;
	provider: ProviderSearchResultModel;
	bookingV1FallbackUrl?: string;
}) => {
	const context: Record<string, string> = {};
	const firstAvailableAppointment = provider.firstAvailableAppointment;

	if (featureId) {
		context.featureId = featureId;
	}

	if (institutionLocationId) {
		context.institutionLocationId = institutionLocationId;
	}

	if (bookingV1FallbackUrl) {
		context[BOOKING_V1_FALLBACK_URL_SEARCH_PARAM] = bookingV1FallbackUrl;
	}

	if (provider.providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC) {
		if (!provider.clinicId) {
			return;
		}

		context.clinicId = provider.clinicId;
	}

	if (provider.providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER) {
		if (!provider.providerId) {
			return;
		}

		context.providerId = provider.providerId;
	}

	context.providerSearchResultTypeId = provider.providerSearchResultTypeId;
	context.appointmentSelectionTypeId = provider.appointmentSelectionTypeId;

	const appointmentModalityId = provider.supportedAppointmentModalities[0]?.appointmentModalityId;

	if (appointmentModalityId) {
		context.appointmentModalityId = appointmentModalityId;
	}

	if (firstAvailableAppointment) {
		context.date = firstAvailableAppointment.date;
		context.time = firstAvailableAppointment.time;

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

interface ProviderSearchResultWithScreeningProps {
	featureId: string;
	institutionLocationId: string;
	provider: ProviderSearchResultModel;
	onTitleButtonClick(): void;
	onViewAppointmentsButtonClick(): void;
}

const ProviderSearchResultWithScreening = ({
	featureId,
	institutionLocationId,
	provider,
	onTitleButtonClick,
	onViewAppointmentsButtonClick,
}: ProviderSearchResultWithScreeningProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const bookingV1FallbackUrl = useMemo(
		() => getBookingV1FallbackUrlFromSearchParams(new URLSearchParams(location.search)),
		[location.search]
	);
	const screeningRequired =
		provider.screeningRequirement?.screeningRequired &&
		!provider.screeningRequirement?.screeningSatisfied &&
		!!provider.screeningRequirement?.screeningFlowId;
	const appointmentBookingContext = useMemo(
		() =>
			appointmentBookingContextForProviderSearchResult({
				featureId,
				institutionLocationId,
				provider,
				bookingV1FallbackUrl,
			}),
		[bookingV1FallbackUrl, featureId, institutionLocationId, provider]
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
			screeningFlowId: provider.screeningRequirement?.screeningFlowId,
			instantiateOnLoad: false,
			disabled: !screeningRequired,
			screeningQuestionPathPrefix: '/screening-questions-fullscreen',
			screeningQuestionSearch,
			...(appointmentBookingContext && { metadata: { appointmentBooking: appointmentBookingContext } }),
		});

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<React.Fragment>
			{renderedCollectPhoneModal}
			{renderedAccountSourcesModal}
			<ProviderSearchResult
				className="mb-6"
				provider={provider}
				onTitleButtonClick={onTitleButtonClick}
				onViewAppointmentsButtonClick={onViewAppointmentsButtonClick}
				onScheduleAppointmentButtonClick={() => {
					if (screeningRequired) {
						startScreeningFlow(true);
						return;
					}

					const providerConfirmAppointmentTimeUrl = buildProviderConfirmAppointmentTimeUrl({
						featureId,
						institutionLocationId,
						provider,
						bookingV1FallbackUrl,
					});

					if (providerConfirmAppointmentTimeUrl) {
						navigate(providerConfirmAppointmentTimeUrl);
					}
				}}
			/>
		</React.Fragment>
	);
};

export const Component = () => {
	/* -------------------------------- */
	/* General */
	/* -------------------------------- */
	const handleError = useHandleError();
	const { account, institution } = useAccount();
	const careTypeRef = useRef<HTMLInputElement>(null);
	const employerRef = useRef<HTMLInputElement>(null);
	const forcedLocationPersistenceKeyRef = useRef<string | undefined>(undefined);

	/* -------------------------------- */
	/* Search Params */
	/* -------------------------------- */
	const [searchParams, setSearchParams] = useSearchParams();
	const featureId = useMemo(
		() => getEffectiveProviderSearchFeatureId(searchParams.get('featureId')),
		[searchParams]
	);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);
	const bookingV1FallbackUrl = useMemo(() => getBookingV1FallbackUrlFromSearchParams(searchParams), [searchParams]);
	const forceLocation = useMemo(() => {
		const v = searchParams.get('forceLocation');
		return v?.toLowerCase() === 'true';
	}, [searchParams]);
	useEffect(() => {
		if (!account?.institutionLocationId || institutionLocationId) {
			return;
		}

		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.set('institutionLocationId', account.institutionLocationId);
		setSearchParams(nextSearchParams, { replace: true });
	}, [account?.institutionLocationId, institutionLocationId, searchParams, setSearchParams]);

	/* -------------------------------- */
	/* Filters */
	/* -------------------------------- */
	const [careTypes, setCareTypes] = useState<InstitutionFeature[]>([]);
	const institutionFeatures = institution.features;
	const [institutionLocations, setInstitutionLocations] = useState<InstitutionLocation[]>([]);
	const selectedInstitutionLocation = useMemo(
		() => institutionLocations.find((i) => i.institutionLocationId === institutionLocationId),
		[institutionLocationId, institutionLocations]
	);
	const selectedInstitutionFeature = useMemo(
		() => institutionFeatures.find((i) => i.featureId === featureId),
		[featureId, institutionFeatures]
	);
	const selectedInstitutionFeatureName = selectedInstitutionFeature?.name.toLocaleLowerCase() ?? 'matching';
	const selectedInstitutionLocationName = selectedInstitutionLocation?.name ?? 'the selected employer';

	const shouldPersistForcedLocation = Boolean(account && forceLocation && institutionLocationId);
	const persistForcedLocation = useCallback(async () => {
		if (!account || !institutionLocationId) {
			return;
		}

		try {
			const accountInstitutionLocationId = getPersistedInstitutionLocationId(institutionLocationId);
			const response = await accountService
				.setAccountLocation(account.accountId, {
					accountId: account.accountId,
					institutionLocationId: accountInstitutionLocationId,
				})
				.fetch();

			const nextSearchParams = new URLSearchParams(searchParams);

			if (response.account.institutionLocationId) {
				nextSearchParams.set('institutionLocationId', response.account.institutionLocationId);
			} else if (isAllInstitutionLocationsId(institutionLocationId)) {
				nextSearchParams.set('institutionLocationId', ALL_INSTITUTION_LOCATIONS_ID);
			} else {
				nextSearchParams.delete('institutionLocationId');
			}
			nextSearchParams.delete('forceLocation');

			setSearchParams(nextSearchParams, { replace: true });
		} catch (error) {
			handleError(error);
		}
	}, [account, handleError, institutionLocationId, searchParams, setSearchParams]);
	useEffect(() => {
		if (!account || !shouldPersistForcedLocation) {
			return;
		}

		const persistenceKey = `${account.accountId}|${institutionLocationId}`;

		if (forcedLocationPersistenceKeyRef.current === persistenceKey) {
			return;
		}

		forcedLocationPersistenceKeyRef.current = persistenceKey;
		persistForcedLocation();
	}, [account, institutionLocationId, persistForcedLocation, shouldPersistForcedLocation]);

	/* -------------------------------- */
	/* List */
	/* -------------------------------- */
	const [providers, setProviders] = useState<ProviderSearchResultModel[]>([]);
	const providerNoDataConfig = useMemo(() => {
		if (featureId && institutionLocationId && providers.length > 0) {
			return;
		}

		if (!featureId && !institutionLocationId) {
			return {
				title: 'Select a care type and employer to see available providers',
				description: 'Both care type and employer are required before providers can be shown.',
				actions: [
					{
						variant: 'primary',
						title: 'Select Care Type',
						onClick: () => {
							careTypeRef.current?.focus();
						},
					},
					{
						variant: 'primary',
						title: 'Select Employer',
						onClick: () => {
							employerRef.current?.focus();
						},
					},
				],
			};
		}

		if (!featureId) {
			return {
				title: 'Select a care type to see available providers',
				description: 'A care type is required before providers can be shown.',
				actions: [
					{
						variant: 'primary',
						title: 'Select Care Type',
						onClick: () => {
							careTypeRef.current?.focus();
						},
					},
				],
			};
		}

		if (!institutionLocationId) {
			return {
				title: 'Select your employer to see available providers',
				description: 'Your employment information will not be shared.',
				actions: [
					{
						variant: 'primary',
						title: 'Select Employer',
						onClick: () => {
							employerRef.current?.focus();
						},
					},
				],
			};
		}

		return {
			title: 'No providers available',
			description: `No ${selectedInstitutionFeatureName} providers are available for ${selectedInstitutionLocationName} employees.`,
			actions: [],
		};
	}, [
		featureId,
		institutionLocationId,
		providers.length,
		selectedInstitutionFeatureName,
		selectedInstitutionLocationName,
	]);

	/* -------------------------------- */
	/* Modals */
	/* -------------------------------- */
	const [selectedProviderIds, setSelectedProviderIds] = useState<{
		selectedTitle?: string;
		providerId?: string;
		clinicId?: string;
	}>();
	const [showProviderCanvas, setShowProviderCanvas] = useState(false);
	const [providerScheduleModalConfig, setProviderScheduleModalConfig] = useState<ProviderScheduleModalConfig>();

	const fetchFilters = useCallback(async () => {
		const [careTypesResponse, institutionLocationsResponse] = await Promise.all([
			institutionService.getCareTypes().fetch(),
			institutionService.getInstitutionLocations().fetch(),
		]);
		setCareTypes(careTypesResponse.careTypes);
		setInstitutionLocations(institutionLocationsResponse.locations);
	}, []);

	const fetchProviders = useCallback(async () => {
		if (!featureId || !institutionLocationId) {
			setProviders([]);
			return;
		}

		const response = await providerService
			.searchProviders({
				featureId,
				institutionLocationId,
			})
			.fetch();

		setProviders(response.providers);
	}, [featureId, institutionLocationId]);

	const handleCareTypeSelectChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			const nextSearchParams = new URLSearchParams(searchParams);

			if (currentTarget.value) {
				nextSearchParams.set('featureId', currentTarget.value);
			} else {
				nextSearchParams.delete('featureId');
			}

			setSearchParams(nextSearchParams, { replace: true });
		},
		[searchParams, setSearchParams]
	);

	const handleEmployerSelectChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			const nextSearchParams = new URLSearchParams(searchParams);

			if (currentTarget.value) {
				try {
					if (account) {
						const response = await accountService
							.setAccountLocation(account.accountId, {
								accountId: account.accountId,
								institutionLocationId: getPersistedInstitutionLocationId(currentTarget.value),
							})
							.fetch();

						if (response.account.institutionLocationId) {
							nextSearchParams.set('institutionLocationId', response.account.institutionLocationId);
						} else {
							nextSearchParams.set('institutionLocationId', currentTarget.value);
						}
					} else {
						nextSearchParams.set('institutionLocationId', currentTarget.value);
					}
				} catch (error) {
					handleError(error);
				} finally {
					setSearchParams(nextSearchParams, { replace: true });
				}
			} else {
				nextSearchParams.delete('institutionLocationId');
				setSearchParams(nextSearchParams, { replace: true });
			}
		},
		[account, handleError, searchParams, setSearchParams]
	);

	return (
		<>
			<IneligibleBookingModal />
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Providers</title>
			</Helmet>

			<PreviewCanvas
				title={selectedProviderIds?.selectedTitle ?? ''}
				show={showProviderCanvas}
				onHide={() => {
					setShowProviderCanvas(false);
				}}
			>
				{selectedProviderIds && (
					<ProviderInfoDetail
						providerId={selectedProviderIds.providerId}
						clinicId={selectedProviderIds.clinicId}
					/>
				)}
			</PreviewCanvas>

			<ProviderScheduleModal
				config={providerScheduleModalConfig}
				show={!!providerScheduleModalConfig}
				onHide={() => {
					setProviderScheduleModalConfig(undefined);
				}}
			/>

			<Container className="pt-10 pb-16">
				<Row className="mb-6">
					<Col>
						<h2 className="mb-2">Providers</h2>
						<p className="mb-6">
							Provider offerings may vary. Select your employer to see available providers and
							appointments.
						</p>
						<hr />
					</Col>
				</Row>
				<Row className="mb-6 mb-lg-8">
					<Col>
						<AsyncWrapper fetchData={fetchFilters}>
							<div className="d-flex">
								<InputHelper
									ref={employerRef}
									className="me-6"
									as="select"
									label="Employer"
									value={institutionLocationId}
									onChange={handleEmployerSelectChange}
								>
									<option value="" disabled>
										Select...
									</option>
									<option value={ALL_INSTITUTION_LOCATIONS_ID}>
										I'm not sure / I'd rather not say
									</option>
									{institutionLocations.map((institutionLocation) => (
										<option
											key={institutionLocation.institutionLocationId}
											value={institutionLocation.institutionLocationId}
										>
											{institutionLocation.name}
										</option>
									))}
								</InputHelper>
								<InputHelper
									ref={careTypeRef}
									as="select"
									label="Care Type"
									value={featureId}
									onChange={handleCareTypeSelectChange}
								>
									<option value="" disabled>
										Select...
									</option>
									{careTypes.map((institutionFeature) => (
										<option key={institutionFeature.featureId} value={institutionFeature.featureId}>
											{institutionFeature.name}
										</option>
									))}
								</InputHelper>
							</div>
						</AsyncWrapper>
					</Col>
				</Row>
				<AsyncWrapper fetchData={fetchProviders}>
					<Row>
						<Col>
							{featureId && institutionLocationId && (
								<p className="mb-7 mb-lg-9">
									<strong>
										{providers.length} available {selectedInstitutionFeatureName} provider
										{providers.length === 1 ? '' : 's'} for {selectedInstitutionLocationName}{' '}
										employees
									</strong>
								</p>
							)}
							{providerNoDataConfig && (
								<NoData
									title={providerNoDataConfig.title}
									description={providerNoDataConfig.description}
									actions={providerNoDataConfig.actions}
								/>
							)}
							{featureId &&
								institutionLocationId &&
								providers.map((provider, providerIndex) => (
									<ProviderSearchResultWithScreening
										key={
											provider.providerSearchResultId ??
											provider.providerId ??
											provider.clinicId ??
											`${provider.providerSearchResultTypeId}-${providerIndex}`
										}
										featureId={featureId}
										institutionLocationId={institutionLocationId}
										provider={provider}
										onTitleButtonClick={() => {
											setSelectedProviderIds({
												selectedTitle: provider.name,
												providerId: provider.providerId,
												clinicId: provider.clinicId,
											});
											setShowProviderCanvas(true);
										}}
										onViewAppointmentsButtonClick={() => {
											setProviderScheduleModalConfig({
												featureId,
												institutionLocationId,
												clinicId: provider.clinicId ?? undefined,
												providerId: provider.providerId ?? undefined,
												providerSearchResultTypeId: provider.providerSearchResultTypeId,
												appointmentSelectionTypeId: provider.appointmentSelectionTypeId,
												bookingV1FallbackUrl,
											});
										}}
									/>
								))}
						</Col>
					</Row>
				</AsyncWrapper>
			</Container>
		</>
	);
};
