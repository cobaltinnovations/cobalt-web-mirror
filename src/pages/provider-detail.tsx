import AsyncPage from '@/components/async-page';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import Breadcrumb from '@/components/breadcrumb';
import DayContainer from '@/components/day-container';
import { ProviderInfoCard } from '@/components/provider-info-card';
import TabBar from '@/components/tab-bar';
import { BookingContext, BookingSource } from '@/contexts/booking-context';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import { providerService } from '@/lib/services';
import { Scrollspy } from '@makotot/ghostui';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';

const useProviderDetailStyles = createUseThemedStyles((theme) => ({
	horizontalScroller: {
		marginTop: 10,
		display: 'flex',
		flexWrap: 'wrap',
		[mediaQueries.md]: {
			left: 0,
			bottom: 0,
			zIndex: 0,
			margin: 0,
			marginLeft: -20,
			paddingLeft: 20,
			paddingBottom: 20,
			overflowX: 'auto',
			flexWrap: 'nowrap',
			width: `calc(100% + 40px)`,
		},
	},
	availabilityButton: {
		[mediaQueries.md]: {
			width: 125,
			flexShrink: 0,
		},
	},
	navOuter: {
		height: 40,
		marginBottom: 48,
	},
	navbar: {
		height: 40,
		listStyle: 'none',
		display: 'flex',
		margin: 0,
		padding: 0,
		alignItems: 'center',
	},
	navItem: {
		position: 'relative',
		'&:after': {
			bottom: 0,
			height: 4,
			width: '100%',
			content: '""',
			display: 'block',
			position: 'absolute',
			backgroundColor: 'transparent',
		},
		'& a': {
			color: theme.colors.n500,
			textDecoration: 'none',
		},
	},
	stickyNavbar: {
		position: 'fixed',
		top: 54,
		left: 0,
		zIndex: 2,
		width: '100%',
	},
	sectionAnchor: {
		position: 'relative',
		top: -122,
		visibility: 'hidden',
	},
	activeNav: {
		'&:after': {
			backgroundColor: theme.colors.p500,
		},
		'& a': {
			color: theme.colors.n900,
			textDecoration: 'none',
		},
	},
}));

