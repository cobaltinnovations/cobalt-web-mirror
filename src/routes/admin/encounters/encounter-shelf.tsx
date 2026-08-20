import React, { useCallback, useRef, useState } from 'react';
import { Button, Card, Col, Container, Row, Tab } from 'react-bootstrap';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';

import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { AppointmentModel, CareEncounterModel, CareEncounterStatusId } from '@/lib/models';
import {
	CancelCareEncounterAppointmentRequestBody,
	CancelCareEncounterRequestBody,
	careEncounterService,
} from '@/lib/services';
import { AppointmentDetailsModal } from './appointment-details-modal';
import { CancelAppointmentModal } from './cancel-appointment-modal';
import { CloseEncounterModal } from './close-encounter-modal';
import { EditContactModal } from './edit-contact-modal';
import { EncounterAppointmentCard } from './encounter-appointment-card';
import { EncounterAppointmentHistoryCard } from './encounter-appointment-history-card';
import { EncounterNotes } from './encounter-notes';
import type { EncountersOutletContext } from './encounters';

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
	notesPane: {
		height: '100%',
		overflow: 'hidden',
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
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const { refreshCareEncounters } = useOutletContext<EncountersOutletContext>();
	const { encounterId } = useParams<{ encounterId: string }>();
	const [activeTab, setActiveTab] = useState<EncounterShelfTab>('encounter-details');
	const [showCancelAppointmentModal, setShowCancelAppointmentModal] = useState(false);
	const [showCloseEncounterModal, setShowCloseEncounterModal] = useState(false);
	const [showEditContactModal, setShowEditContactModal] = useState(false);
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

	const handleCloseEncounterModalSave = useCallback(
		async (data: CancelCareEncounterRequestBody) => {
			if (!encounterId) {
				return;
			}

			try {
				const response = await careEncounterService.cancelCareEncounter(encounterId, data).fetch();

				setCareEncounter(response.careEncounter);
				setShowCloseEncounterModal(false);
				addFlag({
					variant: 'success',
					title: 'Encounter Closed',
					actions: [],
				});
				await refreshCareEncounters();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, encounterId, handleError, refreshCareEncounters]
	);

	const handleCancelAppointmentModalSave = useCallback(
		async (data: CancelCareEncounterAppointmentRequestBody) => {
			if (!encounterId || !careEncounter) {
				return;
			}

			try {
				const response = await careEncounterService
					.cancelCareEncounterAppointment(encounterId, careEncounter.appointment.appointmentId, data)
					.fetch();

				setCareEncounter(response.careEncounter);
				setShowCancelAppointmentModal(false);
				addFlag({
					variant: 'success',
					title: 'Appointment Canceled',
					actions: [],
				});
				await refreshCareEncounters();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, careEncounter, encounterId, handleError, refreshCareEncounters]
	);

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
					showCancelAppointmentModal={showCancelAppointmentModal}
					showCloseEncounterModal={showCloseEncounterModal}
					showEditContactModal={showEditContactModal}
					onActiveTabChange={setActiveTab}
					onCancelAppointmentModalSave={handleCancelAppointmentModalSave}
					onCloseEncounterModalSave={handleCloseEncounterModalSave}
					onShowCancelAppointmentModalChange={setShowCancelAppointmentModal}
					onShowCloseEncounterModalChange={setShowCloseEncounterModal}
					onShowEditContactModalChange={setShowEditContactModal}
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
	showCancelAppointmentModal: boolean;
	showCloseEncounterModal: boolean;
	showEditContactModal: boolean;
	onActiveTabChange(activeTab: EncounterShelfTab): void;
	onCancelAppointmentModalSave(data: CancelCareEncounterAppointmentRequestBody): Promise<void>;
	onCloseEncounterModalSave(data: CancelCareEncounterRequestBody): Promise<void>;
	onShowCancelAppointmentModalChange(show: boolean): void;
	onShowCloseEncounterModalChange(show: boolean): void;
	onShowEditContactModalChange(show: boolean): void;
	onClose(): void;
}

const EncounterShelfContent = ({
	careEncounter,
	activeTab,
	showCancelAppointmentModal,
	showCloseEncounterModal,
	showEditContactModal,
	onActiveTabChange,
	onCancelAppointmentModalSave,
	onCloseEncounterModalSave,
	onShowCancelAppointmentModalChange,
	onShowCloseEncounterModalChange,
	onShowEditContactModalChange,
	onClose,
}: EncounterShelfContentProps) => {
	const classes = useStyles();
	const emailAddress = careEncounter.appointment.account?.emailAddress;
	const notes = careEncounter.notes?.trim();
	const [selectedAppointment, setSelectedAppointment] = useState<AppointmentModel>();

	return (
		<Tab.Container id="encounter-shelf-tabs" activeKey={activeTab} mountOnEnter unmountOnExit>
			<AppointmentDetailsModal
				appointment={selectedAppointment}
				show={Boolean(selectedAppointment)}
				onHide={() => {
					setSelectedAppointment(undefined);
				}}
			/>
			<CancelAppointmentModal
				show={showCancelAppointmentModal}
				onSave={onCancelAppointmentModalSave}
				onHide={() => {
					onShowCancelAppointmentModalChange(false);
				}}
			/>
			<CloseEncounterModal
				show={showCloseEncounterModal}
				onSave={onCloseEncounterModalSave}
				onHide={() => {
					onShowCloseEncounterModalChange(false);
				}}
			/>
			<EditContactModal
				emailAddress={emailAddress ?? ''}
				show={showEditContactModal}
				onHide={() => {
					onShowEditContactModalChange(false);
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
								{careEncounter.careEncounterStatusId === CareEncounterStatusId.OPEN && (
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
								)}
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
									<Button
										variant="transparent-secondary"
										className="p-2"
										aria-label="Edit Contact"
										onClick={() => {
											onShowEditContactModalChange(true);
										}}
									>
										<SvgIcon kit="far" icon="pen" size={16} className="d-flex" />
									</Button>
								</div>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row>
										<Col xs={3}>
											<p className="mb-0">Email</p>
										</Col>
										<Col xs={9}>
											<p className="mb-0">{emailAddress ?? 'Unknown'}</p>
										</Col>
									</Row>
								</Container>
							</Card.Body>
						</Card>
					</section>

					<section className={classes.section}>
						<h4 className="mb-6">Navigator Appointment</h4>
						<Card bsPrefix="ic-card" className="mb-6">
							<Card.Header>
								<Card.Title>Screening Answers</Card.Title>
							</Card.Header>
							<Card.Body>
								<NoData title="No Screening Answers" actions={[]} />
							</Card.Body>
						</Card>
						<div className="mb-6">
							<EncounterAppointmentCard
								appointment={careEncounter.appointment}
								onCancel={() => {
									onShowCancelAppointmentModalChange(true);
								}}
							/>
						</div>
						<EncounterAppointmentHistoryCard
							appointments={careEncounter.appointmentHistory}
							onSelect={setSelectedAppointment}
						/>
					</section>
				</Tab.Pane>

				<Tab.Pane eventKey="contact-history" className={classes.tabPane}>
					<section className={classes.section}>
						<NoData title="No Contact Attempts Logged" actions={[]} />
					</section>
				</Tab.Pane>

				<Tab.Pane eventKey="notes" className={classes.notesPane}>
					<EncounterNotes careEncounter={careEncounter} />
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};
