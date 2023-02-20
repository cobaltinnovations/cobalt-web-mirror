import React, { useCallback } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import NoData from '@/components/no-data';
import useFlags from '@/hooks/use-flags';

export const MhicFollowUp = () => {
	const { addFlag } = useFlags();

	const handleMarkAsSentButtonClick = useCallback(() => {
		addFlag({
			variant: 'success',
			title: 'Resources Sent',
			description: 'A follow up SMS and email are scheduled for Dec 12, 2023',
			actions: [],
		});
	}, [addFlag]);

	return (
		<>
			<section>
				<Container fluid>
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">Resources</h4>
								<div className="d-flex align-items-center">
									<span className="text-gray">Patient Needs Resources</span>
									<Button
										className="ms-2"
										variant="outline-primary"
										onClick={handleMarkAsSentButtonClick}
									>
										Mark as Sent
									</Button>
								</div>
							</div>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<h4 className="mb-0">Follow Up</h4>
						</Col>
					</Row>
					<Row>
						<Col>
							<NoData
								title="No Follow Up Scheduled"
								description="A follow up email and text will be scheduled after resources are sent to the patient"
								actions={[]}
							/>
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
