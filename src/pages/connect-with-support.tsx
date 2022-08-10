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
import { getRandomPlaceholderImage } from '@/hooks/use-random-placeholder-image';

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

import { providerService, FindOptionsResponse, FindFilters, screeningService } from '@/lib/services';
import { Provider, AssessmentScore, Clinic, SupportRoleId } from '@/lib/models';

import { BookingContext, SearchResult, BookingFilters, BookingSource, FILTER_DAYS } from '@/contexts/booking-context';
import { ERROR_CODES } from '@/lib/http-client';
import Accordion from '@/components/accordion';
import useHandleError from '@/hooks/use-handle-error';
import FilterSpecialtyModal from '@/components/filter-specialty-modal';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import { createUseThemedStyles } from '@/jss/theme';

const isClinicResult = (result: Provider | Clinic): result is Clinic => {
	return typeof (result as Clinic).clinicId === 'string';
};

const mapProviderToResult = (provider: Provider): SearchResult => ({
	id: provider.providerId,
	imageUrl: provider.imageUrl,
	type: 'provider',
	displayName: provider.name + (provider.license ? `, ${provider.license}` : ''),
	description: provider.supportRolesDescription,
});

const mapClinicToResult = (clinic: Clinic): SearchResult => ({
	id: clinic.clinicId,
	type: 'clinic',
	imageUrl: getRandomPlaceholderImage() as any,
	displayName: clinic.description,
});

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
	const { account, subdomainInstitution } = useAccount();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();
	const bookingRef = useRef<BookingRefHandle>(null);

	const typeAheadRef = useRef<any>(null);
	const [didInit, setDidInit] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSearching, setIsSearching] = useState(false);
	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();
	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);

	const [recentProviders, setRecentProviders] = useState<SearchResult[]>([]);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [recommendationHtml, setRecommendationHtml] = useState<string>('');

	const [assessmentScore, setAssessmentScore] = useState<AssessmentScore>();
	const [openFilterModal, setOpenFilterModal] = useState<BookingFilters | null>(null);
	const {
		setAppointmentTypes,
		setEpicDepartments,
		availableSections,
		setAvailableSections,

		selectedSearchResult,
		setSelectedSearchResult,
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
	const [isSpecialtiesFilterEnabled, setIsSpecialtiesFilterEnabled] = useState(true);
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
	const recommendedTherapistPsychiatrist =
		findOptions?.recommendedSupportRoleIds.includes(SupportRoleId.Clinician) ||
		findOptions?.recommendedSupportRoleIds.includes(SupportRoleId.Psychiatrist);
	const providerTypeFilter = searchParams.getAll('supportRoleId');
	const filterEapTherapistPsychiatrist =
		providerTypeFilter.includes(SupportRoleId.CareManager) ||
		providerTypeFilter.includes(SupportRoleId.Clinician) ||
		providerTypeFilter.includes(SupportRoleId.Psychiatrist);

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

	useEffect(() => {
		const isImmediate = Cookies.get('immediateAccess');

		if (
			subdomainInstitution?.providerTriageScreeningFlowId &&
			!isImmediate &&
			!skipAssessment &&
			didInit &&
			!hasCompletedScreening
		) {
			navigate(`/screening-flows/${subdomainInstitution.providerTriageScreeningFlowId}`, {
				replace: true,
			});
		}
	}, [
		didInit,
		navigate,
		subdomainInstitution?.providerTriageScreeningFlowId,
		location.search,
		skipAssessment,
		hasCompletedScreening,
	]);

	const institutionId = account?.institutionId ?? '';
	const providerTriageScreeningFlowId = subdomainInstitution?.providerTriageScreeningFlowId ?? '';
	useEffect(() => {
		if (didInit || !institutionId || !providerTriageScreeningFlowId) {
			return;
		}

		const findOptionsRequest = providerService.fetchFindOptions({
			supportRoleIds: searchParams.getAll('supportRoleId'),
			institutionId,
		});
		const fetchRecentRequest = providerService.fetchRecentProviders();
		const fetchScreeningsRequest = screeningService.getScreeningSessionsByFlowId({
			screeningFlowId: providerTriageScreeningFlowId,
		});

		async function init() {
			try {
				const [findOptions, recent, screenings] = await Promise.all([
					findOptionsRequest.fetch(),
					fetchRecentRequest.fetch(),
					fetchScreeningsRequest.fetch(),
				]);

				unstable_batchedUpdates(() => {
					setRecentProviders(recent.providers.map(mapProviderToResult));
					setFindOptions(findOptions);
					setRecommendationHtml(findOptions.recommendationHtml);
					setAssessmentScore(findOptions.scores);
					setHasCompletedScreening(screenings.screeningSessions.some((session) => session.completed));
					setDidInit(true);
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
			fetchScreeningsRequest.abort();
		};
	}, [didInit, handleError, institutionId, providerTriageScreeningFlowId, searchParams]);

	useEffect(() => {
		if (!didInit) {
			return;
		}

		const selectedSearchEntityId = selectedSearchResult[0] ? selectedSearchResult[0].id : undefined;
		const providerId = searchParams.get('providerId');
		const clinicIds = searchParams.getAll('clinicId');

		if (
			(providerId && providerId === selectedSearchEntityId) ||
			(clinicIds.length && clinicIds[0] === selectedSearchEntityId)
		) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		let findFilters: FindFilters;

		if (selectedSearchEntityId && selectedSearchResult[0].type === 'provider') {
			findFilters = { providerId: selectedSearchEntityId };
		} else if (selectedSearchEntityId) {
			findFilters = { clinicIds: [selectedSearchEntityId] };
		} else if (providerId) {
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
				setIsSpecialtiesFilterEnabled(showSpecialties);
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
		didInit,
		findOptions?.defaultAvailability,
		findOptions?.defaultEndDate,
		findOptions?.defaultEndTime,
		findOptions?.defaultStartDate,
		findOptions?.defaultStartTime,
		findOptions?.defaultSupportRoleIds,
		findOptions?.defaultVisitTypeIds,
		handleError,
		searchParams,
		selectedSearchResult,
		setAppointmentTypes,
		setAvailableSections,
		setEpicDepartments,
		setSelectedSearchResult,
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

	if (!didInit) {
		return <Loader />;
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
					<p className="mb-0 text-center" dangerouslySetInnerHTML={{ __html: recommendationHtml }} />
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
								title="payment options vary by provider"
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
									placeholder="search for provider or entity"
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
									onChange={(selectedOptions) => {
										setSelectedSearchResult(selectedOptions as SearchResult[]);
										(typeAheadRef.current as any).blur();
									}}
									options={searchQuery ? searchResults : recentProviders}
									selected={selectedSearchResult}
									renderMenu={(options, menuProps) => {
										const results = options as SearchResult[];
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
									onClick={() => setOpenFilterModal(BookingFilters.Date)}
								>
									Days
								</FilterPill>
								<FilterPill
									active={activeFilters[BookingFilters.Time]}
									onClick={() => setOpenFilterModal(BookingFilters.Time)}
								>
									Times
								</FilterPill>
								<FilterPill
									active={activeFilters[BookingFilters.Provider]}
									onClick={() => setOpenFilterModal(BookingFilters.Provider)}
								>
									Provider Type
								</FilterPill>
								<FilterPill
									active={activeFilters[BookingFilters.Availability]}
									onClick={() => setOpenFilterModal(BookingFilters.Availability)}
								>
									Availability
								</FilterPill>
								<FilterPill
									disabled={!isSpecialtiesFilterEnabled}
									active={activeFilters[BookingFilters.Specialty]}
									onClick={() => setOpenFilterModal(BookingFilters.Specialty)}
								>
									Focus
								</FilterPill>
								<FilterPill
									active={activeFilters[BookingFilters.Payment]}
									onClick={() => setOpenFilterModal(BookingFilters.Payment)}
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

			{(skipAssessment || recommendedTherapistPsychiatrist || filterEapTherapistPsychiatrist) && (
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<AvailableProvider
								className="mb-5"
								provider={{
									fullyBooked: false,
									providerId: 'xxxx-xxxx-xxxx-xxxx',
									institutionId: 'xxxx-xxxx-xxxx-xxxx',
									schedulingSystemId: '',
									name: 'Cobalt Medicine’s TEAMs Clinic',
									title: '',
									entity: '',
									clinic: '',
									license: '',
									specialty: '',
									imageUrl:
										'https://cobaltplatform.s3.us-east-2.amazonaws.com/prod/providers/cobalt-medicine-teams-clinic.jpg',
									isDefaultImageUrl: true,
									timeZone: '',
									locale: '',
									tags: [],
									times: [],
									supportRoles: [],
									appointmentTypeIds: [],
									treatmentDescription: '* Available Mon-Fri, 8:30-2 & 2:30-5',
									supportRolesDescription:
										'Time Efficient, Accessible, and Multidisciplinary approach to therapy and/or medication',
									paymentFundingDescriptions: ['Accepts Insurance'],
									intakeAssessmentRequired: false,
									skipIntakePrompt: true,
								}}
								onTimeSlotClick={() => {
									return;
								}}
							>
								<Button className="d-block" as="a" href="tel:+12155551212" variant="light" size="sm">
									Call (215) 555-1212
								</Button>
							</AvailableProvider>
						</Col>
					</Row>
				</Container>
			)}

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
