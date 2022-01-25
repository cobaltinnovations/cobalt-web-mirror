import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';

import { TableRow, TableCell } from '@/components/table';
import SessionStatus, { SESSION_STATUS } from '@/components/session-status';
import SessionDropdown from '@/components/session-dropdown';

import { GroupSessionRequestModel, ROLE_ID } from '@/lib/models';

import colors from '@/jss/colors';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as AddIcon } from '@/assets/icons/add.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/copy.svg';
import { ReactComponent as ArchiveIcon } from '@/assets/icons/archive.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/trash.svg';
import { Link } from 'react-router-dom';
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

interface SessionRequestRowProps {
	session: GroupSessionRequestModel;
	onEditClick(groupSessionRequestId: string): void;
	onAddClick(groupSessionRequestId: string): void;
	onArchiveClick(groupSessionRequestId: string): void;
	onUnarchiveClick(groupSessionRequestId: string): void;
	onDeleteClick(groupSessionRequestId: string): void;
}

const SessionRequestRow: FC<SessionRequestRowProps> = ({ session, onEditClick, onAddClick, onArchiveClick, onUnarchiveClick, onDeleteClick }) => {
	const classes = useStyles();
	const { account } = useAccount();

	const canEditSession = (account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) &&
		(session.groupSessionRequestStatusId === SESSION_STATUS.NEW || session.groupSessionRequestStatusId === SESSION_STATUS.ADDED);

	const canAddSession =
		(account?.roleId === ROLE_ID.ADMINISTRATOR || account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR) &&
		session.groupSessionRequestStatusId === SESSION_STATUS.NEW;

	const hasDropdown =
		canAddSession || session.groupSessionRequestStatusId === SESSION_STATUS.ADDED || session.groupSessionRequestStatusId === SESSION_STATUS.ARCHIVED;

	return (
		<TableRow>
			<TableCell>
				<span className="d-block font-size-xs">{session.createdDateDescription}</span>
			</TableCell>
			<TableCell>
				<Link to={`/in-the-studio/group-session-by-request/${session.groupSessionRequestId}`} className="d-block font-size-xs font-karla-bold">
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
											icon: <TrashIcon className={classes.iconTrash} />,
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
