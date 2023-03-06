import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';

const MhicOverview = () => {
	return (
		<Container fluid className="py-11 overflow-visible">
			<Row className="mb-8">
				<Col>
					<h3>Welcome back, Ava</h3>
				</Col>
			</Row>
			<Row className="mb-14">
				<Col>
					<Card>
						<Card.Body>
							<h4 className="mb-0">3</h4>
							<p className="mb-4">Assessments Scheduled</p>
							<hr className="mb-4" />
							<p className="mb-0">
								<Link to="/#" className="fw-normal">
									View Scheduled
								</Link>
							</p>
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card>
						<Card.Body>
							<h4 className="mb-0">3</h4>
							<p className="mb-4">Due for Outreach</p>
							<hr className="mb-4" />
							<p className="mb-0">
								<Link to="/#" className="fw-normal">
									View Outreach
								</Link>
							</p>
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card>
						<Card.Body>
							<h4 className="mb-0">2</h4>
							<p className="mb-4">Need Resources</p>
							<hr className="mb-4" />
							<p className="mb-0">
								<Link to="/#" className="fw-normal">
									View Resources
								</Link>
							</p>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row>
				<Col>
					<h3 className="mb-6">
						Follow Up <span className="text-gray">(6)</span>
					</h3>
					<Table isLoading={false}>
						<TableHead>
							<TableRow>
								<TableCell header width={280} sticky>
									Patient
								</TableCell>
								<TableCell header>Referral Date</TableCell>
								<TableCell header className="text-right">
									Outreach #
								</TableCell>
								<TableCell header>Last Outreach</TableCell>
								<TableCell header className="text-right">
									Episode
								</TableCell>
								<TableCell />
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1 day</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
							<TableRow>
								<TableCell width={280} sticky className="py-2">
									<span className="d-block">Lastname, Firstname</span>
									<span className="d-block text-gray">1A2B3C4D5E</span>
								</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">1</TableCell>
								<TableCell>Jan 30, 2023</TableCell>
								<TableCell className="text-right">4 days</TableCell>
								<TableCell>button</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</Col>
			</Row>
		</Container>
	);
};

export default MhicOverview;
