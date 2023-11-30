import React, { Suspense, useContext, useEffect, useMemo, useRef } from 'react';
import { Await, LoaderFunctionArgs, defer, useLocation, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { providerService } from '@/lib/services';
import { BookingContext, BookingSource } from '@/contexts/booking-context';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import HeroContainer from '@/components/hero-container';
import { Loader } from 'react-bootstrap-typeahead';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	imageOuter: {
		width: 88,
		height: 88,
		flexShrink: 0,
		marginRight: 24,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n500,
	},
}));

const loadProviderDetails = async (urlName: string) => {
	try {
		const { provider } = await providerService.getProviderById(urlName).fetch();
		const { appointmentTypes, epicDepartments, sections } = await providerService
			.findProviders({
				providerId: provider.providerId,
			})
			.fetch();

		return {
			provider,
			appointmentTypes,
			epicDepartments,
			sections,
		};
	} catch (error) {
		throw error;
	}
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
	return defer({ deferredData: loadProviderDetails(params.urlName as string) });
};

const useProviderDetailLoaderData = () => {
	return useRouteLoaderData('provider-detail') as { deferredData: ReturnType<typeof loadProviderDetails> };
};

export const Component = () => {
	const classes = useStyles();
	const { pathname, search } = useLocation();
	const [searchParams] = useSearchParams();
	const { deferredData } = useProviderDetailLoaderData();
	const { isEligible, setIsEligible, setAppointmentTypes, setEpicDepartments } = useContext(BookingContext);
	const bookingRef = useRef<BookingRefHandle>(null);
	const patientOrderId = useMemo(() => searchParams.get('patientOrderId') ?? undefined, [searchParams]);

	useEffect(() => {
		const setBookingContextData = async () => {
			const { appointmentTypes, epicDepartments } = await deferredData;

			setAppointmentTypes(appointmentTypes);
			setEpicDepartments(epicDepartments);
		};

		setBookingContextData();
	}, [deferredData, setAppointmentTypes, setEpicDepartments]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Provider</title>
			</Helmet>

			<BookingModals ref={bookingRef} />
			<IneligibleBookingModal show={!isEligible} onHide={() => setIsEligible(true)} />

			<Suspense fallback={<Loader />}>
				<Await resolve={deferredData}>
					{({ provider, sections }: Awaited<typeof deferredData>) => (
						<>
							<HeroContainer className="bg-n75 py-8 py-lg-17">
								<div className="d-flex align-items-center">
									<div
										className={classes.imageOuter}
										style={{ backgroundImage: `url(${provider.imageUrl})` }}
									/>
									<div>
										<h2 className="mb-2">{provider.name}</h2>
										{provider.supportRolesDescription && (
											<p className="mb-0">{provider.supportRolesDescription}</p>
										)}
									</div>
								</div>
							</HeroContainer>
							<Container className="py-8 py-lg-10">
								<Row className="mb-10">
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<h4 className="mb-2">Schedule an appointment</h4>
										<p className="mb-0">Choose a time with {provider?.name} that works for you</p>
									</Col>
								</Row>
								{sections.map((section, sectionIndex) => (
									<Row className="mb-6" key={sectionIndex}>
										<Col
											md={{ span: 10, offset: 1 }}
											lg={{ span: 8, offset: 2 }}
											xl={{ span: 6, offset: 3 }}
										>
											<p className="mb-3">
												<span className="fw-bold">{section.dateDescription}</span>
												{(section.providers.length <= 0 || section.fullyBooked) && (
													<span className="ms-2 fw-normal text-gray">No Availability</span>
												)}
											</p>
											{section.providers.map((currentProvider) => {
												return (
													<div key={currentProvider.providerId} className="d-flex flex-wrap">
														{currentProvider.times.map((time, timeIndex) => (
															<Button
																key={timeIndex}
																variant="light"
																className="me-1 mb-2"
																disabled={time.status !== 'AVAILABLE'}
																onClick={() => {
																	bookingRef.current?.kickoffBookingProcess({
																		source: BookingSource.ProviderDetail,
																		exitUrl: `${pathname}${search}`,
																		provider: currentProvider,
																		date: section.date,
																		timeSlot: time,
																		patientOrderId,
																	});
																}}
															>
																{time.timeDescription}
															</Button>
														))}
													</div>
												);
											})}
										</Col>
									</Row>
								))}
							</Container>
						</>
					)}
				</Await>
			</Suspense>
		</>
	);
};
