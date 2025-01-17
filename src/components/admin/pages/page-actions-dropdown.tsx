import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

import { PAGE_STATUS_ID, PAGE_TYPE_ID, PageModel } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/icon-content-copy.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-delete.svg';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { ReactComponent as MinusIcon } from '@/assets/icons/icon-minus.svg';

interface PageActionsDropdownProps {
	page: PageModel;
	onDelete(page: PageModel): void;
	onUnpublish(page: PageModel): void;
}

export const PageActionsDropdown = ({ page, onDelete, onUnpublish }: PageActionsDropdownProps) => {
	const navigate = useNavigate();

	return (
		<Dropdown>
			<Dropdown.Toggle as={DropdownToggle} id={`dropdown--${page.pageId}`} className="p-2">
				<MoreIcon className="d-flex" />
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
						return;
					}}
				>
					<CopyIcon className="me-2 text-n500" width={20} height={20} />
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
						<TrashIcon className="me-2 text-n500" width={20} height={20} />
						Delete
					</Dropdown.Item>
				)}
				{page.pageStatusId === PAGE_STATUS_ID.LIVE && (
					<>
						<Dropdown.Item
							className="d-flex align-items-center"
							onClick={() => {
								let pathname = '';

								if (page.pageTypeId === PAGE_TYPE_ID.COMMUNITY) {
									pathname = `/community/${page.urlName}`;
								} else if (page.pageTypeId === PAGE_TYPE_ID.TOPIC_CENTER) {
									pathname = `/topic/${page.urlName}`;
								}

								window.open(`${window.location.origin}${pathname}`, '_blank', 'noopener, noreferrer');
							}}
						>
							<ExternalIcon className="me-2 text-n500" width={20} height={20} />
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
