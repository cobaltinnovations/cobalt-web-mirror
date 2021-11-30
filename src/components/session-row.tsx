import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

import { TableRow, TableCell } from '@/components/table';
import SessionAttendees from '@/components/session-attendees';
import SessionStatus, { SESSION_STATUS } from '@/components/session-status';
import SessionDropdown from '@/components/session-dropdown';

import { GroupSessionModel, ROLE_ID } from '@/lib/models';

import colors from '@/jss/colors';

import { ReactComponent as AddIcon } from '@/assets/icons/add.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/copy.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/trash.svg';
import { Link } from 'react-router-dom';
import { GroupSessionSchedulingSystemId } from '@/lib/services';
import useAccount from '@/hooks/use-account';

const useStyles = createUseStyles({
	iconPath: {
		'& path': {
			fill: colors.gray600,
		},
	},
	iconPolygon: {
		'& polygon': {
			fill: colors.gray600,
		},
	},
	iconTrash: {
		'& path': {
			fill: colors.danger,
		},
	},
});

interface SessionRowProps {
	session: GroupSessionModel;
	onEditClick(groupSessionId: string): void;
	onViewClick(groupSessionId: string): void;
	onAddClick(groupSessionId: string): void;
	onCopyClick(groupSessionId: string): void;
	onCancelClick(groupSessionId: string): void;
	onDeleteClick(groupSessionId: string): void;
}

const SessionRow: FC<SessionRowProps> = ({
	session,
	onEditClick,
	onViewClick,
	onAddClick,
	onCopyClick,
	onCancelClick,
	onDeleteClick,
}) => {
	const classes = useStyles();
	const { account } = useAccount();

	const canAddSession =
		(account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR || account?.roleId === ROLE_ID.ADMINISTRATOR) &&
		session.groupSessionStatusId === SESSION_STATUS.NEW;

	const hasDropdown =
		session.groupSessionStatusId === SESSION_STATUS.NEW ||
		session.groupSessionStatusId === SESSION_STATUS.ADDED ||
		canAddSession ||
		session.groupSessionStatusId === SESSION_STATUS.ARCHIVED ||
		session.groupSessionStatusId === SESSION_STATUS.CANCELED;

	return (
		<TableRow>
			<TableCell>
				<span className="d-block font-size-xs">{session.createdDateDescription}</span>
			</TableCell>
			<TableCell>
				<Link
					to={`/in-the-studio/group-session-scheduled/${session.groupSessionId}`}
					className="d-block font-size-xs font-karla-bold"
				>
					{session.title}
				</Link>
				<span className="d-block font-size-xs">{session.startDateTimeDescription}</span>
			</TableCell>
			<TableCell>
				<span className="d-block font-size-xs">{session.facilitatorName}</span>
			</TableCell>
			<TableCell>
				{session.groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.COBALT && (
					<SessionAttendees
						currentAmount={session.seatsReserved || 0}
						maxAmount={(session.seatsReserved || 0) + (session.seatsAvailable || 0)}
					/>
				)}
				{session.groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL && '(external)'}
			</TableCell>
			<TableCell>
				<SessionStatus status={session.groupSessionStatusId} />
			</TableCell>
			<TableCell className="d-flex justify-content-end">
				{hasDropdown && (
					<SessionDropdown
						id={session.groupSessionId}
						items={[
							...(session.groupSessionStatusId === SESSION_STATUS.NEW ||
							session.groupSessionStatusId === SESSION_STATUS.ADDED
								? [
										{
											icon: <EditIcon className={classes.iconPath} />,
											title: 'Edit',
											onClick: () => {
												onEditClick(session.groupSessionId);
											},
										},
								  ]
								: []),
							...(canAddSession
								? [
										{
											icon: <AddIcon className={classes.iconPolygon} />,
											title: 'Add',
											onClick: () => {
												onAddClick(session.groupSessionId);
											},
										},
								  ]
								: []),
							...(session.groupSessionStatusId === SESSION_STATUS.ARCHIVED
								? [
										{
											icon: <InfoIcon className={classes.iconPath} />,
											title: 'View',
											onClick: () => {
												onViewClick(session.groupSessionId);
											},
										},
								  ]
								: []),
							...(session.groupSessionStatusId === SESSION_STATUS.ADDED ||
							session.groupSessionStatusId === SESSION_STATUS.ARCHIVED ||
							session.groupSessionStatusId === SESSION_STATUS.CANCELED
								? [
										{
											icon: <CopyIcon className={classes.iconPath} />,
											title: 'Create Copy',
											onClick: () => {
												onCopyClick(session.groupSessionId);
											},
										},
								  ]
								: []),
							...(session.groupSessionStatusId === SESSION_STATUS.NEW ||
							session.groupSessionStatusId === SESSION_STATUS.ADDED
								? [
										{
											icon: <CloseIcon className={classes.iconPolygon} />,
											title: 'Cancel',
											onClick: () => {
												onCancelClick(session.groupSessionId);
											},
										},
								  ]
								: []),
							...(session.groupSessionStatusId === SESSION_STATUS.CANCELED
								? [
										{
											icon: <TrashIcon className={classes.iconTrash} />,
											title: 'Delete',
											onClick: () => {
												onDeleteClick(session.groupSessionId);
											},
										},
								  ]
								: []),
						]}
					/>
				)}
			</TableCell>
		</TableRow>
	);
};

export default SessionRow;
