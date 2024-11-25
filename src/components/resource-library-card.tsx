import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavigateOptions, To } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import classNames from 'classnames';

import { ContentTypeId, Tag } from '@/lib/models';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import ContentTypeIcon from '@/components/content-type-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { SkeletonBadge, SkeletonImage, SkeletonText } from './skeleton-loaders';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';

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
	tagsOuter: {
		left: 0,
		right: 0,
		bottom: 0,
		padding: 24,
		display: 'flex',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
		transition: '0.2s max-height',
	},
	tagsOverflow: {
		display: 'flex',
		overflow: 'hidden',
		flexFlow: 'column-reverse',
	},
	tagButton: {
		width: 28,
		height: 28,
		padding: 0,
		marginTop: 4,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transform: 'rotate(0deg)',
		transition: `0.2s transform`,
	},
	tagButtonExpanded: {
		transform: 'rotate(-45deg)',
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
	const informationRef = useRef<HTMLDivElement>(null);
	const tagsOuterRef = useRef<HTMLDivElement>(null);
	const tagsInnerRef = useRef<HTMLDivElement>(null);
	const tagRefs = useMemo(
		() =>
			tags.reduce(
				(accumulator, current) => ({ ...accumulator, [current.tagId]: React.createRef<HTMLDivElement>() }),
				{} as Record<string, React.RefObject<HTMLDivElement>>
			),
		[tags]
	);
	const [showTags, setShowTags] = useState(false);
	const [showTagButton, setShowTagButton] = useState(false);

	const getSingleTagHeight = useCallback(() => {
		const tagHeights = Object.values(tagRefs).map((tagRef) => {
			if (!tagRef.current) {
				return 0;
			}

			const currentTagHeight = parseInt(window.getComputedStyle(tagRef.current).height, 10);
			const currentTagMarginTop = parseInt(window.getComputedStyle(tagRef.current).marginTop, 10);

			return currentTagHeight + currentTagMarginTop;
		});

		return Math.max(...tagHeights);
	}, [tagRefs]);

	const getTotalTagsHeight = useCallback(() => {
		if (!tagsInnerRef.current) {
			return 0;
		}

		return parseInt(window.getComputedStyle(tagsInnerRef.current).height, 10);
	}, []);

	const getTagsOuterPaddingY = useCallback(() => {
		if (!tagsOuterRef.current) {
			return 0;
		}

		const outerPaddingTop = parseInt(window.getComputedStyle(tagsOuterRef.current).paddingTop, 10);
		const outerPaddingBottom = parseInt(window.getComputedStyle(tagsOuterRef.current).paddingBottom, 10);
		return outerPaddingTop + outerPaddingBottom;
	}, []);

	const handleWindowResize = useCallback(() => {
		const singleTagHeight = getSingleTagHeight();
		const totalTagsHeight = getTotalTagsHeight();
		const tagsOuterPaddingY = getTagsOuterPaddingY();
		const collapsedHeight = tagsOuterPaddingY + singleTagHeight;

		if (informationRef.current) {
			informationRef.current.style.paddingBottom = `${collapsedHeight}px`;
		}

		setShowTagButton(totalTagsHeight > singleTagHeight);
	}, [getSingleTagHeight, getTagsOuterPaddingY, getTotalTagsHeight]);

	useEffect(() => {
		const singleTagHeight = getSingleTagHeight();
		const totalTagsHeight = getTotalTagsHeight();
		const tagsOuterPaddingY = getTagsOuterPaddingY();
		const expandedHeight = tagsOuterPaddingY + totalTagsHeight;
		const collapsedHeight = tagsOuterPaddingY + singleTagHeight;

		if (!tagsOuterRef.current) {
			return;
		}

		if (showTags) {
			tagsOuterRef.current.style.maxHeight = `${expandedHeight}px`;
		} else {
			tagsOuterRef.current.style.maxHeight = `${collapsedHeight}px`;
		}
	}, [getSingleTagHeight, getTagsOuterPaddingY, getTotalTagsHeight, showTags]);

	useEffect(() => {
		handleWindowResize();
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize]);

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
				<div ref={informationRef} className={classes.informationOuter}>
					<div className="mb-4 d-flex align-items-center">
						<Badge bg="outline-dark" pill className="me-2 d-flex align-items-center flex-shrink-0">
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
						<p className="mb-0 text-truncate text-gray">{author}</p>
					</div>
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
			</Link>
			{tags.length > 0 && (
				<div ref={tagsOuterRef} className={classes.tagsOuter}>
					<div className={classes.tagsOverflow}>
						<div
							ref={tagsInnerRef}
							className="d-flex flex-wrap-reverse flex-row-reverse justify-content-end"
						>
							{showTagButton && (
								<Button
									className={classNames(classes.tagButton, {
										[classes.tagButtonExpanded]: showTags,
									})}
									variant="outline-primary"
									onClick={() => {
										setShowTags(!showTags);
									}}
								>
									<PlusIcon className="d-flex" width={20} height={20} />
								</Button>
							)}
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
											ref={tagRefs[tag.tagId]}
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
