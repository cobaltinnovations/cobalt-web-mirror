import React, { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FullscreenBar from '@/components/fullscreen-bar';
import InlineAlert from '@/components/inline-alert';
import InputHelper from '@/components/input-helper';
import SvgIcon from '@/components/svg-icon';
import useAccount from '@/hooks/use-account';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [formValues, setFormValues] = useState({
		firstName: '',
		lastName: '',
		emailAddress: '',
		phoneNumber: '',
	});

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
	};

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Book Appointment</title>
			</Helmet>

			<FullscreenBar
				title="[TODO]: where does this come from"
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
							<h3 className="h4 mb-4">Additional Info</h3>
							<p className="mb-8 fs-large">
								Message about why info is needed and who has access to it. Please make sure that your
								information is entered correctly.
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
								<p className="mb-8 text-muted">Required because...</p>

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
									size={18}
									className="text-primary me-4 mt-1 flex-shrink-0"
								/>
								<div>
									<p className="mb-1 fs-large fw-bold">[TODO]</p>
									<p className="mb-0 fs-large text-muted">[TODO]</p>
								</div>
							</div>

							<div className="d-flex align-items-start py-6 border-bottom">
								<SvgIcon
									kit="far"
									icon="phone"
									size={18}
									className="text-primary me-4 mt-1 flex-shrink-0"
								/>
								<div>
									<p className="mb-1 fs-large fw-bold">[TODO]</p>
									<p className="mb-0 fs-large text-muted">[TODO]</p>
								</div>
							</div>

							<div className="d-flex align-items-start py-6 border-bottom">
								<SvgIcon
									kit="far"
									icon="calendar"
									size={18}
									className="text-primary me-4 mt-1 flex-shrink-0"
								/>
								<p className="mb-0 fs-large fw-bold">[TODO]</p>
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
		</>
	);
};
