import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';
import AppointmentDateTimePicker, { getDefaultAppointmentDateTime } from '@/components/appointment-date-time-picker';

export const loader = () => {
	return null;
};

export const Component = () => {
	const { institution } = useAccount();
	const [selectedAppointmentDateTime, setSelectedAppointmentDateTime] = useState(getDefaultAppointmentDateTime);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Confirm Appointment Time</title>
			</Helmet>

			<Container>
				<Row>
					<Col>
						<AppointmentDateTimePicker
							value={selectedAppointmentDateTime}
							onChange={setSelectedAppointmentDateTime}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};
