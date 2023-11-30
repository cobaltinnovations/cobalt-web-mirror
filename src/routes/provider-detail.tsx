import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { LoaderFunctionArgs, useLocation, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { providerService } from '@/lib/services';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import HeroContainer from '@/components/hero-container';
import { BookingContext, BookingSource } from '@/contexts/booking-context';

function useProviderDetailLoaderData() {
	return useRouteLoaderData('provider-detail') as Awaited<ReturnType<typeof loader>>;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const urlName = params.urlName as string;

	const { provider } = await providerService.getProviderById(urlName).fetch();
	const { appointmentTypes, epicDepartments, sections } = await providerService
		.findProviders({
			providerId: provider.providerId,
		})
		.fetch();

	return {
		appointmentTypes,
		epicDepartments,
		provider,
		sections,
	};
};

export const Component = () => {
	const { pathname, search } = useLocation();
	const [searchParams] = useSearchParams();
	const { appointmentTypes, epicDepartments, provider, sections } = useProviderDetailLoaderData();

	const { isEligible, setIsEligible, setAppointmentTypes, setEpicDepartments } = useContext(BookingContext);

	const bookingRef = useRef<BookingRefHandle>(null);
	const patientOrderId = useMemo(() => searchParams.get('patientOrderId') ?? undefined, [searchParams]);

	useEffect(() => {
		setAppointmentTypes(appointmentTypes);
		setEpicDepartments(epicDepartments);
	}, [appointmentTypes, epicDepartments, provider, setAppointmentTypes, setEpicDepartments]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Provider - {provider.name}</title>
			</Helmet>

			<BookingModals ref={bookingRef} />
			<IneligibleBookingModal show={!isEligible} onHide={() => setIsEligible(true)} />

			<HeroContainer className="bg-n75">Hello there!</HeroContainer>

			<Container className="py-10">
				<Row className="mb-10">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h4 className="mb-2">Schedule an appointment</h4>
						<p className="mb-0">Choose a time with {provider.name} that works for you</p>
					</Col>
				</Row>

				{sections.map((section, sectionIndex) => (
					<Row className="mb-6" key={sectionIndex}>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
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
	);
};
