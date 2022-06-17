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
import { useHistory, Link, useLocation } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import moment from 'moment';
import classNames from 'classnames';

import useHeaderTitle from '@/hooks/use-header-title';
import useAccount from '@/hooks/use-account';
import { getRandomPlaceholderImage } from '@/hooks/use-random-placeholder-image';
import { queryParamDateRegex } from '@/lib/utils';

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
import { Provider, AssessmentScore, Clinic, SupportRoleId } from '@/lib/models';

import colors from '@/jss/colors';
import { BookingContext, SearchResult, BookingFilters, BookingSource } from '@/contexts/booking-context';
import { ERROR_CODES } from '@/lib/http-client';
import Accordion from '@/components/accordion';
import useHandleError from '@/hooks/use-handle-error';
import FilterSpecialtyModal from '@/components/filter-specialty-modal';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';

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

const useConnectWithSupportStyles = createUseStyles({
	searchIcon: {
		left: 0,
		top: '50%',
		fill: colors.dark,
		position: 'absolute',
		transform: 'translateY(-50%)',
	},
	clearIcon: {
		flexShrink: 0,
		opacity: 0.32,
		cursor: 'pointer',
		fill: colors.dark,
	},
	filterIcon: {
		marginTop: -1,
		marginLeft: 5,
		fill: colors.dark,
	},
	infoIcon: {
		width: 28,
		marginLeft: 10,
		fill: colors.white,
	},
});

interface HistoryLocationState {
	skipAssessment?: boolean;
	successBooking?: boolean;
	routedClinicIds?: string[];
	routedProviderId?: string;
	routedSupportRoleIds?: string[];
	emailAddress?: string;
}

