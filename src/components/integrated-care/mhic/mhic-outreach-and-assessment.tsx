import React, { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { MhicComment, MhicOutreachModal } from '@/components/integrated-care/mhic';
import { ReactComponent as FlagDanger } from '@/assets/icons/flag-danger.svg';
import NoData from '@/components/no-data';

export const MhicOutreachAndAssesment = () => {
	const [showOutreachModal, setShowOutreachModal] = useState(false);

	return (
		<>
			<MhicOutreachModal
				show={showOutreachModal}
				onHide={() => {
					setShowOutreachModal(false);
				}}
				onSave={() => {
					setShowOutreachModal(false);
				}}
			/>

			<section>
				<Container fluid className="overflow-visible">
					<Row className="mb-6">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">
									Outreach Attempts <span className="text-gray">(0)</span>
								</h4>
								<Button
									onClick={() => {
										setShowOutreachModal(true);
									}}
								>
									Add Outreach Attempt
								</Button>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							<MhicComment
								className="mb-4"
								name="Ava Williams"
								date="Nov 07, 2023 at 10:00AM"
								message="Called and scheduled the assessment for November 12."
								onEdit={() => {
									setShowOutreachModal(true);
								}}
								onDelete={() => {
									window.confirm('Are you sure?');
								}}
							/>
							<MhicComment
								name="Ava Williams"
								date="Sep 30, 2023 at 2:51PM"
								message="Called to do assessment, patient was unavailable, left a voicemail."
								onEdit={() => {
									setShowOutreachModal(true);
								}}
								onDelete={() => {
									window.confirm('Are you sure?');
								}}
							/>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">Latest Assessment</h4>
								<Button>Start Assessment</Button>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							<NoData
								className="mb-6"
								title="No Assessment"
								description="There is no assessment for the patient's most recent referral order"
								actions={[
									{
										variant: 'outline-primary',
										title: 'Schedule Assessment',
										onClick: () => {
											return;
										},
									},
								]}
							/>
							<NoData
								className="bg-white"
								title="Assessment is Scheduled"
								description="Nov 12, 2023 at 2:30 PM"
								actions={[
									{
										variant: 'primary',
										title: 'View Appointment',
										onClick: () => {
											return;
										},
									},
									{
										variant: 'outline-primary',
										title: 'Edit Appointment Date',
										onClick: () => {
											return;
										},
									},
								]}
							/>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-5">
						<Col>
							<h4 className="mb-0">
								Past Assessments <span className="text-gray">(1)</span>
							</h4>
						</Col>
					</Row>
					<Row>
						<Col>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell header>
											<span>Sep 21, 2022 at 12:30AM</span>
											<span className="fw-normal">Completed By: Patient</span>
										</TableCell>
										<TableCell header colSpan={4} className="text-right justify-content-end">
											<span>Triage: Specialty Care</span>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										<TableCell>
											<span className="fw-semibold">C-SSRS</span>
										</TableCell>
										<TableCell width={32} className="px-0"></TableCell>
										<TableCell width={72} className="pe-0">
											<span className="text-gray">Score:</span>
										</TableCell>
										<TableCell width={32} className="px-0 text-right">
											<span className="fw-bold">4</span>
										</TableCell>
										<TableCell width={84} className="text-center">
											<Button
												variant="link"
												size="sm"
												className="p-0 text-decoration-none fw-normal"
											>
												View
											</Button>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>
											<span className="fw-semibold">GAD-7</span>
										</TableCell>
										<TableCell width={32} className="px-0"></TableCell>
										<TableCell width={72} className="pe-0">
											<span className="text-gray">Score:</span>
										</TableCell>
										<TableCell width={32} className="px-0 text-right">
											<span className="fw-bold">12</span>
										</TableCell>
										<TableCell width={84} className="text-center">
											<Button
												variant="link"
												size="sm"
												className="p-0 text-decoration-none fw-normal"
											>
												View
											</Button>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>
											<span className="fw-semibold">PHQ-9</span>
										</TableCell>
										<TableCell width={32} className="px-0">
											<FlagDanger className="text-danger" />
										</TableCell>
										<TableCell width={72} className="pe-0">
											<span className="text-gray">Score:</span>
										</TableCell>
										<TableCell width={32} className="px-0 text-right">
											<span className="fw-bold">13</span>
										</TableCell>
										<TableCell width={84} className="text-center">
											<Button
												variant="link"
												size="sm"
												className="p-0 text-decoration-none fw-normal"
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
