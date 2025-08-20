import React, { ComponentType, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { AdminContent, AdminContentAction, ContentStatusId } from '@/lib/models';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';

import SvgIcon from '../svg-icon';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { ReactComponent as ArchiveIcon } from '@/assets/icons/icon-archive.svg';
import { ReactComponent as UnArchiveIcon } from '@/assets/icons/icon-unarchive.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import ConfirmDialog, { ConfirmDialogProps } from '../confirm-dialog';
import useHandleError from '@/hooks/use-handle-error';
import { AdminContentResponse, ContentIdResponse, adminService } from '@/lib/services';

interface AdminResourcesTableDropdownProps {
	content: AdminContent;
	onRefresh: (action: AdminContentAction, content?: AdminContent) => void;
}

interface ActionItemProps {
	icon: ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	dividers: boolean;
	action?(content: AdminContent): Promise<AdminContentResponse | ContentIdResponse | void>;
	linkProps?(content: AdminContent): { as: typeof Link; to: string | { pathname: string; target?: string } };
	requiresRefresh?: boolean;
}

const adminActionConfirmDialogPropsMap: Record<
	string,
	(content: AdminContent, onConfirm: () => void) => ConfirmDialogProps
> = {
	[AdminContentAction.EXPIRE]: (content, onConfirm) => ({
		titleText: 'Force Expire Resource',
		bodyText: `Are you sure you want to force expire this resource?`,
		detailText: `Expired resources are hidden from your Resource Library AND removed from the Resource Library of any institution currently using it.`,
		confirmText: 'Force Expire',
		dismissText: 'Cancel',
		destructive: true,
		size: 'lg',
		onConfirm,
	}),
	[AdminContentAction.DELETE]: (content, onConfirm) => ({
		titleText: 'Delete Resource',
		bodyText: `Are you sure you want to delete this resource?`,
		detailText: `This action is permanent. "${content.title}" will be removed from Cobalt.`,
		confirmText: 'Delete',
		dismissText: 'Cancel',
		destructive: true,
		size: 'lg',
		onConfirm,
	}),
	[AdminContentAction.REMOVE]: (content, onConfirm) => ({
		titleText: 'Remove Resource',
		bodyText: `Are you sure you want to remove this resource?`,
		detailText: `"${content.title}" will be removed from your Resource Library immediately.`,
		confirmText: 'Remove',
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
			return {};
		},
		requiresRefresh: true,
	},
	[AdminContentAction.DELETE]: {
		icon: DeleteIcon,
		label: 'Delete',
		dividers: false,
		action: async (content) => {
			const request = adminService.deleteAdminContent(content.contentId);
			return await request.fetch();
		},
		requiresRefresh: true,
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
			const request = adminService.forceExpireContent(content.contentId);
			return await request.fetch();
		},
		requiresRefresh: true,
	},
	[AdminContentAction.REMOVE]: {
		icon: CloseIcon,
		label: 'Remove',
		dividers: false,
		action: async (content) => {
			const request = adminService.removeContent(content.contentId);
			return await request.fetch();
		},
		requiresRefresh: true,
	},
	[AdminContentAction.UNARCHIVE]: {
		icon: UnArchiveIcon,
		label: 'Unarchive',
		dividers: false,
		action: async () => {
			alert('TODO: Unarchive');
			return {};
		},
		requiresRefresh: true,
	},
	[AdminContentAction.UNEXPIRE]: {
		icon: UnArchiveIcon,
		label: 'Unexpire',
		dividers: false,
		action: async (content) => {
			const request = adminService.updateContent(content.contentId, {
				contentStatusId: ContentStatusId.DRAFT,
			});
			return await request.fetch();
		},
		requiresRefresh: true,
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

export const AdminResourcesTableDropdown = ({ content, onRefresh }: AdminResourcesTableDropdownProps) => {
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
					<SvgIcon kit="far" icon="ellipsis-vertical" size={20} className="d-flex" />
				</Dropdown.Toggle>
				<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
					{content.actions.map((action) => {
						const actionProps = actionItemProps[action];

						if (!actionProps) {
							return null;
						}

						let linkProps = actionProps.linkProps && actionProps.linkProps(content);

						return (
							<React.Fragment key={actionProps.label}>
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
													const response = await actionProps.action?.(content);

													if (actionProps.requiresRefresh) {
														if (response && 'content' in response) {
															onRefresh(action, response.content);
														} else {
															onRefresh(action);
														}
													}

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
