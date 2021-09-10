import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { unstable_batchedUpdates } from 'react-dom';
import { useHistory, useLocation } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import moment from 'moment';

import colors from '@/jss/colors';
import { ReactComponent as PaperIcon } from '@/assets/icons/icon-description.svg';
import { ReactComponent as CheckCircleIcon } from '@/assets/icons/icon-check-circle.svg';
import useHandleError from '@/hooks/use-handle-error';
import useHeaderTitle from '@/hooks/use-header-title';
import { ERROR_CODES } from '@/lib/http-client';
import { appointmentService, CreateAppointmentData, FindFilters, FindOptionsResponse, providerService } from '@/lib/services';
import { queryParamDateRegex } from '@/lib/utils';

import AvailableProvider from '@/components/available-provider';
import DayContainer from '@/components/day-container';
import FilterDaysModal from '@/components/filter-days-modal';
import FilterPill from '@/components/filter-pill';
import FilterTimesModal from '@/components/filter-times-modal';
import Loader from '@/components/loader';
import { BookingContext, BookingFilters } from '@/contexts/booking-context';
import PicInsuranceInfoModal from '@/pages/pic/insurance-info-modal';
import ConfirmPicReservationModal from '@/pages/pic/confirm-reservation-modal';
import { SupportRoleId } from '@/lib/models';

const usePicProviderSearchStyles = createUseStyles({
	insuranceInfoPending: {
		backgroundColor: colors.white + ' !important',
		'&:hover': {
			color: colors.primary + ' !important',
		},
	},
	insuranceInfoRead: {},
	circledCheckIcon: {
		'& path:first-of-type': {
			fill: 'transparent',
		},
	},
	disabledSection: {
		opacity: 0.5,
	},
});

