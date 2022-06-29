import React, { FC } from 'react';

import { TableCell, TableRow } from '@/components/table';

import { ReactComponent as Article } from '@/assets/icons/article.svg';
import { ReactComponent as BlogPost } from '@/assets/icons/blog-post.svg';
import { ReactComponent as Video } from '@/assets/icons/video.svg';
import { ReactComponent as Audio, ReactComponent as Podcast } from '@/assets/icons/audio.svg';
import { ReactComponent as Worksheet } from '@/assets/icons/worksheet.svg';

import { AdminContentActions, AdminContentRow, ContentAvailableStatusId, ContentTypeId } from '@/lib/models';

import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	icon: {
		width: 20,
		height: 20,
		fill: theme.colors.secondary,
	},
	centerText: {
		textAlign: 'center',
	},
	row: {
		borderLeft: `1px solid ${theme.colors.border}`,
		borderRight: `1px solid ${theme.colors.border}`,
	},
	rowButton: {
		height: 44,
	},
	status: {
		paddingLeft: 12,
		textTransform: 'capitalize',
	},
	circleIndicator: {
		width: 12,
		height: 12,
		marginBottom: -2,
		borderRadius: 20,
		display: 'inline-block',

		'&.added': {
			backgroundColor: theme.colors.success,
		},
		'&.available': {
			backgroundColor: theme.colors.secondary,
		},
	},
}));

interface AvailableContentRowProps {
	content: AdminContentRow;

	onAddClick(contentId: string): void;

	onRemoveClick(contentId: string): void;
}

const AvailableContentRow: FC<AvailableContentRowProps> = ({ content, onAddClick, onRemoveClick }) => {
	const classes = useStyles();

	function getIcon(contentTypeId: ContentTypeId) {
		switch (contentTypeId) {
			case ContentTypeId.Article:
				return <Article className={classes.icon} />;
			case ContentTypeId.InternalBlog || ContentTypeId.ExternalBlog:
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

	function getStatusIcon(availableStatusId: ContentAvailableStatusId | undefined) {
		let color;
		switch (availableStatusId) {
			case ContentAvailableStatusId.Added:
				color = 'added';
				break;
			case ContentAvailableStatusId.Available:
				color = 'available';
				break;
		}
		if (availableStatusId) {
			return <span className={`${classes.circleIndicator} ${color}`} />;
		}
	}

	function getButton() {
		return content.actions.map((action, index) => {
			if (action === AdminContentActions.ADD) {
				return (
					<Button
						key={index}
						size={'sm'}
						className={classes.rowButton}
						variant={'success'}
						onClick={() => onAddClick(content.contentId)}
					>
						add
					</Button>
				);
			} else if (action === AdminContentActions.REMOVE) {
				return (
					<Button
						key={index}
						size={'sm'}
						className={classes.rowButton}
						variant={'danger'}
						onClick={() => onRemoveClick(content.contentId)}
					>
						remove
					</Button>
				);
			}
			return <></>;
		});
	}

	return (
		<TableRow className={classes.row}>
			<TableCell>
				<span className="d-block fs-default font-body-normal">{content.dateCreatedDescription}</span>
			</TableCell>
			<TableCell className={`justify-content-center align-items-center ${classes.centerText}`}>
				{getIcon(content.contentTypeId)}
			</TableCell>
			<TableCell>
				<span className="d-block fs-default font-body-bold">
					<Link to={`/on-your-time/${content.contentId}`}>{content.title}</Link>
				</span>
				<span className="d-block fs-default font-body-normal">{content.author}</span>
			</TableCell>
			<TableCell>
				<span className="d-block fs-default font-body-normal">{content.ownerInstitution}</span>
			</TableCell>
			<TableCell>
				<span className="d-inline-block fs-small font-body-normal" style={{ minWidth: 90 }}>
					{getStatusIcon(content.availableStatusId)}
					<span className={classes.status}>
						{content.availableStatusId === ContentAvailableStatusId.Added
							? 'Live'
							: content.availableStatusId?.toLowerCase()}
					</span>
				</span>
			</TableCell>
			<TableCell className="d-flex justify-content-end">{getButton()}</TableCell>
		</TableRow>
	);
};

export default AvailableContentRow;
