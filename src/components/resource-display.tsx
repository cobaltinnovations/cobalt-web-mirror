import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import useReactPlayerSettings from '@/hooks/use-react-player-settings';
import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';
import { AcivityTypeId, ActivityActionId, AdminContent, Content } from '@/lib/models';
import { activityTrackingService } from '@/lib/services';
import classNames from 'classnames';
import React, { useCallback, useEffect } from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import { WysiwygDisplay } from './wysiwyg';
import BackgroundImageContainer from './background-image-container';
import { SkeletonButton, SkeletonImage, SkeletonText } from './skeleton-loaders';
import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import ContentTypeIcon from './content-type-icon';

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
		<Container className="py-18">
			<Row className="justify-content-center">
				<Col md={10} lg={8}>
					<h1 className="mb-4">{content?.title}</h1>

					<p className="text-muted fw-bold mb-14">
						{content?.contentTypeId && (
							<ContentTypeIcon
								contentTypeId={content?.contentTypeId}
								width={16}
								height={16}
								className="me-1"
							/>
						)}
						{content?.contentTypeDescription}{' '}
						{content?.duration && <>&bull; {content?.durationInMinutesDescription}</>}
					</p>

					{canEmbed ? (
						<div className={classNames(classes.reactPlayerOuter, 'mb-14')}>
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
							className={classNames(classes.mediaContainer, 'mb-14')}
							imageUrl={content?.imageUrl || placeholderImage}
						/>
					)}

					<WysiwygDisplay html={content?.description ?? ''} />

					{!canEmbed && content?.url && (
						<div className="mt-8 text-center">
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
								{content.callToAction} <ExternalIcon />
							</Button>
						</div>
					)}

					<hr className="mt-12 mb-10" />

					{content?.author && (
						<>
							<p className="fw-semibold">Created by</p>
							<p className="text-n700 mb-0">{content?.author}</p>
						</>
					)}

					{content?.tags && content?.tags.length > 0 && (
						<>
							<p className={classNames({ 'mt-8': content?.author }, 'fw-semibold')}>Related Topics</p>
							<div className="d-flex flex-wrap">
								{(content?.tags ?? []).map((tag) => (
									<Badge
										key={tag.tagId}
										bg="outline-dark"
										pill
										as="div"
										className="me-1 mt-1 fs-small text-capitalize fw-normal"
									>
										{tag.name}
									</Badge>
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
