import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import Loader from '@/components/loader';

export const PatientAssessmentComplete = () => {
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
		<Container className="py-20">
			<Row className="mb-32">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3 className="mb-2">Assessment Complete</h3>
					<p className="mb-0">
						We are working on your recommendation. Please wait while we determine what type of care is best
						for you.
					</p>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Loader />
				</Col>
			</Row>
		</Container>
	);
};

export default PatientAssessmentComplete;
