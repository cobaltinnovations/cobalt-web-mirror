import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import useFlags from '@/hooks/use-flags';
import NoData from '@/components/no-data';
import { MhicFollowUpMessageModal } from '@/components/integrated-care/mhic';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

export const MhicFollowUp = () => {
	const { addFlag } = useFlags();
	const [showFollowUpMessageModal, setShowFollowUpMessageModal] = useState(false);

	const handleFollowUpMessageSave = useCallback(() => {
		setShowFollowUpMessageModal(false);
		addFlag({
			variant: 'success',
			title: 'Resources Sent',
			description: 'A follow up SMS and email are scheduled for Dec 12, 2023',
			actions: [],
		});
	}, [addFlag]);

	return (
		<>
			<MhicFollowUpMessageModal
				show={showFollowUpMessageModal}
				onHide={() => {
					setShowFollowUpMessageModal(false);
				}}
				onSave={handleFollowUpMessageSave}
			/>

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
										onClick={() => {
											setShowFollowUpMessageModal(true);
										}}
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
					<Row className="mb-6">
						<Col>
							<NoData
								title="No Follow Up Scheduled"
								description="A follow up email and text will be scheduled after resources are sent to the patient"
								actions={[]}
							/>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Message Scheduled</Card.Title>
									<div className="button-container">
										<Button
											variant="danger"
											size="sm"
											className="py-2 me-2"
											onClick={() => {
												window.alert('[TODO]: Cancel the message.');
											}}
										>
											Cancel
										</Button>
										<Button
											variant="light"
											className="p-2"
											onClick={() => {
												setShowFollowUpMessageModal(true);
											}}
										>
											<EditIcon className="d-flex" />
										</Button>
									</div>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Scheduled Date</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Dec 12, 2023</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Contact Method</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Text (SMS), Email</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header className="bg-success">
									<Card.Title className="text-white">Message Sent</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Date Sent</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Dec 12, 2023</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Contact Method</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Text (SMS), Email</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Patient Response</Card.Title>
								</Card.Header>
								<Card.Body className="p-0 bg-n75">
									<NoData
										className="border-0"
										title="Awaiting Response"
										description="The patient has not responded"
										actions={[]}
									/>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					<Row className="mb-6">
						<Col>
							<Card bsPrefix="ic-card">
								<Card.Header>
									<Card.Title>Response Received</Card.Title>
								</Card.Header>
								<Card.Body>
									<Container fluid>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Date Recieved</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Dec 12, 2023 at 2:21 AM</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Response</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">Did Not Attend</p>
											</Col>
										</Row>
										<Row className="mb-4">
											<Col xs={3}>
												<p className="m-0 text-gray">Reason</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">[Reason]</p>
											</Col>
										</Row>
										<Row>
											<Col xs={3}>
												<p className="m-0 text-gray">Comment</p>
											</Col>
											<Col xs={9}>
												<p className="m-0">
													Lorem ipsum dolor sit amet consectetur. Dignissim sit nunc turpis
													mattis quis elementum sed a dolor. Et enim vel faucibus in mauris
													erat libero est. Duis faucibus in vulputate aliquam donec integer
													leo non. Convallis a phasellus senectus ac est commodo.
												</p>
											</Col>
										</Row>
									</Container>
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
