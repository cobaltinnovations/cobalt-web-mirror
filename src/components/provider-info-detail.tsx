import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import ProviderScheduleCard from '@/components/provider-schedule-card';
import { SCHEDULE_TYPE_ID } from './provider-next-appointment-card';
import ProviderScheduleModal from './provider-schedule-modal';

interface ProviderInfoDetailProps {
	scheduleAppointmentDescription: string;
	scheduleTypeId: SCHEDULE_TYPE_ID;
}

const ProviderInfoDetail = ({ scheduleAppointmentDescription, scheduleTypeId }: ProviderInfoDetailProps) => {
	const [showProviderScheduleModal, setShowProviderScheduleModal] = useState(false);

	return (
		<>
			<ProviderScheduleModal
				show={showProviderScheduleModal}
				onHide={() => {
					setShowProviderScheduleModal(false);
				}}
			/>

			<Container>
				<Row>
					<Col xs={7}>
						<Row className="mb-10">
							<Col>
								<h3 className="mb-6">About</h3>
								<p className="mb-6 fs-large">
									Specifically for _ employees, the Employee Assistance Program (EAP) offers up to 8
									sessions of free, confidential, solution-focused counseling per issue. An 'issue' is
									the reason for seeking support, such as relationship challenges or grief.
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
								<p className="mb-0 fs-large">The following is a list of accepted insurance plans.</p>
								<p className="mb-6 fs-large">You will need to confirm your insurance before booking.</p>
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
					<Col xs={5}>
						<ProviderScheduleCard
							scheduleAppointmentDescription={scheduleAppointmentDescription}
							scheduleTypeId={scheduleTypeId}
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

export default ProviderInfoDetail;
