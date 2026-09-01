import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import NoData from '@/components/no-data';
import SvgIcon from '@/components/svg-icon';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { createUseThemedStyles } from '@/jss/theme';
import {
	CareEncounterModel,
	CareEncounterScheduledMessageModel,
	CareEncounterStatusId,
	ScheduledMessageStatusId,
} from '@/lib/models';
import { CareEncounterMessageModal } from './care-encounter-message-modal';

const useStyles = createUseThemedStyles((theme) => ({
	readOnlyHeader: {
		gap: 16,
		marginBottom: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	readOnlyBody: {
		padding: 24,
		borderRadius: 4,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
		'& p:not(:last-child), & div:not(:last-child)': {
			marginBottom: 20,
		},
	},
	messageContent: {
		'& p + p, & div + p, & p + div': {
			marginTop: 16,
		},
	},
}));

interface Props {
	careEncounter: CareEncounterModel;
	onChanged(): Promise<void> | void;
}

const PendingMessageCard = ({ message, onEdit }: { message: CareEncounterScheduledMessageModel; onEdit(): void }) => {
	const classes = useStyles();

	return (
		<Card bsPrefix="ic-card" className="mb-4">
			<Card.Header>
				<Card.Title>Message scheduled for {message.scheduledAtDescription}</Card.Title>
				{message.editable && (
					<div className="button-container">
						<Button
							variant="transparent-secondary"
							className="p-2"
							aria-label="Edit scheduled message"
							onClick={onEdit}
						>
							<SvgIcon kit="far" icon="pen" size={16} className="d-flex" />
						</Button>
					</div>
				)}
			</Card.Header>
			<Card.Body>
				<Container fluid>
					<Row className="mb-4">
						<Col xs={3} className="text-n500">
							Message Type
						</Col>
						<Col xs={9}>{message.careEncounterScheduledMessageTypeDescription}</Col>
					</Row>
					<Row className="mb-4">
						<Col xs={3} className="text-n500">
							Contact Method
						</Col>
						<Col xs={9}>Email</Col>
					</Row>
					<Row>
						<Col xs={3} className="text-n500">
							Custom Text
						</Col>
						<Col xs={9}>
							<WysiwygDisplay html={message.customEmailText} className={classes.messageContent} />
						</Col>
					</Row>
				</Container>
			</Card.Body>
		</Card>
	);
};

const ReadOnlyMessage = ({ message }: { message: CareEncounterScheduledMessageModel }) => {
	const classes = useStyles();
	const navigatorName = message.scheduledByAccountDisplayName ?? 'Care Navigator';
	const sent = Boolean(message.sentAt);
	const statusDescription = message.messageStatusDescription ?? message.scheduledMessageStatusDescription;

	return (
		<article className="mb-6">
			<div className={classes.readOnlyHeader}>
				<p className="mb-0">
					<strong>{navigatorName}</strong> {sent ? 'sent' : 'scheduled'} a follow-up email
				</p>
				<p className="mb-0 text-n500">{sent ? message.sentAtDescription : message.scheduledAtDescription}</p>
			</div>
			{!sent && <p className="mb-0 text-n500">Status: {statusDescription}</p>}
			<WysiwygDisplay html={message.emailBody} className={classes.readOnlyBody} />
		</article>
	);
};

export const EncounterContactHistory = ({ careEncounter, onChanged }: Props) => {
	const [showMessageModal, setShowMessageModal] = useState(false);
	const [messageToEdit, setMessageToEdit] = useState<CareEncounterScheduledMessageModel>();
	const messages = useMemo(() => {
		return (careEncounter.careEncounterScheduledMessages ?? [])
			.filter((message) => !message.deleted)
			.sort((first, second) => {
				const firstPending = first.scheduledMessageStatusId === ScheduledMessageStatusId.PENDING;
				const secondPending = second.scheduledMessageStatusId === ScheduledMessageStatusId.PENDING;
				return Number(secondPending) - Number(firstPending);
			});
	}, [careEncounter.careEncounterScheduledMessages]);
	const hasPendingMessage = messages.some(
		(message) => message.scheduledMessageStatusId === ScheduledMessageStatusId.PENDING
	);

	return (
		<>
			<CareEncounterMessageModal
				careEncounterId={careEncounter.careEncounterId}
				messageToEdit={messageToEdit}
				show={showMessageModal}
				onHide={() => {
					setShowMessageModal(false);
					setMessageToEdit(undefined);
				}}
				onChanged={onChanged}
			/>

			<div className="mb-6 d-flex justify-content-between align-items-center">
				<h4 className="fw-semibold">
					Contact History <span className="text-muted">({messages.length})</span>
				</h4>
				<Button
					variant="outline-primary"
					disabled={careEncounter.careEncounterStatusId !== CareEncounterStatusId.OPEN || hasPendingMessage}
					onClick={() => {
						setMessageToEdit(undefined);
						setShowMessageModal(true);
					}}
				>
					Schedule Message
				</Button>
			</div>

			{messages.length === 0 ? (
				<NoData title="No Contact Attempts Logged" actions={[]} />
			) : (
				messages.map((message) =>
					message.scheduledMessageStatusId === ScheduledMessageStatusId.PENDING ? (
						<PendingMessageCard
							key={message.careEncounterScheduledMessageId}
							message={message}
							onEdit={() => {
								setMessageToEdit(message);
								setShowMessageModal(true);
							}}
						/>
					) : (
						<ReadOnlyMessage key={message.careEncounterScheduledMessageId} message={message} />
					)
				)
			)}
		</>
	);
};
