import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import ProviderSearchResult, { SCHEDULE_TYPE_ID } from '@/components/provider-search-result';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import ProviderScheduleModal from '@/components/provider-schedule-modal';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();
	const [showProviderCanvas, setShowProviderCanvas] = useState(false);
	const [showProviderScheduleModal, setShowProviderScheduleModal] = useState(false);

	const placeholderImage = useRandomPlaceholderImage();

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Providers</title>
			</Helmet>

			<PreviewCanvas
				title={'Provider title'}
				show={showProviderCanvas}
				onHide={() => {
					setShowProviderCanvas(false);
				}}
			>
				<Container>
					<Row>
						<Col sx={7}>
							<Row className="mb-10">
								<Col>
									<h3 className="mb-6">About</h3>
									<p className="mb-6 fs-large">
										Specifically for _ employees, the Employee Assistance Program (EAP) offers up to
										8 sessions of free, confidential, solution-focused counseling per issue. An
										'issue' is the reason for seeking support, such as relationship challenges or
										grief.
									</p>
									<p className="mb-0 fs-large">
										These counseling sessions and visits are not documented in MyChart.
									</p>
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<hr />
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<h3 className="mb-6">Insurance</h3>
									<p className="mb-0 fs-large">
										The following is a list of accepted insurance plans.
									</p>
									<p className="mb-6 fs-large">
										You will need to confirm your insurance before booking.
									</p>
									<Table>
										<TableHead>
											<TableRow>
												<TableCell header>Health Insurance</TableCell>
												<TableCell header className="text-right">
													Behavioral Health Insurance
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow>
												<TableCell>Aetna Choice Point-of-Service (POS) II</TableCell>
												<TableCell className="text-right">
													Aetna Behavioral Health Network
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<hr />
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<h3 className="mb-6">Specialties / Expertise</h3>
									<ul className="mb-0">
										<li className="fs-large">Autism</li>
									</ul>
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<hr />
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<h3 className="mb-6">Population Served</h3>
									<ul className="mb-0">
										<li className="fs-large">Age</li>
										<li className="fs-large">Individuals</li>
									</ul>
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<hr />
								</Col>
							</Row>

							<Row className="mb-10">
								<Col>
									<h3 className="mb-6">Treatment Methods</h3>
									<ul className="mb-0">
										<li className="fs-large">Cognitive Behavorial (CBT)</li>
									</ul>
								</Col>
							</Row>
						</Col>
						<Col sx={5}></Col>
					</Row>
				</Container>
			</PreviewCanvas>

			<ProviderScheduleModal
				show={showProviderScheduleModal}
				onHide={() => {
					setShowProviderScheduleModal(false);
				}}
			/>

			<Container className="pt-10 pb-16">
				<Row className="mb-6">
					<Col>
						<h2 className="mb-2">Providers</h2>
						<p className="mb-6">
							Provider offerings may vary. Select your employer to see available providers and
							appointments.
						</p>
						<hr />
					</Col>
				</Row>
				<Row className="mb-6 mb-lg-8">
					<Col>
						<div className="d-flex">
							<InputHelper
								className="me-6"
								as="select"
								label="Care Type"
								value={''}
								onChange={({ currentTarget }) => {
									return currentTarget;
								}}
							>
								<option value="" disabled>
									Select...
								</option>
							</InputHelper>
							<InputHelper
								as="select"
								label="Employer"
								value={''}
								onChange={({ currentTarget }) => {
									return currentTarget;
								}}
							>
								<option value="" disabled>
									Select...
								</option>
							</InputHelper>
						</div>
					</Col>
				</Row>
				<Row>
					<Col>
						<p className="mb-6 mb-lg-10">
							<strong>4 available _ for _ employees</strong>
						</p>
						<ProviderSearchResult
							className="mb-6"
							imageUrl={placeholderImage}
							title="Employee Assistance Program"
							description="The Employee Assistance Program (EAP) offers up to 8 sessions of free, confidential, solution-focused counseling per issue. An 'issue' is the reason for seeking support, such as relationship challenges or grief."
							scheduleAppointmentDescription="Your first appointment is a 30 minute phone call with a clinician to assess your needs and discuss potential resources."
							scheduleTypeId={SCHEDULE_TYPE_ID.APPOINTMENT_PREDETERMINED}
							onTitleButtonClick={() => {
								setShowProviderCanvas(true);
							}}
							onViewAppointmentsButtonClick={() => {
								setShowProviderScheduleModal(true);
							}}
						/>
						<ProviderSearchResult
							className="mb-6"
							imageUrl={placeholderImage}
							title="Autism Clinic"
							description="Autism Clinic diagnoses and treats patients as part of a 4-month long, outpatient program. Autism Clinic bills insurance for your visits"
							scheduleAppointmentDescription="You will need to answer a few questions before scheduling to determine which type of appointment is right for you."
							scheduleTypeId={SCHEDULE_TYPE_ID.APPOINTMENT_UNDETERMINED}
							onTitleButtonClick={() => {
								setShowProviderCanvas(true);
							}}
							onViewAppointmentsButtonClick={() => {
								setShowProviderScheduleModal(true);
							}}
						/>
						<ProviderSearchResult
							imageUrl={placeholderImage}
							title="General Employee Assistance Program"
							description="The General Health Employee Assistance Program (EAP offers eight (8) free confidential counseling sessions, as well as educational tools and referral services to help you manage life's challenges. The EAP is managed by Quest Behavioral Health, which provides access to a network of behavioral health providers in the community. Employees can contact Quest directly by calling 1-800-364-6352; all contacts are confidential."
							scheduleAppointmentDescription="Available 24 hours a day/7 days a week for urgent clinical matters"
							scheduleTypeId={SCHEDULE_TYPE_ID.APPOINTMENT_BY_PHONE}
							onTitleButtonClick={() => {
								setShowProviderCanvas(true);
							}}
							onViewAppointmentsButtonClick={() => {
								setShowProviderScheduleModal(true);
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
