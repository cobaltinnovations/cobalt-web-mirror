import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import { GROUP_SESSION_STATUS_ID, GroupSessionModel } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import SvgIcon from '../svg-icon';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { ReactComponent as GroupSessionsIcon } from '@/assets/icons/icon-group.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as XCloseIcon } from '@/assets/icons/icon-cancel.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { GroupSessionDetailNavigationSource } from '@/routes/group-session-detail';
import { GroupSessionSchedulingSystemId } from '@/lib/services';

interface GroupSessionTableDropdownProps {
	groupSession: GroupSessionModel;
	onCancel(groupSessionId: string): void;
	onDelete(groupSessionId: string): void;
}

export const GroupSessionTableDropdown = ({ groupSession, onCancel, onDelete }: GroupSessionTableDropdownProps) => {
	const navigate = useNavigate();
	const isNew = groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW;
	const isArchived = groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ARCHIVED;
	const isCanceled = groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.CANCELED;

	const isExternal = groupSession.groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL;

	const canEdit =
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED;

	const canDuplicate =
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ARCHIVED ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.CANCELED;

	const canCancel =
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW ||
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.ADDED;

	const canDelete = groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.CANCELED;

	const canViewOnCobalt = !isNew && !isArchived && !isCanceled;

	return (
		<Dropdown>
			<Dropdown.Toggle
				as={DropdownToggle}
				id={`admin-group-sessions__dropdown-menu--${groupSession.groupSessionId}`}
				className="p-2"
			>
				<MoreIcon className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				{canEdit && (
					<Dropdown.Item
						className="d-flex align-items-center"
						as={Link}
						to={`/admin/group-sessions/edit/${groupSession.groupSessionId}`}
					>
						<EditIcon className="me-2 text-n500" width={20} height={20} />
						Edit
					</Dropdown.Item>
				)}
				{canDuplicate && (
					<Dropdown.Item
						className="d-flex align-items-center"
						as={Link}
						to={`/admin/group-sessions/duplicate/${groupSession.groupSessionId}`}
					>
						<SvgIcon kit="far" icon="clone" size={20} className="me-2 text-n500" />
						Duplicate
					</Dropdown.Item>
				)}
				<Dropdown.Divider />
				{isNew && (
					<Dropdown.Item
						className="d-flex align-items-center"
						as={Link}
						target="_blank"
						to={`/admin/group-sessions/preview/${groupSession.groupSessionId}`}
					>
						<ExternalIcon className="me-2 text-n500" width={20} height={20} />
						Preview
					</Dropdown.Item>
				)}
				{canViewOnCobalt && (
					<Dropdown.Item
						className="d-flex align-items-center"
						as={Link}
						to={`/group-sessions/${groupSession.urlName}`}
						state={{
							navigationSource: GroupSessionDetailNavigationSource.ADMIN_LIST,
						}}
						target="_blank"
					>
						<ExternalIcon className="me-2 text-n500" width={20} height={20} />
						View on Cobalt
					</Dropdown.Item>
				)}

				{!isNew && !isExternal && (
					<Dropdown.Item
						className="d-flex align-items-center"
						onClick={() => {
							navigate({
								pathname: `/admin/group-sessions/view/${groupSession.groupSessionId}`,
								search: '?tab=registrants',
							});
						}}
					>
						<GroupSessionsIcon className="me-2 text-n500" width={20} height={20} />
						View Registrants
					</Dropdown.Item>
				)}

				{(canCancel || canDelete) && <Dropdown.Divider />}

				{canCancel && (
					<Dropdown.Item
						className="d-flex align-items-center"
						onClick={() => {
							onCancel(groupSession.groupSessionId);
						}}
					>
						<XCloseIcon className="me-2 text-n500" width={20} height={20} />
						Cancel
					</Dropdown.Item>
				)}
				{canDelete && (
					<Dropdown.Item
						className="d-flex align-items-center"
						onClick={() => {
							onDelete(groupSession.groupSessionId);
						}}
					>
						<SvgIcon kit="far" icon="trash-can" size={20} className="me-2 text-n500" />
						Delete
					</Dropdown.Item>
				)}
			</Dropdown.Menu>
		</Dropdown>
	);
};
