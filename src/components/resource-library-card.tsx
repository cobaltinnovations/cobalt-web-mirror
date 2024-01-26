import React from 'react';
import { Link, NavigateOptions, To } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import classNames from 'classnames';

import { ContentTypeId, Tag } from '@/lib/models';
// import { getTextClassForColorId } from '@/lib/utils/color-utils';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import ContentTypeIcon from '@/components/content-type-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { SkeletonBadge, SkeletonImage, SkeletonText } from './skeleton-loaders';

const useStyles = createUseThemedStyles((theme) => ({
	resourceLibraryCard: {
		display: 'flex',
		borderRadius: 8,
		overflow: 'hidden',
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
		display: 'flex',
		padding: '16px 20px 0',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	tagsOuter: {
		padding: '0 20px 16px',
	},
	link: {
		textDecoration: 'none',
		'&:hover': {
			textDecoration: 'underline',
		},
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
		'-webkit-line-clamp': 3,
		'line-clamp': 3,
		'-webkit-box-orient': 'vertical',
		'box-orient': 'vertical',
		overflow: 'hidden',
		'& p': {
			marginBottom: 0,
		},
	},
}));

export interface ResourceLibraryCardProps {
	// colorId: COLOR_IDS;
	// subtopic: string;
	// subtopicTo: string;
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
	trackEvent?(): void;
}

const ResourceLibraryCard = ({
	// colorId,
	// subtopic,
	// subtopicTo,
	linkTo,
	linkToOptions,
	title,
	subtitle,
	authorPrefix = 'by',
	author,
	description,
	tags,
	contentTypeId,
	badgeTitle,
	imageUrl,
	duration,
	className,
	trackEvent,
}: ResourceLibraryCardProps) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();

	const showTagsOuter = tags.length > 0 || contentTypeId || duration;

	return (
		<div className={classNames(classes.resourceLibraryCard, className)}>
			<Link to={linkTo} {...linkToOptions} className="text-decoration-none" onClick={trackEvent}>
				<div className={classes.imageOuter} style={{ backgroundImage: `url(${imageUrl ?? placeholderImage})` }}>
					{badgeTitle && (
						<Badge as="div" bg="light" pill>
							{badgeTitle}
						</Badge>
					)}
				</div>
				<div className={classes.informationOuter}>
					<div className="mb-2">
						{/* <p className="mb-2 fw-bold">
							<Link to={subtopicTo} className={classNames(classes.link, getTextClassForColorId(colorId))}>
								{subtopic}
							</Link>
						</p> */}
						<h4 className={classNames(classes.title, 'text-dark')}>{title}</h4>
						{subtitle && <p className="text-gray mt-1">{subtitle}</p>}
						<p className={'mt-1 text-gray'}>
							{authorPrefix} {author}
						</p>
						{description && (
							<div
								className={classNames(classes.description, 'mt-2 fs-default fw-normal text-dark mb-0')}
								dangerouslySetInnerHTML={{
									__html: description,
								}}
							/>
						)}
					</div>
				</div>
			</Link>
			{showTagsOuter && (
				<div className={classes.tagsOuter}>
					<div className="d-flex justify-content-between align-items-end">
						<div className="d-none d-lg-flex flex-wrap">
							{tags.map((tag) => {
								return (
									<Link
										key={tag.tagId}
										to={`/resource-library/tags/${tag.urlName}`}
										className={classes.link}
										onClick={(event) => {
											event.stopPropagation();
										}}
									>
										<Badge
											bg="outline-dark"
											pill
											as="div"
											className="me-1 mt-1 fs-small text-capitalize fw-normal"
										>
											{tag.name}
										</Badge>
									</Link>
								);
							})}
						</div>
						<div className="d-flex align-items-center flex-shrink-0">
							{contentTypeId && (
								<ContentTypeIcon
									contentTypeId={contentTypeId}
									width={16}
									height={16}
									className="text-gray"
								/>
							)}
							{duration && <span className="ms-1 fs-small fw-bold text-gray">{duration}</span>}
						</div>
					</div>
				</div>
			)}
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
			<div className={classes.tagsOuter}>
				<div className="d-flex justify-content-between align-items-end">
					<div className="d-none d-lg-flex flex-wrap">
						<SkeletonBadge className="me-1 mt-1 fs-small" />
						<SkeletonBadge className="me-1 mt-1 fs-small" />
					</div>
					<div className="d-flex align-items-center flex-shrink-0">
						<SkeletonText type="p" width="60px" className="m-0 ms-1 fs-small" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResourceLibraryCard;
