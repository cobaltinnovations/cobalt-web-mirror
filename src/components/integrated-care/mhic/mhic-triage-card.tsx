import React, { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PateintOrderTriageGroupModel } from '@/lib/models';
import { MhicChangeTriageModal } from '@/components/integrated-care/mhic';

interface Props {
	triageGroup: PateintOrderTriageGroupModel;
	disabled?: boolean;
	className?: string;
}

export const MhicTriageCard = ({ triageGroup, disabled, className }: Props) => {
	const [showChangeTriageModal, setShowChangeTriageModal] = useState(false);

	return (
		<>
			<MhicChangeTriageModal
				show={showChangeTriageModal}
				onHide={() => {
					setShowChangeTriageModal(false);
				}}
				onSave={() => {
					setShowChangeTriageModal(false);
				}}
			/>

			<Card bsPrefix="ic-card" className={className}>
				<Card.Header>
					<Card.Title>
						Assessment Triage:{' '}
						<span className="text-uppercase">{triageGroup.patientOrderCareTypeDescription}</span>
					</Card.Title>
					<div className="button-container">
						<span className="me-3 text-uppercase text-gray">Enrolled</span>
						<Button
							variant="light"
							size="sm"
							onClick={() => {
								setShowChangeTriageModal(true);
							}}
							disabled={disabled}
						>
							Override
						</Button>
					</div>
				</Card.Header>
				<Card.Body>
					<Container fluid>
						<Row>
							<Col xs={3}>
								<p className="m-0 text-gray">{triageGroup.patientOrderFocusTypeDescription}</p>
							</Col>
							<Col xs={9}>
								{triageGroup.reasons.map((reason, reasonIndex) => (
									<p key={reasonIndex} className="m-0">
										{reason}
									</p>
								))}
							</Col>
						</Row>
					</Container>
				</Card.Body>
			</Card>
		</>
	);
};
