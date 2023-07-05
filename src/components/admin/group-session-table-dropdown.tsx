import React from 'react';
import { Dropdown } from 'react-bootstrap';

import { GROUP_SESSION_STATUS_ID, GroupSessionModel, ROLE_ID } from '@/lib/models';
import useAccount from '@/hooks/use-account';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';

interface GroupSessionTableDropdownProps {
	groupSession: GroupSessionModel;
	onAdd(groupSessionId: string): void;
	onEdit(groupSessionId: string): void;
	onDuplicate(groupSessionId: string): void;
	onCancel(groupSessionId: string): void;
	onDelete(groupSessionId: string): void;
}

export const GroupSessionTableDropdown = ({
	groupSession,
	onAdd,
	onEdit,
	onDuplicate,
	onCancel,
	onDelete,
}: GroupSessionTableDropdownProps) => {
	const { account } = useAccount();

	const canAdd =
		(account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR || account?.roleId === ROLE_ID.ADMINISTRATOR) &&
		groupSession.groupSessionStatusId === GROUP_SESSION_STATUS_ID.NEW;

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

	return (
		<Dropdown>
			<Dropdown.Toggle
				as={DropdownToggle}
				id={`admin-group-sessions__dropdown-menu--${groupSession.groupSessionId}`}
				className="p-2"
			>
				<MoreIcon className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				<Dropdown.Item
					onClick={() => {
						window.alert('[TODO]: View Registrants');
					}}
				>
					View Registrants
				</Dropdown.Item>
				<Dropdown.Divider />
				{canAdd && (
					<Dropdown.Item
						onClick={() => {
							onAdd(groupSession.groupSessionId);
						}}
					>
						Add
					</Dropdown.Item>
				)}
				{canEdit && (
					<Dropdown.Item
						onClick={() => {
							onEdit(groupSession.groupSessionId);
						}}
					>
						Edit
					</Dropdown.Item>
				)}
				{canDuplicate && (
					<Dropdown.Item
						onClick={() => {
							onDuplicate(groupSession.groupSessionId);
						}}
					>
						Duplicate
					</Dropdown.Item>
				)}
				<Dropdown.Divider />
				{canCancel && (
					<Dropdown.Item
						onClick={() => {
							onCancel(groupSession.groupSessionId);
						}}
					>
						Cancel
					</Dropdown.Item>
				)}
				{canDelete && (
					<Dropdown.Item
						onClick={() => {
							onDelete(groupSession.groupSessionId);
						}}
					>
						Delete
					</Dropdown.Item>
				)}
			</Dropdown.Menu>
		</Dropdown>
	);
};
