import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import Loader from '@/components/loader';
import useAccount from '@/hooks/use-account';

export const PatientAssessmentComplete = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const timeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		if (!timeoutRef.current) {
			timeoutRef.current = setTimeout(() => {
				navigate('/ic/patient/assessment-results');
			}, 5000);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [navigate]);

	return (
		<>
			<Helmet>
				<title>{institution.name ?? 'Cobalt'} | Integrated Care - Assessment Complete</title>
			</Helmet>

			<Container className="py-20">
				<Row className="mb-14">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h1 className="mb-6 text-center">Assessment Complete</h1>
						<p className="mb-0 text-center">
							Thank you for taking the time to answer those questions. We are working on your
							recommendation. Please wait while we determine what type of care is best for you.
						</p>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Loader />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default PatientAssessmentComplete;