const ProviderDetail = () => {
	const classes = useProviderDetailStyles();
	const { pathname, search } = useLocation();
	const { providerId } = useParams<{ providerId: string }>();
	const {
		setAppointmentTypes,
		selectedProvider,
		setSelectedProvider,
		availableSections,
		setAvailableSections,
		specialties,
		setSpecialties,

		selectedTimeSlot,
	} = useContext(BookingContext);

	const inFlightFindRef = useRef<any>();
	const inFlightProviderRef = useRef<any>();
	const navRef = useRef<HTMLDivElement>(null);
	const bookingRef = useRef<BookingRefHandle>(null);
	const sectionRefs = [
		useRef<HTMLDivElement>(null),
		useRef<HTMLDivElement>(null),
		useRef<HTMLDivElement>(null),
		useRef<HTMLDivElement>(null),
	];
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			// 54 is the height of the default Cobalt header
			setScrolled((navRef.current?.getBoundingClientRect().top ?? 0) - 54 <= 0);
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	const fetchData = useCallback(() => {
		if (!providerId) {
			return;
		}

		const findRequest = providerService.findProviders({ providerId });
		const providerRequest = providerService.getProviderById(providerId);

		const promise = Promise.all([findRequest.fetch(), providerRequest.fetch()]).then(
			([findResponse, providerResponse]) => {
				setAppointmentTypes(findResponse.appointmentTypes);
				setAvailableSections(findResponse.sections);
				setSpecialties(findResponse.specialties ?? []);
				setSelectedProvider(providerResponse.provider);
			}
		);

		inFlightFindRef.current = findRequest;
		inFlightProviderRef.current = providerRequest;

		return promise;
	}, [providerId, setAppointmentTypes, setAvailableSections, setSelectedProvider, setSpecialties]);

	useEffect(() => {
		return () => {
			inFlightFindRef.current?.abort();
			inFlightProviderRef.current?.abort();
		};
	}, []);

	return (
		<AsyncPage fetchData={fetchData}>
			<BookingModals ref={bookingRef} />

			<Breadcrumb
				breadcrumbs={[
					{
						to: '/connect-with-support',
						title: 'Connect With Support',
					},
					{
						to: '/#',
						title: selectedProvider?.name ?? '',
					},
				]}
			/>

			<Scrollspy sectionRefs={sectionRefs} offset={-100}>
				{({ currentElementIndexInViewport }) => {
					return (
						<>
							<Container className="py-4">
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										{selectedProvider && (
											<ProviderInfoCard
												linkToExternalBio
												hideSpecifics
												provider={selectedProvider}
											/>
										)}
									</Col>
								</Row>
							</Container>
							<div className={classes.navOuter} ref={navRef}>
								<Container
									fluid
									className={classNames('bg-white', {
										[classes.stickyNavbar]: scrolled,
									})}
								>
									<Container>
										<Row>
											<Col
												md={{ span: 10, offset: 1 }}
												lg={{ span: 8, offset: 2 }}
												xl={{ span: 6, offset: 3 }}
											>
												<TabBar
													hideBorder
													value={
														currentElementIndexInViewport === 0
															? '#about'
															: currentElementIndexInViewport === 2
															? '#payment'
															: currentElementIndexInViewport === 3
															? '#availability'
															: ''
													}
													tabs={[
														{ value: '#about', title: 'About' },
														{ value: '#payment', title: 'Payment' },
														{ value: '#availability', title: 'Availability' },
													]}
													onTabClick={(value) => {
														window.location.href = `${pathname}${value}`;
													}}
												/>
											</Col>
										</Row>
									</Container>
								</Container>
							</div>
							<Container>
								<Row className="mb-8">
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<div ref={sectionRefs[0]}>
											<div id="about" className={classes.sectionAnchor} />
											<h4>About</h4>
											<div
												className="wysiwyg-display"
												dangerouslySetInnerHTML={{
													__html: selectedProvider?.bio ?? '<p>Not available.</p>',
												}}
											/>
										</div>
									</Col>
								</Row>
								<Row className="mb-8">
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<div ref={sectionRefs[2]}>
											<div id="payment" className={classes.sectionAnchor} />
											<h4>Payment</h4>
											{!!selectedProvider?.paymentFundingDescriptions?.length ? (
												<ul>
													{selectedProvider?.paymentFundingDescriptions?.map(
														(paymentOption, index) => {
															return <li key={index}>{paymentOption}</li>;
														}
													)}
												</ul>
											) : (
												<p>Not available.</p>
											)}
										</div>
									</Col>
								</Row>
								<Row>
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
										ref={sectionRefs[3]}
									>
										<div id="availability" className={classes.sectionAnchor} />
										<h3>Book an appointment</h3>

										{selectedProvider
											? availableSections.map((section, idx) => {
													const sectionProvider = section.providers[0];
													const timeSlots = sectionProvider.times ?? {};

													return (
														<div key={section.date}>
															<DayContainer className="mb-4">
																<p className="mb-0 fw-bold">
																	{section.dateDescription}
																</p>
															</DayContainer>

															<div className={classes.horizontalScroller}>
																{sectionProvider.fullyBooked ? (
																	<p>all appointments are booked for this date</p>
																) : (
																	timeSlots.map((availability) => (
																		<Button
																			size="sm"
																			variant={
																				selectedTimeSlot === availability
																					? 'primary'
																					: 'light'
																			}
																			className={classNames(
																				`${classes.availabilityButton}`,
																				'me-1',
																				'mb-1'
																			)}
																			disabled={
																				availability.status !== 'AVAILABLE'
																			}
																			key={availability.time}
																			onClick={() => {
																				bookingRef.current?.kickoffBookingProcess(
																					{
																						source: BookingSource.ProviderDetail,
																						exitUrl: `${pathname}${search}`,
																						timeSlot: availability,
																						date: section.date,
																						provider: sectionProvider,
																					}
																				);
																			}}
																		>
																			{availability.timeDescription}
																		</Button>
																	))
																)}
															</div>
														</div>
													);
											  })
											: null}
									</Col>
								</Row>
							</Container>
						</>
					);
				}}
			</Scrollspy>
		</AsyncPage>
	);
};

export default ProviderDetail;
