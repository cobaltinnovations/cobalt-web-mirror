import React, { FC, ReactElement } from 'react';
import { createUseStyles } from 'react-jss';

import { TableCell, TableRow } from '@/components/table';

import { ReactComponent as Article } from '@/assets/icons/article.svg';
import { ReactComponent as BlogPost } from '@/assets/icons/blog-post.svg';
import { ReactComponent as Video } from '@/assets/icons/video.svg';
import { ReactComponent as Audio } from '@/assets/icons/audio.svg';
import { ReactComponent as Podcast } from '@/assets/icons/podcast.svg';
import { ReactComponent as Worksheet } from '@/assets/icons/worksheet.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/trash.svg';
import { ReactComponent as CheckIcon } from '@/assets/icons/check.svg';
import { ReactComponent as ArchiveIcon } from '@/assets/icons/archive.svg';
import { ReactComponent as UnarchiveIcon } from '@/assets/icons/unarchive.svg';

import { AdminContentRow, AdminContentActions, ContentApprovalStatusId, ContentTypeId, ROLE_ID } from '@/lib/models';

import colors from '@/jss/colors';
import SessionDropdown from '@/components/session-dropdown';
import { Link } from 'react-router-dom';
import useAccount from '@/hooks/use-account';

const useStyles = createUseStyles({
	icon: {
		width: 20,
		height: 20,
		fill: colors.secondary,
		'& path': {
			fill: colors.secondary,
		},
	},
	centerText: {
		textAlign: 'center',
	},
	row: {
		borderLeft: `1px solid ${colors.border}`,
		borderRight: `1px solid ${colors.border}`,
	},
	noWrap: {
		whiteSpace: 'nowrap',
	},
	status: {
		paddingLeft: 12,
		textTransform: 'capitalize',
	},
	rowButton: {
		width: '100%',
		height: 30,
	},
	success: {
		'& #Shape': {
			fill: colors.success,
		},
	},
	danger: {
		width: 10,
		height: 10,
		lineHeight: 10,
		'& polygon': {
			fill: colors.danger,
		},
	},
	circleIndicator: {
		width: 12,
		height: 12,
		marginBottom: -2,
		borderRadius: 20,
		display: 'inline-block',

		'&.approved': {
			backgroundColor: colors.success,
		},
		'&.rejected': {
			backgroundColor: colors.danger,
		},
		'&.pending': {
			backgroundColor: colors.gray700,
		},
		'&.archived': {
			backgroundColor: colors.border,
		},
	},
	description: {
		maxHeight: 20,
		maxWidth: 400,
		overflow: 'hidden',
		color: colors.gray600,
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
});

interface DropdownItem {
	icon: ReactElement;
	title: string;
	onClick: () => void;
}

interface AvailableContentRowProps {
	content: AdminContentRow;

	onEditClick(contentId: string): void;

	onApproveClick(contentId: string): void;

	onRejectClick(contentId: string): void;

	onDeleteClick(contentId: string): void;

	onArchiveToggle(contentId: string, archiveFlag: boolean): void;
}

const OnYourTimeContentRow: FC<AvailableContentRowProps> = React.memo(
	({ content, onEditClick, onApproveClick, onRejectClick, onDeleteClick, onArchiveToggle }) => {
		const classes = useStyles();
		const { account } = useAccount();
		const isSuperAdmin = account?.roleId === ROLE_ID.SUPER_ADMINISTRATOR;

		function getIcon(contentTypeId: ContentTypeId) {
			switch (contentTypeId) {
				case ContentTypeId.Article:
					return <Article className={classes.icon} />;
				case ContentTypeId.InternalBlog:
				case ContentTypeId.ExternalBlog:
					return <BlogPost className={classes.icon} />;
				case ContentTypeId.Audio:
					return <Audio className={classes.icon} />;
				case ContentTypeId.Video:
					return <Video className={classes.icon} />;
				case ContentTypeId.Worksheet:
					return <Worksheet className={classes.icon} />;
				case ContentTypeId.Podcast:
					return <Podcast className={classes.icon} />;
				default:
					return <></>;
			}
		}

		// function getVisibilityLineItem(item: ContentVisibility, key: number) {
		// 	let getIcon = () => {
		// 		switch (item.approvalStatusId) {
		// 			case ContentApprovalStatusId.Approved:
		// 				return <CheckIcon className={`${classes.success} ${classes.icon}`} />;
		// 			case ContentApprovalStatusId.Rejected:
		// 				return <CloseIcon className={`${classes.danger} ${classes.icon}`} />;
		// 			default:
		// 				return <CheckIcon className={`${classes.icon}`} />;
		// 		}
		// 	};
		//
		// 	return (
		// 		<span key={key} className={`d-block font-size-xxs font-karla-regular ${classes.noWrap}`}>
		// 			{getIcon()} {item.description}
		// 		</span>
		// 	);
		// }

		function getStatusIcon(approvalStatusId: ContentApprovalStatusId | undefined) {
			let color;
			switch (approvalStatusId) {
				case ContentApprovalStatusId.Approved:
					color = 'approved';
					break;
				case ContentApprovalStatusId.Rejected:
					color = 'rejected';
					break;
				case ContentApprovalStatusId.Archived:
					color = 'archived';
					break;
				case ContentApprovalStatusId.Pending:
					color = 'pending';
					break;
			}

			return <span className={`${classes.circleIndicator} ${color}`} />;
		}

		function getDropdownItem(action: AdminContentActions) {
			switch (action) {
				case AdminContentActions.EDIT:
					return {
						icon: <EditIcon className={classes.icon} />,
						title: 'Edit',
						onClick: () => onEditClick(content.contentId),
					};
				case AdminContentActions.DELETE:
					return {
						icon: <TrashIcon className={classes.icon} />,
						title: 'Delete',
						onClick: () => onDeleteClick(content.contentId),
					};
				case AdminContentActions.APPROVE:
					return {
						icon: <CheckIcon className={classes.icon} />,
						title: 'Approve',
						onClick: () => onApproveClick(content.contentId),
					};
				case AdminContentActions.REJECT:
					return {
						icon: <CloseIcon className={classes.icon} />,
						title: 'Reject',
						onClick: () => onRejectClick(content.contentId),
					};
				case AdminContentActions.ARCHIVE:
					return {
						icon: <ArchiveIcon className={classes.icon} />,
						title: 'Archive',
						onClick: () => onArchiveToggle(content.contentId, true),
					};
				case AdminContentActions.UNARCHIVE:
					return {
						icon: <UnarchiveIcon className={classes.icon} />,
						title: 'Unarchive',
						onClick: () => onArchiveToggle(content.contentId, false),
					};
				default:
					return {} as DropdownItem;
			}
		}

		return (
			<TableRow className={classes.row}>
				<TableCell>
					<span className="d-block font-size-xs font-karla-regular">{content.dateCreatedDescription}</span>
				</TableCell>
				<TableCell className={`justify-content-center align-items-center ${classes.centerText}`}>{getIcon(content.contentTypeId)}</TableCell>
				<TableCell width={300}>
					<span className="d-block font-size-xs font-karla-bold">
						<Link to={`/on-your-time/${content.contentId}`}>{content.title}</Link>
					</span>
					<span className="d-block font-size-xs font-karla-regular">{content.author}</span>
					<span className={`d-block font-size-xs font-karla-regular ${classes.description}`}>
						{content.description ? content.description.replace(/<\/?[^>]+(>|$)/g, '') : ''}
					</span>
				</TableCell>
				{isSuperAdmin && (
					<TableCell>
						<span className="d-block font-size-xs font-karla-regular">{content.ownerInstitution}</span>
					</TableCell>
				)}
				<TableCell className={`justify-content-center align-items-center ${classes.centerText}`}>
					<span className="d-block font-size-xs font-karla-regular">{content.views}</span>
				</TableCell>
				<TableCell>
					{getStatusIcon(content.ownerInstitutionApprovalStatus.approvalStatusId)}
					<span className="ml-2 font-size-xxs font-karla-regular">{content.ownerInstitutionApprovalStatus.description}</span>
				</TableCell>
				<TableCell>
					{getStatusIcon(content.otherInstitutionApprovalStatus.approvalStatusId)}
					<span className="ml-2 font-size-xxs font-karla-regular">{content.otherInstitutionApprovalStatus.description}</span>
				</TableCell>
				<TableCell>
					<SessionDropdown
						id={content.contentId}
						items={content.actions.map((action) => {
							return getDropdownItem(action);
						})}
					/>
				</TableCell>
			</TableRow>
		);
	}
);

export default OnYourTimeContentRow;
