import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';

export const loader = async () => {
	return null;
};

export const Component = () => {
	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Add Resource</title>
			</Helmet>

			<Container>
				<Row className="py-10">
					<Col>
						<Link to="/ic/mhic/admin/resources" className="d-block mb-6">
							Resources
						</Link>
						<h2 className="mb-0">Resource Name</h2>
					</Col>
				</Row>
				<Row>
					<Col lg={4}>
						<Card bsPrefix="ic-card">
							<Card.Body className="cobalt-card__body--top d-flex align-items-center justify-content-between">
								<h4>Details</h4>
								<Button variant="outline-primary" className="d-flex align-items-center">
									<EditIcon width={20} height={20} className="d-flex me-2" />
									Edit
								</Button>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Contact</Card.Title>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="m-0 text-gray">Phone</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">xxx</p>
										</Col>
									</Row>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="m-0 text-gray">Email</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">xxx</p>
										</Col>
									</Row>
									<Row>
										<Col xs={3}>
											<p className="m-0 text-gray">Website</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">xxx</p>
										</Col>
									</Row>
								</Container>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Accepted Insurance</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="m-0">xxx, xxx, xxx</p>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Resource Notes</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="m-0">xxx, xxx, xxx</p>
							</Card.Body>
						</Card>
					</Col>
					<Col lg={8}>
						<Card bsPrefix="ic-card">
							<Card.Body className="cobalt-card__body--top d-flex align-items-center justify-content-between">
								<h4>Locations</h4>
								<Button variant="primary" className="d-flex align-items-center">
									<PlusIcon width={20} height={20} className="d-flex me-2" />
									Add
								</Button>
							</Card.Body>
							<Card.Body className="p-0 border-top bg-n75">
								<Table className="border-0">
									<TableHead>
										<TableRow>
											<TableCell header>Location Name</TableCell>
											<TableCell header>Insurance</TableCell>
											<TableCell header>Specialties</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header />
										</TableRow>
									</TableHead>
									<TableBody>
										<TableRow>
											<TableCell>
												<span className="d-block">Location Name</span>
												<span className="d-block">1930 S. Broad Street</span>
												<span className="d-block">Philadelphia, PA 00000</span>
											</TableCell>
											<TableCell>Aetna</TableCell>
											<TableCell>xxx, xxx, xxx</TableCell>
											<TableCell>
												<div className="d-flex align-items-center justify-content-between">
													<Badge pill bg="outline-success">
														Available
													</Badge>
												</div>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>
												<span className="d-block">Location Name</span>
												<span className="d-block">1930 S. Broad Street</span>
												<span className="d-block">Philadelphia, PA 00000</span>
											</TableCell>
											<TableCell>Aetna</TableCell>
											<TableCell>xxx, xxx, xxx</TableCell>
											<TableCell>
												<div className="d-flex align-items-center justify-content-between">
													<Badge pill bg="outline-danger">
														Unavailable
													</Badge>
												</div>
											</TableCell>
											<TableCell></TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};