const ConnectWithSupport: FC = () => {
	const handleError = useHandleError();
	useHeaderTitle('connect with support');
	const classes = useConnectWithSupportStyles();
	const { account } = useAccount();

	const location = useLocation();
	const history = useHistory<HistoryLocationState>();
	const bookingRef = useRef<BookingRefHandle>(null);

	const typeAheadRef = useRef<any>(null);
	const [didInit, setDidInit] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSearching, setIsSearching] = useState(false);
	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();

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
		dateFilter,
		setDateFilter,
		timeFilter,
		setTimeFilter,
		providerTypeFilter,
		setProviderTypeFilter,
		availabilityFilter,
		setAvailabilityFilter,
		visitTypeIdsFilter,
		setVisitTypeIdsFilter,
		paymentTypeFilter,
		setPaymentTypeFilter,
		clinicsFilter,
		setClinicsFilter,
		providerFilter,
		setProviderFilter,
		specialtyFilter,
		setSpecialtyFilter,

		selectedDate,
		selectedProvider,
		formattedTimeFilter,

		getActiveFiltersState,
		isEligible,
		setIsEligible,
		preserveFilters,
		setPreserveFilters,
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

	const skipAssessment = !!history.location.state?.skipAssessment;
	const recommendedTherapistPsychiatrist =
		findOptions?.recommendationLevel.recommendationLevelId === SupportRoleId.Clinician ||
		findOptions?.recommendationLevel.recommendationLevelId === SupportRoleId.Psychiatrist;
	const filterEapTherapistPsychiatrist =
		providerTypeFilter.includes(SupportRoleId.CareManager) ||
		providerTypeFilter.includes(SupportRoleId.Clinician) ||
		providerTypeFilter.includes(SupportRoleId.Psychiatrist);

	const activeFilters = useMemo(() => {
		return getActiveFiltersState(findOptions);
	}, [getActiveFiltersState, findOptions]);

	const setFilterDefaults = useCallback(
		async (findOptions, preserveFilters = false) => {
			if (preserveFilters) {
				setRecommendationHtml(findOptions.recommendationHtml);
				setAssessmentScore(findOptions.scores);
				return;
			}

			const urlQuery = new URLSearchParams(location.search);
			const routedSupportRoleIds = urlQuery.getAll('supportRoleId');
			const routedStartDate = urlQuery.get('startDate') || '';
			const routedEndDate = urlQuery.get('endDate') || '';
			const routedClinicIds = urlQuery.getAll('clinicId');
			const routedProviderId = urlQuery.get('providerId') || undefined;

			const dateRange =
				queryParamDateRegex.test(routedStartDate) && queryParamDateRegex.test(routedEndDate)
					? { from: moment(routedStartDate), to: moment(routedEndDate) }
					: { from: moment(findOptions.defaultStartDate), to: moment(findOptions.defaultEndDate) };

			setRecommendationHtml(findOptions.recommendationHtml);
			setAssessmentScore(findOptions.scores);
			setDateFilter({
				...dateRange,
				days: {
					SUNDAY: true,
					MONDAY: true,
					TUESDAY: true,
					WEDNESDAY: true,
					THURSDAY: true,
					FRIDAY: true,
					SATURDAY: true,
				},
			});
			setTimeFilter({
				min: parseInt(findOptions.defaultStartTime, 10),
				max: parseInt(findOptions.defaultEndTime, 10),
			});
			setProviderTypeFilter(
				routedSupportRoleIds.length ? routedSupportRoleIds : findOptions.defaultSupportRoleIds
			);
			setAvailabilityFilter(findOptions.defaultAvailability);
			setVisitTypeIdsFilter(findOptions.defaultVisitTypeIds);
			setPaymentTypeFilter([]);
			setSpecialtyFilter([]);
			setClinicsFilter(routedClinicIds.length ? routedClinicIds : findOptions.defaultClinicIds);
			if (routedProviderId) {
				setProviderFilter(routedProviderId);
			}
		},
		[
			location.search,
			setAvailabilityFilter,
			setVisitTypeIdsFilter,
			setClinicsFilter,
			setDateFilter,
			setPaymentTypeFilter,
			setProviderFilter,
			setProviderTypeFilter,
			setTimeFilter,
			setSpecialtyFilter,
		]
	);

	const searchProviders = useCallback(
		async (query) => {
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

		if (!isImmediate && !skipAssessment && didInit && !assessmentScore) {
			const urlQuery = new URLSearchParams(location.search);
			const routedClinicIds = urlQuery.getAll('clinicId');
			const routedProviderId = urlQuery.get('providerId') || undefined;
			const routedSupportRoleIds = urlQuery.getAll('supportRoleId');

			history.replace('/weekly-assessment', { routedClinicIds, routedProviderId, routedSupportRoleIds });
		}
	}, [assessmentScore, didInit, history, location.search, skipAssessment]);

	const institutionId = account?.institutionId ?? '';
	useEffect(() => {
		const urlQuery = new URLSearchParams(location.search);
		const routedSupportRoleIds = urlQuery.getAll('supportRoleId');
		const routedClinicIds = urlQuery.getAll('clinicId');

		if (didInit || !institutionId) {
			return () => {
				if (routedClinicIds) {
					setSelectedSearchResult([]);
				}
			};
		}

		const findOptionsRequest = providerService.fetchFindOptions({
			supportRoleIds: routedSupportRoleIds,
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
					setFilterDefaults(findOptions, preserveFilters);
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
		};
	}, [
		didInit,
		preserveFilters,
		location.search,
		setFilterDefaults,
		handleError,
		institutionId,
		setSelectedSearchResult,
	]);

	useEffect(() => {
		if (!didInit) {
			return;
		}

		const selectedSearchEntityId = selectedSearchResult[0] ? selectedSearchResult[0].id : undefined;

		if (
			(providerFilter && providerFilter === selectedSearchEntityId) ||
			(clinicsFilter.length && clinicsFilter[0] === selectedSearchEntityId)
		) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		let findFilters: FindFilters;

		if (selectedSearchResult[0]) {
			findFilters =
				selectedSearchResult[0].type === 'provider'
					? { providerId: selectedSearchResult[0].id }
					: { clinicIds: [selectedSearchResult[0].id] };
		} else {
			findFilters = providerFilter
				? { providerId: providerFilter }
				: {
						startDate: moment(dateFilter.from).format('YYYY-MM-DD'),
						endDate: moment(dateFilter.to).format('YYYY-MM-DD'),
						daysOfWeek: Object.entries(dateFilter.days)
							.filter(([_, isSelected]) => isSelected)
							.map(([day]) => day),
						startTime: formattedTimeFilter.startTime,
						endTime: formattedTimeFilter.endTime,
						availability: availabilityFilter,
						visitTypeIds: visitTypeIdsFilter,
						supportRoleIds: providerTypeFilter,
						paymentTypeIds: paymentTypeFilter,
						clinicIds: clinicsFilter,
						specialtyIds: specialtyFilter,
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
					setProviderFilter(provider.providerId);
					setSelectedSearchResult([mapProviderToResult(provider)]);
				} else if (clinics && clinics.length) {
					setClinicsFilter([clinics[0].clinicId]);
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
		availabilityFilter,
		visitTypeIdsFilter,
		clinicsFilter,
		dateFilter.days,
		dateFilter.from,
		dateFilter.to,
		didInit,
		formattedTimeFilter.endTime,
		formattedTimeFilter.startTime,
		handleError,
		paymentTypeFilter,
		providerFilter,
		specialtyFilter,
		providerTypeFilter,
		selectedSearchResult,
		setAppointmentTypes,
		setAvailableSections,
		setClinicsFilter,
		setEpicDepartments,
		setProviderFilter,
		setSelectedSearchResult,
	]);

	useLayoutEffect(() => {
		if (!preserveFilters || availableSections.length === 0 || !selectedDate || !selectedProvider) {
			return;
		}

		setTimeout(() => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			providerRefs[`${selectedDate}-${selectedProvider.providerId}`].current?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});

			setPreserveFilters(false);
		}, 200);
	}, [availableSections.length, preserveFilters, providerRefs, selectedDate, selectedProvider, setPreserveFilters]);

	function handleClearSearchButtonClick() {
		if (typeAheadRef && typeAheadRef.current) {
			typeAheadRef.current.clear();
			typeAheadRef.current.blur();
			setSearchQuery('');
			setSelectedSearchResult([]);
			setProviderFilter(undefined);
			setClinicsFilter([]);
			const params = new URLSearchParams(history.location.search);
			params.delete('providerId');
			params.delete('clinicId');
			history.push(`/connect-with-support?${params.toString()}`, history.location.state);
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
				from={dateFilter.from}
				to={dateFilter.to}
				show={openFilterModal === BookingFilters.Date}
				days={dateFilter.days}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(params) => {
					setDateFilter(params);
					setOpenFilterModal(null);
				}}
			/>

			<FilterTimesModal
				range={timeFilter}
				show={openFilterModal === BookingFilters.Time}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(range) => {
					setTimeFilter(range);
					setOpenFilterModal(null);
				}}
			/>

			<FilterProviderTypesModal
				providerTypes={findOptions?.supportRoles ?? []}
				recommendedTypes={findOptions ? findOptions.defaultSupportRoleIds : []}
				selectedTypes={providerTypeFilter}
				show={openFilterModal === BookingFilters.Provider}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(selectedTypes) => {
					setOpenFilterModal(null);
					setProviderTypeFilter(selectedTypes);
				}}
			/>

			<FilterAvailabilityModal
				availabilities={findOptions?.availabilities ?? []}
				selectedAvailability={availabilityFilter}
				selectedVisitTypeIds={visitTypeIdsFilter}
				show={openFilterModal === BookingFilters.Availability}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(selectedAvailability, visitTypeIds) => {
					setOpenFilterModal(null);
					setAvailabilityFilter(selectedAvailability);
					setVisitTypeIdsFilter(visitTypeIds);
				}}
			/>

			<FilterPaymentsModal
				paymentTypes={findOptions?.paymentTypes ?? []}
				selectedTypes={paymentTypeFilter}
				show={openFilterModal === BookingFilters.Payment}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(selectedTypes) => {
					setOpenFilterModal(null);
					setPaymentTypeFilter(selectedTypes);
				}}
			/>

			<FilterSpecialtyModal
				specialties={findOptions?.specialties ?? []}
				selectedSpecialties={specialtyFilter}
				show={openFilterModal === BookingFilters.Specialty}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(selectedSpecialties) => {
					setOpenFilterModal(null);
					setSpecialtyFilter(selectedSpecialties);
				}}
			/>

			<BookingModals ref={bookingRef} />

			<HeroContainer>
				<div className="d-flex justify-content-center align-items-center">
					<small
						className="text-white text-center"
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
										setSelectedSearchResult(selectedOptions);
										(typeAheadRef.current as any).blur();
									}}
									options={searchQuery ? searchResults : recentProviders}
									selected={selectedSearchResult}
									renderMenu={(results, menuProps) => {
										if (!searchQuery && recentProviders.length === 0) {
											return null;
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
																<div className="ml-3">
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
								<small className="mb-0 text-uppercase text-muted font-karla-bold">Filters</small>
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
										const urlQuery = new URLSearchParams(location.search);

										if (
											urlQuery.has('supportRoleId') ||
											urlQuery.has('startDate') ||
											urlQuery.has('endDate') ||
											urlQuery.has('clinicId') ||
											urlQuery.has('providerId')
										) {
											urlQuery.delete('supportRoleId');
											urlQuery.delete('startDate');
											urlQuery.delete('endDate');
											urlQuery.delete('clinicId');
											urlQuery.delete('providerId');
											history.push({
												pathname: location.pathname,
												search: '?' + urlQuery.toString(),
											});
										} else {
											setFilterDefaults(findOptions);
										}
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
								<p className="mb-0 font-karla-bold">{section.dateDescription}</p>
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
