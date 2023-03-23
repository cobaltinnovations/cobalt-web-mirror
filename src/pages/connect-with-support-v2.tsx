import { cloneDeep } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { InstitutionLocation } from '@/lib/models';
import {
	FindOptionsResponse,
	FIND_OPTIONS_FILTER_IDS,
	institutionService,
	ProviderSection,
	providerService,
} from '@/lib/services';
import { BookingSource, FILTER_DAYS } from '@/contexts/booking-context';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import AsyncWrapper from '@/components/async-page';
import ConnectWithSupportItem from '@/components/connect-with-support-item';
import FilterDropdown from '@/components/filter-dropdown';
import DatePicker from '@/components/date-picker';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';

const ConnectWithSupportV2 = () => {
	const { pathname } = useLocation();
	const { institution } = useAccount();
	const pageInstantiated = useRef(false);
	const bookingRef = useRef<BookingRefHandle>(null);

	const [searchParams, setSearchParams] = useSearchParams();
	const startDate = useMemo(() => searchParams.get('startDate'), [searchParams]);
	const appointmentTimeIds = useMemo(() => searchParams.getAll('appointmentTimeIds'), [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId'), [searchParams]);

	const [selectedStartDate, setSelectedStartDate] = useState<Date>(startDate ? new Date(startDate) : new Date());
	const [selectedAppointmentTimeIds, setSelectedAppointmentTimeIds] = useState(appointmentTimeIds);
	const [selectedInstitutionLocationId, setSelectedInstitutionLocationId] = useState(institutionLocationId ?? '');

	const [findOptions, setFindOptions] = useState<FindOptionsResponse>();
	const [institutionLocations, setInstitutionLocations] = useState<InstitutionLocation[]>([]);
	const [providerSections, setProviderSections] = useState<ProviderSection[]>([]);

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => pathname === feature.urlName),
		[institution?.features, pathname]
	);

	useEffect(() => {
		if (pageInstantiated.current) {
			return;
		}

		if (institution?.locationPromptRequired !== undefined) {
			pageInstantiated.current = true;
		}

		console.log(institution?.locationPromptRequired);
	}, [institution]);

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

		setProviderSections(response.sections);
	}, [appointmentTimeIds, featureDetails, findOptions, institutionLocationId, startDate]);

	useEffect(() => {
		setSelectedStartDate(startDate ? new Date(startDate) : new Date());
	}, [startDate]);

	useEffect(() => {
		setSelectedAppointmentTimeIds(appointmentTimeIds);
	}, [appointmentTimeIds]);

	useEffect(() => {
		setSelectedInstitutionLocationId(institutionLocationId ?? '');
	}, [institutionLocationId]);

	return (
		<>
			<BookingModals ref={bookingRef} />

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
															dismissText="Cancel"
															onDismiss={() => {
																searchParams.delete('startDate');
																setSearchParams(searchParams);
															}}
															confirmText="Done"
															onConfirm={() => {
																searchParams.set(
																	'startDate',
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
																searchParams.delete('appointmentTimeIds');
																setSearchParams(searchParams);
															}}
															confirmText="Apply"
															onConfirm={() => {
																searchParams.delete('appointmentTimeIds');
																selectedAppointmentTimeIds.forEach((tod) => {
																	searchParams.append('appointmentTimeIds', tod);
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
																searchParams.delete('institutionLocationId');
																setSearchParams(searchParams);
															}}
															confirmText="Apply"
															onConfirm={() => {
																searchParams.set(
																	'institutionLocationId',
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
									{section.providers.map((provider, providerIndex) => {
										const isLast = providerIndex === section.providers.length - 1;

										return (
											<React.Fragment key={provider.providerId}>
												<ConnectWithSupportItem
													providerId={provider.providerId}
													imageUrl={provider.imageUrl}
													title={provider.name}
													subtitle={provider.title}
													descriptionHtml="<p>During your first session, an intake coordinator will collect your information and ask you about the issue/s you're experiencing, spanning issues with self, family, work or substance use. Next they'll help you schedule your next session with a provider appropriate to your needs and goals, which may not be the intake coordinator. The EAP program does not prescribe or recommend medications.</p>"
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
																			exitUrl: pathname,
																			provider,
																			date: section.date,
																			timeSlot: time,
																		});
																	},
															  }))
													}
													showViewButton={!provider.displayPhoneNumberOnlyForBooking}
													onModalTimeButtonClick={(availabilityTimeSlot) => {
														console.log(availabilityTimeSlot);
														window.alert('[TODO]: Start booking flow?');
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
