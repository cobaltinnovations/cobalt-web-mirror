import React, { FC } from 'react';

import { TableRow, TableCell } from '@/components/table';
import SessionStatus, { SESSION_STATUS } from '@/components/session-status';
import SessionDropdown from '@/components/session-dropdown';

import { GroupSessionRequestModel, ROLE_ID } from '@/lib/models';

import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as AddIcon } from '@/assets/icons/add.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/copy.svg';
import { ReactComponent as ArchiveIcon } from '@/assets/icons/archive.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';
import { Link } from 'react-router-dom';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	iconPath: {
		'& path': {
			fill: theme.colors.n500,
		},
	},
	iconPolygon: {
		'& polygon': {
			fill: theme.colors.n500,
		},
	},
	iconTrash: {
		'& path': {
			fill: theme.colors.d500,
		},
	},
}));

interface SessionRequestRowProps {
	session: GroupSessionRequestModel;
	onEditClick(groupSessionRequestId: string): void;
	onAddClick(groupSessionRequestId: string): void;
	onArchiveClick(groupSessionRequestId: string): void;
	onUnarchiveClick(groupSessionRequestId: string): void;
	onDeleteClick(groupSessionRequestId: string): void;
}

const SessionRequestRow: FC<SessionRequestRowProps> = ({
	session,
	onEditClick,
	onAddClick,
	onArchiveClick,
	onUnarchiveClick,
	onDeleteClick,
}) => {
	const classes = useStyles();
	const { account } = useAccount();

	const canEditSession =
		account?.roleId === ROLE_ID.ADMINISTRATOR &&
		(session.groupSessionRequestStatusId === SESSION_STATUS.NEW ||
			session.groupSessionRequestStatusId === SESSION_STATUS.ADDED);

	const canAddSession =
		account?.roleId === ROLE_ID.ADMINISTRATOR && session.groupSessionRequestStatusId === SESSION_STATUS.NEW;

	const hasDropdown =
		canAddSession ||
		session.groupSessionRequestStatusId === SESSION_STATUS.ADDED ||
		session.groupSessionRequestStatusId === SESSION_STATUS.ARCHIVED;

	return (
		<TableRow>
			<TableCell>
				<span className="d-block fs-default">{session.createdDateDescription}</span>
			</TableCell>
			<TableCell>
				<Link
					to={`/in-the-studio/group-session-by-request/${session.groupSessionRequestId}`}
					className="d-block fs-default fw-bold"
				>
					{session.title}
				</Link>
			</TableCell>
			<TableCell>
				<SessionStatus status={session.groupSessionRequestStatusId} />
			</TableCell>
			<TableCell className="d-flex justify-content-end">
				{hasDropdown && (
					<SessionDropdown
						id={session.groupSessionRequestId}
						items={[
							...(canEditSession
								? [
										{
											icon: <EditIcon className={classes.iconPath} />,
											title: 'Edit',
											onClick: () => {
												onEditClick(session.groupSessionRequestId);
											},
										},
								  ]
								: []),
							...(canAddSession
								? [
										{
											icon: <AddIcon className={classes.iconPath} />,
											title: 'Add',
											onClick: () => {
												onAddClick(session.groupSessionRequestId);
											},
										},
								  ]
								: []),
							...(session.groupSessionRequestStatusId === SESSION_STATUS.ADDED
								? [
										{
											icon: <ArchiveIcon className={classes.iconPath} />,
											title: 'Archive',
											onClick: () => {
												onArchiveClick(session.groupSessionRequestId);
											},
										},
								  ]
								: []),
							...(session.groupSessionRequestStatusId === SESSION_STATUS.ARCHIVED
								? [
										{
											icon: <CopyIcon className={classes.iconPath} />,
											title: 'Unarchive',
											onClick: () => {
												onUnarchiveClick(session.groupSessionRequestId);
											},
										},
										{
											icon: <DeleteIcon className={classes.iconTrash} />,
											title: 'Delete',
											onClick: () => {
												onDeleteClick(session.groupSessionRequestId);
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

export default SessionRequestRow;
