import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { AdminContent } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';

interface AdminResourcesTableDropdownProps {
	content: AdminContent;
}

export const AdminResourcesTableDropdown = ({ content }: AdminResourcesTableDropdownProps) => {
	return (
		<Dropdown>
			<Dropdown.Toggle
				as={DropdownToggle}
				id={`admin-resources__dropdown-menu--${content.contentId}`}
				className="p-2"
			>
				<MoreIcon className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				<Dropdown.Item
					className="d-flex align-items-center"
					as={Link}
					to={`/admin/resources/view/${content.contentId}`}
				>
					<EditIcon className="me-2 text-n500" width={24} height={24} />
					View
				</Dropdown.Item>

				<Dropdown.Item
					className="d-flex align-items-center"
					as={Link}
					to={`/admin/resources/edit/${content.contentId}`}
				>
					<EditIcon className="me-2 text-n500" width={24} height={24} />
					Edit
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	);
};
