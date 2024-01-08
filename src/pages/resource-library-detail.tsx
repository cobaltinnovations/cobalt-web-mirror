import React, { FC, useCallback, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import useReactPlayerSettings from '@/hooks/use-react-player-settings';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import BackgroundImageContainer from '@/components/background-image-container';

import { contentService, activityTrackingService, tagService } from '@/lib/services';
import { Content, ActivityActionId, AcivityTypeId, Tag } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { SkeletonButton, SkeletonImage, SkeletonText } from '@/components/skeleton-loaders';
import { WysiwygDisplay } from '@/components/admin-cms/wysiwyg';
import Helpful from '@/components/helpful';

const useResourceLibraryDetailStyles = createUseThemedStyles((theme) => ({
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

const ResourceLibraryDetail: FC = () => {
	const { contentId } = useParams<{
		contentId: string;
	}>();
	const classes = useResourceLibraryDetailStyles();
	const placeholderImage = useRandomPlaceholderImage();

	const [item, setItem] = useState<Content>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	const { canEmbed, embedUrl, playerConfig } = useReactPlayerSettings(item?.url);

	const fetchData = useCallback(async () => {
		if (!contentId) {
			return;
		}

		const [contentResponse, tagsRespose] = await Promise.all([
			contentService.fetchContent(contentId).fetch(),
			tagService.getTagGroups().fetch(),
		]);

		const tags = tagsRespose.tagGroups
			.reduce((accumulator, currentValue) => [...accumulator, ...currentValue.tags], [] as Tag[])
			.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[currentValue.tagId]: currentValue,
				}),
				{} as Record<string, Tag>
			);

		setItem(contentResponse.content);
		setTagsByTagId(tags);
	}, [contentId]);

	const trackActivity = useCallback(async () => {
		if (!item) {
			return;
		}

		activityTrackingService
			.track({
				activityActionId: ActivityActionId.View,
				activityTypeId: AcivityTypeId.Content,
				context: {
					contentId: item.contentId,
				},
			})
			.fetch()
			.catch((e) => {
				// TODO: Swallowing error silently for now
			});
	}, [item]);

	// Activity Tracking
	useEffect(() => {
		if (!item || canEmbed) {
			return;
		}

		// content that is not embedded, and has no "call to action" link
		// like INT_BLOG
		if (!item.url) {
			trackActivity();
		}
	}, [item, canEmbed, trackActivity]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Resource Library</title>
			</Helmet>

			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'Home',
					},
					{
						to: '/resource-library',
						title: 'Resource Library',
					},
					{
						to: '/#',
						title: item?.title ?? 'Content',
					},
				]}
			/>

			<AsyncPage
				fetchData={fetchData}
				loadingComponent={
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
				}
			>
				<Container className="py-12">
					<Row className="justify-content-center">
						<Col md={10} lg={8} xl={8}>
							<h2 className="mb-4">{item?.title}</h2>
							<p className="mb-12 text-muted mb-0">
								{item?.duration ?? <>{item?.duration}</>} {item?.contentTypeDescription} &bull; By{' '}
								{item?.author}
							</p>

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
									imageUrl={item?.imageUrl || placeholderImage}
								/>
							)}
						</Col>
					</Row>

					<Row className="justify-content-center">
						<Col md={10} lg={8} xl={8}>
							<WysiwygDisplay html={item?.description ?? ''} />

							{!canEmbed && item?.url && (
								<div className="mb-12 mt-10 text-center">
									<Button
										as="a"
										className="d-inline-block text-decoration-none text-white"
										variant="primary"
										href={item.url}
										target="_blank"
										onClick={() => {
											trackActivity();
										}}
									>
										{item.callToAction}
									</Button>
								</div>
							)}

							<Helpful className="mb-10" title="Was this resource helpful?" />

							{(item?.tagIds ?? []).length > 0 && (
								<>
									<hr className="mb-6" />
									<div className="d-none d-lg-flex flex-wrap">
										{item?.tagIds.map((tagId) => (
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
			</AsyncPage>
		</>
	);
};

export default ResourceLibraryDetail;
