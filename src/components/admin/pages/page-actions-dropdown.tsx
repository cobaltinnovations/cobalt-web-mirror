import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { PageDetailModel } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import SvgIcon, { SvgIconProps } from '@/components/svg-icon';
import { getPageActionIds, PageActionId } from '@/lib/utils/page-admin-utils';

interface PageActionsDropdownProps {
	page: PageDetailModel;
	onEdit(page: PageDetailModel): void;
	onPageSettings(page: PageDetailModel): void;
	onDuplicate(page: PageDetailModel): void;
	onDelete(page: PageDetailModel): void;
	onUnpublish(page: PageDetailModel): void;
}

export const PageActionsDropdown = ({
	page,
	onEdit,
	onPageSettings,
	onDuplicate,
	onDelete,
	onUnpublish,
}: PageActionsDropdownProps) => {
	const actions: Record<
		PageActionId,
		{ title: string; icon: SvgIconProps['icon']; onClick(): void; dividerBefore?: boolean }
	> = {
		EDIT: { title: 'Edit', icon: 'pen', onClick: () => onEdit(page) },
		DUPLICATE: { title: 'Duplicate', icon: 'clone', onClick: () => onDuplicate(page) },
		SETTINGS: { title: 'Settings', icon: 'gear', onClick: () => onPageSettings(page) },
		DELETE: { title: 'Delete', icon: 'trash-can', onClick: () => onDelete(page), dividerBefore: true },
		VIEW: {
			title: 'View on Cobalt',
			icon: 'arrow-up-right-from-square',
			onClick: () => {
				window.open(page.relativeUrl, '_blank', 'noopener,noreferrer');
			},
			dividerBefore: true,
		},
		UNPUBLISH: { title: 'Unpublish', icon: 'minus', onClick: () => onUnpublish(page), dividerBefore: true },
	};
	return (
		<Dropdown>
			<Dropdown.Toggle
				as={DropdownToggle}
				variant="transparent-secondary"
				size="sm"
				id={`page-actions--${page.pageId}`}
				aria-label={`Actions for ${page.name}`}
				className="p-2"
			>
				<SvgIcon kit="far" icon="ellipsis-vertical" size={20} className="d-flex" />
			</Dropdown.Toggle>
			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				{getPageActionIds(page.pageStatusId).map((id) => (
					<React.Fragment key={id}>
						{actions[id].dividerBefore && <Dropdown.Divider />}
						<Dropdown.Item className="d-flex align-items-center" onClick={actions[id].onClick}>
							<SvgIcon
								kit={id === 'UNPUBLISH' ? 'fas' : 'far'}
								icon={actions[id].icon}
								size={16}
								className={`me-2 ${id === 'DELETE' ? 'text-danger' : 'text-n500'}`}
							/>
							{actions[id].title}
						</Dropdown.Item>
					</React.Fragment>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
};
