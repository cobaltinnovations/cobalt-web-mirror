import { throttle } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getKalturaScriptForVideo } from '@/lib/utils';
import classNames from 'classnames';
import { CourseVideoModel } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import InlineAlert from '@/components/inline-alert';
import Loader from '@/components/loader';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	videoPlayerSupplementsOuter: {
		position: 'relative',
	},
	videoPlayerLoader: {
		top: '50%',
		left: '50%',
	},
	videoPlayerOuter: {
		width: '100%',
		borderRadius: 8,
		overflow: 'hidden',
		aspectRatio: '16/9',
		backgroundColor: theme.colors.n900,
		'& #kaltura_player': {
			opacity: 0,
		},
		'&.ready': {
			'& #kaltura_player': {
				opacity: 1,
			},
		},
	},
	screeningFlowOuter: {
		padding: 40,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	imageOuter: {
		'& img': {
			maxWidth: '100%',
		},
	},
}));

interface CourseVideoProps {
	videoId: string;
	courseVideos: CourseVideoModel[];
	onVideoPlayerEvent(eventName: string, eventPayload: unknown): void;
	onVideoPlayerEnd(): void;
}

export const CourseVideo = ({ videoId, courseVideos, onVideoPlayerEvent, onVideoPlayerEnd }: CourseVideoProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [videoPlayerReady, setVideoPlayerReady] = useState(false);
	const [videoPlayerTimedOut, setVideoPlayerTimedOut] = useState(false);
	const videoLoadingTimeoutRef = useRef<NodeJS.Timeout>();

	const stopVideoLoadingTimer = useCallback(() => {
		if (!videoLoadingTimeoutRef.current) {
			return;
		}

		clearTimeout(videoLoadingTimeoutRef.current);
		videoLoadingTimeoutRef.current = undefined;
	}, []);

	const startVideoLoadingTimer = useCallback(() => {
		stopVideoLoadingTimer();
		videoLoadingTimeoutRef.current = setTimeout(() => {
			setVideoPlayerTimedOut(true);
			onVideoPlayerEvent('INITIALIZATION_ERROR', {});
		}, 15000);
	}, [onVideoPlayerEvent, stopVideoLoadingTimer]);

	const throttledPlayerEvent = useRef(
		throttle((eventName: string, eventPayload: unknown) => onVideoPlayerEvent(eventName, eventPayload), 5000, {
			leading: true,
			trailing: false,
		})
	).current;

	useEffect(() => {
		const video = courseVideos.find((courseVideo) => courseVideo.videoId === videoId);
		if (!video) {
			return;
		}

		setVideoPlayerReady(false);
		setVideoPlayerTimedOut(false);
		startVideoLoadingTimer();

		const { script } = getKalturaScriptForVideo({
			videoPlayerId: 'kaltura_player',
			courseVideo: video,
			eventCallback: (eventName, eventPayload) => {
				if (eventName === 'playerReady') {
					setVideoPlayerReady(true);
					setVideoPlayerTimedOut(false);
					stopVideoLoadingTimer();
				}

				if (eventName === 'playerPlayEnd') {
					onVideoPlayerEnd();
				}

				if (eventName === 'playerUpdatePlayhead') {
					throttledPlayerEvent(eventName, eventPayload);
				} else {
					console.log('eventName', eventName);
					console.log('eventPayload', eventPayload);
					onVideoPlayerEvent(eventName, eventPayload);
				}
			},
			errorCallback: (error) => {
				setVideoPlayerReady(false);
				setVideoPlayerTimedOut(false);
				stopVideoLoadingTimer();
				handleError(error);
			},
		});

		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, [
		courseVideos,
		handleError,
		onVideoPlayerEnd,
		onVideoPlayerEvent,
		startVideoLoadingTimer,
		stopVideoLoadingTimer,
		throttledPlayerEvent,
		videoId,
	]);

	return (
		<>
			{videoPlayerTimedOut && (
				<InlineAlert
					className="mb-4"
					variant="warning"
					title="Video is taking longer than usual to load."
					description="If the issue persists, try reloading your browser window."
					action={{
						title: 'Reload',
						onClick: () => window.location.reload(),
					}}
				/>
			)}
			<div className={classes.videoPlayerSupplementsOuter}>
				{!videoPlayerReady && <Loader className={classes.videoPlayerLoader} />}
				<div className={classNames(classes.videoPlayerOuter, { ready: videoPlayerReady })}>
					<div id="kaltura_player" style={{ width: '100%', height: '100%' }} />
				</div>
			</div>
		</>
	);
};
