import React from 'react';
import { Dropdown } from 'react-bootstrap';

import { PageDetailModel } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import SvgIcon from '@/components/svg-icon';

interface MailingListActionsDropdownProps {
	page: PageDetailModel;
	onCopy(page: PageDetailModel): void;
	onDownload(page: PageDetailModel): void;
}

export const MailingListActionsDropdown = ({ page, onCopy, onDownload }: MailingListActionsDropdownProps) => {
	return (
		<Dropdown>
			<Dropdown.Toggle as={DropdownToggle} id={`dropdown--${page.pageId}`} className="p-2 border-0">
				<SvgIcon kit="far" icon="gear" size={20} className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						onCopy(page);
					}}
				>
					Copy subscriber email addresses
				</Dropdown.Item>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						onDownload(page);
					}}
				>
					Download subscriber emails addresses
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	);
};
