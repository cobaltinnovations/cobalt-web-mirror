import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import ProviderSearchResult from '@/components/provider-search-result';
import ProviderScheduleModal, {
	createProviderScheduleModalConfig,
	ProviderScheduleModalConfig,
} from '@/components/provider-schedule-modal';
import ProviderInfoDetail from '@/components/provider-info-detail';
import {
	AnalyticsNativeEventProviderSearchResultActionId,
	AnalyticsNativeEventProviderSearchResultSourceId,
	AnalyticsNativeEventTypeId,
	InstitutionFeature,
	InstitutionLocation,
	ProviderSearchResultModel,
	ProviderSearchResultTypeId,
} from '@/lib/models';
import { accountService, analyticsService, institutionService, providerService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { useLocation, useNavigate, useRevalidator, useSearchParams } from 'react-router-dom';
import NoData from '@/components/no-data';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import useHandleError from '@/hooks/use-handle-error';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import EmployerSelectionModal from '@/components/employer-selection-modal';
import {
	ALL_INSTITUTION_LOCATIONS_ID,
	buildBookingV2UrlWithV1Fallback,
	buildProviderBookingAnalyticsData,
	getBookingV1FallbackUrlFromSearchParams,
	getEffectiveProviderSearchFeatureId,
	getPersistedInstitutionLocationId,
	getProviderSearchInstitutionLocationIdForAccount,
	isAllInstitutionLocationsId,
	setFirstAvailableAppointmentSearchParams,
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

	if (!firstAvailableAppointment || !provider.appointmentSelectionTypeId) {
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
	if (provider.providerSearchResultId) {
		params.set('providerSearchResultId', provider.providerSearchResultId);
	}
	params.set('appointmentSelectionTypeId', provider.appointmentSelectionTypeId);

	const appointmentModalityId = provider.supportedAppointmentModalities[0]?.appointmentModalityId;

	if (appointmentModalityId) {
		params.set('appointmentModalityId', appointmentModalityId);
	}

	setFirstAvailableAppointmentSearchParams(params, firstAvailableAppointment);

	return buildBookingV2UrlWithV1Fallback(
		`/provider-confirm-appointment-time?${params.toString()}`,
		bookingV1FallbackUrl
	);
};

interface ProviderSearchResultWithScreeningProps {
	featureId: string;
	institutionLocationId: string;
	provider: ProviderSearchResultModel;
	onTitleButtonClick(): void;
	onViewAppointmentsButtonClick(): void;
}

const ProviderReferralScreeningLauncher = ({ screeningFlowId }: { screeningFlowId: string }) => {
	const didStartRef = useRef(false);
	const handleError = useHandleError();
	const {
		didCheckScreeningSessions,
		startScreeningFlow,
		renderedCollectPhoneModal,
		renderedPreScreeningLoader,
		renderedAccountSourcesModal,
	} = useScreeningFlow({
		screeningFlowId,
		instantiateOnLoad: false,
	});

	useEffect(() => {
		if (!didCheckScreeningSessions || didStartRef.current) {
			return;
		}

		didStartRef.current = true;
		startScreeningFlow().catch(handleError);
	}, [didCheckScreeningSessions, handleError, startScreeningFlow]);

	return (
		<>
			{renderedPreScreeningLoader ?? (
				<>
					{renderedCollectPhoneModal}
					{renderedAccountSourcesModal}
				</>
			)}
		</>
	);
};

export const ProviderSearchResultWithScreening = ({
	featureId,
	institutionLocationId,
	provider,
	onTitleButtonClick,
	onViewAppointmentsButtonClick,
}: ProviderSearchResultWithScreeningProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [referralScreeningLaunchSequence, setReferralScreeningLaunchSequence] = useState(0);
	const bookingV1FallbackUrl = useMemo(
		() => getBookingV1FallbackUrlFromSearchParams(new URLSearchParams(location.search)),
		[location.search]
	);
	const isReferralBooking = Boolean(provider.referralBooking?.intakeScreeningFlowId);
	const persistSearchResultClick = useCallback(
		(action: AnalyticsNativeEventProviderSearchResultActionId) => {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PROVIDER_SEARCH_RESULT, {
				...buildProviderBookingAnalyticsData({
					featureId,
					institutionLocationId,
					providerSearchResultId: provider.providerSearchResultId,
					providerSearchResultTypeId: provider.providerSearchResultTypeId,
					providerId: provider.providerId,
					clinicId: provider.clinicId,
					screeningFlowId: provider.referralBooking?.intakeScreeningFlowId,
				}),
				action,
				source: AnalyticsNativeEventProviderSearchResultSourceId.LIST,
			});
		},
		[featureId, institutionLocationId, provider]
	);

	return (
		<>
			{isReferralBooking &&
				referralScreeningLaunchSequence > 0 &&
				provider.referralBooking?.intakeScreeningFlowId && (
					<ProviderReferralScreeningLauncher
						key={referralScreeningLaunchSequence}
						screeningFlowId={provider.referralBooking.intakeScreeningFlowId}
					/>
				)}
			<ProviderSearchResult
				className="mb-6"
				provider={provider}
				onTitleButtonClick={() => {
					persistSearchResultClick(AnalyticsNativeEventProviderSearchResultActionId.VIEW_DETAILS);
					onTitleButtonClick();
				}}
				onViewAppointmentsButtonClick={() => {
					persistSearchResultClick(AnalyticsNativeEventProviderSearchResultActionId.VIEW_MORE_APPOINTMENTS);
					onViewAppointmentsButtonClick();
				}}
				onScheduleAppointmentButtonClick={() => {
					if (isReferralBooking) {
						persistSearchResultClick(AnalyticsNativeEventProviderSearchResultActionId.CHECK_ELIGIBILITY);
						setReferralScreeningLaunchSequence((previousSequence) => previousSequence + 1);
						return;
					}

					persistSearchResultClick(AnalyticsNativeEventProviderSearchResultActionId.SCHEDULE_APPOINTMENT);

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
		</>
	);
};

export const Component = () => {
	/* -------------------------------- */
	/* General */
	/* -------------------------------- */
	const handleError = useHandleError();
	const { account, institution } = useAccount();
	const { revalidate } = useRevalidator();
	const careTypeRef = useRef<HTMLInputElement>(null);
	const employerRef = useRef<HTMLInputElement>(null);
	const forcedLocationPersistenceKeyRef = useRef<string | undefined>(undefined);
	const employerSelectionSequenceRef = useRef(0);

	/* -------------------------------- */
	/* Search Params */
	/* -------------------------------- */
	const [searchParams, setSearchParams] = useSearchParams();
	const featureId = useMemo(() => getEffectiveProviderSearchFeatureId(searchParams.get('featureId')), [searchParams]);
	const requestedInstitutionLocationId = useMemo(
		() => searchParams.get('institutionLocationId') ?? '',
		[searchParams]
	);
	const savedInstitutionLocationId = getProviderSearchInstitutionLocationIdForAccount(account);
	const institutionLocationId = requestedInstitutionLocationId || savedInstitutionLocationId || '';
	const bookingV1FallbackUrl = useMemo(() => getBookingV1FallbackUrlFromSearchParams(searchParams), [searchParams]);
	const forceLocation = useMemo(() => {
		const v = searchParams.get('forceLocation');
		return v?.toLowerCase() === 'true';
	}, [searchParams]);
	useEffect(() => {
		if (requestedInstitutionLocationId || !savedInstitutionLocationId) {
			return;
		}

		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);
				nextSearchParams.set('institutionLocationId', savedInstitutionLocationId);
				return nextSearchParams;
			},
			{ replace: true }
		);
	}, [requestedInstitutionLocationId, savedInstitutionLocationId, setSearchParams]);

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
	const [showEmployerModal, setShowEmployerModal] = useState(false);
	const [selectedEmployerId, setSelectedEmployerId] = useState('');
	const openEmployerModal = useCallback(() => {
		setSelectedEmployerId(institutionLocationId);
		setShowEmployerModal(true);
	}, [institutionLocationId]);

	const persistEmployerSelection = useCallback(
		async (selectedInstitutionLocationId: string) => {
			const selectionSequence = ++employerSelectionSequenceRef.current;

			if (!selectedInstitutionLocationId) {
				setSearchParams(
					(currentSearchParams) => {
						const nextSearchParams = new URLSearchParams(currentSearchParams);
						nextSearchParams.delete('institutionLocationId');
						return nextSearchParams;
					},
					{ replace: true }
				);
				return;
			}

			let persistedInstitutionLocationId = selectedInstitutionLocationId;
			try {
				if (account) {
					const response = await accountService
						.setAccountLocation(account.accountId, {
							accountId: account.accountId,
							institutionLocationId: getPersistedInstitutionLocationId(selectedInstitutionLocationId),
						})
						.fetch();

					if (response.account.institutionLocationId) {
						persistedInstitutionLocationId = response.account.institutionLocationId;
					}

					await revalidate();
				}
			} catch (error) {
				handleError(error);
			} finally {
				if (selectionSequence !== employerSelectionSequenceRef.current) {
					return;
				}

				setSearchParams(
					(currentSearchParams) => {
						const nextSearchParams = new URLSearchParams(currentSearchParams);
						nextSearchParams.set('institutionLocationId', persistedInstitutionLocationId);
						return nextSearchParams;
					},
					{ replace: true }
				);
			}
		},
		[account, handleError, revalidate, setSearchParams]
	);

	const shouldPersistForcedLocation = Boolean(account && forceLocation && institutionLocationId);
	const persistForcedLocation = useCallback(async () => {
		if (!account || !institutionLocationId) {
			return;
		}
		const institutionLocationIdBeingPersisted = institutionLocationId;

		try {
			const accountInstitutionLocationId = getPersistedInstitutionLocationId(institutionLocationId);
			const response = await accountService
				.setAccountLocation(account.accountId, {
					accountId: account.accountId,
					institutionLocationId: accountInstitutionLocationId,
				})
				.fetch();
			await revalidate();

			setSearchParams(
				(currentSearchParams) => {
					if (currentSearchParams.get('institutionLocationId') !== institutionLocationIdBeingPersisted) {
						return currentSearchParams;
					}

					const nextSearchParams = new URLSearchParams(currentSearchParams);

					if (response.account.institutionLocationId) {
						nextSearchParams.set('institutionLocationId', response.account.institutionLocationId);
					} else if (isAllInstitutionLocationsId(institutionLocationIdBeingPersisted)) {
						nextSearchParams.set('institutionLocationId', ALL_INSTITUTION_LOCATIONS_ID);
					} else {
						nextSearchParams.delete('institutionLocationId');
					}
					nextSearchParams.delete('forceLocation');
					return nextSearchParams;
				},
				{ replace: true }
			);
		} catch (error) {
			handleError(error);
		}
	}, [account, handleError, institutionLocationId, revalidate, setSearchParams]);
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
	const providerSearchRequestRef = useRef<ReturnType<typeof providerService.searchProviders>>();
	const providerSearchSequenceRef = useRef(0);
	const providerSearchFilterKeyRef = useRef('');
	providerSearchFilterKeyRef.current = `${featureId}|${institutionLocationId}`;
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
						onClick: openEmployerModal,
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
						onClick: openEmployerModal,
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
		openEmployerModal,
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

	const abortProviderSearch = useCallback(() => {
		providerSearchSequenceRef.current += 1;
		providerSearchRequestRef.current?.abort();
		providerSearchRequestRef.current = undefined;
	}, []);

	const fetchProviders = useCallback(async () => {
		const searchSequence = ++providerSearchSequenceRef.current;
		const searchFilterKey = `${featureId}|${institutionLocationId}`;
		providerSearchRequestRef.current?.abort();

		if (!featureId || !institutionLocationId) {
			if (searchSequence === providerSearchSequenceRef.current) {
				setProviders([]);
			}
			return;
		}
		setProviders([]);

		const request = providerService.searchProviders({
			featureId,
			institutionLocationId,
		});
		providerSearchRequestRef.current = request;

		try {
			const response = await request.fetch();

			if (
				searchSequence === providerSearchSequenceRef.current &&
				searchFilterKey === providerSearchFilterKeyRef.current
			) {
				setProviders(response.providers);
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_PROVIDERS, {
					...buildProviderBookingAnalyticsData({ featureId, institutionLocationId }),
					resultCount: response.providers.length,
					providerSearchResults: response.providers.map((provider) => ({
						providerSearchResultId: provider.providerSearchResultId,
						providerSearchResultTypeId: provider.providerSearchResultTypeId,
						providerId: provider.providerId,
						clinicId: provider.clinicId,
					})),
				});
			}
		} catch (error) {
			if (
				searchSequence === providerSearchSequenceRef.current &&
				searchFilterKey === providerSearchFilterKeyRef.current
			) {
				throw error;
			}
		} finally {
			if (providerSearchRequestRef.current === request) {
				providerSearchRequestRef.current = undefined;
			}
		}
	}, [featureId, institutionLocationId]);

	const handleCareTypeSelectChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFeatureId = currentTarget.value;
			setSearchParams(
				(currentSearchParams) => {
					const nextSearchParams = new URLSearchParams(currentSearchParams);

					if (selectedFeatureId) {
						nextSearchParams.set('featureId', selectedFeatureId);
					} else {
						nextSearchParams.delete('featureId');
					}

					return nextSearchParams;
				},
				{ replace: true }
			);
		},
		[setSearchParams]
	);

	const handleEmployerSelectChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			await persistEmployerSelection(currentTarget.value);
		},
		[persistEmployerSelection]
	);

	return (
		<>
			<IneligibleBookingModal />
			<EmployerSelectionModal
				show={showEmployerModal}
				institutionLocations={institutionLocations}
				selectedInstitutionLocationId={selectedEmployerId}
				onInstitutionLocationSelect={setSelectedEmployerId}
				onContinue={() => {
					persistEmployerSelection(selectedEmployerId).then(() => {
						setShowEmployerModal(false);
					});
				}}
				onHide={() => {
					setShowEmployerModal(false);
				}}
			/>
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
						flushHeader
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
				<AsyncWrapper fetchData={fetchProviders} abortFetch={abortProviderSearch}>
					<Row>
						<Col>
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
											setProviderScheduleModalConfig(
												createProviderScheduleModalConfig({
													featureId,
													institutionLocationId,
													provider,
													bookingV1FallbackUrl,
												})
											);
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
