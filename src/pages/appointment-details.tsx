import React, { FC, useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import useHeaderTitle from '@/hooks/use-header-title';

import AsyncPage from '@/components/async-page';

import { appointmentService } from '@/lib/services';
import { AppointmentModel, VideoconferencePlatformId } from '@/lib/models';

const AppointmentDetails: FC = () => {
	useHeaderTitle('Appointment');
	const navigate = useNavigate();
	const [details, setDetails] = useState<AppointmentModel>();
	const { appointmentId } = useParams<{ appointmentId?: string }>();

	const fetchData = useCallback(async () => {
		const { appointment } = await appointmentService.getAppointment(appointmentId).fetch();
		if (!appointment) {
			navigate('/404', { replace: true });
		}
		setDetails(appointment);
	}, [appointmentId, navigate]);

	return (
		<AsyncPage fetchData={fetchData}>
			{details?.videoconferencePlatformId === VideoconferencePlatformId.TELEPHONE ? (
				<Container className="pt-5">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<p className="text-center fs-large mt-5">
								Your telephone consultation is scheduled for {details.timeDescription}. Your intake
								counselor will call you at that time.
							</p>
						</Col>
					</Row>
				</Container>
			) : (
				<></>
			)}
		</AsyncPage>
	);
};

export default AppointmentDetails;
