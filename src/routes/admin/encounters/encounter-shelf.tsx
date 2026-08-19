import React, { useCallback, useRef, useState } from 'react';
import { Button, Card, Col, Container, Row, Tab } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import { createUseThemedStyles } from '@/jss/theme';
import { CareEncounterModel } from '@/lib/models';
import { careEncounterService } from '@/lib/services';
import { CloseEncounterModal } from './close-encounter-modal';

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
}));

export const Component = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { encounterId } = useParams<{ encounterId: string }>();
	const [activeTab, setActiveTab] = useState<EncounterShelfTab>('encounter-details');
	const [showCloseEncounterModal, setShowCloseEncounterModal] = useState(false);
	const [careEncounter, setCareEncounter] = useState<CareEncounterModel | null>(null);
	const careEncounterRequestRef = useRef<ReturnType<typeof careEncounterService.getCareEncounter>>();

	const fetchCareEncounter = useCallback(async () => {
		if (!encounterId) {
			return;
		}

		careEncounterRequestRef.current?.abort();

		const request = careEncounterService.getCareEncounter(encounterId);
		careEncounterRequestRef.current = request;

		try {
			const response = await request.fetch();

			if (request === careEncounterRequestRef.current) {
				setCareEncounter(response.careEncounter);
			}
		} finally {
			if (request === careEncounterRequestRef.current) {
				careEncounterRequestRef.current = undefined;
			}
		}
	}, [encounterId]);

	const abortFetchCareEncounter = useCallback(() => {
		careEncounterRequestRef.current?.abort();
		careEncounterRequestRef.current = undefined;
	}, []);

	if (!encounterId) {
		throw new Error('Unknown encounter');
	}

	return (
		<AsyncWrapper
			key={encounterId}
			fetchData={fetchCareEncounter}
			abortFetch={abortFetchCareEncounter}
			showBackButton={false}
		>
			{careEncounter && (
				<EncounterShelfContent
					careEncounter={careEncounter}
					activeTab={activeTab}
					showCloseEncounterModal={showCloseEncounterModal}
					onActiveTabChange={setActiveTab}
					onShowCloseEncounterModalChange={setShowCloseEncounterModal}
					onClose={() => {
						navigate({
							pathname: '..',
							search: location.search,
						});
					}}
				/>
			)}
		</AsyncWrapper>
	);
};

interface EncounterShelfContentProps {
	careEncounter: CareEncounterModel;
	activeTab: EncounterShelfTab;
	showCloseEncounterModal: boolean;
	onActiveTabChange(activeTab: EncounterShelfTab): void;
	onShowCloseEncounterModalChange(show: boolean): void;
	onClose(): void;
}

const EncounterShelfContent = ({
	careEncounter,
	activeTab,
	showCloseEncounterModal,
	onActiveTabChange,
	onShowCloseEncounterModalChange,
	onClose,
}: EncounterShelfContentProps) => {
	const classes = useStyles();
	const notes = careEncounter.notes?.trim();

	return (
		<Tab.Container id="encounter-shelf-tabs" activeKey={activeTab} mountOnEnter unmountOnExit>
			<CloseEncounterModal
				show={showCloseEncounterModal}
				onHide={() => {
					onShowCloseEncounterModalChange(false);
				}}
			/>

			<div className={classes.header}>
				<Button
					variant="transparent-secondary"
					className={`${classes.closeButton} p-2 position-absolute`}
					aria-label="Close encounter details"
					onClick={onClose}
				>
					<SvgIcon kit="far" icon="xmark" size={16} className="d-block" />
				</Button>

				<h4 className="mb-2">{careEncounter.patientFullName}</h4>
				<p className="mb-6 fs-large">
					Care Navigator:{' '}
					<span className="fw-bold">{careEncounter.appointment.provider?.name ?? 'Unassigned'}</span>
				</p>

				<TabBar
					hideBorder
					value={activeTab}
					tabs={[
						{ value: 'encounter-details', title: 'Encounter Details' },
						{ value: 'contact-history', title: 'Contact History (0)' },
						{ value: 'notes', title: `Notes (${notes ? 1 : 0})` },
					]}
					onTabClick={(value) => {
						onActiveTabChange(value as EncounterShelfTab);
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
									<Button
										variant="light"
										size="sm"
										onClick={() => {
											onShowCloseEncounterModalChange(true);
										}}
									>
										Close Encounter
									</Button>
								</div>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="mb-0">Date Created</p>
										</Col>
										<Col xs={9}>
											<p className="mb-0">{careEncounter.createdDateDescription}</p>
										</Col>
									</Row>
									<Row>
										<Col xs={3}>
											<p className="mb-0">Created By</p>
										</Col>
										<Col xs={9}>
											<p className="mb-0">Unknown</p>
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
											<p className="mb-0">
												{careEncounter.appointment.account?.emailAddress ?? 'Unknown'}
											</p>
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
								<NoData title="No Screening Answers" actions={[]} />
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
						{notes ? <p className="mb-0">{notes}</p> : <NoData title="No Notes" actions={[]} />}
					</section>
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};
