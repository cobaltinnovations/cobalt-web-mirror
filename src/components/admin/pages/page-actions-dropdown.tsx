import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

import { PAGE_STATUS_ID, PageDetailModel } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as MinusIcon } from '@/assets/icons/icon-minus.svg';
import SvgIcon from '@/components/svg-icon';

interface PageActionsDropdownProps {
	page: PageDetailModel;
	onDuplicate(page: PageDetailModel): void;
	onDelete(page: PageDetailModel): void;
	onUnpublish(page: PageDetailModel): void;
}

export const PageActionsDropdown = ({ page, onDuplicate, onDelete, onUnpublish }: PageActionsDropdownProps) => {
	const navigate = useNavigate();

	return (
		<Dropdown>
			<Dropdown.Toggle as={DropdownToggle} id={`dropdown--${page.pageId}`} className="p-2 border-0">
				<SvgIcon kit="far" icon="ellipsis-vertical" size={20} className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						navigate(`/admin/pages/${page.pageId}`);
					}}
				>
					<EditIcon className="me-2 text-n500" width={20} height={20} />
					Edit
				</Dropdown.Item>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						onDuplicate(page);
					}}
				>
					<SvgIcon kit="far" icon="clone" size={20} className="me-2 text-n500" />
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
						<SvgIcon kit="far" icon="trash-can" size={20} className="me-2 text-n500" />
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
							<SvgIcon kit="far" icon="arrow-up-right-from-square" size={20} className="me-2 text-n500" />
							View on Cobalt
						</Dropdown.Item>
						<Dropdown.Divider />
						<Dropdown.Item
							className="d-flex align-items-center"
							onClick={() => {
								onUnpublish(page);
							}}
						>
							<MinusIcon className="me-2 text-n500" width={20} height={20} />
							Unpublish
						</Dropdown.Item>
					</>
				)}
			</Dropdown.Menu>
		</Dropdown>
	);
};
