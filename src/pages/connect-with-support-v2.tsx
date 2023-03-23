import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import {
	FindOptionsAppointmentTime,
	FindOptionsFilter,
	FIND_OPTIONS_FILTER_IDS,
	ProviderSection,
	providerService,
} from '@/lib/services';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import AsyncWrapper from '@/components/async-page';
import ConnectWithSupportItem from '@/components/connect-with-support-item';
import FilterDropdown from '@/components/filter-dropdown';
import DatePicker from '@/components/date-picker';
import { cloneDeep } from 'lodash';

const ConnectWithSupportV2 = () => {
	const { pathname } = useLocation();
	const { institution } = useAccount();

	const [searchParams, setSearchParams] = useSearchParams();
	const startDate = useMemo(() => searchParams.get('startDate'), [searchParams]);
	const timesOfDay = useMemo(() => searchParams.getAll('timeOfDay'), [searchParams]);

	const [filters, setFilters] = useState<FindOptionsFilter[]>([]);
	const [appointmentTimes, setAppointmentTimes] = useState<FindOptionsAppointmentTime[]>([]);

	const [selectedDate, setSelectedDate] = useState<Date | null>(startDate ? new Date(startDate) : null);
	const [selectedTimesOfDay, setSelectedTimesOfDay] = useState<string[]>(timesOfDay);

	const [providerSections, setProviderSections] = useState<ProviderSection[]>([]);

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => pathname === feature.urlName),
		[institution?.features, pathname]
	);

	const fetchfindOptions = useCallback(async () => {
		if (!institution || !featureDetails) {
			return;
		}

		const response = await providerService
			.fetchFindOptions({
				institutionId: institution.institutionId,
				supportRoleIds: featureDetails.supportRoleIds,
			})
			.fetch();

		setFilters(response.filters ?? []);
		setAppointmentTimes(response.appointmentTimes);
	}, [featureDetails, institution]);

	const fetchProviders = useCallback(async () => {
		if (!institution || !featureDetails) {
			return;
		}

		const response = await providerService
			.findProviders({
				...(startDate && { startDate }),
				supportRoleIds: featureDetails.supportRoleIds,
			})
			.fetch();
		setProviderSections(response.sections);
	}, [featureDetails, institution, startDate]);

	return (
		<>
			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>
					<p className="mb-0 text-center fs-large">{featureDetails.description}</p>
				</HeroContainer>
			)}

			<AsyncWrapper fetchData={fetchfindOptions}>
				{filters.length > 0 && (
					<Container fluid className="bg-n75 pb-8">
						<Container>
							<Row>
								<Col
									md={{ span: 10, offset: 1 }}
									lg={{ span: 8, offset: 2 }}
									xl={{ span: 6, offset: 3 }}
								>
									<div className="d-flex justify-content-center">
										{filters.map((filter) => {
											switch (filter.filterId) {
												case FIND_OPTIONS_FILTER_IDS.DATE:
													return (
														<FilterDropdown
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
																	moment(selectedDate).format('YYYY-MM-DD')
																);
																setSearchParams(searchParams);
															}}
														>
															<div className="py-3">
																<p className="mb-5 fw-bold">
																	Show providers with availability from:
																	<br />
																	{moment(selectedDate).format('MMMM D')} onwards
																</p>
																<div className="d-flex justify-content-center">
																	<DatePicker
																		inline
																		selected={selectedDate ?? undefined}
																		onChange={(date) => {
																			setSelectedDate(date);
																		}}
																	/>
																</div>
															</div>
														</FilterDropdown>
													);
												case FIND_OPTIONS_FILTER_IDS.TIME_OF_DAY:
													return (
														<FilterDropdown
															className="mx-1"
															id={`connect-with-support-filter--${filter.filterId}`}
															title={filter.name}
															dismissText="Clear"
															onDismiss={() => {
																searchParams.delete('timeOfDay');
																setSearchParams(searchParams);
															}}
															confirmText="Apply"
															onConfirm={() => {
																searchParams.delete('timeOfDay');
																selectedTimesOfDay.forEach((tod) => {
																	searchParams.append('timeOfDay', tod);
																});
																setSearchParams(searchParams);
															}}
														>
															<div className="py-3">
																<p className="mb-5 fw-bold">
																	Do you have a preferred time of day?
																</p>
																{appointmentTimes.map((at, atIndex) => {
																	const isLastAt =
																		atIndex === appointmentTimes.length - 1;

																	return (
																		<Form.Check
																			className={classNames({
																				'mb-1': !isLastAt,
																			})}
																			type="checkbox"
																			name="time-of-day"
																			id={`time-of-day--${at.appointmentTimeId}`}
																			label={`${at.name} • ${at.description}`}
																			value={at.appointmentTimeId}
																			checked={selectedTimesOfDay.includes(
																				at.appointmentTimeId
																			)}
																			onChange={({ currentTarget }) => {
																				const selectedTimesOfDayClone =
																					cloneDeep(selectedTimesOfDay);
																				const targetIndex =
																					selectedTimesOfDayClone.findIndex(
																						(tod) =>
																							tod === currentTarget.value
																					);

																				if (targetIndex > -1) {
																					selectedTimesOfDayClone.splice(
																						targetIndex,
																						1
																					);
																				} else {
																					selectedTimesOfDayClone.push(
																						currentTarget.value
																					);
																				}

																				setSelectedTimesOfDay(
																					selectedTimesOfDayClone
																				);
																			}}
																		/>
																	);
																})}
															</div>
														</FilterDropdown>
													);
												case FIND_OPTIONS_FILTER_IDS.LOCATION:
													return <></>;
												default:
													return null;
											}
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
						<Container fluid className="py-3 bg-white border-top border-bottom">
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
									{section.providers.map((provider) => (
										<ConnectWithSupportItem
											key={provider.providerId}
											title={provider.name}
											subtitle={provider.title}
											descriptionHtml="<p>During your first session, an intake coordinator will collect your information and ask you about the issue/s you're experiencing, spanning issues with self, family, work or substance use. Next they'll help you schedule your next session with a provider appropriate to your needs and goals, which may not be the intake coordinator. The EAP program does not prescribe or recommend medications.</p>"
											buttons={provider.times.map((time) => ({
												title: time.timeDescription,
												disabled: time.status !== 'AVAILABLE',
												onClick: () => {
													window.alert('[TODO]: Start booking flow.');
												},
											}))}
										/>
									))}
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
