import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

export const MhicOutreachAndAssesment = () => {
	return (
		<>
			<section>
				<Container fluid>
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">
									Outreach Attempts <span className="text-gray">(0)</span>
								</h4>
								<Button>Add Outreach Attempt</Button>
							</div>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">Latest Assessment</h4>
								<Button>Start Assessment</Button>
							</div>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row>
						<Col>
							<h4 className="mb-0">
								Past Assessments <span className="text-gray">(0)</span>
							</h4>
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
