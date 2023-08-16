import React, { useCallback, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import {
	PatientOrderConsentStatusId,
	PatientOrderDispositionId,
	PatientOrderIntakeInsuranceStatusId,
	PatientOrderIntakeLocationStatusId,
	PatientOrderIntakeWantsServicesStatusId,
	PatientOrderModel,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { MhicCloseEpisodeModal } from '@/components/integrated-care/mhic';
import InlineAlert from '@/components/inline-alert';

interface MhicEpisodeCardProps {
	patientOrder: PatientOrderModel;
}

export const MhicEpisodeCard = ({ patientOrder }: MhicEpisodeCardProps) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);
	const revalidator = useRevalidator();

	const handleCloseEpisodeModalSave = useCallback(
		async (patientOrderClosureReasonId: string) => {
			try {
				await integratedCareService
					.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
					.fetch();

				setShowCloseEpisodeModal(false);
				addFlag({
					variant: 'success',
					title: 'Episode Closed',
					actions: [],
				});

				revalidator.revalidate();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, patientOrder.patientOrderId, revalidator]
	);

	const handleReopenButtonClick = useCallback(async () => {
		try {
			await integratedCareService.openPatientOrder(patientOrder.patientOrderId).fetch();

			addFlag({
				variant: 'success',
				title: 'Episode Reopened',
				actions: [],
			});

			revalidator.revalidate();
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, patientOrder.patientOrderId, revalidator]);

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
									<InlineAlert
										variant="warning"
										title="Patient was under 18 at the time the order was created"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.mostRecentEpisodeClosedWithinDateThreshold && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Order Flagged"
										description="Patient had a recently-closed episode"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.patientOrderIntakeWantsServicesStatusId ===
							PatientOrderIntakeWantsServicesStatusId.NO && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Patient indicated they are no longer seeking mental health services"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.patientOrderIntakeLocationStatusId ===
							PatientOrderIntakeLocationStatusId.INVALID && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Patient lives in a state that is not supported by Integrated Care"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.patientOrderIntakeInsuranceStatusId ===
							PatientOrderIntakeInsuranceStatusId.CHANGED_RECENTLY && (
							<Row className="mb-4">
								<Col>
									<InlineAlert variant="warning" title="Patient's insurance has recently changed" />
								</Col>
							</Row>
						)}
						{patientOrder.patientOrderIntakeInsuranceStatusId ===
							PatientOrderIntakeInsuranceStatusId.INVALID && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Patient's insurance is not accepted for Integrated Care"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.patientOrderConsentStatusId === PatientOrderConsentStatusId.REJECTED && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Patient rejected consent to Integrated Care services"
									/>
								</Col>
							</Row>
						)}
						{/* these 2 flags are unique and have user actions tied to them, can be found in mhic-next-steps-card.tsx  */}
						{/* {patientOrder.patientOrderSafetyPlanningStatusId ===
							PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING && (
							<Row className="mb-4">
								<Col>
									<InlineAlert variant="warning" title="Patient needs safety planning" />
								</Col>
							</Row>
						)}
						{patientOrder.patientOrderResourcingStatusId ===
							PatientOrderResourcingStatusId.NEEDS_RESOURCES && (
							<Row className="mb-4">
								<Col>
									<InlineAlert variant="warning" title="Patient needs resources" />
								</Col>
							</Row>
						)} */}
						{patientOrder.mostRecentIntakeScreeningSessionAppearsAbandoned && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Intake assessment appears to have been abandoned"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.mostRecentScreeningSessionAppearsAbandoned && (
							<Row className="mb-4">
								<Col>
									<InlineAlert
										variant="warning"
										title="Clinical assessment appears to have been abandoned"
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
								<p className="m-0">
									{patientOrder.referringPracticeName} ({patientOrder.referringPracticeId})
								</p>
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
