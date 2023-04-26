import Cookies from 'js-cookie';
import React, {
	FC,
	useEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
	useContext,
	RefObject,
	useLayoutEffect,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Col, Container, Row, Button } from 'react-bootstrap';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';

import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import FilterAvailabilityModal from '@/components/filter-availability-modal';
import FilterDaysModal from '@/components/filter-days-modal';
import FilterPill from '@/components/filter-pill';
import FilterProviderTypesModal from '@/components/filter-provider-types-modal';
import FilterTimesModal from '@/components/filter-times-modal';
import FilterPaymentsModal from '@/components/filter-payments-modal';
import Loader from '@/components/loader';
import AvailableProvider from '@/components/available-provider';
import RenderJson from '@/components/render-json';
import DayContainer from '@/components/day-container';
import HeroContainer from '@/components/hero-container';
import BackgroundImageContainer from '@/components/background-image-container';

import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import { ReactComponent as ClearIcon } from '@/assets/icons/icon-search-close.svg';

import { providerService, FindOptionsResponse, FindFilters } from '@/lib/services';
import { AssessmentScore, SupportRoleId } from '@/lib/models';

import {
	BookingContext,
	ProviderSearchResult,
	BookingFilters,
	BookingSource,
	FILTER_DAYS,
	isClinicResult,
	mapClinicToResult,
	mapProviderToResult,
} from '@/contexts/booking-context';
import { ERROR_CODES } from '@/lib/http-client';
import Accordion from '@/components/accordion';
import useHandleError from '@/hooks/use-handle-error';
import FilterSpecialtyModal from '@/components/filter-specialty-modal';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import { createUseThemedStyles } from '@/jss/theme';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useAnalytics from '@/hooks/use-analytics';
import ProviderListHeader from '@/components/provider-list-header';
import { useScreeningFlow } from './screening/screening.hooks';

const useConnectWithSupportStyles = createUseThemedStyles((theme) => ({
	searchIcon: {
		left: 0,
		top: '50%',
		fill: theme.colors.n900,
		position: 'absolute',
		transform: 'translateY(-50%)',
	},
	clearIcon: {
		flexShrink: 0,
		opacity: 0.32,
		cursor: 'pointer',
		fill: theme.colors.n900,
	},
	filterIcon: {
		marginTop: -1,
		marginLeft: 5,
		fill: theme.colors.n900,
	},
	infoIcon: {
		width: 28,
		marginLeft: 10,
		fill: theme.colors.p500,
	},
}));

interface HistoryLocationState {
	skipAssessment?: boolean;
	successBooking?: boolean;
	emailAddress?: string;
}

