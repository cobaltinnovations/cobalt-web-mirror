import React, { useCallback, useRef, useState } from 'react';
import { Button, Card, Col, Container, Row, Tab } from 'react-bootstrap';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';

import AsyncWrapper from '@/components/async-page';
import SvgIcon from '@/components/svg-icon';
import TabBar from '@/components/tab-bar';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import {
	AppointmentModel,
	ATTENDANCE_STATUS_ID,
	CareEncounterListModel,
	CareEncounterModel,
	CareEncounterNoteModel,
	CareEncounterStatusId,
} from '@/lib/models';
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
import { EncounterContactHistory } from './encounter-contact-history';
import { EncounterNotes } from './encounter-notes';
import { EncounterRelatedEncountersCard } from './encounter-related-encounters-card';
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
	const [careEncounterHistory, setCareEncounterHistory] = useState<CareEncounterListModel[]>([]);
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
				setCareEncounterHistory(response.careEncounterHistory);
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
				navigate({
					pathname: '..',
					search: location.search,
				});
				await refreshCareEncounters();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, encounterId, handleError, location.search, navigate, refreshCareEncounters]
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

	const handleAttendanceStatusChange = useCallback(
		async (attendanceStatusId: ATTENDANCE_STATUS_ID) => {
			if (!encounterId || !careEncounter) {
				return;
			}

			try {
				const response = await careEncounterService
					.changeCareEncounterAppointmentAttendanceStatus(
						encounterId,
						careEncounter.appointment.appointmentId,
						{ attendanceStatusId }
					)
					.fetch();

				setCareEncounter(response.careEncounter);
				addFlag({
					variant: 'success',
					title: 'Appointment Attendance Updated',
					actions: [],
				});
				await refreshCareEncounters();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, careEncounter, encounterId, handleError, refreshCareEncounters]
	);

	const handleCareEncounterNotesChange = useCallback(
		async (careEncounterNotes: CareEncounterNoteModel[]) => {
			setCareEncounter((currentCareEncounter) =>
				currentCareEncounter ? { ...currentCareEncounter, careEncounterNotes } : currentCareEncounter
			);
			await refreshCareEncounters();
		},
		[refreshCareEncounters]
	);

	const handleCareEncounterScheduledMessagesChange = useCallback(async () => {
		await fetchCareEncounter();
		await refreshCareEncounters();
	}, [fetchCareEncounter, refreshCareEncounters]);

	const handleEditContactModalSave = useCallback(
		async (emailAddress: string) => {
			if (!encounterId) {
				return;
			}

			try {
				const response = await careEncounterService.updateCareEncounter(encounterId, { emailAddress }).fetch();

				setCareEncounter(response.careEncounter);
				setShowEditContactModal(false);
				addFlag({
					variant: 'success',
					title: 'Primary Contact Updated',
					actions: [],
				});
				await refreshCareEncounters();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, encounterId, handleError, refreshCareEncounters]
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
					careEncounterHistory={careEncounterHistory}
					activeTab={activeTab}
					showCancelAppointmentModal={showCancelAppointmentModal}
					showCloseEncounterModal={showCloseEncounterModal}
					showEditContactModal={showEditContactModal}
					onActiveTabChange={setActiveTab}
					onCancelAppointmentModalSave={handleCancelAppointmentModalSave}
					onAttendanceStatusChange={handleAttendanceStatusChange}
					onCloseEncounterModalSave={handleCloseEncounterModalSave}
					onEditContactModalSave={handleEditContactModalSave}
					onCareEncounterNotesChange={handleCareEncounterNotesChange}
					onCareEncounterScheduledMessagesChange={handleCareEncounterScheduledMessagesChange}
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
	careEncounterHistory: CareEncounterListModel[];
	activeTab: EncounterShelfTab;
	showCancelAppointmentModal: boolean;
	showCloseEncounterModal: boolean;
	showEditContactModal: boolean;
	onActiveTabChange(activeTab: EncounterShelfTab): void;
	onAttendanceStatusChange(attendanceStatusId: ATTENDANCE_STATUS_ID): Promise<void>;
	onCancelAppointmentModalSave(data: CancelCareEncounterAppointmentRequestBody): Promise<void>;
	onCloseEncounterModalSave(data: CancelCareEncounterRequestBody): Promise<void>;
	onEditContactModalSave(emailAddress: string): Promise<void>;
	onCareEncounterNotesChange(careEncounterNotes: CareEncounterNoteModel[]): Promise<void>;
	onCareEncounterScheduledMessagesChange(): Promise<void>;
	onShowCancelAppointmentModalChange(show: boolean): void;
	onShowCloseEncounterModalChange(show: boolean): void;
	onShowEditContactModalChange(show: boolean): void;
	onClose(): void;
}

const EncounterShelfContent = ({
	careEncounter,
	careEncounterHistory,
	activeTab,
	showCancelAppointmentModal,
	showCloseEncounterModal,
	showEditContactModal,
	onActiveTabChange,
	onAttendanceStatusChange,
	onCancelAppointmentModalSave,
	onCloseEncounterModalSave,
	onEditContactModalSave,
	onCareEncounterNotesChange,
	onCareEncounterScheduledMessagesChange,
	onShowCancelAppointmentModalChange,
	onShowCloseEncounterModalChange,
	onShowEditContactModalChange,
	onClose,
}: EncounterShelfContentProps) => {
	const classes = useStyles();
	const emailAddress = careEncounter.emailAddress;
	const [selectedAppointment, setSelectedAppointment] = useState<AppointmentModel>();
	const scheduledMessages = (careEncounter.careEncounterScheduledMessages ?? []).filter(
		(message) => !message.deleted
	);

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
				onSave={onEditContactModalSave}
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
						{ value: 'contact-history', title: `Contact History (${scheduledMessages.length})` },
						{ value: 'notes', title: `Notes (${careEncounter.careEncounterNotes.length})` },
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
										disabled={careEncounter.careEncounterStatusId !== CareEncounterStatusId.OPEN}
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
						<h4 className="mb-6 fw-semibold">Navigator Appointment</h4>
						<div className="mb-6">
							<EncounterAppointmentCard
								appointment={careEncounter.appointment}
								onAttendanceStatusChange={onAttendanceStatusChange}
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

					{careEncounterHistory.length > 0 && (
						<section className={classes.section}>
							<h4 className="mb-6 fw-semibold">
								Encounters <span className="text-muted">({careEncounterHistory.length})</span>
							</h4>
							<EncounterRelatedEncountersCard careEncounters={careEncounterHistory} />
						</section>
					)}
				</Tab.Pane>

				<Tab.Pane eventKey="contact-history" className={classes.tabPane}>
					<section className={classes.section}>
						<EncounterContactHistory
							careEncounter={careEncounter}
							onChanged={onCareEncounterScheduledMessagesChange}
						/>
					</section>
				</Tab.Pane>

				<Tab.Pane eventKey="notes" className={classes.notesPane}>
					<EncounterNotes careEncounter={careEncounter} onNotesChange={onCareEncounterNotesChange} />
				</Tab.Pane>
			</Tab.Content>
		</Tab.Container>
	);
};
