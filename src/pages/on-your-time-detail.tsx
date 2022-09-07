import React, { FC, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ReactPlayer from 'react-player';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import BackgroundImageContainer from '@/components/background-image-container';

import { contentService, activityTrackingService } from '@/lib/services';
import { Content, ActivityActionId, AcivityTypeId } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useOnYourTimeDetailStyles = createUseThemedStyles((theme) => ({
	mediaContainer: {
		height: 400,
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
		backgroundColor: theme.colors.n500,
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

const OnYourTimeDetail: FC = () => {
	const { contentId } = useParams<{
		contentId: string;
	}>();
	const classes = useOnYourTimeDetailStyles();
	const placeholderImage = useRandomPlaceholderImage();

	const [canEmbed, setCanEmbed] = useState(false);
	const [item, setItem] = useState<Content>();

	const fetchData = useCallback(async () => {
		if (!contentId) {
			return;
		}

		const response = await contentService.fetchContent(contentId).fetch();
		setItem(response.content);
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

	useEffect(() => {
		if (!item || !item.url) {
			setCanEmbed(false);
			return;
		}

		setCanEmbed(ReactPlayer.canPlay(item.url));
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
		<AsyncPage fetchData={fetchData}>
			<Breadcrumb
				xs={{ span: 12 }}
				lg={{ span: 12 }}
				xl={{ span: 12 }}
				breadcrumbs={[
					{
						to: '/',
						title: 'Home',
					},
					{
						to: '/on-your-time',
						title: 'On Your Time Content',
					},
					{
						to: '/#',
						title: item?.title ?? 'Content',
					},
				]}
			/>

			<Container fluid className="mb-4 mb-lg-10">
				<Row>
					<Col>
						{canEmbed ? (
							<div className={classes.reactPlayerOuter}>
								<ReactPlayer
									width="100%"
									height="100%"
									controls
									url={item?.url}
									onPlay={() => {
										trackActivity();
									}}
								/>
							</div>
						) : (
							<BackgroundImageContainer
								className={classes.mediaContainer}
								imageUrl={item?.imageUrl || placeholderImage}
							/>
						)}
					</Col>
				</Row>
			</Container>

			<Container className="pb-10">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h4 className={item?.author ? 'mb-1' : 'mb-4'}>{item?.title}</h4>

						{item?.author && <p className="mb-2 mb-lg-4">By {item?.author}</p>}

						<small className="mb-4 mb-lg-6 d-block text-muted text-uppercase">
							<span className="fw-bold">{item?.contentTypeLabel}</span>{' '}
							{item?.duration && <>&bull; {item?.duration}</>}
						</small>

						<hr className="mb-3 mb-lg-4" />

						<p className="mb-0" dangerouslySetInnerHTML={{ __html: item?.description || '' }} />

						{!canEmbed && item?.url && (
							<div className="mt-10 text-center">
								<Button
									as="a"
									className="d-inline-block text-decoration-none"
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
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default OnYourTimeDetail;
