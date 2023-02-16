import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { ReactComponent as FlagDanger } from '@/assets/icons/flag-danger.svg';

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
					<Row className="mb-5">
						<Col>
							<h4 className="mb-0">
								Past Assessments <span className="text-gray">(0)</span>
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
