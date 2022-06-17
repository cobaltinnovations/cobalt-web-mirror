import Cookies from 'js-cookie';
import React, { FC, useEffect, useState, useMemo, useCallback, useContext, RefObject, useLayoutEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Col, Container, Row, Button } from 'react-bootstrap';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import moment from 'moment';
import classNames from 'classnames';

import useHeaderTitle from '@/hooks/use-header-title';
import useAccount from '@/hooks/use-account';
import useRandomPlaceholderImage, { getRandomPlaceholderImage } from '@/hooks/use-random-placeholder-image';
import { queryParamDateRegex } from '@/lib/utils';

import CollectContactInfoModal from '@/components/collect-contact-info-modal';
import ConfirmAppointmentTypeModal from '@/components/confirm-appointment-type-modal';
import ConfirmIntakeAssessmentModal from '@/components/confirm-intake-assessment-modal';
import ConfirmProviderBookingModal from '@/components/confirm-provider-booking-modal';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import FilterAvailabilityModal from '@/components/filter-availability-modal';
import FilterDaysModal from '@/components/filter-days-modal';
import FilterPill from '@/components/filter-pill';
import FilterProviderTypesModal from '@/components/filter-provider-types-modal';
import FilterTimesModal from '@/components/filter-times-modal';
import FilterPaymentsModal from '@/components/filter-payments-modal';
import Loader from '@/components/loader';
import DayContainer from '@/components/day-container';
import HeroContainer from '@/components/hero-container';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { useTranslation } from 'react-i18next';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';

import {
	accountService,
	appointmentService,
	providerService,
	CreateAppointmentData,
	FindOptionsResponse,
	FindFilters,
} from '@/lib/services';
import { Provider, AssessmentScore, Clinic } from '@/lib/models';

import colors from '@/jss/colors';
import { BookingContext, SearchResult, BookingFilters } from '@/contexts/booking-context';
import { ERROR_CODES } from '@/lib/http-client';
import AvailableProvider from '@/components/available-provider';

/** NEW COMPONENTS CREATED */
import ConnectWithSupportHeader from '@/components/connect-with-support-header';
import AppointmentSearchBar from '@/components/appointment-search-bar';
import ImmediateHelpHeader from '@/components/immediate-help-header';

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
	whiteSection: {
		background: colors.white,
		color: colors.black,
		verticalAlign: 'center',
	},
});

interface HistoryLocationState {
	skipAssessment?: boolean;
	successBooking?: boolean;
	routedClinicIds?: string[];
	routedProviderId?: string;
}

interface ImmediatePatientHelpProps {
	dontRenderAssessment?: boolean;
	autoFilter?: boolean;
	patientNeeds?: any;
	providerName?: string;
}

