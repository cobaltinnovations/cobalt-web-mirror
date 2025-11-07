import React from 'react';
import { Dropdown } from 'react-bootstrap';

import { PAGE_STATUS_ID, PageDetailModel } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import SvgIcon from '@/components/svg-icon';

interface PageActionsDropdownProps {
	page: PageDetailModel;
	onEdit(page: PageDetailModel): void;
	onDuplicate(page: PageDetailModel): void;
	onDelete(page: PageDetailModel): void;
	onUnpublish(page: PageDetailModel): void;
}

export const PageActionsDropdown = ({ page, onEdit, onDuplicate, onDelete, onUnpublish }: PageActionsDropdownProps) => {
	return (
		<Dropdown>
			<Dropdown.Toggle as={DropdownToggle} id={`dropdown--${page.pageId}`} className="p-2 border-0">
				<SvgIcon kit="far" icon="ellipsis-vertical" size={20} className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						onEdit(page);
					}}
				>
					<SvgIcon kit="far" icon="pen" size={16} className="me-2 text-n500" />
					Edit
				</Dropdown.Item>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						onDuplicate(page);
					}}
				>
					<SvgIcon kit="far" icon="clone" size={16} className="me-2 text-n500" />
					Duplicate
				</Dropdown.Item>
				<Dropdown.Divider />
				{page.pageStatusId === PAGE_STATUS_ID.DRAFT && (
					<Dropdown.Item
						className="d-flex align-items-center"
						onClick={() => {
							onDelete(page);
						}}
					>
						<SvgIcon kit="far" icon="trash-can" size={16} className="me-2 text-n500" />
						Delete
					</Dropdown.Item>
				)}
				{page.pageStatusId === PAGE_STATUS_ID.LIVE && (
					<>
						<Dropdown.Item
							className="d-flex align-items-center"
							onClick={() => {
								window.open(page.relativeUrl, '_blank', 'noopener, noreferrer');
							}}
						>
							<SvgIcon kit="far" icon="arrow-up-right-from-square" size={16} className="me-2 text-n500" />
							View on Cobalt
						</Dropdown.Item>
						<Dropdown.Divider />
						<Dropdown.Item
							className="d-flex align-items-center"
							onClick={() => {
								onUnpublish(page);
							}}
						>
							<SvgIcon kit="fas" icon="minus" size={16} className="me-2 text-n500" />
							Unpublish
						</Dropdown.Item>
					</>
				)}
			</Dropdown.Menu>
		</Dropdown>
	);
};
