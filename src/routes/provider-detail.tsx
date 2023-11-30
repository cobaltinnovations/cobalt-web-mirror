import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { Provider } from '@/lib/models';
import { ProviderSection, providerService } from '@/lib/services';
import { BookingContext, BookingSource } from '@/contexts/booking-context';
import { BookingModals, BookingRefHandle } from '@/components/booking-modals';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';
import AsyncWrapper from '@/components/async-page';
import HeroContainer from '@/components/hero-container';

export const Component = () => {
	const { pathname, search } = useLocation();
	const [searchParams] = useSearchParams();
	const { urlName } = useParams<{ urlName: string }>();

	const { isEligible, setIsEligible, setAppointmentTypes, setEpicDepartments } = useContext(BookingContext);

	const bookingRef = useRef<BookingRefHandle>(null);
	const patientOrderId = useMemo(() => searchParams.get('patientOrderId') ?? undefined, [searchParams]);

	const [provider, setProvider] = useState<Provider>();
	const [providerSections, setProviderSections] = useState<ProviderSection[]>([]);

	const fetchData = useCallback(async () => {
		if (!urlName) {
			throw new Error('urlName is required');
		}

		const providerResponse = await providerService.getProviderById(urlName).fetch();
		const { appointmentTypes, epicDepartments, sections } = await providerService
			.findProviders({
				providerId: providerResponse.provider.providerId,
			})
			.fetch();

		setAppointmentTypes(appointmentTypes);
		setEpicDepartments(epicDepartments);
		setProvider(providerResponse.provider);
		setProviderSections(sections);
	}, [setAppointmentTypes, setEpicDepartments, urlName]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Provider</title>
			</Helmet>

			<BookingModals ref={bookingRef} />
			<IneligibleBookingModal show={!isEligible} onHide={() => setIsEligible(true)} />

			<AsyncWrapper fetchData={fetchData}>
				<HeroContainer className="bg-n75">
					<div className="d-flex">
						<div className="flex-shrink-0">IMG</div>
						<div>
							<h2>{provider?.name}</h2>
							<p>{provider?.title}</p>
							<p>{provider?.emailAddress}</p>
						</div>
					</div>
				</HeroContainer>
				<Container className="py-10">
					<Row className="mb-10">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h4 className="mb-2">Schedule an appointment</h4>
							<p className="mb-0">Choose a time with {provider?.name} that works for you</p>
						</Col>
					</Row>
					{providerSections.map((section, sectionIndex) => (
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
			</AsyncWrapper>
		</>
	);
};
