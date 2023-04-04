import React, { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PateintOrderTriageGroupModel } from '@/lib/models';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { MhicChangeTriageModal } from '@/components/integrated-care/mhic';

interface Props {
	triageGroup: PateintOrderTriageGroupModel;
	className?: string;
}

export const MhicTriageCard = ({ triageGroup, className }: Props) => {
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
						<Button
							variant="light"
							className="p-2"
							onClick={() => {
								setShowChangeTriageModal(true);
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
								<p className="m-0 text-gray">Care Focus</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{triageGroup.patientOrderFocusTypeDescription}</p>
							</Col>
						</Row>
						<Row>
							<Col xs={3}>
								<p className="m-0 text-gray">Reason</p>
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