const ConnectWithSupport: FC = () => {
	const handleError = useHandleError();
	const classes = useConnectWithSupportStyles();
	const { account, institution } = useAccount();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { trackEvent } = useAnalytics();
	const { didCheckScreeningSessions, renderedCollectPhoneModal } = useScreeningFlow({
		screeningFlowId: institution?.providerTriageScreeningFlowId,
	});
	const bookingRef = useRef<BookingRefHandle>(null);

	const typeAheadRef = useRef<any>(null);
	const [didInitSearch, setDidInitSearch] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSearching, setIsSearching] = useState(false);
	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();

	const [recentProviders, setRecentProviders] = useState<ProviderSearchResult[]>([]);
	const [searchResults, setSearchResults] = useState<ProviderSearchResult[]>([]);
	const [selectedSearchResult, setSelectedSearchResult] = useState<ProviderSearchResult[]>([]);
	const [recommendationHtml, setRecommendationHtml] = useState<string>('');

	const [assessmentScore, setAssessmentScore] = useState<AssessmentScore>();
	const [openFilterModal, setOpenFilterModal] = useState<BookingFilters | null>(null);
	const {
		setAppointmentTypes,
		setEpicDepartments,
		availableSections,
		setAvailableSections,

		preservedFilterQueryString,
		setPreservedFilterQueryString,

		selectedDate,
		selectedProvider,

		getActiveFiltersState,
		isEligible,
		setIsEligible,
	} = useContext(BookingContext);
	const [searchQuery, setSearchQuery] = useState('');

	const [paymentDisclaimerOpen, setPaymentDisclaimerOpen] = useState(!Cookies.get('paymentDisclaimerSeen'));
	// const [showCopayModal, setShowCopayModal] = useState(!Cookies.get('seenWaivedCopay'));
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	// const [isSpecialtiesFilterEnabled, setIsSpecialtiesFilterEnabled] = useState(true);
	const providerRefs = useMemo(
		() =>
			availableSections.reduce((acc, section) => {
				section.providers.forEach((provider) => {
					acc[`${section.date}-${provider.providerId}`] = React.createRef();
				});

				return acc;
			}, {} as { [key: string]: RefObject<HTMLDivElement> }),
		[availableSections]
	);

	const skipAssessment = !!(location.state as HistoryLocationState)?.skipAssessment;

	const activeFilters = useMemo(() => {
		return getActiveFiltersState(findOptions);
	}, [getActiveFiltersState, findOptions]);

	const searchProviders = useCallback(
		async (query: string) => {
			setIsSearching(true);

			try {
				const response = await providerService.searchEntities(query).fetch();
				setSearchResults(
					[...response.providers, ...response.clinics].map((item) => {
						return isClinicResult(item) ? mapClinicToResult(item) : mapProviderToResult(item);
					})
				);
			} catch (e) {
				handleError(e);
			}

			setIsSearching(false);
		},
		[handleError]
	);

	const institutionId = account?.institutionId ?? '';
	useEffect(() => {
		if (didInitSearch || !didCheckScreeningSessions || !institutionId) {
			return;
		}

		const findOptionsRequest = providerService.fetchFindOptions({
			supportRoleIds: searchParams.getAll('supportRoleId'),
			institutionId,
		});
		const fetchRecentRequest = providerService.fetchRecentProviders();

		async function init() {
			try {
				const [findOptions, recent] = await Promise.all([
					findOptionsRequest.fetch(),
					fetchRecentRequest.fetch(),
				]);

				unstable_batchedUpdates(() => {
					setRecentProviders(recent.providers.map(mapProviderToResult));
					setFindOptions(findOptions);
					setRecommendationHtml(findOptions.recommendationHtml);
					setAssessmentScore(findOptions.scores);
					setDidInitSearch(true);
				});
			} catch (e) {
				if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			}
		}

		init();

		return () => {
			findOptionsRequest.abort();
			fetchRecentRequest.abort();
		};
	}, [didCheckScreeningSessions, didInitSearch, handleError, institutionId, searchParams]);

	useEffect(() => {
		if (!didInitSearch) {
			return;
		}

		const providerId = searchParams.get('providerId');
		const clinicIds = searchParams.getAll('clinicId');

		setIsLoading(true);

		let findFilters: FindFilters;

		if (providerId) {
			findFilters = { providerId };
		} else if (clinicIds.length > 0) {
			findFilters = { clinicIds };
		} else {
			const daysOfWeek = searchParams.getAll('dayOfWeek');
			const supportRoleIds = searchParams.getAll('supportRoleId') as SupportRoleId[];
			const visitTypeIds = searchParams.getAll('visitTypeId');
			const specialtyIds = searchParams.getAll('specialtyId');
			const paymentTypeIds = searchParams.getAll('paymentTypeId');

			findFilters = {
				startDate: searchParams.get('startDate') || findOptions?.defaultStartDate,
				endDate: searchParams.get('endDate') || findOptions?.defaultEndDate,
				daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : FILTER_DAYS.map((d) => d.key),
				startTime: searchParams.get('startTime') || findOptions?.defaultStartTime,
				endTime: searchParams.get('endTime') || findOptions?.defaultEndTime,
				supportRoleIds: supportRoleIds.length > 0 ? supportRoleIds : findOptions?.defaultSupportRoleIds ?? [],
				availability: searchParams.get('availability') || findOptions?.defaultAvailability,
				visitTypeIds: visitTypeIds.length > 0 ? visitTypeIds : findOptions?.defaultVisitTypeIds ?? [],
				specialtyIds,
				paymentTypeIds,
			};
		}

		const findRequest = providerService.findProviders(findFilters);

		findRequest
			.fetch()
			.then(({ appointmentTypes, epicDepartments, sections, provider, clinics, showSpecialties }) => {
				// setIsSpecialtiesFilterEnabled(showSpecialties);
				setIsLoading(false);
				setAppointmentTypes(appointmentTypes);
				setEpicDepartments(epicDepartments);
				setAvailableSections(sections);

				if (provider) {
					setSelectedSearchResult([mapProviderToResult(provider)]);
				} else if (clinics && clinics.length) {
					setSelectedSearchResult([mapClinicToResult(clinics[0])]);
				}
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					setIsLoading(false);
					handleError(e);
				}
			});

		return () => {
			findRequest.abort();
		};
	}, [
		didInitSearch,
		findOptions?.defaultAvailability,
		findOptions?.defaultEndDate,
		findOptions?.defaultEndTime,
		findOptions?.defaultStartDate,
		findOptions?.defaultStartTime,
		findOptions?.defaultSupportRoleIds,
		findOptions?.defaultVisitTypeIds,
		handleError,
		searchParams,
		setAppointmentTypes,
		setAvailableSections,
		setEpicDepartments,
	]);

	useEffect(() => {
		if (preservedFilterQueryString) {
			setSearchParams(preservedFilterQueryString, {
				replace: true,
				state: location.state,
			});
			setPreservedFilterQueryString('');
		}
	}, [location.state, preservedFilterQueryString, setPreservedFilterQueryString, setSearchParams]);

	useLayoutEffect(() => {
		if (availableSections.length === 0 || !selectedDate || !selectedProvider) {
			return;
		}

		setTimeout(() => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			providerRefs[`${selectedDate}-${selectedProvider.providerId}`].current?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}, 200);
	}, [availableSections.length, providerRefs, selectedDate, selectedProvider]);

	function handleClearSearchButtonClick() {
		if (typeAheadRef && typeAheadRef.current) {
			typeAheadRef.current.clear();
			typeAheadRef.current.blur();
			setSearchQuery('');
			setSelectedSearchResult([]);

			navigate(`/connect-with-support`, { state: location.state });
		}
	}

	const handlePaymentDisclaimerDidClose = useCallback(() => {
		Cookies.set('paymentDisclaimerSeen', 'true');
	}, []);

	if (!didInitSearch) {
		return (
			<>
				{renderedCollectPhoneModal}
				<Loader />
			</>
		);
	}

	return (
		<>
			<IneligibleBookingModal show={!isEligible} onHide={() => setIsEligible(true)} />

			{/* <CovidCopayModal
				show={showCopayModal}
				onHide={() => {
					Cookies.set('seenWaivedCopay', '1');
					setShowCopayModal(false);
				}}
			/> */}

			<FilterDaysModal
				defaultFrom={findOptions?.defaultStartDate}
				defaultTo={findOptions?.defaultEndDate}
				show={openFilterModal === BookingFilters.Date}
				onHide={() => {
					setOpenFilterModal(null);
				}}
			/>

			<FilterTimesModal
				defaultStartTime={findOptions?.defaultStartTime}
				defaultEndTime={findOptions?.defaultEndTime}
				show={openFilterModal === BookingFilters.Time}
				onHide={() => {
					setOpenFilterModal(null);
				}}
			/>

			<FilterProviderTypesModal
				providerTypes={findOptions?.supportRoles ?? []}
				recommendedTypes={findOptions?.defaultSupportRoleIds ?? []}
				show={openFilterModal === BookingFilters.Provider}
				onHide={() => {
					setOpenFilterModal(null);
				}}
			/>

			<FilterAvailabilityModal
				availabilities={findOptions?.availabilities ?? []}
				visitTypes={findOptions?.visitTypes ?? []}
				defaultAvailability={findOptions?.defaultAvailability}
				defaultVisitTypeIds={findOptions?.defaultVisitTypeIds ?? []}
				show={openFilterModal === BookingFilters.Availability}
				onHide={() => {
					setOpenFilterModal(null);
				}}
			/>

			<FilterPaymentsModal
				paymentTypes={findOptions?.paymentTypes ?? []}
				show={openFilterModal === BookingFilters.Payment}
				onHide={() => {
					setOpenFilterModal(null);
				}}
			/>

			<FilterSpecialtyModal
				specialties={findOptions?.specialties ?? []}
				show={openFilterModal === BookingFilters.Specialty}
				onHide={() => {
					setOpenFilterModal(null);
				}}
			/>

			<BookingModals ref={bookingRef} />

			<HeroContainer>
				<h2 className="mb-2 text-center">Connect with Support</h2>
				<div className="d-flex justify-content-center align-items-center">
					<div
						className="wysiwyg-display text-center"
						dangerouslySetInnerHTML={{ __html: recommendationHtml }}
					/>
					<Link to="/one-on-one-resources">
						<InfoIcon className={classes.infoIcon} />
					</Link>
				</div>
			</HeroContainer>

			<div className="border-bottom">
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<Accordion
								open={paymentDisclaimerOpen}
								onToggle={() => {
									setPaymentDisclaimerOpen(!paymentDisclaimerOpen);
								}}
								onDidClose={() => {
									handlePaymentDisclaimerDidClose();
								}}
								title="Payment options vary by provider"
							>
								<p className="pb-4 m-0">
									Payment options vary by provider. Services may be free of charge, covered by
									insurance, or self-pay, and you may choose to filter by your specific payment
									preferences. CobaltCare PPO and insurance plans through Cobalt cover most services
									with Cobalt providers. Copays and deductibles may apply.
								</p>
							</Accordion>
						</Col>
					</Row>
				</Container>
			</div>

			<div className="p-0 border-bottom">
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<div className="position-relative d-flex align-items-center">
								<SearchIcon className={classes.searchIcon} />
								<AsyncTypeahead
									placeholder="Search for Provider or Entity"
									ref={typeAheadRef}
									id="search-providers"
									filterBy={[]}
									isLoading={isSearching}
									labelKey="displayName"
									open={isSearchFocused && selectedSearchResult.length === 0}
									onSearch={searchProviders}
									onFocus={() => setIsSearchFocused(true)}
									onBlur={() => {
										if (selectedSearchResult.length === 0) {
											(typeAheadRef.current as any).clear();
											setSearchQuery('');
										}

										setIsSearchFocused(false);
									}}
									onInputChange={setSearchQuery}
									//@ts-expect-error option type
									onChange={([selectedOption]: ProviderSearchResult[]) => {
										const paramName = selectedOption.type === 'clinic' ? 'clinicId' : 'providerId';

										setSearchParams({ [paramName]: selectedOption.id }, { state: location.state });

										(typeAheadRef.current as any).blur();
									}}
									options={searchQuery ? searchResults : recentProviders}
									selected={selectedSearchResult}
									renderMenu={(
										options,
										{ newSelectionPrefix, paginationText, renderMenuItemChildren, ...menuProps }
									) => {
										const results = options as ProviderSearchResult[];
										if (!searchQuery && recentProviders.length === 0) {
											return <></>;
										}

										return (
											<Menu {...menuProps}>
												<small
													className={classNames({
														'text-muted': true,
														'text-uppercase': true,
														'mb-3': results.length,
													})}
												>
													{searchQuery ? 'Matches' : 'Your recent appointments'}
												</small>
												{results.map((result, idx) => {
													return (
														<MenuItem key={result.id} option={result} position={idx}>
															<div className="d-flex align-items-center">
																<BackgroundImageContainer
																	imageUrl={result.imageUrl}
																	size={43}
																/>
																<div className="ms-3">
																	<p className="mb-0">{result.displayName}</p>
																	{result.description && (
																		<small>{result.description}</small>
																	)}
																</div>
															</div>
														</MenuItem>
													);
												})}
											</Menu>
										);
									}}
								/>
								{selectedSearchResult.length !== 0 && (
									<ClearIcon className={classes.clearIcon} onClick={handleClearSearchButtonClick} />
								)}
							</div>
						</Col>
					</Row>
				</Container>
			</div>

			{selectedSearchResult.length === 0 && (
				<Container className="pt-5 pb-5">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<div className="d-flex align-items-center justify-content-center mb-1">
								<small className="mb-0 text-uppercase text-muted fw-bold">Filters</small>
							</div>
							<div className="d-flex justify-content-center flex-wrap">
								<FilterPill
									active={activeFilters[BookingFilters.Date] || activeFilters[BookingFilters.Days]}
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.clickFilterPill('Days'));
										setOpenFilterModal(BookingFilters.Date);
									}}
								>
									Days
								</FilterPill>
								<FilterPill
									active={activeFilters[BookingFilters.Time]}
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.clickFilterPill('Times'));
										setOpenFilterModal(BookingFilters.Time);
									}}
								>
									Times
								</FilterPill>
								<FilterPill
									active={activeFilters[BookingFilters.Provider]}
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.clickFilterPill('Provider Type'));
										setOpenFilterModal(BookingFilters.Provider);
									}}
								>
									Provider Type
								</FilterPill>
								{/* <FilterPill
									active={activeFilters[BookingFilters.Availability]}
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.clickFilterPill('Availability'));
										setOpenFilterModal(BookingFilters.Availability);
									}}
								>
									Availability
								</FilterPill> */}
								{/* <FilterPill
									disabled={!isSpecialtiesFilterEnabled}
									active={activeFilters[BookingFilters.Specialty]}
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.clickFilterPill('Focus'));
										setOpenFilterModal(BookingFilters.Specialty);
									}}
								>
									Focus
								</FilterPill> */}
								<FilterPill
									active={activeFilters[BookingFilters.Payment]}
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.clickFilterPill('Payment Type'));
										setOpenFilterModal(BookingFilters.Payment);
									}}
								>
									Payment Type
								</FilterPill>
							</div>
						</Col>

						{Object.values(activeFilters).some((active) => !!active) && (
							<Col xs={12} className="mt-2 text-center">
								<Button
									type="button"
									variant="link"
									className="p-0 mb-1"
									size="sm"
									onClick={() => {
										trackEvent(ProviderSearchAnalyticsEvent.resetFilters());

										setSearchParams({}, { state: location.state });
									}}
								>
									Reset Filters
								</Button>
							</Col>
						)}
					</Row>
				</Container>
			)}

			<ProviderListHeader {...{ skipAssessment, findOptions }} />

			{isLoading ? (
				<div className="position-relative mt-5 h-100" style={{ minHeight: 100 }}>
					<Loader />
				</div>
			) : availableSections.length > 0 ? (
				availableSections.map((section, index) => {
					return (
						<div key={section.date}>
							<DayContainer className="mb-4">
								<p className="mb-0 fw-bold">{section.dateDescription}</p>
							</DayContainer>

							<Container>
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										{section.fullyBooked ? (
											<p className="mb-4">
												<strong>all appointments are booked for this date</strong>
											</p>
										) : (
											section.providers.map((provider) => {
												return (
													<AvailableProvider
														ref={providerRefs[`${section.date}-${provider.providerId}`]}
														key={provider.providerId}
														className="mb-5"
														provider={provider}
														onTimeSlotClick={(timeSlot) => {
															bookingRef.current?.kickoffBookingProcess({
																source: BookingSource.ProviderSearch,
																exitUrl: `${location.pathname}${location.search}`,
																provider,
																date: section.date,
																timeSlot,
															});
														}}
													/>
												);
											})
										)}
									</Col>
								</Row>
							</Container>
						</div>
					);
				})
			) : (
				<Container>
					<Row className={classNames({ 'mt-3': selectedSearchResult.length !== 0 })}>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="text-center mb-0">
								<strong>No appointments are available.</strong>
							</p>
						</Col>
					</Row>
				</Container>
			)}

			<Container>
				<Row>
					<Col>
						<RenderJson json={{ scores: assessmentScore, availableSections: availableSections }} />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ConnectWithSupport;
