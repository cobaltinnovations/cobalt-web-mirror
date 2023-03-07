import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

export const MhicAssessmentComplete = () => {
	const navigate = useNavigate();

	return (
		<Container className="py-20">
			<Row className="mb-8">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<h3 className="mb-2">Assessment Complete</h3>
					<p className="mb-0">Based on the patient’s answers, we recommend the following:</p>
				</Col>
			</Row>
			<Row className="mb-6">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					[TODO]: Results Card
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<div className="text-right">
						<Button
							onClick={() => {
								navigate('/ic/mhic');
							}}
						>
							Done
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default MhicAssessmentComplete;
