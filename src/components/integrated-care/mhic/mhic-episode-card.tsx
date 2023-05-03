import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderDispositionId, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { MhicCloseEpisodeModal, MhicInlineAlert } from '@/components/integrated-care/mhic';

interface MhicEpisodeCardProps {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicEpisodeCard = ({ patientOrder, onPatientOrderChange }: MhicEpisodeCardProps) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);

	const handleCloseEpisodeModalSave = useCallback(
		async (patientOrderClosureReasonId: string) => {
			try {
				const response = await integratedCareService
					.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
					.fetch();

				setShowCloseEpisodeModal(false);
				addFlag({
					variant: 'success',
					title: 'Episode Closed',
					description: '{Message}',
					actions: [],
				});

				onPatientOrderChange(response.patientOrder);
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	const handleReopenButtonClick = useCallback(async () => {
		try {
			const response = await integratedCareService.openPatientOrder(patientOrder.patientOrderId).fetch();

			addFlag({
				variant: 'success',
				title: 'Episode Reopened',
				description: '{Message}',
				actions: [],
			});

			onPatientOrderChange(response.patientOrder);
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]);

	return (
		<>
			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={handleCloseEpisodeModalSave}
			/>

			<Card bsPrefix="ic-card">
				<Card.Header>
					<Card.Title>
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED ||
						patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED
							? `${patientOrder.orderDateDescription} - ${patientOrder.episodeClosedAtDescription}`
							: 'Order'}{' '}
						<span className="text-gray">(Episode: {patientOrder.episodeDurationInDaysDescription})</span>
					</Card.Title>
					<div className="button-container">
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.OPEN && (
							<Button
								variant="light"
								size="sm"
								onClick={() => {
									setShowCloseEpisodeModal(true);
								}}
							>
								Close Episode
							</Button>
						)}
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED && (
							<>
								<span className="me-3 fw-bold text-gray">Closed</span>
								<Button variant="light" size="sm" onClick={handleReopenButtonClick}>
									Reopen
								</Button>
							</>
						)}
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED && (
							<span className="fw-bold text-gray">Archived</span>
						)}
					</div>
				</Card.Header>
				{(patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED ||
					patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED) && (
					<Card.Body className="bg-n75 border-bottom">
						<Container fluid>
							<Row className="mb-4">
								<Col xs={3}>
									<p className="m-0">Closure Date</p>
								</Col>
								<Col xs={9}>
									<p className="m-0 text-gray">{patientOrder.episodeClosedAtDescription}</p>
								</Col>
							</Row>
							<Row>
								<Col xs={3}>
									<p className="m-0">Closure Reason</p>
								</Col>
								<Col xs={9}>
									<p className="m-0 text-gray">{patientOrder.patientOrderClosureReasonDescription}</p>
								</Col>
							</Row>
						</Container>
					</Card.Body>
				)}
				<Card.Body>
					<Container fluid>
						{patientOrder.patientBelowAgeThreshold && (
							<Row className="mb-4">
								<Col>
									<MhicInlineAlert
										variant="warning"
										title="Order Flagged"
										description="Patient under 18"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.mostRecentEpisodeClosedWithinDateThreshold && (
							<Row className="mb-4">
								<Col>
									<MhicInlineAlert
										variant="warning"
										title="Order Flagged"
										description="Episode closed within date threshold"
									/>
								</Col>
							</Row>
						)}
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Date Referred</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.orderDateDescription}</p>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Referral Reason</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.reasonForReferral}</p>
							</Col>
						</Row>
						<hr className="mb-4" />
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Practice</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.referringPracticeName}</p>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Ordering Provider</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.orderingProviderDisplayName}</p>
							</Col>
						</Row>
						{/* <Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Authorizing Provider</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">
									<span className="text-danger">[TODO]: Authorizing Provider Name</span>
								</p>
							</Col>
						</Row> */}
						<Row>
							<Col xs={3}>
								<p className="m-0 text-gray">Billing Provider</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.billingProviderDisplayName}</p>
							</Col>
						</Row>
					</Container>
				</Card.Body>
			</Card>
		</>
	);
};
