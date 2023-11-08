import React, { ComponentType, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { AdminContent, AdminContentAction, ContentStatusId } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { ReactComponent as ArchiveIcon } from '@/assets/icons/archive.svg';
import { ReactComponent as UnArchiveIcon } from '@/assets/icons/unarchive.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-trash.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as XIcon } from '@/assets/icons/icon-x.svg';
import ConfirmDialog, { ConfirmDialogProps } from '../confirm-dialog';
import useHandleError from '@/hooks/use-handle-error';
import { adminService } from '@/lib/services';

interface AdminResourcesTableDropdownProps {
	content: AdminContent;
}

interface ActionItemProps {
	icon: ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	dividers: boolean;
	action?(content: AdminContent): Promise<void>;
	linkProps?(content: AdminContent): { as: typeof Link; to: string | { pathname: string; target?: string } };
}

const adminActionConfirmDialogPropsMap: Record<
	string,
	(content: AdminContent, onConfirm: () => void) => ConfirmDialogProps
> = {
	[AdminContentAction.EXPIRE]: (content, onConfirm) => ({
		titleText: 'Force Expire Resource',
		bodyText: `Are you sure you want to force expire ${content.title}?`,
		detailText: `This resource will be removed from the Resource Library. TODO: ${2} institutions are currently using this resource.`,
		confirmText: 'Force Expire',
		dismissText: 'Cancel',
		destructive: true,
		size: 'lg',
		onConfirm,
	}),
	[AdminContentAction.DELETE]: (content, onConfirm) => ({
		titleText: 'Delete Resource',
		bodyText: `Are you sure you want to delete ${content.title}?`,
		detailText: 'This action is permanent. The content will be removed from Cobalt immediately.',
		confirmText: 'Delete',
		dismissText: 'Cancel',
		destructive: true,
		size: 'lg',
		onConfirm,
	}),
	[AdminContentAction.REMOVE]: (content, onConfirm) => ({
		titleText: 'Remove Resource',
		bodyText: `Are you sure you want to remove ${content.title}?`,
		detailText: 'This resource will be removed from your Resource Library.',
		confirmText: 'Delete',
		dismissText: 'Cancel',
		destructive: true,
		size: 'lg',
		onConfirm,
	}),
};

const actionItemProps: Record<string, ActionItemProps> = {
	[AdminContentAction.ARCHIVE]: {
		icon: ArchiveIcon,
		label: 'Archive',
		dividers: false,
		action: async (content) => {
			alert('TODO: Archive');
		},
	},
	[AdminContentAction.DELETE]: {
		icon: TrashIcon,
		label: 'Delete',
		dividers: false,
		action: async (content) => {
			const request = adminService.deleteAdminContent(content.contentId);
			await request.fetch();
		},
	},
	[AdminContentAction.EDIT]: {
		icon: EditIcon,
		label: 'Edit',
		dividers: false,
		linkProps: (content) => {
			return {
				as: Link,
				to: `/admin/resources/edit/${content.contentId}`,
			};
		},
	},
	[AdminContentAction.EXPIRE]: {
		icon: EventIcon,
		label: 'Force Expire',
		dividers: false,
		action: async (content) => {
			const request = adminService.updateContent(content.contentId, {
				contentStatusId: ContentStatusId.EXPIRED,
			});
			await request.fetch();
		},
	},
	[AdminContentAction.REMOVE]: {
		icon: XIcon,
		label: 'Remove',
		dividers: false,
		action: async (content) => {
			const request = adminService.removeContent(content.contentId);
			await request.fetch();
		},
	},
	[AdminContentAction.UNARCHIVE]: {
		icon: UnArchiveIcon,
		label: 'Unarchive',
		dividers: false,
		action: async () => {
			alert('TODO: Unarchive');
		},
	},
	[AdminContentAction.UNEXPIRE]: {
		icon: UnArchiveIcon,
		label: 'Unexpire',
		dividers: false,
		action: async (content) => {
			const request = adminService.updateContent(content.contentId, {
				contentStatusId: ContentStatusId.DRAFT,
			});
			await request.fetch();
		},
	},
	[AdminContentAction.VIEW_ON_COBALT]: {
		icon: ExternalIcon,
		label: 'View on Cobalt',
		dividers: true,
		linkProps: (content) => {
			return {
				as: Link,
				to: {
					pathname: `/resource-library/${content.contentId}`,
				},
				target: '_blank',
			};
		},
	},
};

export const AdminResourcesTableDropdown = ({ content }: AdminResourcesTableDropdownProps) => {
	const handleError = useHandleError();
	const [confirmDialogProps, setConfirmDialogProps] = useState<ConfirmDialogProps>({} as ConfirmDialogProps);
	const [isConfirming, setIsConfirming] = useState(false);

	const hideCurrentConfirmDialog = () => {
		setConfirmDialogProps((current) => {
			return {
				...current,
				show: false,
			};
		});
	};

	return (
		<>
			<ConfirmDialog {...confirmDialogProps} isConfirming={isConfirming} />

			<Dropdown>
				<Dropdown.Toggle
					as={DropdownToggle}
					id={`admin-resources__dropdown-menu--${content.contentId}`}
					className="p-2 border-0"
				>
					<MoreIcon className="d-flex" />
				</Dropdown.Toggle>
				<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
					{content.actions.map((action) => {
						const actionProps = actionItemProps[action];

						if (!actionProps) {
							return null;
						}

						let linkProps = actionProps.linkProps && actionProps.linkProps(content);

						return (
							<React.Fragment>
								{actionProps.dividers && <Dropdown.Divider />}

								{linkProps ? (
									<Dropdown.Item className="d-flex align-items-center" {...linkProps}>
										<actionProps.icon className="me-2 text-n500" width={24} height={24} />
										{actionProps.label}
									</Dropdown.Item>
								) : (
									<Dropdown.Item
										className="d-flex align-items-center"
										onClick={() => {
											const finishAction = async () => {
												setIsConfirming(true);

												try {
													await actionProps.action?.(content);
													hideCurrentConfirmDialog();
												} catch (e) {
													handleError(e);
												} finally {
													setIsConfirming(false);
												}
											};

											const nextConfirmProps = adminActionConfirmDialogPropsMap[action];

											if (!nextConfirmProps) {
												finishAction();
												return;
											}

											setConfirmDialogProps({
												...nextConfirmProps(content, finishAction),
												show: true,
												onHide: () => {
													hideCurrentConfirmDialog();
												},
											});
										}}
									>
										<actionProps.icon className="me-2 text-n500" width={24} height={24} />
										{actionProps.label}
									</Dropdown.Item>
								)}

								{actionProps.dividers && <Dropdown.Divider />}
							</React.Fragment>
						);
					})}
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
};
