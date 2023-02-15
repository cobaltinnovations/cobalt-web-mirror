import { createUseThemedStyles } from '@/jss/theme';
import React from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import CopyToClipboard from 'react-copy-to-clipboard';
import classNames from 'classnames';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseThemedStyles((theme) => ({
	patientOrderShelf: {
		top: 0,
		right: 0,
		bottom: 0,
		zIndex: 6,
		width: '95%',
		maxWidth: 800,
		position: 'fixed',
		overflow: 'hidden',
		boxShadow: theme.elevation.e400,
		backgroundColor: theme.colors.n50,
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.n100}`,
		},
	},
	overlay: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 5,
		cursor: 'pointer',
		position: 'fixed',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	header: {
		padding: '28px 32px 0',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
	},
	shelfCloseButton: {
		top: 20,
		right: 24,
	},
	'@global': {
		'.patient-order-shelf-enter': {
			opacity: 0.5,
			transform: 'translateX(100%)',
		},
		'.patient-order-shelf-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.patient-order-shelf-exit-active': {
			opacity: 0.5,
			transform: 'translateX(100%)',
			transition: 'transform 300ms, opacity 300ms',
		},
		'.patient-order-shelf-overlay-enter': {
			opacity: 0,
		},
		'.patient-order-shelf-overlay-enter-active': {
			opacity: 1,
			transition: 'opacity 300ms',
		},
		'.patient-order-shelf-overlay-exit': {
			opacity: 1,
		},
		'.patient-order-shelf-overlay-exit-active': {
			opacity: 0,
			transition: 'opacity 300ms',
		},
	},
}));

interface MhicPatientOrderShelfProps {
	open: boolean;
	onHide(): void;
}

export const MhicPatientOrderShelf = ({ open, onHide }: MhicPatientOrderShelfProps) => {
	const classes = useStyles();
	const { addFlag } = useFlags();

	return (
		<>
			<CSSTransition in={open} timeout={300} classNames="patient-order-shelf" mountOnEnter unmountOnExit>
				<div className={classes.patientOrderShelf}>
					<div className={classes.header}>
						<Button
							variant="link"
							className={classNames(classes.shelfCloseButton, 'p-2 position-absolute')}
							onClick={onHide}
						>
							<CloseIcon />
						</Button>
						<div className="mb-2 d-flex align-items-center">
							<h4 className="mb-0 me-2">Lastname, FirstName</h4>
							<Badge pill bg="outline-primary">
								NEW
							</Badge>
						</div>
						<div className="d-flex align-items-center">
							<p className="mb-0">
								MRN: <span className="fw-bold">1A2B3C4D5E</span>
							</p>
							<CopyToClipboard
								onCopy={() => {
									addFlag({
										variant: 'success',
										title: 'Copied!',
										description: 'The MRN was copied to your clipboard',
										actions: [],
									});
								}}
								text="1A2B3C4D5E"
							>
								<Button variant="link" className="p-2">
									<CopyIcon width={20} height={20} />
								</Button>
							</CopyToClipboard>
						</div>
						<div>[TODO]: nav goes here</div>
					</div>
					<section>
						<Container fluid>
							<Row className="mb-6">
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Basic Info</Card.Title>
										</Card.Header>
										<Card.Body>
											<Row className="mb-4">
												<Col>
													<p className="m-0">Firstname Lastname</p>
												</Col>
											</Row>
											<Row className="mb-4">
												<Col>
													<p className="m-0 text-gray">Date of birth</p>
												</Col>
												<Col>
													<p className="m-0">3/22/1953</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0 text-gray">Pref. Language</p>
												</Col>
												<Col>
													<p className="m-0">English</p>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								</Col>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Demographics</Card.Title>
										</Card.Header>
										<Card.Body>
											<Row className="mb-4">
												<Col>
													<p className="m-0 text-gray">Race</p>
												</Col>
												<Col>
													<p className="m-0">Black</p>
												</Col>
											</Row>
											<Row className="mb-4">
												<Col>
													<p className="m-0 text-gray">Ethnicity</p>
												</Col>
												<Col>
													<p className="m-0">Hispanic</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0 text-gray">Gender Identity</p>
												</Col>
												<Col>
													<p className="m-0">Male</p>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<Row>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Address</Card.Title>
										</Card.Header>
										<Card.Body>
											<Row>
												<Col>
													<p className="m-0">123 Main Street</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0">Apt 21</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0">Philadelphia, PA 19238</p>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								</Col>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Insurance</Card.Title>
										</Card.Header>
										<Card.Body>
											<Row>
												<Col>
													<p className="m-0">Medicare</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0">Plan: [PLAN_NAME]</p>
												</Col>
											</Row>
											<Row>
												<Col>
													<p className="m-0">Coverage Until: Mar 23, 2023</p>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</Container>
					</section>
					<section>
						<Container fluid>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Contact</h4>
								</Col>
							</Row>
							<Row className="mb-6">
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Patient</Card.Title>
										</Card.Header>
										<Card.Body>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Home Phone</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">(000) 000-0000</p>
												</Col>
											</Row>
											<Row className="mb-4">
												<Col xs={3}>
													<p className="m-0 text-gray">Mobile Phone</p>
												</Col>
												<Col xs={9}>
													<div className="d-flex align-items-center">
														<p className="m-0">(000) 000-0000</p>
														<Badge bg="outline-dark" pill className="ms-2">
															Preferred
														</Badge>
													</div>
												</Col>
											</Row>
											<Row>
												<Col xs={3}>
													<p className="m-0 text-gray">Email</p>
												</Col>
												<Col xs={9}>
													<p className="m-0">frankasanzez@email.com</p>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<Row>
								<Col>
									<Card bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>Patient's Father</Card.Title>
										</Card.Header>
										<Card.Body>
											<Row>
												<Col xs={3}>
													<p className="m-0 text-gray">Mobile Phone</p>
												</Col>
												<Col xs={9}>
													<div className="d-flex align-items-center">
														<p className="m-0 text-gray">(000) 000-0000</p>
														<Badge bg="outline-dark" pill className="ms-2">
															Preferred
														</Badge>
													</div>
												</Col>
											</Row>
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</Container>
					</section>
					<section>
						<Container fluid>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Referrals</h4>
								</Col>
							</Row>
							<Row>
								<Col>Most Recent</Col>
							</Row>
							<Row>
								<Col>Past</Col>
							</Row>
						</Container>
					</section>
					<section>
						<Container fluid>
							<Row className="mb-6">
								<Col>
									<h4 className="mb-0">Clinical</h4>
								</Col>
							</Row>
							<Row>
								<Col>Diagnoses</Col>
							</Row>
							<Row>
								<Col>Medications</Col>
							</Row>
							<Row>
								<Col>Care Team</Col>
							</Row>
						</Container>
					</section>
				</div>
			</CSSTransition>
			<CSSTransition
				in={open}
				timeout={300}
				classNames="patient-order-shelf-overlay"
				onClick={onHide}
				mountOnEnter
				unmountOnExit
			>
				<div className={classes.overlay} />
			</CSSTransition>
		</>
	);
};
