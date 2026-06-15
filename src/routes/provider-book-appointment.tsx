import React, { useCallback, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AsyncWrapper from '@/components/async-page';
import FullscreenBar from '@/components/fullscreen-bar';
import InlineAlert from '@/components/inline-alert';
import InputHelper from '@/components/input-helper';
import {
	getAppointmentModalitySummaryById,
	isProviderAppointmentModalityId,
} from '@/components/provider-appointment-modality-summary';
import SvgIcon from '@/components/svg-icon';
import useAccount from '@/hooks/use-account';
import { Clinic, InstitutionLocation, Provider, ProviderSearchResultTypeId } from '@/lib/models';
import { clinicService, institutionService, providerService } from '@/lib/services';

export const loader = () => {
	return null;
};

const getAppointmentDateTimeLabelFromSearchParams = (searchParams: URLSearchParams) => {
	const date = searchParams.get('date');
	const time = searchParams.get('time');
	const dateTime = date
		? moment(`${date} ${time ?? ''}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mmA'])
		: undefined;

	return dateTime?.isValid() ? dateTime.format('MMMM D, YYYY [at] h:mmA') : undefined;
};

export const Component = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const providerId = useMemo(() => searchParams.get('providerId') ?? '', [searchParams]);
	const clinicId = useMemo(() => searchParams.get('clinicId') ?? '', [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);
	const providerSearchResultTypeId = useMemo(
		() => (searchParams.get('providerSearchResultTypeId') as ProviderSearchResultTypeId) ?? '',
		[searchParams]
	);
	const appointmentDateTimeLabel = useMemo(
		() => getAppointmentDateTimeLabelFromSearchParams(searchParams),
		[searchParams]
	);
	const appointmentModalityId = useMemo(() => {
		const appointmentModalityId = searchParams.get('appointmentModalityId');

		return isProviderAppointmentModalityId(appointmentModalityId) ? appointmentModalityId : undefined;
	}, [searchParams]);
	const selectedAppointmentModalitySummary = useMemo(() => {
		return getAppointmentModalitySummaryById(appointmentModalityId);
	}, [appointmentModalityId]);

	const [formValues, setFormValues] = useState({
		firstName: '',
		lastName: '',
		emailAddress: '',
		phoneNumber: '',
	});
	const [provider, setProvider] = useState<Provider>();
	const [clinic, setClinic] = useState<Clinic>();
	const [institutionLocation, setInstitutionLocation] = useState<InstitutionLocation>();

	const fetchData = useCallback(async () => {
		const institutionLocationRequest = institutionLocationId
			? institutionService.getInstitutionLocationByIinstitutionLocationId(institutionLocationId).fetch()
			: Promise.resolve(undefined);

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.PROVIDER && providerId) {
			const [providerResponse, institutionLocationResponse] = await Promise.all([
				providerService.getProviderById(providerId).fetch(),
				institutionLocationRequest,
			]);

			setProvider(providerResponse.provider);
			setClinic(undefined);
			setInstitutionLocation(institutionLocationResponse?.location);
			return;
		}

		if (providerSearchResultTypeId === ProviderSearchResultTypeId.CLINIC && clinicId) {
			const [clinicResponse, institutionLocationResponse] = await Promise.all([
				clinicService.getClinicByClinicId(clinicId).fetch(),
				institutionLocationRequest,
			]);

			setProvider(undefined);
			setClinic(clinicResponse.clinic);
			setInstitutionLocation(institutionLocationResponse?.location);
			return;
		}

		throw new Error('Required query parameters are undefined.');
	}, [clinicId, institutionLocationId, providerId, providerSearchResultTypeId]);

	const handleFormValueChange = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues((previousFormValues) => ({
			...previousFormValues,
			[currentTarget.name]: currentTarget.value,
		}));
	};

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log({
			...formValues,
			...Object.fromEntries(searchParams),
		});

		const queryString = searchParams.toString();
		navigate(queryString ? `/provider-booking-complete?${queryString}` : '/provider-booking-complete');
	};

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Book Appointment</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<FullscreenBar
					title={`Appointment Scheduling - ${institutionLocation?.name}`}
					onExit={() => {
						navigate('/providers');
					}}
				/>

				<Container className="pt-10 pb-16">
					<Row className="mb-10">
						<Col>
							<h2 className="mb-4">Book Appointment</h2>
							<p className="mb-0 fs-large">
								This provider requires more information before you can schedule.
							</p>
						</Col>
					</Row>

					<Row className="mb-10">
						<Col lg={8} className="mb-6 mb-lg-0">
							<div className="bg-white border rounded-4 py-8 px-6">
								<h4 className="mb-4">Additional Info</h4>
								<p className="mb-8 fs-large">
									Message about why info is needed and who has access to it. Please make sure that
									your information is entered correctly.
								</p>

								<Form id="provider-book-appointment-form" onSubmit={handleFormSubmit}>
									<InputHelper
										className="mb-4"
										name="firstName"
										label="First Name"
										value={formValues.firstName}
										onChange={handleFormValueChange}
									/>
									<InputHelper
										required
										className="mb-4"
										name="lastName"
										label="Last Name"
										value={formValues.lastName}
										onChange={handleFormValueChange}
									/>
									<InputHelper
										className="mb-4"
										type="email"
										name="emailAddress"
										label="Email Address"
										value={formValues.emailAddress}
										onChange={handleFormValueChange}
									/>
									<InputHelper
										required
										className="mb-2"
										type="tel"
										name="phoneNumber"
										label="Phone Number"
										value={formValues.phoneNumber}
										onChange={handleFormValueChange}
									/>
									<p className="mb-8 text-muted small">Required because...</p>

									<InlineAlert
										variant="info"
										title="Message about information sharing"
										description="TBD"
									/>
								</Form>
							</div>
						</Col>

						<Col lg={4}>
							<div className="bg-white border rounded-4 shadow-lg py-8 px-6">
								<h5 className="mb-6">Booking Summary</h5>

								<div className="d-flex align-items-start pb-6 border-bottom">
									<SvgIcon
										kit="far"
										icon="location-dot"
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
									/>
									<div>
										<p className="mb-1 fs-large fw-bold">{provider?.name ?? clinic?.description}</p>
										{provider?.description && (
											<p className="mb-0 fs-large text-muted">{provider.description}</p>
										)}
									</div>
								</div>

								<div className="d-flex align-items-start py-6 border-bottom">
									<SvgIcon
										kit="far"
										icon={selectedAppointmentModalitySummary.icon}
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
									/>
									<div>
										<p className="mb-1 fs-large fw-bold">
											{selectedAppointmentModalitySummary.title}
										</p>
										<p className="mb-0 fs-large text-muted">
											{selectedAppointmentModalitySummary.description}
										</p>
									</div>
								</div>

								<div className="d-flex align-items-start py-6 border-bottom">
									<SvgIcon
										kit="far"
										icon="calendar"
										size={16}
										className="text-primary me-2 mt-1 flex-shrink-0"
									/>
									<p className="mb-0 fs-large fw-bold">{appointmentDateTimeLabel}</p>
								</div>

								<Button type="submit" form="provider-book-appointment-form" className="w-100 mt-6">
									Book Appointment
								</Button>
							</div>
						</Col>
					</Row>

					<Button
						type="button"
						variant="outline-primary"
						className="d-inline-flex align-items-center"
						onClick={() => {
							navigate(-1);
						}}
					>
						<SvgIcon kit="far" icon="chevron-left" size={16} className="me-3" />
						Previous
					</Button>
				</Container>
			</AsyncWrapper>
		</>
	);
};
