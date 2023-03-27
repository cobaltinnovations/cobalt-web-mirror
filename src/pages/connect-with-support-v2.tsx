import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { InstitutionLocation } from '@/lib/models';
import {
	accountService,
	FindOptionsResponse,
	FIND_OPTIONS_FILTER_IDS,
	institutionService,
	ProviderSection,
	providerService,
} from '@/lib/services';
import { BookingContext, BookingSource, FILTER_DAYS } from '@/contexts/booking-context';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import AsyncWrapper from '@/components/async-page';
import ConnectWithSupportItem from '@/components/connect-with-support-item';
import FilterDropdown from '@/components/filter-dropdown';
import DatePicker from '@/components/date-picker';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import useHandleError from '@/hooks/use-handle-error';
import NoData from '@/components/no-data';

enum SEARCH_PARAMS {
	START_DATE = 'startDate',
	APPOINTMENT_TIME_IDS = 'appointmentTimeIds',
	INSTITUTION_LOCATION_ID = 'institutionLocationId',
}

const ConnectWithSupportV2 = () => {
	const handleError = useHandleError();
	const { pathname, search } = useLocation();
	const { account, institution } = useAccount();
	const bookingRef = useRef<BookingRefHandle>(null);

	const [searchParams, setSearchParams] = useSearchParams();
	const startDate = useMemo(() => searchParams.get(SEARCH_PARAMS.START_DATE), [searchParams]);
	const appointmentTimeIds = useMemo(() => searchParams.getAll(SEARCH_PARAMS.APPOINTMENT_TIME_IDS), [searchParams]);
	const institutionLocationId = useMemo(
		() => searchParams.get(SEARCH_PARAMS.INSTITUTION_LOCATION_ID),
		[searchParams]
	);

	const [selectedStartDate, setSelectedStartDate] = useState<Date>(
		startDate ? moment(startDate, 'YYYY-MM-DD').toDate() : new Date()
	);
	const [selectedAppointmentTimeIds, setSelectedAppointmentTimeIds] = useState(appointmentTimeIds);
	const [selectedInstitutionLocationId, setSelectedInstitutionLocationId] = useState(institutionLocationId ?? '');

	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();
	const [institutionLocations, setInstitutionLocations] = useState<InstitutionLocation[]>([]);
	const [providerSections, setProviderSections] = useState<ProviderSection[]>([]);

	const [showEmployerModal, setShowEmployerModal] = useState(false);
	const [selectedEmployerId, setSelectedEmployerId] = useState(account?.institutionLocationId ?? '');

	const { setAppointmentTypes, setEpicDepartments, isEligible, setIsEligible } = useContext(BookingContext);

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => pathname === feature.urlName),
		[institution?.features, pathname]
	);

	/* --------------------------------------------------- */
	/* Employer modal check  */
	/* --------------------------------------------------- */
	useEffect(() => {
		if (featureDetails?.locationPromptRequired) {
			setShowEmployerModal(true);
		}
	}, [featureDetails?.locationPromptRequired]);

	/* --------------------------------------------------- */
	/* Get available filters for feature  */
	/* --------------------------------------------------- */
	const fetchFilters = useCallback(async () => {
		if (!institution || !featureDetails) {
			return;
		}

		const [findOptionsResponse, institutionLocationsResponse] = await Promise.all([
			providerService
				.fetchFindOptions({
					institutionId: institution.institutionId,
					featureId: featureDetails.featureId,
				})
				.fetch(),
			institutionService.getInstitutionLocations().fetch(),
		]);

		setFindOptions(findOptionsResponse);
		setInstitutionLocations(institutionLocationsResponse.locations);
	}, [featureDetails, institution]);

	/* --------------------------------------------------- */
	/* Get providers based on searchParams  */
	/* --------------------------------------------------- */
	const fetchProviders = useCallback(async () => {
		if (!findOptions || !featureDetails) {
			return;
		}

		const response = await providerService
			.findProviders({
				startDate: startDate ?? findOptions.defaultStartDate,
				endDate: findOptions.defaultEndDate,
				daysOfWeek: FILTER_DAYS.map((d) => d.key),
				startTime: findOptions.defaultStartTime,
				endTime: findOptions.defaultEndTime,
				supportRoleIds: featureDetails.supportRoleIds,
				availability: findOptions.defaultAvailability,
				visitTypeIds: findOptions.defaultVisitTypeIds,
				...(institutionLocationId && { institutionLocationId }),
				...(appointmentTimeIds.length > 0 && { appointmentTimeIds }),
			})
			.fetch();

		setAppointmentTypes(response.appointmentTypes);
		setEpicDepartments(response.epicDepartments);
		setProviderSections(response.sections);
	}, [
		appointmentTimeIds,
		featureDetails,
		findOptions,
		institutionLocationId,
		setAppointmentTypes,
		setEpicDepartments,
		startDate,
	]);

	/* --------------------------------------------------- */
	/* Employer submission (reload page for simplicity) */
	/* --------------------------------------------------- */
	const handleEmployerModalContinueButton = useCallback(async () => {
		if (!account) {
			return;
		}

		try {
			const response = await accountService
				.setAccountLocation(account.accountId, {
					accountId: account.accountId,
					institutionLocationId: selectedEmployerId !== 'NA' ? selectedEmployerId : '',
				})
				.fetch();

			window.location.replace(
				`${pathname}?${SEARCH_PARAMS.INSTITUTION_LOCATION_ID}=${response.account.institutionLocationId}`
			);
		} catch (error) {
			handleError(error);
		}
	}, [account, handleError, pathname, selectedEmployerId]);

	/* --------------------------------------------------- */
	/* If searchParams change, set filter states  */
	/* --------------------------------------------------- */
	useEffect(() => {
		setSelectedStartDate(startDate ? moment(startDate, 'YYYY-MM-DD').toDate() : new Date());
	}, [startDate]);

	useEffect(() => {
		setSelectedAppointmentTimeIds(appointmentTimeIds);
	}, [appointmentTimeIds]);

	useEffect(() => {
		setSelectedInstitutionLocationId(institutionLocationId ?? '');
	}, [institutionLocationId]);

	return (
		<>
			<Modal centered show={showEmployerModal}>
				<Modal.Header>
					<Modal.Title>Select Employer</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-2 fw-bold">
						Select your employer so we can display the providers available to you.
					</p>
					<p className="mb-4 fs-small">Your employment information will not be shared.</p>
					{institutionLocations.map((l) => {
						return (
							<Form.Check
								key={l.institutionLocationId}
								className="mb-1"
								type="radio"
								name="employer"
								id={`employer--${l.institutionLocationId}`}
								label={l.name}
								value={l.institutionLocationId}
								checked={selectedEmployerId === l.institutionLocationId}
								onChange={({ currentTarget }) => {
									setSelectedEmployerId(currentTarget.value);
								}}
							/>
						);
					})}
					<Form.Check
						type="radio"
						name="employer"
						id="employer--NA"
						label="I'm not sure / I'd rather not say"
						value="NA"
						checked={selectedEmployerId === 'NA'}
						onChange={({ currentTarget }) => {
							setSelectedEmployerId(currentTarget.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button disabled={!selectedEmployerId} onClick={handleEmployerModalContinueButton}>
						Continue
					</Button>
				</Modal.Footer>
			</Modal>

			<BookingModals ref={bookingRef} />
			<IneligibleBookingModal show={!isEligible} onHide={() => setIsEligible(true)} />

			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>
					<p className="mb-0 text-center fs-large">{featureDetails.description}</p>
				</HeroContainer>
			)}

			<AsyncWrapper fetchData={fetchFilters}>
				{(findOptions?.filters ?? []).length > 0 && (
					<Container fluid className="bg-n75 pb-8">
						<Container>
							<Row>
								<Col
									md={{ span: 10, offset: 1 }}
									lg={{ span: 8, offset: 2 }}
									xl={{ span: 6, offset: 3 }}
								>
									<div className="d-flex justify-content-center">
										{(findOptions?.filters ?? []).map((filter) => {
											return (
												<React.Fragment key={filter.filterId}>
													{filter.filterId === FIND_OPTIONS_FILTER_IDS.DATE && (
														<FilterDropdown
															key={filter.filterId}
															active={!!startDate}
															className="mx-1"
															id={`connect-with-support-filter--${filter.filterId}`}
															title={filter.name}
															dismissText="Clear"
															onDismiss={() => {
																searchParams.delete(SEARCH_PARAMS.START_DATE);
																setSearchParams(searchParams);
															}}
															confirmText="Apply"
															onConfirm={() => {
																searchParams.set(
																	SEARCH_PARAMS.START_DATE,
																	moment(selectedStartDate).format('YYYY-MM-DD')
																);
																setSearchParams(searchParams);
															}}
														>
															<div className="py-3">
																<p className="mb-6 fw-bold">
																	Show providers with availability from:
																	<br />
																	{moment(selectedStartDate).format('MMMM D')} onwards
																</p>
																<hr className="mb-6" />
																<div className="d-flex justify-content-center">
																	<DatePicker
																		inline
																		minDate={new Date()}
																		selected={selectedStartDate}
																		onChange={(date) => {
																			if (!date) {
																				return;
																			}

																			setSelectedStartDate(date);
																		}}
																	/>
																</div>
															</div>
														</FilterDropdown>
													)}
													{filter.filterId === FIND_OPTIONS_FILTER_IDS.TIME_OF_DAY && (
														<FilterDropdown
															key={filter.filterId}
															active={appointmentTimeIds.length > 0}
															className="mx-1"
															id={`connect-with-support-filter--${filter.filterId}`}
															title={filter.name}
															dismissText="Clear"
															onDismiss={() => {
																searchParams.delete(SEARCH_PARAMS.APPOINTMENT_TIME_IDS);
																setSearchParams(searchParams);
															}}
															confirmText="Apply"
															onConfirm={() => {
																searchParams.delete(SEARCH_PARAMS.APPOINTMENT_TIME_IDS);
																selectedAppointmentTimeIds.forEach((tod) => {
																	searchParams.append(
																		SEARCH_PARAMS.APPOINTMENT_TIME_IDS,
																		tod
																	);
																});
																setSearchParams(searchParams);
															}}
														>
															<div className="py-3">
																<p className="mb-5 fw-bold">
																	Do you have a preferred time of day?
																</p>
																{(findOptions?.appointmentTimes ?? []).map(
																	(at, atIndex) => {
																		const isLast =
																			atIndex ===
																			(findOptions?.appointmentTimes ?? [])
																				.length -
																				1;

																		return (
																			<Form.Check
																				key={at.appointmentTimeId}
																				className={classNames({
																					'mb-1': !isLast,
																				})}
																				type="checkbox"
																				name="appointment-time"
																				id={`appointment-time--${at.appointmentTimeId}`}
																				label={`${at.name} • ${at.description}`}
																				value={at.appointmentTimeId}
																				checked={selectedAppointmentTimeIds.includes(
																					at.appointmentTimeId
																				)}
																				onChange={({ currentTarget }) => {
																					const selectedAppointmentTimeIdsClone =
																						cloneDeep(
																							selectedAppointmentTimeIds
																						);
																					const targetIndex =
																						selectedAppointmentTimeIdsClone.findIndex(
																							(tod) =>
																								tod ===
																								currentTarget.value
																						);

																					if (targetIndex > -1) {
																						selectedAppointmentTimeIdsClone.splice(
																							targetIndex,
																							1
																						);
																					} else {
																						selectedAppointmentTimeIdsClone.push(
																							currentTarget.value
																						);
																					}

																					setSelectedAppointmentTimeIds(
																						selectedAppointmentTimeIdsClone
																					);
																				}}
																			/>
																		);
																	}
																)}
															</div>
														</FilterDropdown>
													)}
													{filter.filterId === FIND_OPTIONS_FILTER_IDS.LOCATION && (
														<FilterDropdown
															key={filter.filterId}
															active={!!institutionLocationId}
															className="mx-1"
															id={`connect-with-support-filter--${filter.filterId}`}
															title={filter.name}
															dismissText="Clear"
															onDismiss={() => {
																searchParams.delete(
																	SEARCH_PARAMS.INSTITUTION_LOCATION_ID
																);
																setSearchParams(searchParams);
															}}
															confirmText="Apply"
															onConfirm={() => {
																searchParams.set(
																	SEARCH_PARAMS.INSTITUTION_LOCATION_ID,
																	selectedInstitutionLocationId
																);
																setSearchParams(searchParams);
															}}
														>
															<div className="py-3">
																{institutionLocations.map((l, locationIndex) => {
																	const isLast =
																		locationIndex ===
																		institutionLocations.length - 1;

																	return (
																		<Form.Check
																			key={l.institutionLocationId}
																			className={classNames({
																				'mb-1': !isLast,
																			})}
																			type="radio"
																			name="location"
																			id={`location--${l.institutionLocationId}`}
																			label={l.name}
																			value={l.institutionLocationId}
																			checked={
																				selectedInstitutionLocationId ===
																				l.institutionLocationId
																			}
																			onChange={({ currentTarget }) => {
																				setSelectedInstitutionLocationId(
																					currentTarget.value
																				);
																			}}
																		/>
																	);
																})}
															</div>
														</FilterDropdown>
													)}
												</React.Fragment>
											);
										})}
									</div>
								</Col>
							</Row>
						</Container>
					</Container>
				)}
			</AsyncWrapper>
			<AsyncWrapper fetchData={fetchProviders}>
				{providerSections.map((section) => (
					<React.Fragment key={section.date}>
						<Container
							fluid
							className="py-3 bg-white border-top border-bottom position-sticky"
							style={{ top: 55, zIndex: 2 }}
						>
							<Container>
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<p className="mb-0 text-center fw-bold">{section.dateDescription}</p>
									</Col>
								</Row>
							</Container>
						</Container>
						<Container>
							<Row>
								<Col
									md={{ span: 10, offset: 1 }}
									lg={{ span: 8, offset: 2 }}
									xl={{ span: 6, offset: 3 }}
								>
									{section.providers.length <= 0 && (
										<div className="py-8">
											<NoData
												title="No Available Providers"
												description="All providers are booked for this date"
												actions={[]}
											/>
										</div>
									)}
									{section.providers.map((provider, providerIndex) => {
										const isLast = providerIndex === section.providers.length - 1;

										return (
											<React.Fragment key={provider.providerId}>
												<ConnectWithSupportItem
													providerId={provider.providerId}
													imageUrl={provider.imageUrl}
													title={provider.name}
													subtitle={provider.title}
													descriptionHtml={provider.treatmentDescription ?? ''}
													buttons={
														provider.displayPhoneNumberOnlyForBooking
															? [
																	{
																		as: 'a',
																		className: 'text-decoration-none',
																		href: `tel:${provider.phoneNumber}`,
																		title: provider.formattedPhoneNumber,
																	},
															  ]
															: provider.times.map((time) => ({
																	title: time.timeDescription,
																	disabled: time.status !== 'AVAILABLE',
																	onClick: () => {
																		bookingRef.current?.kickoffBookingProcess({
																			source: BookingSource.ConnectWithSupportV2,
																			exitUrl: `${pathname}${search}`,
																			provider,
																			date: section.date,
																			timeSlot: time,
																		});
																	},
															  }))
													}
													showViewButton={!provider.displayPhoneNumberOnlyForBooking}
													onModalTimeButtonClick={(availabilityTimeSlot) => {
														bookingRef.current?.kickoffBookingProcess({
															source: BookingSource.ConnectWithSupportV2,
															exitUrl: `${pathname}${search}`,
															provider,
															date: section.date,
															timeSlot: availabilityTimeSlot,
														});
													}}
												/>
												{!isLast && <hr />}
											</React.Fragment>
										);
									})}
								</Col>
							</Row>
						</Container>
					</React.Fragment>
				))}
			</AsyncWrapper>
		</>
	);
};

export default ConnectWithSupportV2;