const PicProviderSearch: FC = () => {
	const { t } = useTranslation();
	useHeaderTitle(t('picProviderSearch.title', 'Schedule an appointment'));
	const classes = usePicProviderSearchStyles();
	const handleError = useHandleError();
	const history = useHistory();
	const location = useLocation();
	const [openFilterModal, setOpenFilterModal] = useState<BookingFilters | null>(null);
	const [didInit, setDidInit] = useState(false);
	const [isBooking, setIsBooking] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();
	const [showInsuranceInfoModal, setShowInsuranceInfoModal] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [insuranceInfoRead, setInsuranceInfoRead] = useState(false);

	const {
		dateFilter,
		setDateFilter,
		timeFilter,
		setTimeFilter,
		formattedTimeFilter,
		providerTypeFilter,
		setProviderTypeFilter,
		clinicsFilter,
		setClinicsFilter,
		providerFilter,
		setProviderFilter,

		setAppointmentTypes,
		availableSections,
		setAvailableSections,

		selectedDate,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,
		selectedAppointmentTypeId,
		setSelectedAppointmentTypeId,
		formattedModalDate,
		formattedAvailabilityDate,
		timeSlotEndTime,

		getActiveFiltersState,
	} = useContext(BookingContext);

	const activeFilters = useMemo(() => {
		return getActiveFiltersState(findOptions);
	}, [findOptions, getActiveFiltersState]);

	const setFilterDefaults = useCallback(
		async (findOptions) => {
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
			setProviderTypeFilter(routedSupportRoleIds.length ? routedSupportRoleIds : findOptions.defaultSupportRoleIds);
			setClinicsFilter(routedClinicIds.length ? routedClinicIds : findOptions.defaultClinicIds);
			if (routedProviderId) {
				setProviderFilter(routedProviderId);
			}
		},
		[location.search, setClinicsFilter, setDateFilter, setProviderFilter, setProviderTypeFilter, setTimeFilter]
	);

	useEffect(() => {
		if (didInit) {
			return;
		}

		const urlQuery = new URLSearchParams(location.search);
		const routedSupportRoleIds = urlQuery.getAll('supportRoleId').filter((r) => r !== 'LCSW');

		const findOptionsRequest = providerService.fetchFindOptions({
			supportRoleIds: routedSupportRoleIds,
		});

		async function init() {
			try {
				const findOptions = await findOptionsRequest.fetch();

				unstable_batchedUpdates(() => {
					setFindOptions(findOptions);
					setFilterDefaults(findOptions);
					setDidInit(true);
				});
			} catch (e) {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			}
		}

		init();

		return () => {
			findOptionsRequest.abort();
		};
	}, [didInit, handleError, location.search, setFilterDefaults]);

	useEffect(() => {
		if (!didInit) {
			return;
		}

		setIsLoading(true);

		const licenseTypes: string[] = [];
		const supportRoleIds = providerTypeFilter.filter((t) => {
			//@ts-expect-error LCSW is a `licenseType` rather than a "Support Role"
			if (t === 'LCSW') {
				licenseTypes.push('LCSW');
				return false;
			}

			return true;
		});

		const findFilters: FindFilters = providerFilter
			? { providerId: providerFilter }
			: {
					startDate: moment(dateFilter.from).format('YYYY-MM-DD'),
					endDate: moment(dateFilter.to).format('YYYY-MM-DD'),
					daysOfWeek: Object.entries(dateFilter.days)
						.filter(([_, isSelected]) => isSelected)
						.map(([day]) => day),
					startTime: formattedTimeFilter.startTime,
					endTime: formattedTimeFilter.endTime,
					supportRoleIds,
					clinicIds: clinicsFilter,
					visitTypeIds: ['INITIAL'],
					licenseTypes,
			  };

		const findRequest = providerService.findProviders(findFilters);

		findRequest
			.fetch()
			.then(({ appointmentTypes, sections, provider, clinics }) => {
				setIsLoading(false);
				setAppointmentTypes(appointmentTypes);
				setAvailableSections(sections);

				if (provider) {
					setProviderFilter(provider.providerId);
				} else if (clinics && clinics.length) {
					setClinicsFilter([clinics[0].clinicId]);
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
		clinicsFilter,
		dateFilter.days,
		dateFilter.from,
		dateFilter.to,
		didInit,
		formattedTimeFilter.endTime,
		formattedTimeFilter.startTime,
		handleError,
		providerFilter,
		providerTypeFilter,
		setAppointmentTypes,
		setAvailableSections,
		setClinicsFilter,
		setProviderFilter,
	]);

	return (
		<>
			<PicInsuranceInfoModal
				show={showInsuranceInfoModal}
				onHide={() => {
					setShowInsuranceInfoModal(false);
					setInsuranceInfoRead(true);
				}}
			/>

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

			<ConfirmPicReservationModal
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
						if (e.metadata?.accountPhoneNumberRequired) {
							setShowConfirmationModal(false);
						} else {
							handleError(e);
						}
					}

					setIsBooking(false);
				}}
			/>

			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p>
							{t('picProviderSearch.availabilityHeader', 'A {{providerType}} is available for a 30-minute appointment at the times below.', {
								providerType:
									providerTypeFilter.findIndex((type) => type === SupportRoleId.MHIC) > -1
										? t('picProviderSearch.mhic', 'mental health coordinator')
										: t('picProviderSearch.bhs', 'mental health provider'),
							})}
						</p>

						<hr className="my-4" />
					</Col>
				</Row>

				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="d-flex">
							<p className="mr-2">1.</p>
							<p>{t('picProviderSearch.insuranceInstructions', 'Read important insurance information before scheduling')}</p>
						</div>

						<div className="d-flex justify-content-center">
							<Button
								variant={insuranceInfoRead ? 'success' : 'outline-primary'}
								className={classNames('d-flex align-items-center', {
									[classes.insuranceInfoPending]: !insuranceInfoRead,
									[classes.insuranceInfoRead]: insuranceInfoRead,
								})}
								size="sm"
								onClick={() => {
									setShowInsuranceInfoModal(true);
								}}
							>
								<PaperIcon className="mr-2" />
								{t('picProviderSearch.readInsuranceInfo', 'Read insurance information')}
								{insuranceInfoRead && <CheckCircleIcon className={classNames('ml-4', classes.circledCheckIcon)} />}
							</Button>
						</div>

						<hr className="my-4" />
					</Col>
				</Row>

				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="d-flex">
							<p className="mr-2">2.</p>
							<p>{t('picProviderSearch.filterInstructions', 'Choose an appointment time')}</p>
						</div>

						<div
							className={classNames('d-flex justify-content-center', {
								[classes.disabledSection]: !insuranceInfoRead,
							})}
						>
							<FilterPill
								disabled={!insuranceInfoRead}
								active={activeFilters[BookingFilters.Date] || activeFilters[BookingFilters.Days]}
								onClick={() => setOpenFilterModal(BookingFilters.Date)}
							>
								Days
							</FilterPill>
							<FilterPill
								disabled={!insuranceInfoRead}
								active={activeFilters[BookingFilters.Time]}
								onClick={() => setOpenFilterModal(BookingFilters.Time)}
							>
								Times
							</FilterPill>
						</div>

						<hr className="my-4" />
					</Col>
				</Row>
			</Container>

			{isLoading ? (
				<div className="position-relative mt-5 h-100" style={{ minHeight: 100 }}>
					<Loader />
				</div>
			) : availableSections.length > 0 ? (
				availableSections.map((section) => {
					return (
						<div
							key={section.date}
							className={classNames({
								[classes.disabledSection]: !insuranceInfoRead,
							})}
						>
							<DayContainer className="mb-4">
								<p className="mb-0 font-karla-bold">{section.dateDescription}</p>
							</DayContainer>

							<Container>
								<Row>
									<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
										{section.fullyBooked ? (
											<p className="mb-4">
												<strong>all appointments are booked for this date</strong>
											</p>
										) : (
											section.providers.map((provider) => {
												return (
													<AvailableProvider
														key={provider.providerId}
														className="mb-5"
														provider={provider}
														onTimeSlotClick={(timeSlot) => {
															if (!insuranceInfoRead) {
																return;
															}

															setSelectedAppointmentTypeId(provider.appointmentTypeIds[0]);
															setSelectedDate(section.date);
															setSelectedProvider(provider);
															setSelectedTimeSlot(timeSlot);

															setShowConfirmationModal(true);
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
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="text-center mb-0">
								<strong>No appointments are available.</strong>
							</p>
						</Col>
					</Row>
				</Container>
			)}
		</>
	);
};

export default PicProviderSearch;
