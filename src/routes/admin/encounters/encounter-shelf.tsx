import React, { useState } from 'react';
import { Button, Card, Col, Container, Row, Tab } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import { createUseThemedStyles } from '@/jss/theme';

type EncounterShelfTab = 'encounter-details' | 'contact-history' | 'notes';

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		padding: '28px 32px 0',
		position: 'relative',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	closeButton: {
		top: 20,
		right: 24,
	},
	tabContent: {
		flex: 1,
		overflow: 'hidden',
	},
	tabPane: {
		height: '100%',
		overflowY: 'auto',
		backgroundColor: theme.colors.background,
	},
	section: {
		padding: 32,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	questionList: {
		padding: 0,
		margin: 0,
		listStyle: 'none',
		counterReset: 'encounter-question',
	},
	question: {
		position: 'relative',
		padding: '0 0 20px 40px',
		marginBottom: 20,
		counterIncrement: 'encounter-question',
		borderBottom: `1px solid ${theme.colors.border}`,
		'&:before': {
			top: 0,
			left: 0,
			position: 'absolute',
			content: 'counter(encounter-question) ")"',
		},
		'&:last-child': {
			paddingBottom: 0,
			marginBottom: 0,
			borderBottom: 0,
		},
	},
}));

export const Component = () => {
	const classes = useStyles();
	const location = useLocation();
	const navigate = useNavigate();
	const { encounterId } = useParams<{ encounterId: string }>();
	const [activeTab, setActiveTab] = useState<EncounterShelfTab>('encounter-details');

	if (!encounterId) {
		throw new Error('Unknown encounter');
	}

	return (
		<Tab.Container id="encounter-shelf-tabs" activeKey={activeTab} mountOnEnter unmountOnExit>
			<div className={classes.header}>
				<Button
					variant="transparent-secondary"
					className={`${classes.closeButton} p-2 position-absolute`}
					aria-label="Close encounter details"
					onClick={() => {
						navigate({
							pathname: '..',
							search: location.search,
						});
					}}
				>
					<SvgIcon kit="far" icon="xmark" size={16} className="d-block" />
				</Button>

				<h4 className="mb-2">Firstname Lastname</h4>
				<p className="mb-6 fs-large">
					Care Navigator: <span className="fw-bold">Navigator Name</span>
				</p>

				<TabBar
					hideBorder
					value={activeTab}
					tabs={[
						{ value: 'encounter-details', title: 'Encounter Details' },
						{ value: 'contact-history', title: 'Contact History (0)' },
						{ value: 'notes', title: 'Notes (0)' },
					]}
					onTabClick={(value) => {
						setActiveTab(value as EncounterShelfTab);
					}}
				/>
			</div>

			<Tab.Content className={classes.tabContent}>
				<Tab.Pane eventKey="encounter-details" className={classes.tabPane}>
					<section className={classes.section}>
						<Card bsPrefix="ic-card" className="mb-6">
							<Card.Header>
								<Card.Title>Encounter</Card.Title>
								<div className="button-container">
									<span className="fw-semibold">Close Encounter</span>
								</div>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="mb-0">Date Created</p>
										</Col>
										<Col xs={9}>
											<p className="mb-0">Nov 12, 2022</p>
										</Col>
									</Row>
									<Row>
										<Col xs={3}>
											<p className="mb-0">Created By</p>
										</Col>
										<Col xs={9}>
											<p className="mb-0">webform</p>
										</Col>
									</Row>
								</Container>
							</Card.Body>
						</Card>

						<Card bsPrefix="ic-card">
							<Card.Header>
								<Card.Title>Contact</Card.Title>
								<div className="button-container">
									<SvgIcon kit="far" icon="pen" size={16} />
								</div>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row>
										<Col xs={3}>
											<p className="mb-0">Email</p>
										</Col>
										<Col xs={9}>
											<p className="mb-0">address@email.com</p>
										</Col>
									</Row>
								</Container>
							</Card.Body>
						</Card>
					</section>

					<section className={classes.section}>
						<h4 className="mb-6">Navigator Appointment</h4>
						<Card bsPrefix="ic-card">
							<Card.Header>
								<Card.Title>Screening Answers</Card.Title>
							</Card.Header>
							<Card.Body>
								<ol className={classes.questionList}>
									<li className={classes.question}>
										<p className="mb-3">Who are you seeking support for?</p>
										<p className="mb-0 fw-bold">Myself</p>
									</li>
									<li className={classes.question}>
										<p className="mb-3">Who is your current employer?</p>
										<p className="mb-0 fw-bold">UPHS (University Pennsylvania Health System)</p>
									</li>
									<li className={classes.question}>
										<p className="mb-3">
											Select your current behavioral health insurance plan from the list below.
										</p>
										<p className="mb-0 fw-bold">Aetna Behavioral Health Network</p>
									</li>
									<li className={classes.question}>
										<p className="mb-3">What kind of support are you looking for today?</p>
										<p className="mb-3 fw-bold">Something else / I’m not sure</p>
										<p className="mb-0 fw-bold">User input text here if available...</p>
									</li>
								</ol>
							</Card.Body>
						</Card>
					</section>
				</Tab.Pane>

				<Tab.Pane eventKey="contact-history" className={classes.tabPane}>
					<section className={classes.section}>
						<NoData title="No Contact Attempts Logged" actions={[]} />
					</section>
				</Tab.Pane>

				<Tab.Pane eventKey="notes" className={classes.tabPane}>
					<section className={classes.section}>
						<NoData title="No Notes" actions={[]} />
					</section>
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};
