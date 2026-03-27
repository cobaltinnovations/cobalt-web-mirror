import React from 'react';
import { Link, NavigateOptions, To } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';

import { ContentTypeId, Tag } from '@/lib/models';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import ContentTypeIcon from '@/components/content-type-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { SkeletonImage, SkeletonText } from './skeleton-loaders';

const useStyles = createUseThemedStyles((theme) => ({
	resourceLibraryCard: {
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
		position: 'relative',
		flexDirection: 'column',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.border}`,
		transition: '0.2s all',
		textDecoration: 'none',
		'&:hover': {
			transform: 'translateY(-16px)',
			boxShadow: theme.elevation.e400,
		},
	},
	resourceLibraryCardLink: {
		flex: 1,
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		textDecoration: 'none',
	},
	expired: {
		width: '100%',
		borderRadius: 5,
		position: 'relative',
		paddingBottom: '56.25%',
		backgroundColor: theme.colors.d500,
	},
	expiredInner: {
		top: '50%',
		left: '50%',
		width: '100%',
		padding: '0 16px',
		position: 'absolute',
		transform: 'translate(-50%, -50%)',
	},
	imageOuter: {
		position: 'relative',
		paddingBottom: '56.25%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n300,
		'& .cobalt-badge': {
			top: 8,
			right: 8,
			position: 'absolute',
		},
	},
	imageOuterSkeleton: {
		paddingBottom: '56.25%',
	},
	informationOuter: {
		flex: 1,
		padding: 24,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	metaRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		marginTop: 'auto',
		paddingTop: 32,
	},
	metaAuthor: {
		flex: 1,
		minWidth: 0,
	},
	title: {
		display: '-webkit-box',
		'-webkit-line-clamp': 2,
		'line-clamp': 2,
		'-webkit-box-orient': 'vertical',
		'box-orient': 'vertical',
		overflow: 'hidden',
	},
	description: {
		display: '-webkit-box',
		'-webkit-line-clamp': 2,
		'line-clamp': 2,
		'-webkit-box-orient': 'vertical',
		'box-orient': 'vertical',
		overflow: 'hidden',
		'& p': {
			marginBottom: 0,
		},
	},
}));

export interface ResourceLibraryCardProps {
	linkTo: To;
	linkToOptions?: NavigateOptions;
	title: string;
	subtitle?: string;
	authorPrefix?: string;
	author: string;
	description?: string;
	tags: Tag[];
	contentTypeId?: ContentTypeId;
	badgeTitle?: string;
	imageUrl?: string;
	duration?: string;
	className?: string;
	expired?: boolean;
	trackEvent?(): void;
	trackTagEvent?(tag: Tag): void;
}

const ResourceLibraryCard = ({
	linkTo,
	linkToOptions,
	title,
	subtitle,
	authorPrefix = 'by',
	author,
	description,
	contentTypeId,
	badgeTitle,
	imageUrl,
	duration,
	className,
	expired,
	trackEvent,
}: ResourceLibraryCardProps) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();

	return (
		<div className={classNames(classes.resourceLibraryCard, className)}>
			<Link to={linkTo} {...linkToOptions} className={classes.resourceLibraryCardLink} onClick={trackEvent}>
				{expired ? (
					<div className={classes.expired}>
						<div className={classes.expiredInner}>
							<h6 className="mb-2 text-center text-white">Resource Expired</h6>
							<p className="mb-0 text-center text-white">
								This resource will not be visible when the page is published
							</p>
						</div>
					</div>
				) : (
					<div
						className={classes.imageOuter}
						style={{ backgroundImage: `url(${imageUrl ?? placeholderImage})` }}
					>
						{badgeTitle && (
							<Badge as="div" bg="light" pill>
								{badgeTitle}
							</Badge>
						)}
					</div>
				)}
				<div className={classes.informationOuter}>
					<div>
						<div className="mb-4">
							<h4 className={classNames(classes.title, 'text-dark')}>{title}</h4>
							{subtitle && <p className="text-gray mt-1">{subtitle}</p>}
						</div>
						{description && (
							<div
								className={classNames(classes.description, 'fs-default fw-normal text-dark mb-0')}
								dangerouslySetInnerHTML={{
									__html: description,
								}}
							/>
						)}
					</div>
					<div className={classes.metaRow}>
						<p className={classNames(classes.metaAuthor, 'mb-0 text-truncate text-gray')}>{author}</p>
						<Badge bg="outline-dark" pill className="d-flex align-items-center flex-shrink-0">
							{contentTypeId && (
								<ContentTypeIcon
									contentTypeId={contentTypeId}
									width={16}
									height={16}
									className="text-gray"
								/>
							)}
							{duration && <span className="ms-1 fs-small fw-bold text-gray">{duration}</span>}
						</Badge>
					</div>
				</div>
			</Link>
		</div>
	);
};

interface SkeletonResourceLibraryCardProps {
	className?: string;
}

export const SkeletonResourceLibraryCard = ({ className }: SkeletonResourceLibraryCardProps) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.resourceLibraryCard, className)}>
			<div>
				<SkeletonImage className={classes.imageOuterSkeleton} />
				<div className={classes.informationOuter}>
					<div className="mb-2">
						<SkeletonText type="h4" className={classNames(classes.title, 'mb-1')} width="75%" />
						<SkeletonText type="p" className="mb-2" width="50%" />
						<SkeletonText type="p" numberOfLines={3} className={classNames(classes.description, 'mb-0')} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResourceLibraryCard;
