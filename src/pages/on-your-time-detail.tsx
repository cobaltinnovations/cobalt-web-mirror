import React, { FC, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import ReactPlayer from 'react-player';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import useReactPlayerSettings from '@/hooks/use-react-player-settings';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import BackgroundImageContainer from '@/components/background-image-container';

import { contentService, activityTrackingService } from '@/lib/services';
import { Content, ActivityActionId, AcivityTypeId } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import classNames from 'classnames';

const useOnYourTimeDetailStyles = createUseThemedStyles((theme) => ({
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

	const [item, setItem] = useState<Content>();

	const { canEmbed, embedUrl, playerConfig } = useReactPlayerSettings(item?.url);

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
						title: 'On Your Time',
					},
					{
						to: '/#',
						title: item?.title ?? 'Content',
					},
				]}
			/>

			<Container className="py-12">
				<Row className="justify-content-center">
					<Col md={10} lg={8} xl={6}>
						<h2 className="mb-6">{item?.title}</h2>

						{canEmbed ? (
							<div className={classes.reactPlayerOuter}>
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

						<p className="text-muted fw-bold mb-0">
							{item?.contentTypeLabel} {item?.duration && <>&bull; {item?.duration}</>}
						</p>

						{item?.author && <p className="text-muted mb-6">By {item?.author}</p>}

						<hr className="mb-6" />
					</Col>
				</Row>

				<Row className="justify-content-center">
					<Col md={10} lg={8} xl={6}>
						<div className="mb-0" dangerouslySetInnerHTML={{ __html: item?.description || '' }} />

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
