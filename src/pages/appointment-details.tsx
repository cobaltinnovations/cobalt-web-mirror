import React, { FC, useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import AsyncPage from '@/components/async-page';

import { appointmentService } from '@/lib/services';
import { AppointmentModel, VideoconferencePlatformId } from '@/lib/models';
import HeroContainer from '@/components/hero-container';
import useAccount from '@/hooks/use-account';

const AppointmentDetails: FC = () => {
	const navigate = useNavigate();
	const [details, setDetails] = useState<AppointmentModel>();
	const { appointmentId } = useParams<{ appointmentId?: string }>();
	const { institution } = useAccount();

	const fetchData = useCallback(async () => {
		const { appointment } = await appointmentService.getAppointment(appointmentId).fetch();
		if (!appointment) {
			navigate('/404', { replace: true });
		}
		setDetails(appointment);
	}, [appointmentId, navigate]);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Appointment</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				<HeroContainer>
					<h2 className="mb-0 text-center">Appointment</h2>
				</HeroContainer>
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
		</>
	);
};

export default AppointmentDetails;
