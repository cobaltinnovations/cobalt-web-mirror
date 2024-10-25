import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import useReactPlayerSettings from '@/hooks/use-react-player-settings';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import { AcivityTypeId, ActivityActionId, AdminContent, Content, Tag } from '@/lib/models';
import { activityTrackingService, tagService } from '@/lib/services';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import BackgroundImageContainer from './background-image-container';
import { SkeletonButton, SkeletonImage, SkeletonText } from './skeleton-loaders';
import Helpful from '@/components/helpful';
import { Link } from 'react-router-dom';
import ContentTypeIcon from './content-type-icon';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';

const useResourceDisplayStyles = createUseThemedStyles((theme) => ({
	mediaContainer: {
		height: 350,
		[mediaQueries.lg]: {
			height: 210,
		},
	},
	informationContainer: {
		padding: '10px 20px',
		color: theme.colors.n900,
		backgroundColor: theme.colors.n0,
	},
	reactPlayerOuter: {
		paddingBottom: 400,
		position: 'relative',
		backgroundColor: '#000',
		[mediaQueries.lg]: {
			paddingBottom: 210,
		},
		'& > div': {
			top: 0,
			left: 0,
			position: 'absolute',
		},
	},
}));

interface ResourceDisplayProps {
	trackView: boolean;
	content?: Content | AdminContent;
	className?: string;
}

const ResourceDisplay = ({ trackView, content, className }: ResourceDisplayProps) => {
	const classes = useResourceDisplayStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	const { canEmbed, embedUrl, playerConfig } = useReactPlayerSettings(content?.url);

	const trackActivity = useCallback(async () => {
		if (!content || !trackView) {
			return;
		}

		activityTrackingService
			.track({
				activityActionId: ActivityActionId.View,
				activityTypeId: AcivityTypeId.Content,
				context: {
					contentId: content.contentId,
				},
			})
			.fetch()
			.catch((e) => {
				// TODO: Swallowing error silently for now
			});
	}, [content, trackView]);

	const fetchData = useCallback(async () => {
		const tagsRespose = await tagService.getTagGroups().fetch();

		const tags = tagsRespose.tagGroups
			.reduce((accumulator, currentValue) => [...accumulator, ...(currentValue.tags ?? [])], [] as Tag[])
			.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[currentValue.tagId]: currentValue,
				}),
				{} as Record<string, Tag>
			);

		setTagsByTagId(tags);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Activity Tracking
	useEffect(() => {
		if (!content || canEmbed) {
			return;
		}

		// content that is not embedded, and has no "call to action" link
		// like INT_BLOG
		if (!content.url) {
			trackActivity();
		}
	}, [content, canEmbed, trackActivity]);

	return (
		<Container className={classNames('py-18', className)}>
			<Row className="justify-content-center">
				<Col md={10} lg={8} xl={8}>
					<h2 className="mb-4">{content?.title}</h2>
					<div className="mb-12 d-flex align-items-center">
						{content?.contentTypeId && (
							<ContentTypeIcon className="me-2 text-muted" contentTypeId={content?.contentTypeId} />
						)}
						<p className="text-muted mb-0">
							{content?.duration && <>{content?.durationInMinutesDescription} </>}
							{content?.contentTypeDescription} &bull; By {content?.author}
						</p>
					</div>

					{!content?.neverEmbed && (
						<>
							{canEmbed ? (
								<div className={classNames(classes.reactPlayerOuter, 'mb-6')}>
									<ReactPlayer
										width="100%"
										height="100%"
										controls
										url={embedUrl}
										config={playerConfig}
										onPlay={() => {
											trackActivity();
										}}
									/>
								</div>
							) : (
								<BackgroundImageContainer
									className={classNames(classes.mediaContainer, 'mb-6')}
									imageUrl={content?.imageUrl || placeholderImage}
								/>
							)}
						</>
					)}
				</Col>
			</Row>

			<Row className="justify-content-center">
				<Col md={10} lg={8} xl={8}>
					<WysiwygDisplay html={content?.description ?? ''} />

					{(content?.neverEmbed || !canEmbed) && content?.url && (
						<div className="mt-10 text-center">
							<Button
								as="a"
								className="d-inline-block text-decoration-none text-white"
								variant="primary"
								href={content.url}
								target="_blank"
								onClick={() => {
									trackActivity();
								}}
							>
								{content.callToAction}
							</Button>
						</div>
					)}

					{content?.contentId && (
						<Helpful contentId={content.contentId} className="my-10" title="Was this resource helpful?" />
					)}

					{(content?.tagIds ?? []).length > 0 && (
						<>
							<hr className="mb-6" />
							<div className="d-none d-lg-flex flex-wrap">
								{content?.tagIds.map((tagId) => (
									<Link
										key={tagId}
										to={`/resource-library/tags/${tagsByTagId?.[tagId]?.urlName}`}
										className="text-decoration-none"
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
											{tagsByTagId?.[tagId]?.name}
										</Badge>
									</Link>
								))}
							</div>
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
};

export const ResourceDisplaySkeleton = () => {
	const classes = useResourceDisplayStyles();

	return (
		<Container className="py-12">
			<Row className="justify-content-center">
				<Col md={10} lg={8} xl={6}>
					<SkeletonText type="h2" width="75%" className="mb-6" />
					<SkeletonImage height={350} className={classNames(classes.mediaContainer, 'mb-6')} />
					<SkeletonText type="p" width="25%" className="mb-1" />
					<SkeletonText type="p" width="50%" className="mb-6" />
					<hr className="mb-6 " />
					<SkeletonText type="p" numberOfLines={3} className="mb-10" />
					<div className="text-center">
						<SkeletonButton />
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default ResourceDisplay;