const ImmediatePatientHelp: FC<ImmediatePatientHelpProps> = (props) => {
	let headerTitle = 'connect with support';
	let noRelevantProviders = true;
	if (props.autoFilter) {
		headerTitle = 'Schedule an Appointment';
	}
	useHeaderTitle(headerTitle);
	const classes = useConnectWithSupportStyles();
	const { t } = useTranslation();
	const { account, isAnonymous, setAccount } = useAccount();

	const location = useLocation();
	const history = useHistory<HistoryLocationState>();
	const placeholderImage = useRandomPlaceholderImage();

	const [didInit, setDidInit] = useState(false);
	const [isBooking, setIsBooking] = useState(false);
	const [isSavingInfo, setIsSavingInfo] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();

	const [recentProviders, setRecentProviders] = useState<SearchResult[]>([]);

	const [recommendationHtml, setRecommendationHtml] = useState<string>('');

	const [assessmentScore, setAssessmentScore] = useState<AssessmentScore>();
	const [openFilterModal, setOpenFilterModal] = useState<BookingFilters | null>(null);
	const {
		appointmentTypes,
		setAppointmentTypes,
		epicDepartments,
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
		paymentTypeFilter,
		setPaymentTypeFilter,
		clinicsFilter,
		setClinicsFilter,
		providerFilter,
		setProviderFilter,

		selectedAppointmentTypeId,
		setSelectedAppointmentTypeId,
		selectedDate,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,
		timeSlotEndTime,
		formattedAvailabilityDate,
		formattedModalDate,
		formattedTimeFilter,

		promptForEmail,
		setPromptForEmail,
		promptForPhoneNumber,
		setPromptForPhoneNumber,

		getActiveFiltersState,
		isEligible,
		setIsEligible,
		preserveFilters,
		setPreserveFilters,
	} = useContext(BookingContext);

	const [paymentDisclaimerOpen, setPaymentDisclaimerOpen] = useState(!Cookies.get('paymentDisclaimerSeen'));
	const [collectedPhoneNumebr, setCollectedPhoneNumber] = useState(account?.phoneNumber ?? '');
	const [collectedEmail, setCollectedEmail] = useState(account?.emailAddress ?? '');
	const [showCopayModal, setShowCopayModal] = useState(!Cookies.get('seenWaivedCopay'));
	const [showCollectInfoModal, setShowCollectInfoModal] = useState(false);
	const [showConfirmAppointmentTypeModal, setShowConfirmAppointmentTypeModal] = useState(false);
	const [showConfirmIntakeAssessmentModal, setShowConfirmIntakeAssessmentModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
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

	const activeFilters = useMemo(() => {
		return getActiveFiltersState(findOptions);
	}, [findOptions, getActiveFiltersState]);

	const OneOnOneResources: FC = () => {
		return (
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
		);
	};

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
			setPaymentTypeFilter([]);
			setClinicsFilter(routedClinicIds.length ? routedClinicIds : findOptions.defaultClinicIds);
			if (routedProviderId) {
				setProviderFilter(routedProviderId);
			}
		},
		[
			location.search,
			setAvailabilityFilter,
			setClinicsFilter,
			setDateFilter,
			setPaymentTypeFilter,
			setProviderFilter,
			setProviderTypeFilter,
			setTimeFilter,
		]
	);

	useEffect(() => {
		if (account?.emailAddress) {
			setCollectedEmail(account.emailAddress);
		}

		if (account?.phoneNumber) {
			setCollectedPhoneNumber(account.phoneNumber);
		}
	}, [account]);

	useEffect(() => {
		if (didInit) {
			return;
		}

		const urlQuery = new URLSearchParams(location.search);
		const routedSupportRoleIds = urlQuery.getAll('supportRoleId');

		const findOptionsRequest = providerService.fetchFindOptions({
			supportRoleIds: routedSupportRoleIds,
			institutionId: account!.institutionId,
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
					alert((e as any).message);
				}
			}
		}

		init();

		return () => {
			findOptionsRequest.abort();
			fetchRecentRequest.abort();
		};
	}, [didInit, preserveFilters, location.search, setFilterDefaults]);

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
						supportRoleIds: providerTypeFilter,
						paymentTypeIds: paymentTypeFilter,
						clinicIds: clinicsFilter,
				  };
		}

		const findRequest = providerService.findProviders(findFilters);

		findRequest
			.fetch()
			.then(({ appointmentTypes, epicDepartments, sections, provider, clinics }) => {
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
					alert(e.message);
				}
			});

		return () => {
			findRequest.abort();
		};
	}, [
		availabilityFilter,
		clinicsFilter,
		dateFilter.days,
		dateFilter.from,
		dateFilter.to,
		didInit,
		formattedTimeFilter.endTime,
		formattedTimeFilter.startTime,
		paymentTypeFilter,
		providerFilter,
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

	function navigateToEhrLookup() {
		setPreserveFilters(true);
		history.push(`/ehr-lookup`, {
			skipAssessment,
		});
	}

	function navigateToIntakeAssessment(provider: Provider) {
		if (!provider) {
			return;
		}

		setPreserveFilters(true);
		history.push(`/intake-assessment?providerId=${provider.providerId}`, {
			skipAssessment,
		});
	}

	function continueBookingProcess(provider?: Provider, promptForInfo = false) {
		if (provider?.schedulingSystemId === 'EPIC' && !account?.epicPatientId) {
			navigateToEhrLookup();
		} else if (provider?.intakeAssessmentRequired && provider?.skipIntakePrompt) {
			navigateToIntakeAssessment(provider);
		} else if (provider?.intakeAssessmentRequired) {
			setShowConfirmIntakeAssessmentModal(true);
		} else if (promptForInfo || promptForEmail || promptForPhoneNumber) {
			setShowCollectInfoModal(true);
		} else {
			setShowConfirmationModal(true);
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
				selectedVisitTypeIds={[]}
				show={openFilterModal === BookingFilters.Availability}
				onHide={() => {
					setOpenFilterModal(null);
				}}
				onSave={(selectedAvailability) => {
					setOpenFilterModal(null);
					setAvailabilityFilter(selectedAvailability);
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
			<CollectContactInfoModal
				promptForEmail={promptForEmail}
				promptForPhoneNumber={promptForPhoneNumber}
				show={showCollectInfoModal}
				collectedEmail={collectedEmail}
				collectedPhoneNumber={collectedPhoneNumebr}
				onHide={() => {
					setShowCollectInfoModal(false);
				}}
				onSubmit={async ({ email, phoneNumber }) => {
					if (!account || isSavingInfo) {
						return;
					}

					setIsSavingInfo(true);

					try {
						if (promptForEmail) {
							const accountResponse = await accountService
								.updateEmailAddressForAccountId(account.accountId, {
									emailAddress: email,
								})
								.fetch();

							setCollectedEmail(email);
							setAccount(accountResponse.account);
						}

						if (promptForPhoneNumber) {
							const accountResponse = await accountService
								.updatePhoneNumberForAccountId(account.accountId, {
									phoneNumber,
								})
								.fetch();

							setCollectedPhoneNumber(phoneNumber);
							setAccount(accountResponse.account);
						}

						setShowCollectInfoModal(false);
						setShowConfirmationModal(true);
					} catch (error) {
						alert((error as any).message);
					}

					setIsSavingInfo(false);
				}}
			/>
			<ConfirmAppointmentTypeModal
				show={showConfirmAppointmentTypeModal}
				appointmentTypes={appointmentTypes
					.filter((aT) => selectedProvider?.appointmentTypeIds.includes(aT.appointmentTypeId))
					.map((aT) => ({
						...aT,
						disabled: !selectedTimeSlot?.appointmentTypeIds.includes(aT.appointmentTypeId),
					}))}
				epicDepartment={epicDepartments.find(
					(eD) => eD.epicDepartmentId === selectedTimeSlot?.epicDepartmentId
				)}
				timeSlot={selectedTimeSlot}
				providerName={`${selectedProvider?.name}${
					selectedProvider?.license ? `, ${selectedProvider?.license}` : ''
				}`}
				onHide={() => {
					setSelectedAppointmentTypeId(undefined);
					setShowConfirmAppointmentTypeModal(false);
				}}
				onConfirm={(appointmentTypeId) => {
					setSelectedAppointmentTypeId(appointmentTypeId);
					setShowConfirmAppointmentTypeModal(false);
					continueBookingProcess(selectedProvider);
				}}
			/>
			<ConfirmIntakeAssessmentModal
				show={showConfirmIntakeAssessmentModal}
				onHide={() => {
					setShowConfirmIntakeAssessmentModal(false);
				}}
				onConfirm={() => {
					if (!selectedProvider) {
						return;
					}

					navigateToIntakeAssessment(selectedProvider);
				}}
			/>
			<ConfirmProviderBookingModal
				show={showConfirmationModal}
				formattedDate={formattedModalDate}
				provider={selectedProvider}
				selectedTimeSlot={selectedTimeSlot}
				timeSlotEndTime={timeSlotEndTime}
				onHide={() => {
					setShowConfirmationModal(false);
				}}
				onConfirm={async () => {
					if (isBooking || !selectedProvider || !selectedTimeSlot) {
						return;
					}

					try {
						setIsBooking(true);
						const appointmentData: CreateAppointmentData = {
							providerId: selectedProvider.providerId,
							appointmentTypeId: selectedAppointmentTypeId,
							date: formattedAvailabilityDate,
							time: selectedTimeSlot.time,
						};

						if (promptForEmail) {
							appointmentData.emailAddress = collectedEmail;
						}

						if (promptForPhoneNumber) {
							appointmentData.phoneNumber = collectedPhoneNumebr;
						}

						const response = await appointmentService.createAppointment(appointmentData).fetch();

						// Update slot status in UI 🤮
						setAvailableSections(
							availableSections.map((aS) => {
								if (aS.date === selectedDate) {
									const updatedProviders = aS.providers.map((p) => {
										if (p.providerId === selectedProvider.providerId) {
											const updatedTimes = p.times.map((time) => {
												if (time.time === selectedTimeSlot.time) {
													return {
														...time,
														status: 'BOOKED',
													};
												}

												return time;
											});

											return {
												...p,
												times: updatedTimes,
												fullyBooked: updatedTimes.every((t) => t.status === 'BOOKED'),
											};
										}

										return p;
									});

									return {
										...aS,
										providers: updatedProviders,
										fullyBooked: updatedProviders.every((uP) => uP.fullyBooked),
									};
								}

								return aS;
							})
						);

						setShowConfirmationModal(false);

						setSelectedDate(undefined);
						setSelectedProvider(undefined);
						setSelectedTimeSlot(undefined);

						history.replace(`/my-calendar?appointmentId=${response.appointment.appointmentId}`, {
							successBooking: true,
						});
					} catch (e) {
						if ((e as any).metadata?.accountPhoneNumberRequired) {
							setPromptForPhoneNumber(true);
							setShowConfirmationModal(false);
							setShowCollectInfoModal(true);
						} else {
							alert((e as any).message);
						}
					}

					setIsBooking(false);
				}}
			/>
			{props.autoFilter === true && <ImmediateHelpHeader />}
			{props.autoFilter !== true && (
				<>
					<OneOnOneResources />
					<ConnectWithSupportHeader
						open={paymentDisclaimerOpen}
						setOpenFunction={setPaymentDisclaimerOpen}
						handleCloseFunction={handlePaymentDisclaimerDidClose}
					/>
					<AppointmentSearchBar
						recentProviders={recentProviders}
						selectedSearchResult={selectedSearchResult}
						setSelectedSearchResult={setSelectedSearchResult}
						setProviderFilter={setProviderFilter}
						setClinicsFilter={setClinicsFilter}
					/>
				</>
			)}
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
			{isLoading ? (
				<div className="position-relative mt-5 h-100" style={{ minHeight: 100 }}>
					<Loader />
				</div>
			) : availableSections.length > 0 ? (
				availableSections.map((section, index) => {
					// Filter out providers
					let relevantProviders: Provider[] = [];

					if (props.autoFilter) {
						section.providers.map((provider, index) => {
							const typeOfProvider = provider.supportRolesDescription;
							const providerName = provider.name;
							if (props.providerName === providerName) {
								noRelevantProviders = false;
								relevantProviders.push(provider);
							}
						});
					} else {
						relevantProviders = section.providers;
					}

					if (relevantProviders.length > 0) {
						return (
							<div key={section.date}>
								<>
									<DayContainer className="mb-4">
										<p className="mb-0 font-karla-bold">{section.dateDescription}</p>
										{console.log('Providers length are: ' + relevantProviders.length)}
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
													relevantProviders.map((provider) => {
														return (
															<>
																<AvailableProvider
																	ref={
																		providerRefs[
																			`${section.date}-${provider.providerId}`
																		]
																	}
																	key={provider.providerId}
																	className="mb-5"
																	provider={provider}
																	onTimeSlotClick={(timeSlot) => {
																		setSelectedDate(section.date);
																		setSelectedProvider(provider);
																		setSelectedTimeSlot(timeSlot);

																		const needsEmail =
																			isAnonymous || !account?.emailAddress;
																		const needsPhoneNumber =
																			!!provider.phoneNumberRequiredForAppointment &&
																			(isAnonymous || !account?.phoneNumber);

																		setPromptForEmail(needsEmail);
																		setPromptForPhoneNumber(needsPhoneNumber);

																		if (provider.appointmentTypeIds.length === 1) {
																			setSelectedAppointmentTypeId(
																				appointmentTypes.find(
																					(aT) =>
																						aT.appointmentTypeId ===
																						provider.appointmentTypeIds[0]
																				)?.appointmentTypeId
																			);

																			continueBookingProcess(
																				provider,
																				needsEmail || needsPhoneNumber
																			);
																		} else {
																			setShowConfirmAppointmentTypeModal(true);
																		}
																	}} // closes onClick
																/>
															</>
														); // closes Return
													}) // closes section map
												)}
											</Col>
										</Row>
									</Container>
								</>
							</div> // closes section.date div
						);
					}
				}) // closes the available sections.map
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

			{isLoading === false && noRelevantProviders && (
				<Container>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p>{t('noAvailableAppointments.descriptionText')}</p>
							<hr className={'mt-2'} />
							<p>
								<p className={'mt-1'}> {t('noAvailableAppointments.willCallText')} </p>
								<Button
									variant="light"
									className={'w-100 d-flex justify-content-center align-items-center'}
									href="tel:1-800-123-4567"
								>
									<PhoneIcon className={'mr-2'} />
									<div className={'d-flex flex-column font-size-s'}>
										<span className={'text-primary mb-2'}>
											{t('noAvailableAppointments.callButtonTopRow')}
										</span>
										<span className={'font-weight-regular'}>
											{t('noAvailableAppointments.callButtonBottomRow')}
										</span>
									</div>
								</Button>
								<hr className={'mt-2'} />
								<p className={'mt-1'}>{t('noAvailableAppointments.wantToBeCalledText')}</p>
								<Button
									variant="light"
									className={'w-100 d-flex justify-content-center align-items-center mt-2'}
									href="tel:1-800-123-4567"
								>
									<PhoneIcon className={'mr-2'} />
									<div className={'d-flex flex-column font-size-s'}>
										{t('noAvailableAppointments.pleaseCallMeText')}
									</div>
								</Button>
								<hr className={'mt-2'} />
								{t('noAvailableAppointments.descriptionText')}
							</p>
						</Col>
					</Row>
				</Container>
			)}
		</>
	); // closes the return
};

export default ImmediatePatientHelp;
