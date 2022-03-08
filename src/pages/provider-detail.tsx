import AsyncPage from '@/components/async-page';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import Breadcrumb from '@/components/breadcrumb';
import DayContainer from '@/components/day-container';
import { ProviderInfoCard } from '@/components/provider-info-card';
import { BookingContext, BookingSource } from '@/contexts/booking-context';
import colors from '@/jss/colors';
import mediaQueries from '@/jss/media-queries';
import { providerService } from '@/lib/services';
import { Scrollspy } from '@makotot/ghostui';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';

const useProviderDetailStyles = createUseStyles({
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
			paddingTop: 40,
			paddingLeft: 20,
			overflowX: 'auto',
			flexWrap: 'nowrap',
			position: 'absolute',
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
			color: colors.gray600,
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
		top: -450,
		visibility: 'hidden',
	},
	activeNav: {
		'&:after': {
			backgroundColor: colors.primary,
		},
		'& a': {
			color: colors.black,
			textDecoration: 'none',
		},
	},
});

const ProviderDetail = () => {
	const classes = useProviderDetailStyles();
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

	const inFlightRef = useRef<any>();
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
			if (!navRef.current) {
				return;
			}

			// 54 is the height of the header
			setScrolled(navRef.current.getBoundingClientRect().top - 54 <= 0);
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	const fetchData = useCallback(() => {
		const request = providerService.findProviders({ providerId });
		const promise = request.fetch().then((response) => {
			setAppointmentTypes(response.appointmentTypes);
			setSelectedProvider(Object.assign({}, response.sections?.[0]?.providers?.[0], response.provider));
			setAvailableSections(response.sections);
			setSpecialties(response.specialties ?? []);
		});

		inFlightRef.current = request;

		return promise;
	}, [providerId, setAppointmentTypes, setAvailableSections, setSelectedProvider, setSpecialties]);

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

			<Scrollspy sectionRefs={sectionRefs}>
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
											<ProviderInfoCard hideSpecifics provider={selectedProvider} />
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
												<ul className={classes.navbar}>
													<li
														className={classNames('ml-2 py-2', classes.navItem, {
															[classes.activeNav]: currentElementIndexInViewport === 0,
														})}
													>
														<a href="#about">About</a>
													</li>
													<li
														className={classNames('ml-2 py-2', classes.navItem, {
															[classes.activeNav]: currentElementIndexInViewport === 1,
														})}
													>
														<a href="#specialties">Specialties</a>
													</li>
													<li
														className={classNames('ml-2 py-2', classes.navItem, {
															[classes.activeNav]: currentElementIndexInViewport === 2,
														})}
													>
														<a href="#payment">Payment</a>
													</li>
												</ul>
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
										<div className="mb-8" ref={sectionRefs[0]}>
											<div id="about" className={classes.sectionAnchor} />
											<h4>About</h4>
											<div
												dangerouslySetInnerHTML={{
													__html: selectedProvider?.bio ?? '<p>Not available.</p>',
												}}
											></div>
										</div>

										<div className="mb-8" ref={sectionRefs[1]}>
											<div id="specialties" className={classes.sectionAnchor} />
											<h4>Specialties</h4>
											{!!specialties?.length ? (
												<ul>
													{specialties?.map((specialty) => {
														return (
															<li key={specialty.specialtyId}>{specialty.description}</li>
														);
													})}
												</ul>
											) : (
												<p>Not available.</p>
											)}
										</div>

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
																<p className="mb-0 font-karla-bold">
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
																				'mr-1',
																				'mb-1'
																			)}
																			disabled={
																				availability.status !== 'AVAILABLE'
																			}
																			key={availability.time}
																			onClick={() => {
																				bookingRef.current?.kickoffBookingProcess(
																					{
																						source:
																							BookingSource.ProviderDetail,
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
