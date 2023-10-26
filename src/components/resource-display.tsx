import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import useReactPlayerSettings from '@/hooks/use-react-player-settings';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import { AcivityTypeId, ActivityActionId, Content } from '@/lib/models';
import { activityTrackingService } from '@/lib/services';
import classNames from 'classnames';
import React, { useCallback, useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import { WysiwygDisplay } from './admin-cms/wysiwyg';
import BackgroundImageContainer from './background-image-container';
import { SkeletonButton, SkeletonImage, SkeletonText } from './skeleton-loaders';

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
	content?: Content;
}

const ResourceDisplay = ({ trackView, content }: ResourceDisplayProps) => {
	const classes = useResourceDisplayStyles();
	const placeholderImage = useRandomPlaceholderImage();
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
		<Container className="py-12">
			<Row className="justify-content-center">
				<Col md={10} lg={8} xl={6}>
					<h2 className="mb-6">{content?.title}</h2>

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

					<p className="text-muted fw-bold mb-0">
						{content?.contentTypeLabel} {content?.duration && <>&bull; {content?.duration}</>}
					</p>

					{content?.author && <p className="text-muted mb-6">By {content?.author}</p>}

					<hr className="mb-6" />
				</Col>
			</Row>

			<Row className="justify-content-center">
				<Col md={10} lg={8} xl={6}>
					<WysiwygDisplay html={content?.description ?? ''} />

					{!canEmbed && content?.url && (
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
